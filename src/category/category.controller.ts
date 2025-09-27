import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ObjectIdValidationPipe } from 'src/common/pipes/object-id-validation/object-id-validation.pipe';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto);
  }

  @Get()
  findAll() {
    return this.categoryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ObjectIdValidationPipe ) id: string) {
    return this.categoryService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ObjectIdValidationPipe ) id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoryService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  remove(@Param('id', ObjectIdValidationPipe ) id: string) {
    return this.categoryService.remove(id);
  }
}
