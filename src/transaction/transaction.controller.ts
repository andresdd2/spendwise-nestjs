import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { ObjectIdValidationPipe } from 'src/common/pipes/object-id-validation/object-id-validation.pipe';

@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  create(@Body() createTransactionDto: CreateTransactionDto) {
    return this.transactionService.create(createTransactionDto);
  }

  @Get()
  findAll() {
    return this.transactionService.findAll();
  }

  @Get('totals')
  getTotals(@Query('year') year: string, @Query('month') month: string) {
    return this.transactionService.getTotals(
      year ? parseInt(year, 10) : undefined,
      month ? parseInt(month, 10) : undefined,
    );
  }

  @Get('totals/by-category')
  getTotalsByCategory(
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    return this.transactionService.getTotalsByCategory(
      year ? parseInt(year, 10) : undefined,
      month ? parseInt(month, 10) : undefined,
    );
  }

  @Get('monthly')
  getMonthlyTransactions( @Query('year') year: string, @Query('month') month: string ) {
    return this.transactionService.getMonthlyTransactions(
      parseInt(year, 10),
      parseInt(month, 10),
    );
  }

  @Get('totals/monthly')
  getMonthlyTotals(@Query('year') year: string) {
    return this.transactionService.getMonthlyTotals(
      year ? parseInt(year, 10) : undefined,
    );
  }

  @Get('totals/daily')
  getDailyTotals(@Query('year') year: string, @Query('month') month: string) {
    return this.transactionService.getDailyTotals(
      parseInt(year, 10),
      parseInt(month, 10),
    );
  }

  @Get(':id')
  findOne(@Param('id', ObjectIdValidationPipe) id: string) {
    return this.transactionService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ObjectIdValidationPipe) id: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
  ) {
    return this.transactionService.update(id, updateTransactionDto);
  }

  @Delete(':id')
  remove(@Param('id', ObjectIdValidationPipe) id: string) {
    return this.transactionService.remove(id);
  }
}