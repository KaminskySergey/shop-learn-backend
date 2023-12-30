import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { ProductDto } from './dto/product.dto';
import { generateSlug } from 'src/utills/generateSlug';
import { PaginationService } from 'src/pagination/pagination.service';
import { EnumProductSort, GetAllProductDto } from './dto/get-all.product.dto';
import { Prisma } from '@prisma/client';
import { convertToNumber } from 'src/utills/convert-to-number';
import { CategoryService } from 'src/category/category.service';

@Injectable()
export class ProductService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paginationService: PaginationService,
    private readonly categoryService: CategoryService,
  ) {}

  async getAll(dto: GetAllProductDto) {
    const { perPage, skip } = this.paginationService.getPagination(dto);

    const filters = this.createFilter(dto);
    const products = await this.prisma.product.findMany({
      where: filters,
      orderBy: this.getSortOption(dto.sort),
      skip,
      take: perPage,
      // сюди можливо щось повернути йще
      select: {
        name: true,
        description: true,
        price: true,
        images: true,
      },
    });

    return {
      products,
      length: await this.prisma.product.count({
        where: filters,
      }),
    };
  }

  private createFilter(dto: GetAllProductDto) {
    const filters: Prisma.ProductWhereInput[] = [];

    if (dto.searchTerm) filters.push(this.getSearchTermFilter(dto.searchTerm));

    if (dto.ratings)
      filters.push(
        this.getRatingFilter(dto.ratings.split('|').map((rating) => +rating)),
      );

    if (dto.minPrice || dto.maxPrice) {
      filters.push(
        this.getPriceFilter(
          convertToNumber(dto.minPrice),
          convertToNumber(dto.maxPrice),
        ),
      );
    }

    return filters.length ? { AND: filters } : {};
  }

  private getSortOption(
    sort: EnumProductSort,
  ): Prisma.ProductOrderByWithRelationInput[] {
    switch (sort) {
      case EnumProductSort.LOW_PRICE:
        return [{ price: 'asc' }];
      case EnumProductSort.HIGH_PRICE:
        return [{ price: 'desc' }];
      case EnumProductSort.OLDEST:
        return [{ createdAt: 'asc' }];
      default:
        return [{ createdAt: 'desc' }];
    }
  }

  private getSearchTermFilter(searchTerm: string): Prisma.ProductWhereInput {
    return {
      OR: [
        {
          category: {
            name: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
        },
        {
          name: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
      ],
    };
  }

  private getRatingFilter(ratings: number[]): Prisma.ProductWhereInput {
    return {
      reviews: {
        some: {
          rating: {
            in: ratings,
          },
        },
      },
    };
  }

  private getPriceFilter(minPrice?: number, maxPrice?: number) {
    let priceFilter: Prisma.IntFilter | any = undefined;

    if (minPrice) {
      priceFilter = {
        ...priceFilter,
        gte: minPrice,
      };
    }

    if (maxPrice) {
      priceFilter = {
        ...priceFilter,
        lte: minPrice,
      };
    }

    return {
      price: priceFilter,
    };
  }

  private getCategoryFilter(categoryId: number) {
    return {
      categoryId,
    };
  }

  async byId(id: number) {
    const product = await this.prisma.product.findUnique({
      where: {
        id,
      },
      select: {
        name: true,
        id: true,
        price: true,
        description: true,
        images: true,
        categoryId: true,
        reviews: {
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
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!product) throw new Error('Product not found!');
    return product;
  }

  async bySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: {
        slug,
      },
      select: {
        name: true,
        price: true,
        description: true,
        images: true,
        categoryId: true,
        createdAt: true,
        slug: true,
        reviews: {
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
          orderBy: {
            createdAt: 'desc',
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!product) throw new Error('Product not found!');
    return product;
  }

  async byCategory(categorySlug: string) {
    const products = await this.prisma.product.findMany({
      where: {
        category: {
          slug: categorySlug,
        },
      },
      select: {
        name: true,
        price: true,
        description: true,
        images: true,
        categoryId: true,
        createdAt: true,
        slug: true,
        reviews: {
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
          orderBy: {
            createdAt: 'desc',
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!products) throw new Error('Products not found!');
    return products;
  }

  async getSimilar(id: number) {
    const currentProduct = await this.byId(id);
    if (!currentProduct) throw new NotFoundException('Product not found!');
    const products = await this.prisma.product.findMany({
      where: {
        category: {
          name: currentProduct.category.name,
        },
        NOT: {
          id: currentProduct.category.id,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        name: true,
        price: true,
        description: true,
        images: true,
        categoryId: true,
        createdAt: true,
        slug: true,
      },
    });
    return products;
  }

  async create() {
    const product = await this.prisma.product.create({
      data: {
        name: '',
        price: '',
        description: '',
        slug: '',
      },
    });

    return product.id;
  }

  async update(id: number, dto: ProductDto) {
    const { name, description, price, images, categoryId } = dto;

    await this.categoryService.byId(categoryId);

    return this.prisma.product.update({
      where: {
        id,
      },
      data: {
        name,
        description,
        images,
        price: price.toString(),
        slug: generateSlug(name),
        category: {
          connect: {
            id: categoryId,
          },
        },
      },
    });
  }

  async delete(id: number) {
    await this.prisma.product.delete({
      where: {
        id,
      },
    });

    return { data: 'Success delete' };
  }
}
