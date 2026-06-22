import { Module } from '@nestjs/common';
import { PoojaVidhisService } from './pooja-vidhis.service';
import { PoojaVidhisController } from './pooja-vidhis.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [PoojaVidhisService],
  controllers: [PoojaVidhisController],
})
export class PoojaVidhisModule {}
