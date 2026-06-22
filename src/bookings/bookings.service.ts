import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BookingStatus } from '@prisma/client';

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

  async createBooking(customerId: number, data: { panditId: number; poojaTypeId: number; date: string; time: string; location: string }) {
    return this.prisma.booking.create({
      data: {
        customerId,
        panditId: data.panditId,
        poojaTypeId: data.poojaTypeId,
        date: new Date(data.date), // Expecting ISO string or valid date string
        time: data.time,
        location: data.location,
        status: BookingStatus.PENDING,
        paymentStatus: 'PENDING',
      },
    });
  }

  async getCustomerBookings(customerId: number) {
    return this.prisma.booking.findMany({
      where: { customerId },
      include: {
        pandit: { include: { user: true } },
        poojaType: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPanditBookings(userId: number) {
    // Find the PanditProfile associated with this user
    const panditProfile = await this.prisma.panditProfile.findUnique({
      where: { userId },
    });
    if (!panditProfile) {
      throw new NotFoundException('Pandit profile not found for this user');
    }

    return this.prisma.booking.findMany({
      where: { panditId: panditProfile.id },
      include: {
        customer: true,
        poojaType: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAllBookings() {
    return this.prisma.booking.findMany({
      include: {
        customer: true,
        pandit: { include: { user: true } },
        poojaType: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateBookingStatus(id: number, status: BookingStatus) {
    return this.prisma.booking.update({
      where: { id },
      data: { status },
    });
  }
}
