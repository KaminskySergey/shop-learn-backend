import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { PrismaService } from 'src/database/prisma.service';
import { PaginationService } from 'src/pagination/pagination.service';
import { CategoryModule } from 'src/category/category.module';
import { PaginationModule } from 'src/pagination/pagination.module';

@Module({
  controllers: [ProductController],
  imports: [CategoryModule, PaginationModule],
  providers: [ProductService, PrismaService, PaginationService],
})
export class ProductModule {}
