import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Transaction } from './entities/transaction.entity';
import { Model, Types } from 'mongoose';
import { TransactionType } from './entities/transaction_type.enum';

@Injectable()
export class TransactionService {
  constructor(
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<Transaction>,
  ) {}

  async create(createTransactionDto: CreateTransactionDto) {

    const payload: Partial<Transaction> = {
      amount: parseInt(createTransactionDto.amount, 10),
      description: createTransactionDto.description,
      date: createTransactionDto.date
        ? new Date(
            /^\d{4}-\d{2}-\d{2}$/.test(createTransactionDto.date)
              ? `${createTransactionDto.date}T00:00:00.000Z`
              : createTransactionDto.date,
          )
        : undefined,
      category: new Types.ObjectId(createTransactionDto.category),
      type: createTransactionDto.type,
    };

    const transaction = await this.transactionModel.create(payload);

    const message = this.transactionMessage(transaction.type, 'registrado')

    return { message };
  }

  async findAll() {
    return await this.transactionModel.find().populate('category');
  }

  async findOne(id: string) {
    const transaction = await this.transactionModel
      .findById(id)
      .populate('category');

    if (!transaction) {
      throw new NotFoundException({
        message: `El id ${id} de la transacción no existe.`,
      });
    }

    return transaction;
  }

  async update(id: string, updateTransactionDto: UpdateTransactionDto) {
    const transaction = await this.transactionModel.findByIdAndUpdate(
      id,
      updateTransactionDto,
      { new: true },
    );

    if (!transaction) {
      throw new NotFoundException({
        message: `El id ${id} de la transacción no existe.`,
      });
    }

    const message = this.transactionMessage(transaction.type, 'actualizado')

    return { message };
  }

  async remove(id: string) {
    const transaction = await this.transactionModel.findByIdAndDelete(id);

    if (!transaction) {
      throw new NotFoundException({
        message: `El id ${id} de la transacción no existe.`,
      });
    }

    return { message: 'La transacción ha sido eliminada.'};
  }

  private transactionMessage(transactionType: TransactionType, action: string): string {
    let baseType: string;

    if( transactionType === 'income' ) {
      baseType = 'Ingreso'
    } else {
      baseType = 'Gasto'
    }
    return `${baseType} ${action} exitosamente.`;
  }
}