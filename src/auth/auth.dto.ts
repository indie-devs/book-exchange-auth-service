import { IsEmail, IsNotEmpty } from 'class-validator';

export class RegisterUserAuthDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}

export class LoginUserAuthDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}
