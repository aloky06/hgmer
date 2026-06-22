import { Module } from '@nestjs/common';
import { FestivalsService } from './festivals.service';
import { FestivalsController } from './festivals.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FestivalsController],
  providers: [FestivalsService],
})
export class FestivalsModule {}
