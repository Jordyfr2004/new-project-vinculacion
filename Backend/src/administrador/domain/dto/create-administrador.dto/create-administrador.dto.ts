import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateAdministradorDto {
	@IsNotEmpty()
	@IsString()
	nombre: string;

	@IsNotEmpty()
	@IsEmail()
	email: string;

	@IsNotEmpty()
	@IsString()
	@MinLength(6)
	contrasena: string;
}
