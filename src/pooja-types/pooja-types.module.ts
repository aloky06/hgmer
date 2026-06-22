import { Module } from '@nestjs/common';
import { PoojaTypesService } from './pooja-types.service';
import { PoojaTypesController } from './pooja-types.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [PoojaTypesService],
  controllers: [PoojaTypesController],
})
export class PoojaTypesModule {}
