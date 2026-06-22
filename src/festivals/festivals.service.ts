import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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

  update(id: number, updateFestivalDto: any) {
    return this.prisma.festival.update({ where: { id }, data: updateFestivalDto });
  }

  remove(id: number) {
    return this.prisma.festival.delete({ where: { id } });
  }
}
