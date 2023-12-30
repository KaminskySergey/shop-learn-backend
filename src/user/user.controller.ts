import {
  Controller,
  Get,
  Body,
  UsePipes,
  ValidationPipe,
  Put,
  Param,
  Patch,
  HttpCode,
} from '@nestjs/common';
import { CurrentUser } from 'src/auth/decorators/user.decorator';
import { UserService } from './user.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { UserDto } from './dto/user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  @Auth()
  async getProfile(@CurrentUser('id') id: number) {
    return this.userService.byId(id);
  }

  @UsePipes(new ValidationPipe())
  @Put('profile')
  @HttpCode(200)
  @Auth()
  async updateProfile(@CurrentUser('id') id: number, @Body() dto: UserDto) {
    return this.userService.updateProfile(id, dto);
  }

  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Patch('profile/favorites/:productId')
  @Auth()
  async toggleFavorite(
    @Param('productId') productId: string,
    @CurrentUser('id') id: number,
  ) {
    return this.userService.toggleFavorite(id, +productId);
  }
}
