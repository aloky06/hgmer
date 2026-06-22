import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WishlistService {
  constructor(private prisma: PrismaService) {}

  async getWishlist(userId: number) {
    const wishlists = await this.prisma.wishlist.findMany({
      where: { userId },
      include: {
        product: {
          include: { 
            inventories: true,
            images: true 
          }
        }
      }
    });
    return wishlists.map(w => w.product);
  }

  async addToWishlist(userId: number, productId: number) {
    try {
      return await this.prisma.wishlist.create({
        data: { userId, productId }
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Product is already in wishlist');
      }
      throw error;
    }
  }

  async removeFromWishlist(userId: number, productId: number) {
    return this.prisma.wishlist.delete({
      where: {
        userId_productId: { userId, productId }
      }
    });
  }
}
