import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PoojaTypesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.poojaType.findMany();
  }

  async findOne(id: number) {
    const poojaType = await this.prisma.poojaType.findUnique({ where: { id } });
    if (!poojaType) {
      throw new NotFoundException(`PoojaType with ID ${id} not found`);
    }
    return poojaType;
  }

  async create(data: { name: string; description?: string }) {
    return this.prisma.poojaType.create({ data });
  }

  async update(id: number, data: { name?: string; description?: string }) {
    return this.prisma.poojaType.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    return this.prisma.poojaType.delete({ where: { id } });
  }
}
