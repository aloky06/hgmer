import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FestivalsService } from './festivals.service';
import { CreateFestivalDto } from './dto/create-festival.dto';
import { UpdateFestivalDto } from './dto/update-festival.dto';

@Controller('festivals')
export class FestivalsController {
  constructor(private readonly festivalsService: FestivalsService) {}

  @Post()
  create(@Body() createFestivalDto: CreateFestivalDto) {
    return this.festivalsService.create(createFestivalDto);
  }

  @Get()
  findAll() {
    return this.festivalsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.festivalsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFestivalDto: UpdateFestivalDto) {
    return this.festivalsService.update(+id, updateFestivalDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.festivalsService.remove(+id);
  }
}
