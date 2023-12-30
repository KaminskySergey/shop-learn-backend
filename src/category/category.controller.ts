import {
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  UsePipes,
  ValidationPipe,
  Put,
  Body,
  Delete,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { CategoryDto } from './dto/category-dto';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  async getAll() {
    return this.categoryService.getAll();
  }

  @Get(':id')
  @Auth()
  async getById(@Param('id') id: string) {
    return this.categoryService.byId(+id);
  }

  @Get('by-slug/:slug')
  async getBySlug(@Param('slug') slug: string) {
    return this.categoryService.bySlug(slug);
  }

  @Post()
  @Auth('admin')
  @HttpCode(200)
  async create() {
    return this.categoryService.create();
  }

  @Put(':categoryId')
  @Auth('admin')
  @HttpCode(200)
  @UsePipes(new ValidationPipe())
  async update(
    @Param('categoryId') categoryId: number,
    @Body() dto: CategoryDto,
  ) {
    return this.categoryService.update(+categoryId, dto);
  }

  @Delete(':id')
  @Auth('admin')
  @HttpCode(200)
  @UsePipes(new ValidationPipe())
  async delete(@Param('id') id: number) {
    return this.categoryService.delete(+id);
  }
}
