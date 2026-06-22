import { Controller, Get, Post, Put, Patch, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('categories')
  getCategories(@Query('parentId') parentId?: string) {
    if (parentId === 'null') {
      return this.productsService.getCategories(null);
    }
    return this.productsService.getCategories(parentId ? +parentId : undefined);
  }

  @Post('categories')
  createCategory(@Body() body: any) {
    return this.productsService.createCategory(body);
  }

  @Put('categories/:id')
  updateCategory(@Param('id') id: string, @Body() body: any) {
    return this.productsService.updateCategory(+id, body);
  }

  @Delete('categories/:id')
  deleteCategory(@Param('id') id: string) {
    return this.productsService.deleteCategory(+id);
  }

  @Get()
  findAll(
    @Query('warehouseId') warehouseId?: string,
    @Query('categoryId') categoryId?: string,
    @Query('sort') sort?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('search') search?: string,
  ) {
    return this.productsService.findAll(
      warehouseId ? +warehouseId : undefined,
      categoryId ? +categoryId : undefined,
      sort,
      minPrice ? +minPrice : undefined,
      maxPrice ? +maxPrice : undefined,
      search
    );
  }

  @Get('admin')
  findAllAdmin() {
    return this.productsService.findAllAdmin();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }

  @Post()
  create(@Body() body: any) {
    return this.productsService.create(body);
  }

  @Patch(':id/approve')
  approve(@Param('id') id: string) {
    return this.productsService.approve(+id);
  }

  @Patch(':id/reject')
  reject(@Param('id') id: string, @Body() body: { adminNote: string }) {
    return this.productsService.reject(+id, body.adminNote);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.productsService.update(+id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(+id);
  }
}
