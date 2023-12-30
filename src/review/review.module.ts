import { Module } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { PrismaService } from 'src/database/prisma.service';
import { ProductService } from 'src/product/product.service';
import { PaginationModule } from 'src/pagination/pagination.module';
import { ProductModule } from 'src/product/product.module';
import { CategoryModule } from 'src/category/category.module';

@Module({
  controllers: [ReviewController],
  providers: [ReviewService, PrismaService, ProductService],
  imports: [ProductModule, PaginationModule, CategoryModule],
})
export class ReviewModule {}
