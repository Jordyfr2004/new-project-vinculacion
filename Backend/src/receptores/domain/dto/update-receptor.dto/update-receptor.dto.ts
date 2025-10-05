import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateReceptorDto {
	@IsOptional()
	@IsString()
	nombres?: string;

	@IsOptional()
	@IsString()
	apellidos?: string;

	@IsOptional()
	@IsString()
	cedula?: string;

	@IsOptional()
	@IsEmail()
	email?: string;

	@IsOptional()
	@IsString()
	telefono?: string;

	@IsOptional()
	@IsString()
	direccion?: string;
}
