import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Status } from '@prisma/client';

@Injectable()
export class PanditsService {
  constructor(private prisma: PrismaService) {}

  async register(userId: number, data: any) {
    return this.prisma.panditProfile.create({
      data: {
        userId,
        bio: data.bio,
        experience: data.experience,
        city: data.city,
        serviceRadius: data.serviceRadius,
        videoIntroUrl: data.videoIntroUrl,
        status: Status.PENDING,
        photoUrl: data.photoUrl || 'https://cdn-icons-png.flaticon.com/512/3588/3588636.png',
        rating: 4.8,
        price: data.price ? parseInt(data.price, 10) : 6000,
        languages: data.languages || 'Hindi, Sanskrit',
        specializations: data.specializations || 'All Hindu Ceremonies, Havan Ceremonies, Satyanarayan Katha, Temple Ceremonies, Vastu Shanti',
      },
    });
  }

  async getPending() {
    return this.prisma.panditProfile.findMany({
      where: { status: Status.PENDING },
      include: { user: true },
    });
  }

  async getAllAdmin() {
    return this.prisma.panditProfile.findMany({
      include: { 
        user: { select: { name: true, phone: true, email: true } },
        _count: { select: { bookings: true } }
      },
      orderBy: { id: 'desc' }
    });
  }

  async updateStatus(id: number, status: Status) {
    return this.prisma.panditProfile.update({
      where: { id },
      data: { status },
    });
  }

  async getApproved(city?: string) {
    const whereClause: any = { status: Status.APPROVED };
    if (city) {
      whereClause.city = { contains: city }; // Or exact match if preferred
    }
    return this.prisma.panditProfile.findMany({
      where: whereClause,
      include: { user: { select: { name: true, phone: true, email: true } } },
    });
  }

  async getById(id: number) {
    const profile = await this.prisma.panditProfile.findUnique({
      where: { id },
      include: { user: { select: { name: true, phone: true, email: true } } },
    });
    if (!profile) {
      throw new NotFoundException('Pandit profile not found');
    }
    return profile;
  }

  async updateProfile(id: number, data: any) {
    return this.prisma.panditProfile.update({
      where: { id },
      data: {
        bio: data.bio,
        experience: data.experience ? parseInt(data.experience, 10) : undefined,
        city: data.city,
        serviceRadius: data.serviceRadius ? parseInt(data.serviceRadius, 10) : undefined,
        photoUrl: data.photoUrl,
        rating: data.rating ? parseFloat(data.rating) : undefined,
        price: data.price ? parseInt(data.price, 10) : undefined,
        languages: data.languages,
        specializations: data.specializations,
      },
    });
  }
}
