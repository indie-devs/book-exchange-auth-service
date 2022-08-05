import { IsEmail, IsNotEmpty } from 'class-validator';

export class RegisterUserAuthDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}

export class LoginUserAuthReqDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}

export class LoginUserAuthResDto {
  @IsNotEmpty()
  access_token: string;
}

export class JwtUserResDto {
  @IsNotEmpty()
  id: string;

  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  isAdmin: boolean;

  roles: string[];
}
