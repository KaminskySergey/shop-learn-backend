import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { ReviewDto } from './dto/review.dto';
import { ProductService } from 'src/product/product.service';

@Injectable()
export class ReviewService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly productService: ProductService,
  ) {}

  async getAll() {
    return await this.prisma.review.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        user: {
          select: {
            id: true,
            name: true,
            avatarPath: true,
          },
        },
        createdAt: true,
        text: true,
        rating: true,
        id: true,
      },
    });
  }

  async create(userId: number, dto: ReviewDto, productId: number) {
    await this.productService.byId(productId);

    return await this.prisma.review.create({
      data: {
        ...dto,
        product: {
          connect: {
            id: productId,
          },
        },
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });
  }

  async getAverageValueByProductId(productId: number) {
    return this.prisma.review
      .aggregate({
        where: {
          productId,
        },
        _avg: {
          rating: true,
        },
      })
      .then((data) => data._avg);
  }
}
