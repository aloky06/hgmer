import { Controller, Get, Post, Body, Param, Query, Headers, UnauthorizedException, Logger } from '@nestjs/common';
import { ShiprocketService } from './shiprocket.service';
import { PrismaService } from '../prisma/prisma.service';

@Controller('shiprocket')
export class ShiprocketController {
  private readonly logger = new Logger(ShiprocketController.name);

  constructor(
    private readonly shiprocketService: ShiprocketService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('estimate-delivery')
  async estimateDelivery(
    @Query('pincode') pincode: string,
    @Query('weight') weight: string,
  ) {
    if (!pincode) throw new UnauthorizedException('Pincode is required');
    return this.shiprocketService.estimateDelivery(pincode, parseFloat(weight) || 1);
  }

  @Post('order/:id/create')
  async createOrder(@Param('id') id: string) {
    return this.shiprocketService.createOrder(parseInt(id));
  }

  @Post('shipment/:id/awb')
  async generateAWB(
    @Param('id') shipmentId: string,
    @Body('courierId') courierId?: number,
  ) {
    return this.shiprocketService.generateAWB(parseInt(shipmentId), courierId);
  }

  @Post('shipment/:id/pickup')
  async schedulePickup(@Param('id') shipmentId: string) {
    return this.shiprocketService.schedulePickup(parseInt(shipmentId));
  }

  @Post('shipment/:id/label')
  async generateLabel(@Param('id') shipmentId: string) {
    return this.shiprocketService.generateLabel(parseInt(shipmentId));
  }

  // Webhook handler for Shiprocket tracking updates
  @Post('webhook')
  async handleWebhook(
    @Headers('x-shiprocket-signature') signature: string,
    @Body() payload: any,
  ) {
    this.logger.log(`Received Webhook: ${JSON.stringify(payload)}`);

    // In production, verify signature here using crypto and JWT/webhook secret.

    if (payload && payload.awb) {
      const order = await this.prisma.order.findFirst({
        where: { awbCode: payload.awb },
      });

      if (order) {
        // payload.current_status can be: "PICKED UP", "IN TRANSIT", "DELIVERED", "RTO", etc.
        const statusMap: Record<string, string> = {
          'PICKED UP': 'SHIPPED',
          'IN TRANSIT': 'SHIPPED',
          'OUT FOR DELIVERY': 'OUT_FOR_DELIVERY',
          'DELIVERED': 'DELIVERED',
          'RTO INITIATED': 'RETURNED',
        };

        const newStatus = statusMap[payload.current_status];
        if (newStatus) {
          await this.prisma.order.update({
            where: { id: order.id },
            data: { status: newStatus },
          });
        }
      }
    }

    return { status: 'success' };
  }
}
