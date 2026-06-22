import { Module } from '@nestjs/common';
import { HoroscopesService } from './horoscopes.service';
import { HoroscopesController } from './horoscopes.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [HoroscopesService],
  controllers: [HoroscopesController],
})
export class HoroscopesModule {}
