import { Injectable, Inject, Logger, BadRequestException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import axios from 'axios';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ShiprocketService {
  private readonly logger = new Logger(ShiprocketService.name);
  private readonly apiUrl = 'https://apiv2.shiprocket.in/v1/payload';

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private prisma: PrismaService,
  ) {}

  async authenticate(): Promise<string> {
    const cachedToken = await this.cacheManager.get<string>('shiprocket_token');
    if (cachedToken) {
      return cachedToken;
    }

    const email = process.env.SHIPROCKET_EMAIL;
    const password = process.env.SHIPROCKET_PASSWORD;

    if (!email || !password) {
      this.logger.warn('Shiprocket credentials not found in environment variables. Using mock token.');
      return 'mock_shiprocket_token';
    }

    try {
      const response = await axios.post(`${this.apiUrl}/user/login`, {
        email,
        password,
      });

      const token = response.data.token;
      // Shiprocket token is valid for 10 days, cache for 9 days (777600000 ms)
      await this.cacheManager.set('shiprocket_token', token, 777600000);
      return token;
    } catch (error: any) {
      this.logger.error('Shiprocket authentication failed', error.response?.data || error.message);
      throw new BadRequestException('Failed to authenticate with shipping provider.');
    }
  }

  async estimateDelivery(pincode: string, weight: number) {
    const token = await this.authenticate();
    if (token === 'mock_shiprocket_token') {
      return {
        estimated_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +3 days
        rates: [
          { courier_name: 'Mock Courier', rate: 50 },
          { courier_name: 'Mock Express', rate: 100 },
        ],
      };
    }

    try {
      // Note: In reality, Shiprocket's courier/generate/awb and courier/serviceability require pickup pincode.
      // We will assume a default origin pincode here for serviceability.
      const originPincode = process.env.ORIGIN_PINCODE || '110001';

      const response = await axios.get(`${this.apiUrl}/courier/serviceability/`, {
        params: {
          pickup_postcode: originPincode,
          delivery_postcode: pincode,
          weight: weight,
          cod: 0,
        },
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = response.data.data;
      if (!data || !data.available_courier_companies) {
        throw new BadRequestException('No couriers available for this pincode.');
      }

      return {
        estimated_date: data.available_courier_companies[0]?.etd,
        rates: data.available_courier_companies.map((c: any) => ({
          courier_name: c.courier_name,
          rate: c.rate,
          estimated_delivery_days: c.estimated_delivery_days,
          courier_company_id: c.courier_company_id,
        })),
      };
    } catch (error: any) {
      this.logger.error('Failed to estimate delivery', error.response?.data || error.message);
      throw new BadRequestException('Failed to estimate delivery.');
    }
  }

  async createOrder(orderId: number) {
    // Fetch full order details
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: true,
        orderItems: { include: { product: true } },
      },
    });

    if (!order) throw new BadRequestException('Order not found');

    const token = await this.authenticate();

    if (token === 'mock_shiprocket_token') {
      await this.prisma.order.update({
        where: { id: order.id },
        data: {
          shiprocketOrderId: Math.floor(Math.random() * 100000),
          shiprocketShipmentId: Math.floor(Math.random() * 100000),
        },
      });
      return { status: 'success', message: 'Mock order created in Shiprocket' };
    }

    // Format for Shiprocket
    const orderPayload = {
      order_id: order.id.toString(),
      order_date: order.createdAt.toISOString().split('T')[0],
      pickup_location: "Primary", // Requires configuring pickup location in Shiprocket dashboard
      billing_customer_name: order.customer.name,
      billing_last_name: "",
      billing_address: order.shippingAddress,
      billing_address_2: "",
      billing_city: "Unknown", // Would need to parse from address or have structured address
      billing_pincode: "110001", // Placeholder, need real pincode
      billing_state: "Unknown",
      billing_country: "India",
      billing_email: order.customer.email,
      billing_phone: order.customer.phone || "9999999999",
      shipping_is_billing: true,
      order_items: order.orderItems.map((item) => ({
        name: item.product.name,
        sku: `SKU-${item.product.id}`,
        units: item.quantity,
        selling_price: item.price,
        discount: 0,
        tax: 0,
      })),
      payment_method: order.paymentStatus === 'PAID' ? 'Prepaid' : 'COD',
      sub_total: order.totalAmount,
      length: 10, // Default or calculated
      breadth: 10,
      height: 10,
      weight: 1, // Default or calculated sum of products
    };

    try {
      const response = await axios.post(`${this.apiUrl}/orders/create/adhoc`, orderPayload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const { order_id, shipment_id } = response.data;

      await this.prisma.order.update({
        where: { id: order.id },
        data: {
          shiprocketOrderId: order_id,
          shiprocketShipmentId: shipment_id,
        },
      });

      return response.data;
    } catch (error: any) {
      this.logger.error('Failed to create Shiprocket order', error.response?.data || error.message);
      throw new BadRequestException('Failed to create Shiprocket order.');
    }
  }

  async generateAWB(shipmentId: number, courierId?: number) {
    const token = await this.authenticate();
    if (token === 'mock_shiprocket_token') {
      const awb = `MOCK-AWB-${Math.floor(Math.random() * 1000000)}`;
      await this.prisma.order.updateMany({
        where: { shiprocketShipmentId: shipmentId },
        data: { awbCode: awb, courierCompanyId: courierId || 1 },
      });
      return { status: 'success', awb };
    }

    try {
      const payload = courierId ? { shipment_id: shipmentId, courier_id: courierId } : { shipment_id: shipmentId };
      const response = await axios.post(`${this.apiUrl}/courier/assign/awb`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const { awb_code, courier_company_id } = response.data.response.data;

      await this.prisma.order.updateMany({
        where: { shiprocketShipmentId: shipmentId },
        data: {
          awbCode: awb_code,
          courierCompanyId: courier_company_id,
        },
      });

      return response.data;
    } catch (error: any) {
      this.logger.error('Failed to assign AWB', error.response?.data || error.message);
      throw new BadRequestException('Failed to assign AWB.');
    }
  }

  async schedulePickup(shipmentId: number) {
    const token = await this.authenticate();
    if (token === 'mock_shiprocket_token') {
      return { status: 'success', message: 'Mock pickup scheduled' };
    }

    try {
      const response = await axios.post(`${this.apiUrl}/courier/generate/pickup`, {
        shipment_id: [shipmentId],
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return response.data;
    } catch (error: any) {
      this.logger.error('Failed to schedule pickup', error.response?.data || error.message);
      throw new BadRequestException('Failed to schedule pickup.');
    }
  }

  async generateLabel(shipmentId: number) {
    const token = await this.authenticate();
    if (token === 'mock_shiprocket_token') {
      const labelUrl = `https://mock-shiprocket.in/label/${shipmentId}.pdf`;
      await this.prisma.order.updateMany({
        where: { shiprocketShipmentId: shipmentId },
        data: { shippingLabelUrl: labelUrl },
      });
      return { label_url: labelUrl };
    }

    try {
      const response = await axios.post(`${this.apiUrl}/courier/generate/label`, {
        shipment_id: [shipmentId],
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const labelUrl = response.data.label_url;
      await this.prisma.order.updateMany({
        where: { shiprocketShipmentId: shipmentId },
        data: { shippingLabelUrl: labelUrl },
      });

      return { label_url: labelUrl };
    } catch (error: any) {
      this.logger.error('Failed to generate label', error.response?.data || error.message);
      throw new BadRequestException('Failed to generate label.');
    }
  }
}
