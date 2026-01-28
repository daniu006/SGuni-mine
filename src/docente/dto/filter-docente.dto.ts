import { IsOptional, IsInt, IsEnum, IsArray } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export enum EmploymentType {
    FULL_TIME = 'FULL_TIME',
    PART_TIME = 'PART_TIME',
}

export class FilterDocenteDto {
    @IsOptional()
    @Transform(({ value }) => {
        if (typeof value === 'string') {
            return value.split(',').map(id => parseInt(id, 10));
        }
        return value;
    })
    @IsArray()
    @IsInt({ each: true })
    specialityIds?: number[];

    @IsOptional()
    @IsEnum(EmploymentType)
    employmentType?: EmploymentType;

    @IsOptional()
    @Transform(({ value }) => {
        if (typeof value === 'string') {
            return value.split(',').map(id => parseInt(id, 10));
        }
        return value;
    })
    @IsArray()
    @IsInt({ each: true })
    excludeCareerIds?: number[];

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    careerId?: number;
}
