import { Controller, Post, Get, Body, Param, UseGuards, Request, Put } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('checkout')
  async checkout(
    @Request() req,
    @Body() body: { items: { productId: number; quantity: number }[]; shippingAddress: string; pincode?: string }
  ) {
    const userId = req.user.userId;
    return this.ordersService.checkout(userId, body.items, body.shippingAddress, body.pincode);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':id/confirm')
  async confirmPayment(@Param('id') id: string) {
    return this.ordersService.confirmPayment(Number(id));
  }

  // Admin routes (ideally protected by RolesGuard)
  @Get()
  async getAllOrders() {
    return this.ordersService.getAllOrders();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('my-orders')
  async getCustomerOrders(@Request() req) {
    return this.ordersService.getCustomerOrders(req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put(':id/cancel')
  async cancelOrder(
    @Request() req,
    @Param('id') id: string,
    @Body('reason') reason: string
  ) {
    return this.ordersService.cancelOrder(Number(id), req.user.userId, reason || 'No reason provided');
  }

  @Post(':id/shiprocket/push')
  async pushToShiprocket(@Param('id') id: string) {
    return this.ordersService.pushToShiprocket(Number(id));
  }

  @Post('shiprocket/:shipmentId/awb')
  async generateAWB(@Param('shipmentId') shipmentId: string) {
    return this.ordersService.generateAWB(Number(shipmentId));
  }

  @Post('shiprocket/:shipmentId/pickup')
  async schedulePickup(@Param('shipmentId') shipmentId: string) {
    return this.ordersService.schedulePickup(Number(shipmentId));
  }

  @Post('shiprocket/:shipmentId/label')
  async generateLabel(@Param('shipmentId') shipmentId: string) {
    return this.ordersService.generateLabel(Number(shipmentId));
  }
}
