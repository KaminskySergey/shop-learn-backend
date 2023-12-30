import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { CurrentUser } from 'src/auth/decorators/user.decorator';
import { ReviewDto } from './dto/review.dto';

@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Get()
  @Auth('admin')
  async getAll() {
    return this.reviewService.getAll();
  }

  @Get('average-by-product/:productId')
  async getAverageByProduct(@Param('productId') productId: string) {
    return this.reviewService.getAverageValueByProductId(+productId);
  }

  @Post('leave/:productId')
  @Auth()
  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  async getById(
    @CurrentUser('id') userId: number,
    @Body() dto: ReviewDto,
    @Param('productId') productId: string,
  ) {
    return this.reviewService.create(userId, dto, +productId);
  }
}
