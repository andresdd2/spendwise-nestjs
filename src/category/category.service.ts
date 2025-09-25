import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class CategoryService {

  constructor(
    @InjectModel( Category.name )
    private readonly categoryModel : Model<Category>
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const category = await this.categoryModel.create(createCategoryDto);
    return { message: 'Categoría creada exitosamente.'};
  }

  async findAll() {
    return await this.categoryModel.find();
  }

  async findOne(id: string) {
    const category = await this.categoryModel.findById( id );
    if ( !category ) {
      throw new NotFoundException({ message: `El id ${id} no existe.`})
    }

    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.categoryModel.findByIdAndUpdate(id, updateCategoryDto, { new: true });
    if (!category) {
      throw new NotFoundException({ message: `El id ${id} no existe.` });
    }
    return { message: 'La categoría ha sido actualizada.'};
  }

  async remove(id: string) {
    const category = await this.categoryModel.findByIdAndDelete( id );
    if ( !category ) {
      throw new NotFoundException({ message: `El id ${id} no existe.` });
    }
    return { message: 'La categoría ha sido eliminada.'};
  }
}