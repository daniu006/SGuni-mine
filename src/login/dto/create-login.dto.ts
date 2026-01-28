import { IsEmail, IsNotEmpty, MinLength, IsEnum } from 'class-validator';

enum RolEnum {
  ESTUDIANTE = 'ESTUDIANTE',
  DOCENTE = 'DOCENTE',
}

export class CreateLoginDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(4)
  password: string;

  @IsEnum(RolEnum)
  @IsNotEmpty()
  rol: RolEnum;
}
