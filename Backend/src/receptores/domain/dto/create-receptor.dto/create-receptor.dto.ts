import { IsEmail, IsString, Length } from "class-validator";


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

    @IsString()
    public password: string;
}



export class VerifyCedulaDto{
    @IsString()
    @Length(10,10,{message: 'La cédula debe tener 10 dígitos'})
    cedula: string;
}
