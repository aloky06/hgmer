import { Controller, Post, Get, Put, Body, Param, UseGuards, Request } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { BookingStatus } from '@prisma/client';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('CUSTOMER')
  @Post()
  createBooking(@Request() req, @Body() body: any) {
    return this.bookingsService.createBooking(req.user.userId, body);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('CUSTOMER')
  @Get('my-bookings')
  getCustomerBookings(@Request() req) {
    return this.bookingsService.getCustomerBookings(req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('PANDIT')
  @Get('pandit-requests')
  getPanditBookings(@Request() req) {
    return this.bookingsService.getPanditBookings(req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @Get('admin/all')
  getAllBookings() {
    return this.bookingsService.getAllBookings();
  }

  @UseGuards(AuthGuard('jwt'))
  @Put(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: BookingStatus) {
    // Note: Ideally, check if the user is authorized to update THIS specific booking.
    // For simplicity in Phase 2, we just allow authenticated users to update if they call this.
    // We can add logic to restrict PANDIT to only update their own bookings, etc.
    return this.bookingsService.updateBookingStatus(+id, status);
  }
}
