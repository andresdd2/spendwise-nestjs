import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { v4 as uuidv4 } from "uuid";

@Schema({ versionKey: false })
export class Category extends Document {
  @Prop({
    type: String,
    default: () => uuidv4(),
  })
  declare _id: string; // Sé que ya existe _id en Document, pero en mi modelo va a ser de este tipo

  @Prop({
    unique: true,
    index: true,
  })
  name: string;
}

export const CategorySchema = SchemaFactory.createForClass(Category);