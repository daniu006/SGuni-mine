import { IsNotEmpty, IsString } from "class-validator";

export class CreateEspecialidadDto {
    @IsString()
    @IsNotEmpty()
    nombre: string;
}
