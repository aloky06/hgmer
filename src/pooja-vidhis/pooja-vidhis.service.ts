import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PoojaVidhisService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.poojaVidhi.findMany();
  }

  async findOne(id: number) {
    const poojaVidhi = await this.prisma.poojaVidhi.findUnique({ where: { id } });
    if (!poojaVidhi) {
      throw new NotFoundException(`PoojaVidhi with ID ${id} not found`);
    }
    return poojaVidhi;
  }

  async create(data: any) {
    return this.prisma.poojaVidhi.create({ data });
  }

  async update(id: number, data: any) {
    return this.prisma.poojaVidhi.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    return this.prisma.poojaVidhi.delete({ where: { id } });
  }
}
