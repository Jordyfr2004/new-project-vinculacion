import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateReceptorDto {
	@IsNotEmpty()
	@IsString()
	nombres: string;

	@IsNotEmpty()
	@IsString()
	apellidos: string;

	@IsNotEmpty()
	@IsString()
	cedula: string;

	@IsNotEmpty()
	@IsEmail()
	email: string;

	@IsNotEmpty()
	@IsString()
	telefono: string;

	@IsNotEmpty()
	@IsString()
	direccion: string;
}
