import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HoroscopesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.horoscope.findMany();
  }

  async findOne(id: number) {
    const horoscope = await this.prisma.horoscope.findUnique({ where: { id } });
    if (!horoscope) {
      throw new NotFoundException(`Horoscope with ID ${id} not found`);
    }
    return horoscope;
  }

  async create(data: any) {
    return this.prisma.horoscope.create({ data });
  }

  async update(id: number, data: any) {
    return this.prisma.horoscope.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    return this.prisma.horoscope.delete({ where: { id } });
  }
}
