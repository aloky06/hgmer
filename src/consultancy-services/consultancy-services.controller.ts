import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ConsultancyServicesService } from './consultancy-services.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('consultancy-services')
export class ConsultancyServicesController {
  constructor(private readonly ConsultancyServicesService: ConsultancyServicesService) {}

  @Get()
  findAll() {
    return this.ConsultancyServicesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ConsultancyServicesService.findOne(+id);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @Post()
  create(@Body() data: any) {
    return this.ConsultancyServicesService.create(data);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @Put(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.ConsultancyServicesService.update(+id, data);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ConsultancyServicesService.remove(+id);
  }
}
