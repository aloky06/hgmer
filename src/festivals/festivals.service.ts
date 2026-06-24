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
export class FestivalsService {
  constructor(private prisma: PrismaService) {}

  create(createFestivalDto: any) {
    return this.prisma.festival.create({ data: createFestivalDto });
  }

  findAll() {
    return this.prisma.festival.findMany({ where: { isActive: true } });
  }

  findOne(id: number) {
    return this.prisma.festival.findUnique({ where: { id } });
  }

  async update(id: number, updateFestivalDto: any) {
    // Delete old image from Cloudinary if updating imageUrl
    if (updateFestivalDto.imageUrl) {
      const oldFestival = await this.prisma.festival.findUnique({ where: { id } });
      if (oldFestival && oldFestival.imageUrl && oldFestival.imageUrl !== updateFestivalDto.imageUrl) {
        const publicId = extractPublicId(oldFestival.imageUrl);
        if (publicId) {
          try { await cloudinary.uploader.destroy(publicId); } 
          catch (error) { console.error('Failed to delete old image from Cloudinary', error); }
        }
      }
    }
    return this.prisma.festival.update({ where: { id }, data: updateFestivalDto });
  }

  async remove(id: number) {
    const festival = await this.prisma.festival.findUnique({ where: { id } });
    if (festival && festival.imageUrl) {
      const publicId = extractPublicId(festival.imageUrl);
      if (publicId) {
        try { await cloudinary.uploader.destroy(publicId); } 
        catch (error) { console.error('Failed to delete image from Cloudinary', error); }
      }
    }
    return this.prisma.festival.delete({ where: { id } });
  }
}
