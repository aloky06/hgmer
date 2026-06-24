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
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(warehouseId?: number, categoryId?: number, sort?: string, minPrice?: number, maxPrice?: number, search?: string, status: string = 'APPROVED') {
    const where: any = { status };
    if (categoryId) where.categoryId = categoryId;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } }
      ];
    }
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    let orderBy: any = undefined;
    if (sort === 'price_asc') orderBy = { price: 'asc' };
    else if (sort === 'price_desc') orderBy = { price: 'desc' };
    else if (sort === 'newest') orderBy = { id: 'desc' };

    const products = await this.prisma.product.findMany({
      where,
      orderBy,
      include: { 
        category: true, 
        vendor: { include: { user: true } }, 
        inventories: { include: { warehouse: true } }, 
        images: { orderBy: { order: 'asc' } },
        bundleComponents: true 
      }
    });

    if (warehouseId) {
      return products.map(p => {
        let availableStock = 0;
        
        if (p.type === 'STANDARD') {
          const inv = p.inventories.find(i => i.warehouseId === warehouseId);
          if (inv) availableStock = Math.max(0, inv.quantity - inv.reservedQuantity);
        } else if (p.type === 'BUNDLE') {
          if (p.bundleComponents && p.bundleComponents.length > 0) {
            let minKits = Infinity;
            for (const bc of p.bundleComponents) {
              const compProduct = products.find(cp => cp.id === bc.componentId);
              if (!compProduct) continue;
              const compInv = compProduct.inventories.find(i => i.warehouseId === warehouseId);
              const compStock = compInv ? Math.max(0, compInv.quantity - compInv.reservedQuantity) : 0;
              const possibleKits = Math.floor(compStock / bc.quantity);
              if (possibleKits < minKits) minKits = possibleKits;
            }
            availableStock = minKits === Infinity ? 0 : minKits;
          }
        }
        return { ...p, availableStock };
      });
    }

    return products;
  }

  async findAllAdmin() {
    return this.prisma.product.findMany({
      orderBy: { id: 'desc' },
      include: { category: true, vendor: true, inventories: { include: { warehouse: true } }, images: true }
    });
  }

  async approve(id: number) {
    return this.prisma.product.update({
      where: { id },
      data: { status: 'APPROVED' }
    });
  }

  async reject(id: number, adminNote: string) {
    return this.prisma.product.update({
      where: { id },
      data: { status: 'REJECTED', adminNote }
    });
  }

  async findOne(id: number) {
    return this.prisma.product.findUnique({
      where: { id },
      include: { category: true, vendor: { include: { user: true } }, inventories: { include: { warehouse: true } }, images: { orderBy: { order: 'asc' } }, bundleComponents: true }
    });
  }

  async create(data: any) {
    const { galleryUrls, initialStock, ...productData } = data;
    
    // Auto-assign nearest warehouse (for now, pick the first one)
    let warehouse = await this.prisma.warehouse.findFirst();
    if (!warehouse) {
      warehouse = await this.prisma.warehouse.create({ data: { name: 'Main Warehouse' } });
    }

    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          ...productData,
          status: 'PENDING',
          images: galleryUrls && galleryUrls.length > 0 ? {
            create: galleryUrls.map((url: string, index: number) => ({ url, order: index }))
          } : undefined
        }
      });

      if (initialStock && initialStock > 0) {
        await tx.inventory.create({
          data: {
            productId: product.id,
            warehouseId: warehouse.id,
            quantity: Number(initialStock),
          }
        });
      }
      return product;
    });
  }

  async update(id: number, data: any) {
    const { galleryUrls, ...productData } = data;

    return this.prisma.$transaction(async (tx) => {
      if (galleryUrls !== undefined) {
        // Delete removed images from Cloudinary
        const oldImages = await tx.productImage.findMany({ where: { productId: id } });
        const newUrlsSet = new Set(galleryUrls || []);
        for (const old of oldImages) {
          if (!newUrlsSet.has(old.url)) {
            const publicId = extractPublicId(old.url);
            if (publicId) {
              try { await cloudinary.uploader.destroy(publicId); }
              catch (error) { console.error('Failed to delete image from Cloudinary', error); }
            }
          }
        }

        await tx.productImage.deleteMany({ where: { productId: id } });
        if (galleryUrls.length > 0) {
          productData.images = {
            create: galleryUrls.map((url: string, index: number) => ({ url, order: index }))
          };
        }
      }
      return tx.product.update({
        where: { id },
        data: productData,
      });
    });
  }

  async remove(id: number) {
    const product = await this.prisma.product.findUnique({ where: { id }, include: { images: true } });
    if (product) {
      const urlsToDelete = product.images.map(img => img.url);
      if (product.imageUrl) urlsToDelete.push(product.imageUrl);
      
      for (const url of urlsToDelete) {
        const publicId = extractPublicId(url);
        if (publicId) {
          try { await cloudinary.uploader.destroy(publicId); }
          catch (error) { console.error('Failed to delete image from Cloudinary', error); }
        }
      }
    }
    
    return this.prisma.product.delete({
      where: { id },
    });
  }

  async getCategories(parentId?: number | null) {
    if (parentId !== undefined) {
      return this.prisma.category.findMany({
        where: { parentId },
        include: { children: true }
      });
    }
    return this.prisma.category.findMany({
      include: { children: true }
    });
  }

  async createCategory(data: any) {
    return this.prisma.category.create({ data });
  }

  async updateCategory(id: number, data: any) {
    return this.prisma.category.update({
      where: { id },
      data,
    });
  }

  async deleteCategory(id: number) {
    return this.prisma.category.delete({
      where: { id },
    });
  }
}
