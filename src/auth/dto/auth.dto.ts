import { MinLength, IsString, IsEmail } from 'class-validator';

export class AuthDto {
  @IsEmail()
  email: string;

  @MinLength(6, { message: 'Password must min-length 6 ' })
  @IsString()
  password: string;
}
