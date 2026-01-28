import { IsNotEmpty, IsString } from "class-validator";

export class CreateCarreraDto {
    @IsNotEmpty()
    @IsString()
    nombre: string;
}
