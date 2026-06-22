import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InventoryService } from '../inventory/inventory.service';
import { ShiprocketService } from '../shiprocket/shiprocket.service';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private inventoryService: InventoryService,
    private shiprocketService: ShiprocketService,
  ) {}

  async checkout(customerId: number, items: { productId: number; quantity: number }[], shippingAddress: string, pincode?: string) {
    if (!items || items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    // 1. Calculate Total and Validate Stock
    let totalAmount = 0;
    const orderItemsData: { productId: number; quantity: number; price: number; warehouseId: number | null }[] = [];

    // Find a warehouse for each item
    for (const item of items) {
      const product = await this.prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) throw new NotFoundException(`Product ${item.productId} not found`);

      // Find a warehouse with sufficient stock
      let assignedWarehouseId: number | null = null;
      if (product.type === 'STANDARD') {
        const inventories = await this.prisma.inventory.findMany({
          where: { productId: product.id },
          include: { warehouse: true }
        });
        
        let validInv: any = null;

        // 1. Try to find a warehouse that explicitly services this pincode
        if (pincode) {
          validInv = inventories.find(inv => {
            if ((inv.quantity - inv.reservedQuantity) < item.quantity) return false;
            if (!inv.warehouse.serviceablePincodes) return false;
            try {
              const sps = JSON.parse(inv.warehouse.serviceablePincodes);
              return Array.isArray(sps) && sps.includes(pincode);
            } catch(e) { return false; }
          });
        }

        // 2. Fallback: If no warehouse explicitly covers it, assign to default/first available
        if (!validInv) {
          validInv = inventories.find(inv => (inv.quantity - inv.reservedQuantity) >= item.quantity);
        }

        if (!validInv) {
          throw new BadRequestException(`Insufficient stock for product ${product.name}`);
        }
        assignedWarehouseId = validInv.warehouseId;
        await this.inventoryService.reserveStock(assignedWarehouseId!, product.id, item.quantity);
      } else if (product.type === 'BUNDLE') {
        // For bundle, we must ensure the warehouse has stock for ALL components
        const components = await this.prisma.bundleComponent.findMany({ where: { bundleId: product.id } });
        const warehouses = await this.prisma.warehouse.findMany();
        
        let targetWarehouses = warehouses;

        // Filter servicing warehouses if pincode provided
        if (pincode) {
          const servicingWarehouses = warehouses.filter(w => {
             if (!w.serviceablePincodes) return false;
             try {
                const sps = JSON.parse(w.serviceablePincodes);
                return Array.isArray(sps) && sps.includes(pincode);
             } catch(e) { return false; }
          });
          if (servicingWarehouses.length > 0) {
             targetWarehouses = servicingWarehouses;
          }
        }
        
        let found = false;

        for (const w of targetWarehouses) {
          let canFulfill = true;
          for (const comp of components) {
            const avail = await this.inventoryService.getAvailableStock(comp.componentId, w.id);
            if (avail < (item.quantity * comp.quantity)) {
              canFulfill = false;
              break;
            }
          }
          if (canFulfill) {
            assignedWarehouseId = w.id;
            found = true;
            break;
          }
        }

        // Fallback for bundles if target warehouses failed, but we had filtered them
        if (!found && pincode && targetWarehouses.length !== warehouses.length) {
          for (const w of warehouses) {
            let canFulfill = true;
            for (const comp of components) {
              const avail = await this.inventoryService.getAvailableStock(comp.componentId, w.id);
              if (avail < (item.quantity * comp.quantity)) {
                canFulfill = false;
                break;
              }
            }
            if (canFulfill) {
              assignedWarehouseId = w.id;
              found = true;
              break;
            }
          }
        }
        
        if (!assignedWarehouseId) {
          throw new BadRequestException(`Insufficient stock across warehouses for bundle ${product.name}`);
        }

        for (const comp of components) {
          await this.inventoryService.reserveStock(assignedWarehouseId!, comp.componentId, item.quantity * comp.quantity);
        }
      }

      totalAmount += product.price * item.quantity;
      orderItemsData.push({
        productId: product.id,
        quantity: item.quantity,
        price: product.price,
        warehouseId: assignedWarehouseId,
      });
    }

    // Calculate Commissions
    const hgmrCommission = totalAmount * 0.15;
    const vendorAmount = totalAmount * 0.85;

    // Create Order
    const order = await this.prisma.order.create({
      data: {
        customerId,
        totalAmount,
        shippingAddress,
        hgmrCommission,
        vendorAmount,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        orderItems: {
          create: orderItemsData,
        },
      },
      include: { orderItems: true, customer: true },
    });

    return {
      message: 'Checkout successful, proceed to payment',
      order,
      // Mock payment intent
      clientSecret: `pi_mock_${order.id}_secret`,
    };
  }

  async confirmPayment(orderId: number) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { orderItems: { include: { product: true } } },
    });

    if (!order) throw new NotFoundException('Order not found');
    if (order.paymentStatus === 'PAID') throw new BadRequestException('Order already paid');

    // Commit Stock
    for (const item of order.orderItems) {
      const warehouseId = item.warehouseId;
      if (!warehouseId) continue;

      if (item.product.type === 'STANDARD') {
        await this.inventoryService.commitStock(warehouseId, item.productId, item.quantity);
      } else if (item.product.type === 'BUNDLE') {
        const components = await this.prisma.bundleComponent.findMany({ where: { bundleId: item.productId } });
        for (const comp of components) {
          await this.inventoryService.commitStock(warehouseId, comp.componentId, item.quantity * comp.quantity);
        }
      }
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'PROCESSING',
        paymentStatus: 'PAID',
      },
    });

    return updatedOrder;
  }

  async getAllOrders() {
    return this.prisma.order.findMany({
      include: { 
        customer: true,
        orderItems: {
          include: { warehouse: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getCustomerOrders(customerId: number) {
    return this.prisma.order.findMany({
      where: { customerId },
      include: { 
        orderItems: {
          include: { product: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async cancelOrder(orderId: number, customerId: number, reason: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId, customerId }
    });

    if (!order) throw new NotFoundException('Order not found');
    if (order.status !== 'PENDING' && order.status !== 'PROCESSING') {
      throw new BadRequestException('Order cannot be cancelled at this stage');
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'CANCELLED',
        cancelReason: reason
      }
    });
  }

  // Shiprocket Actions
  async pushToShiprocket(orderId: number) {
    return this.shiprocketService.createOrder(orderId);
  }

  async generateAWB(shipmentId: number) {
    return this.shiprocketService.generateAWB(shipmentId);
  }

  async schedulePickup(shipmentId: number) {
    return this.shiprocketService.schedulePickup(shipmentId);
  }

  async generateLabel(shipmentId: number) {
    return this.shiprocketService.generateLabel(shipmentId);
  }
}
