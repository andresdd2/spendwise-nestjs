import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Transaction } from './entities/transaction.entity';
import { Model, Types } from 'mongoose';
import { TransactionType } from './entities/transaction_type.enum';
import { Category } from 'src/category/entities/category.entity';

@Injectable()
export class TransactionService {
  constructor(
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<Transaction>,
    @InjectModel('Category')
    private readonly categoryModel: Model<Category>,
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

    const message = this.transactionMessage(transaction.type, 'registrado');

    return { message };
  }

  async findAll(limit?: number, startDate?: string, endDate?: string) {
    const filter: any = {};

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        filter.date.$gte = new Date(
          /^\d{4}-\d{2}-\d{2}$/.test(startDate)
            ? `${startDate}T00:00:00.000Z`
            : startDate,
        );
      }
      if (endDate) {
        filter.date.$lte = new Date(
          /^\d{4}-\d{2}-\d{2}$/.test(endDate)
            ? `${endDate}T23:59:59.999Z`
            : endDate,
        );
      }
    }

    const query = this.transactionModel
      .find(filter)
      .populate('category')
      .sort({ date: -1 });

    if (limit && limit > 0) {
      query.limit(limit);
    }

    return await query.exec();
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

    const message = this.transactionMessage(transaction.type, 'actualizado');

    return { message };
  }

  async remove(id: string) {
    const transaction = await this.transactionModel.findByIdAndDelete(id);

    if (!transaction) {
      throw new NotFoundException({
        message: `El id ${id} de la transacción no existe.`,
      });
    }

    return { message: 'La transacción ha sido eliminada.' };
  }

  async getTotals(year?: number, month?: number) {
    let matchStage = {};

    if (year && month) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 1);
      matchStage = {
        date: {
          $gte: startDate,
          $lt: endDate,
        },
      };
    }

    const totals = await this.transactionModel.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$type',
          totalAmount: { $sum: '$amount' },
        },
      },
    ]);

    const result = {
      income: 0,
      expense: 0,
    };

    totals.forEach((item) => {
      if (item._id === TransactionType.INCOME) {
        result.income = item.totalAmount;
      } else if (item._id === TransactionType.EXPENSE) {
        result.expense = item.totalAmount;
      }
    });

    return [result];
  }

  async getTotalsByCategory(year?: number, month?: number) {
    let matchStage: any = {};

    if (year && month) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 1);
      matchStage = {
        date: {
          $gte: startDate,
          $lt: endDate,
        },
      };
    }

    const results = await this.categoryModel.aggregate([
      {
        $lookup: {
          from: 'transactions',
          let: { categoryId: '$_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$category', '$$categoryId'] } } },
            { $match: matchStage },
            {
              $group: {
                _id: null,
                totalIncome: {
                  $sum: {
                    $cond: [
                      { $eq: ['$type', TransactionType.INCOME] },
                      '$amount',
                      0,
                    ],
                  },
                },
                totalExpense: {
                  $sum: {
                    $cond: [
                      { $eq: ['$type', TransactionType.EXPENSE] },
                      '$amount',
                      0,
                    ],
                  },
                },
                incomeCount: {
                  $sum: {
                    $cond: [{ $eq: ['$type', TransactionType.INCOME] }, 1, 0],
                  },
                },
                expenseCount: {
                  $sum: {
                    $cond: [{ $eq: ['$type', TransactionType.EXPENSE] }, 1, 0],
                  },
                },
              },
            },
          ],
          as: 'transactionData',
        },
      },

      {
        $unwind: {
          path: '$transactionData',
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $project: {
          categoryId: '$_id',
          categoryName: '$name',
          totalIncome: {
            $ifNull: ['$transactionData.totalIncome', 0],
          },
          totalExpense: {
            $ifNull: ['$transactionData.totalExpense', 0],
          },
          incomeCount: {
            $ifNull: ['$transactionData.incomeCount', 0],
          },
          expenseCount: {
            $ifNull: ['$transactionData.expenseCount', 0],
          },
          _id: 0,
        },
      },

      {
        $sort: {
          categoryName: 1,
        },
      },
    ]);

    return results;
  }

  async getMonthlyTransactions(year: number, month: number) {
    if (!year || !month) {
      throw new BadRequestException(
        'El año y el mes son requeridos para obtener las transacciones mensuales.',
      );
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    return await this.transactionModel
      .find({
        date: {
          $gte: startDate,
          $lt: endDate,
        },
      })
      .populate('category')
      .sort({ date: -1 });
  }

  async getMonthlyTotals(year: number = new Date().getFullYear()) {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year + 1, 0, 1);

    const aggregates = await this.transactionModel.aggregate([
      {
        $match: {
          date: {
            $gte: startDate,
            $lt: endDate,
          },
        },
      },
      {
        $group: {
          _id: {
            month: { $month: '$date' },
            type: '$type',
          },
          totalAmount: { $sum: '$amount' },
        },
      },
      {
        $sort: { '_id.month': 1 },
      },
    ]);

    const results = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      income: 0,
      expense: 0,
    }));

    aggregates.forEach((item) => {
      const monthIndex = item._id.month - 1;
      if (item._id.type === TransactionType.INCOME) {
        results[monthIndex].income = item.totalAmount;
      } else if (item._id.type === TransactionType.EXPENSE) {
        results[monthIndex].expense = item.totalAmount;
      }
    });

    return results;
  }

  async getDailyTotals(year: number, month: number) {
    if (!year || !month) {
      throw new BadRequestException(
        'El año y el mes son requeridos para obtener los totales diarios.',
      );
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);
    const daysInMonth = new Date(year, month, 0).getDate();

    const aggregates = await this.transactionModel.aggregate([
      {
        $match: {
          date: {
            $gte: startDate,
            $lt: endDate,
          },
        },
      },
      {
        $group: {
          _id: {
            day: { $dayOfMonth: '$date' },
            type: '$type',
          },
          totalAmount: { $sum: '$amount' },
        },
      },
      {
        $sort: { '_id.day': 1 },
      },
    ]);

    const results = Array.from({ length: daysInMonth }, (_, i) => ({
      day: i + 1,
      income: 0,
      expense: 0,
    }));

    aggregates.forEach((item) => {
      const dayIndex = item._id.day - 1;
      if (dayIndex >= 0 && dayIndex < daysInMonth) {
        if (item._id.type === TransactionType.INCOME) {
          results[dayIndex].income = item.totalAmount;
        } else if (item._id.type === TransactionType.EXPENSE) {
          results[dayIndex].expense = item.totalAmount;
        }
      }
    });

    return results;
  }

  private transactionMessage(
    transactionType: TransactionType,
    action: string,
  ): string {
    let baseType: string;

    if (transactionType === 'income') {
      baseType = 'Ingreso';
    } else {
      baseType = 'Gasto';
    }
    return `${baseType} ${action} exitosamente.`;
  }
}
