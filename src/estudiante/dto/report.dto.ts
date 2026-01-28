import { IsOptional, IsInt, IsNumber, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ReportDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    careerId?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    minGrade?: number;

    @IsOptional()
    @IsString()
    status?: string;
}
