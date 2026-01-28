import { IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class FilterEstudianteDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    careerId?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    currentCicle?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    minCicle?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    maxCicle?: number;
}
