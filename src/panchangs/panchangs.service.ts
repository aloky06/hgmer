import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PanchangsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.panchang.findMany();
  }

  async findOne(id: number) {
    const panchang = await this.prisma.panchang.findUnique({ where: { id } });
    if (!panchang) {
      throw new NotFoundException(`Panchang with ID ${id} not found`);
    }
    return panchang;
  }

  async create(data: any) {
    return this.prisma.panchang.create({ data });
  }

  async update(id: number, data: any) {
    return this.prisma.panchang.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    return this.prisma.panchang.delete({ where: { id } });
  }
}
