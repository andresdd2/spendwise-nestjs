import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { mongooseConfig } from './config/mongooseConfig';
import { CategoryModule } from './category/category.module';
import { TransactionModule } from './transaction/transaction.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRootAsync(
      mongooseConfig,
    ),
    CategoryModule,
    TransactionModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}