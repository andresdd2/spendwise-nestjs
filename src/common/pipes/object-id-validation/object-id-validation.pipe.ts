import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { Types } from 'mongoose';

@Injectable()
export class ObjectIdValidationPipe implements PipeTransform<String, Types.ObjectId> {

  transform(value: string, metadata: ArgumentMetadata): Types.ObjectId {
    if ( !Types.ObjectId.isValid(value) ) {
      throw new BadRequestException(`El ObjectId ${value} es inválido`)
    }
    return new Types.ObjectId(value);
  }

}