import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ConsultancyServicesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.consultancyService.findMany();
  }

  async findOne(id: number) {
    const consultancyService = await this.prisma.consultancyService.findUnique({ where: { id } });
    if (!consultancyService) {
      throw new NotFoundException(`ConsultancyService with ID ${id} not found`);
    }
    return consultancyService;
  }

  async create(data: any) {
    return this.prisma.consultancyService.create({ data });
  }

  async update(id: number, data: any) {
    return this.prisma.consultancyService.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    return this.prisma.consultancyService.delete({ where: { id } });
  }
}
