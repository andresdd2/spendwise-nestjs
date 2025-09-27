import { IsDateString, IsEnum, IsMongoId, IsNotEmpty, IsNumberString, IsOptional, IsString, Matches } from "class-validator";
import { TransactionType } from "../entities/transaction_type.enum";


export class CreateTransactionDto {

  @IsNumberString({}, { message: 'El monto debe ser un número válido.' })
  @Matches(/^\d+$/, {
    message: 'El monto debe ser un entero positivo sin decimales.',
  })
  @IsNotEmpty({ message: 'El monto es requerido.' })
  amount: string;

  @IsString({ message: 'La descripción debe ser un texto.' })
  @IsOptional()
  description?: string;

  @IsOptional()
  @IsDateString(
    {},
    { message: 'La fecha debe tener formato válido (yyyy-mm-dd o ISO).' },
  )
  date?: string;

  @IsMongoId({ message: 'La categoría debe ser un ID de MongoID válido.' })
  @IsNotEmpty({ message: 'La categoría es requerida.' })
  category: string;

  @IsEnum(TransactionType, { message: 'El tipo de transacción no es válido.' })
  @IsNotEmpty({ message: 'El tipo de transacción es requerido.' })
  type: TransactionType;
}