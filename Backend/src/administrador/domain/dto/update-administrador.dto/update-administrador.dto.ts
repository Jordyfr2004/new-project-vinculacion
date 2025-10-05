import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateAdministradorDto {
	@IsOptional()
	@IsString()
	nombre?: string;

	@IsOptional()
	@IsEmail()
	email?: string;

	@IsOptional()
	@IsString()
	@MinLength(6)
	contrasena?: string;
}
