import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { Category } from "src/category/entities/category.entity";
import { TransactionType } from "./transaction_type.enum";

@Schema({ versionKey: false, collection: 'transactions' })
export class Transaction extends Document {
  @Prop({
    type: Number,
    required: true,
    index: true,
    match: /^\d+$/,
  })
  amount: number;

  @Prop({
    type: String,
  })
  description?: string;

  @Prop({
    type: Date,
    index: true,
    required: false,
    default: Date.now,
  })
  date?: Date;

  @Prop({
    type: Types.ObjectId,
    ref: Category.name,
    required: true,
    index: true,
  })
  category: Types.ObjectId;

  @Prop({
    type: String,
    enum: Object.values(TransactionType),
    required: true,
    index: true,
  })
  type: TransactionType;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);