import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
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
    try {
      const categoryData: Partial<Category> = {
        name: createCategoryDto.name.toLowerCase()
      };

      await this.categoryModel.create(categoryData);
      return { message: 'Categoría creada exitosamente.'}
    } catch (error) {
      if ( error.code == 11000 ) {
        throw new ConflictException({ message: 'La categoría ya existe en la base de datos.'});
      }
      throw new InternalServerErrorException({ message: 'No se pudo crear la categoría.'});
    }
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
    try {
      const updateData: Partial<Category> = updateCategoryDto.name ? {
        name: updateCategoryDto.name.toLowerCase()
      } : {};

      const category = await this.categoryModel.findByIdAndUpdate(id, updateData, { new: true });

      if ( !category ) {
        throw new NotFoundException({ message: `El id ${id} no existe.`})
      }

      return { message: 'La categoría ha sido actualizada.'}
    } catch (error) {
      if ( error.code == 11000 ) {
        throw new ConflictException({ message: 'Ya existe una categoría con ese nombre.'})
      }
      throw new InternalServerErrorException({ message: 'No se pudo actualizar la categoría.'});
    }
  }

  async remove(id: string) {
    const category = await this.categoryModel.findByIdAndDelete( id );
    if ( !category ) {
      throw new NotFoundException({ message: `El id ${id} no existe.` });
    }
    return { message: 'La categoría ha sido eliminada.'};
  }
}