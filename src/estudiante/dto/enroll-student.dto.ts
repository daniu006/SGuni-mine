import { IsInt, IsNotEmpty, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class EnrollStudentDto {
    @IsNotEmpty()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    studentProfileId: number;

    @IsNotEmpty()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    subjectId: number;
}
