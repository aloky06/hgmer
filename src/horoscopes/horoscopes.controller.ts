import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { HoroscopesService } from './horoscopes.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('horoscopes')
export class HoroscopesController {
  constructor(private readonly HoroscopesService: HoroscopesService) {}

  @Get()
  findAll() {
    return this.HoroscopesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.HoroscopesService.findOne(+id);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @Post()
  create(@Body() data: any) {
    return this.HoroscopesService.create(data);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @Put(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.HoroscopesService.update(+id, data);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.HoroscopesService.remove(+id);
  }
}
