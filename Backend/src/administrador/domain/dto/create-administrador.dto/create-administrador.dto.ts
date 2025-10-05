import { IsEmail, IsString } from "class-validator";

export class CreateAdministradorDto {
    @IsString()
    public nombre: string;

    @IsEmail()
    public email: string;

    @IsString()
    public password: string;
}
