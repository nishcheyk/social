import { IsString, MinLength, MaxLength } from 'class-validator';

export class RegisterUserDto {
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  username!: string;

  @IsString()
  @MinLength(6)
  @MaxLength(50)
  password!: string;
}

export class LoginUserDto {
  @IsString()
  username!: string;

  @IsString()
  password!: string;
}

export class RefreshTokenDto {
  @IsString()
  userId!: string;

  @IsString()
  refreshToken!: string;
}
