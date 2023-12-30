import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { OrderDto } from './dto/order.dto';

@Injectable()
export class OrderService {
  constructor(private readonly prisma: PrismaService) {}

  async getAll() {
    return this.prisma.order.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
                price: true,
                images: true,
                category: true,
                categoryId: true,
                description: true,
                slug: true,
                createdAt: true,
              },
            },
          },
        },
      },
    });
  }

  async getByUserId(userId: number) {
    return this.prisma.order.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
                price: true,
                images: true,
                category: true,
                categoryId: true,
                description: true,
                slug: true,
              },
            },
          },
        },
      },
    });
  }

  async placeOrder(dto: OrderDto, userId: number) {
    const order = await this.prisma.order.create({
      data: {
        status: dto.status,
        items: {
          create: dto.items,
        },
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });

    return order;
  }
}
