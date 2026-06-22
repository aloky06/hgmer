import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async adjustStock(warehouseId: number, productId: number, quantity: number, reason: string) {
    const inventory = await this.prisma.inventory.findUnique({
      where: {
        warehouseId_productId: { warehouseId, productId }
      }
    });

    if (!inventory) {
      if (quantity < 0) {
        throw new BadRequestException('Cannot reduce stock below zero for an item that has no inventory record.');
      }
      
      const newInventory = await this.prisma.inventory.create({
        data: {
          warehouseId,
          productId,
          quantity
        }
      });

      await this.prisma.inventoryAuditLog.create({
        data: {
          inventoryId: newInventory.id,
          changeType: 'ADD',
          quantityChanged: quantity,
          previousQuantity: 0,
          newQuantity: quantity,
          reason
        }
      });

      return newInventory;
    }

    const newQuantity = inventory.quantity + quantity;
    if (newQuantity < 0) {
      throw new BadRequestException('Insufficient stock');
    }

    const updatedInventory = await this.prisma.inventory.update({
      where: { id: inventory.id },
      data: { quantity: newQuantity }
    });

    await this.prisma.inventoryAuditLog.create({
      data: {
        inventoryId: inventory.id,
        changeType: quantity > 0 ? 'ADD' : 'REMOVE',
        quantityChanged: Math.abs(quantity),
        previousQuantity: inventory.quantity,
        newQuantity,
        reason
      }
    });

    return updatedInventory;
  }

  async checkServiceability(pincode: string) {
    const warehouses = await this.prisma.warehouse.findMany();
    
    // First try to find a warehouse that explicitly services this pincode
    const exactMatch = warehouses.find(w => {
      if (!w.serviceablePincodes) return false;
      try {
        const pings = JSON.parse(w.serviceablePincodes) as string[];
        return pings.includes(pincode);
      } catch (e) {
        return false;
      }
    });

    if (exactMatch) {
      return { warehouse: exactMatch, isLocalDelivery: true };
    }

    // Fallback to the primary warehouse (usually the first one)
    if (warehouses.length > 0) {
      return { warehouse: warehouses[0], isLocalDelivery: false };
    }

    throw new NotFoundException('No warehouses configured in the system');
  }

  async getWarehouses() {
    return this.prisma.warehouse.findMany();
  }

  async createWarehouse(data: { name: string; pincode?: string; address?: string; serviceablePincodes?: string }) {
    return this.prisma.warehouse.create({ data });
  }

  async updateWarehouse(id: number, data: { name?: string; pincode?: string; address?: string; serviceablePincodes?: string }) {
    return this.prisma.warehouse.update({
      where: { id },
      data
    });
  }

  async getAvailableStock(productId: number, warehouseId?: number) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: {
        inventories: warehouseId ? { where: { warehouseId } } : true,
        bundleComponents: true,
      }
    });

    if (!product) throw new NotFoundException('Product not found');

    if (product.type === 'STANDARD') {
      return product.inventories.reduce((acc, inv) => acc + (inv.quantity - inv.reservedQuantity), 0);
    }

    if (product.type === 'BUNDLE') {
      if (!product.bundleComponents || product.bundleComponents.length === 0) {
        return 0; // Invalid bundle, no components
      }

      let maxBundles = Infinity;
      
      for (const comp of product.bundleComponents) {
        const compStock = await this.getAvailableStock(comp.componentId, warehouseId);
        const possibleKits = Math.floor(compStock / comp.quantity);
        if (possibleKits < maxBundles) {
          maxBundles = possibleKits;
        }
      }

      return maxBundles === Infinity ? 0 : maxBundles;
    }

    return 0;
  }

  async transferStock(fromWarehouseId: number, toWarehouseId: number, productId: number, quantity: number, reason: string) {
    if (quantity <= 0) throw new BadRequestException('Transfer quantity must be greater than zero');
    
    // Check if enough stock exists
    const fromInventory = await this.prisma.inventory.findUnique({
      where: { warehouseId_productId: { warehouseId: fromWarehouseId, productId } }
    });

    if (!fromInventory || fromInventory.quantity < quantity) {
      throw new BadRequestException('Insufficient stock in source warehouse');
    }

    return await this.prisma.$transaction(async (tx) => {
      // Deduct from source
      const updatedFrom = await tx.inventory.update({
        where: { id: fromInventory.id },
        data: { quantity: fromInventory.quantity - quantity }
      });

      await tx.inventoryAuditLog.create({
        data: {
          inventoryId: updatedFrom.id,
          changeType: 'TRANSFER_OUT',
          quantityChanged: quantity,
          previousQuantity: fromInventory.quantity,
          newQuantity: updatedFrom.quantity,
          reason: `Transfer to warehouse ${toWarehouseId}. Reason: ${reason}`
        }
      });

      // Add to destination
      let toInventory = await tx.inventory.findUnique({
        where: { warehouseId_productId: { warehouseId: toWarehouseId, productId } }
      });

      let updatedTo;
      if (toInventory) {
        updatedTo = await tx.inventory.update({
          where: { id: toInventory.id },
          data: { quantity: toInventory.quantity + quantity }
        });
      } else {
        updatedTo = await tx.inventory.create({
          data: { warehouseId: toWarehouseId, productId, quantity }
        });
      }

      await tx.inventoryAuditLog.create({
        data: {
          inventoryId: updatedTo.id,
          changeType: 'TRANSFER_IN',
          quantityChanged: quantity,
          previousQuantity: toInventory ? toInventory.quantity : 0,
          newQuantity: updatedTo.quantity,
          reason: `Transfer from warehouse ${fromWarehouseId}. Reason: ${reason}`
        }
      });

      return { from: updatedFrom, to: updatedTo };
    });
  }

  // --- Professional Stock Management (Blinkit Model) ---

  async inwardStock(data: { warehouseId: number; productId: number; quantity: number; costPrice: number; mrp?: number; batchNumber: string; expiryDate?: string }) {
    if (data.quantity <= 0) throw new BadRequestException('Quantity must be greater than zero');

    return await this.prisma.$transaction(async (tx) => {
      // 1. Create Purchase Order (Ad-hoc)
      const po = await tx.purchaseOrder.create({
        data: {
          status: 'COMPLETED',
          totalAmount: data.costPrice * data.quantity,
        }
      });

      // 2. Create Stock Inward
      await tx.stockInward.create({
        data: {
          purchaseOrderId: po.id,
          warehouseId: data.warehouseId,
          productId: data.productId,
          quantity: data.quantity,
          costPrice: data.costPrice,
          batchNumber: data.batchNumber,
          expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
        }
      });

      // 3. Update Inventory
      let inventory = await tx.inventory.findUnique({
        where: { warehouseId_productId: { warehouseId: data.warehouseId, productId: data.productId } }
      });

      if (!inventory) {
        inventory = await tx.inventory.create({
          data: { warehouseId: data.warehouseId, productId: data.productId, quantity: data.quantity }
        });
      } else {
        inventory = await tx.inventory.update({
          where: { id: inventory.id },
          data: { quantity: inventory.quantity + data.quantity }
        });
      }

      // 4. Create Batch tracking
      await tx.inventoryBatch.create({
        data: {
          inventoryId: inventory.id,
          batchNumber: data.batchNumber,
          quantity: data.quantity,
          costPrice: data.costPrice,
          mrp: data.mrp,
          expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
        }
      });

      // 5. Audit Log
      await tx.inventoryAuditLog.create({
        data: {
          inventoryId: inventory.id,
          changeType: 'INWARD',
          quantityChanged: data.quantity,
          previousQuantity: inventory.quantity - data.quantity,
          newQuantity: inventory.quantity,
          reason: `GRN Inward via PO #${po.id}, Batch: ${data.batchNumber}`
        }
      });

      return inventory;
    });
  }

  async reserveStock(warehouseId: number, productId: number, quantity: number) {
    const inventory = await this.prisma.inventory.findUnique({
      where: { warehouseId_productId: { warehouseId, productId } }
    });

    if (!inventory || (inventory.quantity - inventory.reservedQuantity) < quantity) {
      throw new BadRequestException('Insufficient available stock to reserve');
    }

    return this.prisma.inventory.update({
      where: { id: inventory.id },
      data: { reservedQuantity: inventory.reservedQuantity + quantity }
    });
  }

  async commitStock(warehouseId: number, productId: number, quantity: number) {
    // When order is shipped, we deduct the reserved amount and the actual quantity
    const inventory = await this.prisma.inventory.findUnique({
      where: { warehouseId_productId: { warehouseId, productId } }
    });

    if (!inventory) throw new BadRequestException('Inventory not found');

    const updated = await this.prisma.inventory.update({
      where: { id: inventory.id },
      data: {
        quantity: Math.max(0, inventory.quantity - quantity),
        reservedQuantity: Math.max(0, inventory.reservedQuantity - quantity),
      }
    });

    await this.prisma.inventoryAuditLog.create({
      data: {
        inventoryId: inventory.id,
        changeType: 'DISPATCH',
        quantityChanged: quantity,
        previousQuantity: inventory.quantity,
        newQuantity: updated.quantity,
        reason: `Order Dispatch`
      }
    });

    return updated;
  }

  async releaseStock(warehouseId: number, productId: number, quantity: number) {
    const inventory = await this.prisma.inventory.findUnique({
      where: { warehouseId_productId: { warehouseId, productId } }
    });

    if (!inventory) return;

    return this.prisma.inventory.update({
      where: { id: inventory.id },
      data: { reservedQuantity: Math.max(0, inventory.reservedQuantity - quantity) }
    });
  }
}
