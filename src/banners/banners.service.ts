import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BannersService {
  constructor(private prisma: PrismaService) {}

  async create(createBannerDto: any) {
    const { productIds, ...data } = createBannerDto;
    
    return this.prisma.banner.create({ 
      data: {
        ...data,
        ...(productIds && productIds.length > 0 ? {
          products: {
            connect: productIds.map(id => ({ id: Number(id) }))
          }
        } : {})
      } 
    });
  }

  findAll() {
    return this.prisma.banner.findMany({ 
      where: { isActive: true },
      include: { products: true }
    });
  }

  findOne(id: number) {
    return this.prisma.banner.findUnique({ 
      where: { id },
      include: { products: true }
    });
  }

  async findProducts(id: number) {
    const banner = await this.prisma.banner.findUnique({
      where: { id },
      include: { products: true }
    });
    return banner?.products || [];
  }

  async update(id: number, updateBannerDto: any) {
    const { productIds, ...data } = updateBannerDto;
    
    return this.prisma.banner.update({ 
      where: { id }, 
      data: {
        ...data,
        ...(productIds ? {
          products: {
            set: productIds.map(pid => ({ id: Number(pid) }))
          }
        } : {})
      } 
    });
  }

  remove(id: number) {
    return this.prisma.banner.delete({ where: { id } });
  }
}
