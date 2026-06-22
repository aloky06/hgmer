import { Module } from '@nestjs/common';
import { ConsultancyServicesService } from './consultancy-services.service';
import { ConsultancyServicesController } from './consultancy-services.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [ConsultancyServicesService],
  controllers: [ConsultancyServicesController],
})
export class ConsultancyServicesModule {}
