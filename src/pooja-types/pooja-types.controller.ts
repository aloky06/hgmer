import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { PoojaTypesService } from './pooja-types.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('pooja-types')
export class PoojaTypesController {
  constructor(private readonly poojaTypesService: PoojaTypesService) {}

  @Get()
  findAll() {
    return this.poojaTypesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.poojaTypesService.findOne(+id);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @Post()
  create(@Body() data: { name: string; description?: string }) {
    return this.poojaTypesService.create(data);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @Put(':id')
  update(@Param('id') id: string, @Body() data: { name?: string; description?: string }) {
    return this.poojaTypesService.update(+id, data);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.poojaTypesService.remove(+id);
  }
}
