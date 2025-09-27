import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({ versionKey: false, collection: 'categories' })
export class Category extends Document {

  @Prop({
    unique: true,
    index: true,
    trim: true
  })
  name: string;
}

export const CategorySchema = SchemaFactory.createForClass(Category);