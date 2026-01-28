


import { IsString, IsNumber } from "class-validator";

export class CreateDocenteDto {
    @IsString()
    nombre: string;
    @IsString()
    apellido: string;
    @IsNumber()
    telefono?: number;
}
