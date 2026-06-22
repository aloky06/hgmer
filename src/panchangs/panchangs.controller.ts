import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { PanchangsService } from './panchangs.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('panchangs')
export class PanchangsController {
  constructor(private readonly PanchangsService: PanchangsService) {}

  @Get()
  findAll() {
    return this.PanchangsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.PanchangsService.findOne(+id);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @Post()
  create(@Body() data: any) {
    return this.PanchangsService.create(data);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @Put(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.PanchangsService.update(+id, data);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.PanchangsService.remove(+id);
  }
}
