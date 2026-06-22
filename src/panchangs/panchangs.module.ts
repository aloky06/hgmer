import { Module } from '@nestjs/common';
import { PanchangsService } from './panchangs.service';
import { PanchangsController } from './panchangs.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [PanchangsService],
  controllers: [PanchangsController],
})
export class PanchangsModule {}
