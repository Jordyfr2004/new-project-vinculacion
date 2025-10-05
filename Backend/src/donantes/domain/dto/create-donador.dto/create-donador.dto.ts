import { IsEmail, IsString } from "class-validator";


export class CreateDonadorDto {
    @IsString()
    public tipo_donante: string;

    @IsString()
    public nombre: string;

    @IsString()
    public direccion:string;

    @IsString()
    public telefono:string;

    @IsEmail()
    public email:string;
}
