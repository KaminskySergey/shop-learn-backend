import { Body, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { CategoryDto } from './dto/category-dto';
import { generateSlug } from 'src/utills/generateSlug';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  async getAll() {
    return this.prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });
  }

  async byId(id: number) {
    const category = await this.prisma.category.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });

    if (!category) throw new Error('Category not found');
    return category;
  }

  async bySlug(slug: string) {
    const categorySlug = await this.prisma.category.findUnique({
      where: {
        slug,
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });
    if (!categorySlug) throw new NotFoundException('categorySlug not found');
    return categorySlug;
  }

  async create() {
    const category = await this.prisma.category.create({
      data: {
        name: '',
        slug: '',
      },
    });
    return category;
  }

  async update(id: number, @Body() dto: CategoryDto) {
    const category = await this.prisma.category.update({
      where: {
        id,
      },
      data: {
        name: dto.name,
        slug: generateSlug(dto.name),
      },
    });
    return category;
  }

  async delete(id: number) {
    const category = await this.prisma.category.delete({
      where: {
        id,
      },
    });
    return category;
  }
}
