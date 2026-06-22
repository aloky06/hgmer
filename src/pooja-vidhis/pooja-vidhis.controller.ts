import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { PoojaVidhisService } from './pooja-vidhis.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('pooja-vidhis')
export class PoojaVidhisController {
  constructor(private readonly PoojaVidhisService: PoojaVidhisService) {}

  @Get()
  findAll() {
    return this.PoojaVidhisService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.PoojaVidhisService.findOne(+id);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @Post()
  create(@Body() data: any) {
    return this.PoojaVidhisService.create(data);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @Put(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.PoojaVidhisService.update(+id, data);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.PoojaVidhisService.remove(+id);
  }
}
