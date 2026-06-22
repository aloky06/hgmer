import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { InventoryService } from './inventory.service';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post('serviceability')
  checkServiceability(@Body() body: { pincode: string }) {
    return this.inventoryService.checkServiceability(body.pincode);
  }

  @Get('warehouses')
  getWarehouses() {
    return this.inventoryService.getWarehouses();
  }

  @Post('warehouses')
  createWarehouse(@Body() body: { name: string; pincode?: string; address?: string; serviceablePincodes?: string }) {
    return this.inventoryService.createWarehouse(body);
  }

  @Post('warehouses/:id')
  updateWarehouse(@Param('id') id: string, @Body() body: { name?: string; pincode?: string; address?: string; serviceablePincodes?: string }) {
    return this.inventoryService.updateWarehouse(parseInt(id), body);
  }

  @Get('stock/:productId')
  getAvailableStock(
    @Param('productId') productId: string,
    @Query('warehouseId') warehouseId?: string,
  ) {
    return this.inventoryService.getAvailableStock(
      parseInt(productId),
      warehouseId ? parseInt(warehouseId) : undefined,
    );
  }

  @Post('adjust')
  adjustStock(
    @Body()
    body: {
      warehouseId: number;
      productId: number;
      quantity: number;
      reason: string;
    },
  ) {
    return this.inventoryService.adjustStock(
      body.warehouseId,
      body.productId,
      body.quantity,
      body.reason,
    );
  }

  @Post('inward')
  inwardStock(
    @Body()
    body: {
      warehouseId: number;
      productId: number;
      quantity: number;
      costPrice: number;
      mrp?: number;
      batchNumber: string;
      expiryDate?: string;
    },
  ) {
    return this.inventoryService.inwardStock(body);
  }

  @Post('transfer')
  transferStock(
    @Body()
    body: {
      fromWarehouseId: number;
      toWarehouseId: number;
      productId: number;
      quantity: number;
      reason: string;
    },
  ) {
    return this.inventoryService.transferStock(
      body.fromWarehouseId,
      body.toWarehouseId,
      body.productId,
      body.quantity,
      body.reason,
    );
  }
}
