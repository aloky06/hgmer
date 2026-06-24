import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function extractPublicId(url: string) {
  if (!url || !url.includes('cloudinary.com')) return null;
  try {
    const parts = url.split('/');
    const uploadIndex = parts.findIndex(p => p === 'upload');
    if (uploadIndex === -1) return null;
    let startIndex = uploadIndex + 1;
    if (parts[startIndex] && parts[startIndex].startsWith('v')) {
      startIndex++;
    }
    const publicIdWithExt = parts.slice(startIndex).join('/');
    return publicIdWithExt.substring(0, publicIdWithExt.lastIndexOf('.'));
  } catch (e) {
    return null;
  }
}

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
    
    // Delete old image from Cloudinary if updating imageUrl
    if (data.imageUrl) {
      const oldBanner = await this.prisma.banner.findUnique({ where: { id } });
      if (oldBanner && oldBanner.imageUrl && oldBanner.imageUrl !== data.imageUrl) {
        const publicId = extractPublicId(oldBanner.imageUrl);
        if (publicId) {
          try { await cloudinary.uploader.destroy(publicId); } 
          catch (error) { console.error('Failed to delete old image from Cloudinary', error); }
        }
      }
    }
    
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

  async remove(id: number) {
    const banner = await this.prisma.banner.findUnique({ where: { id } });
    if (banner && banner.imageUrl) {
      const publicId = extractPublicId(banner.imageUrl);
      if (publicId) {
        try { await cloudinary.uploader.destroy(publicId); } 
        catch (error) { console.error('Failed to delete image from Cloudinary', error); }
      }
    }
    return this.prisma.banner.delete({ where: { id } });
  }
}
