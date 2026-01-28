import { IsString, IsInt, IsDateString } from 'class-validator';

export class CreateCicloDto {
  @IsString()
  name: string;

  @IsInt()
  year: number;

  @IsInt()
  period: number;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;
}