import { IsNotEmpty, IsString, Length, Matches } from "class-validator";


export class CreateCategoryDto {
  @IsNotEmpty({ message: 'El nombre de la categoría no puede estar vacío.' })
  @IsString({ message: 'El nombre de la categoría debe ser un texto.' })
  @Length(3, 30, {
    message: 'El nombre de la categoría debe tener entre 3 y 30 caracteres.',
  })
  @Matches(/^[a-zA-Z0-9\s]+$/, { message: 'El nombre de la categoría solo puede contener, letras números y espacios'})
  name: string;
}