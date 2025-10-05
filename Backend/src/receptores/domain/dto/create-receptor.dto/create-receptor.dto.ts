import { IsEmail, IsString } from "class-validator";


export class CreateReceptorDto {
    @IsString()
    public nombres: string;

    @IsString()
    public apellidos: string;

    @IsString()
    public cedula: string;

    @IsEmail()
    public email: string;

    @IsString()
    public telefono: string;

    @IsString()
    public direccion: string;
}
