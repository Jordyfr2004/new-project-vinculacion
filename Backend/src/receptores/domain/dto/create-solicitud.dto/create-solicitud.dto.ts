import { IsNotEmpty, IsString } from 'class-validator';

export class CreateSolicitudDto {
	@IsNotEmpty()
	@IsString()
	estado: string;

	@IsNotEmpty()
	@IsString()
	motivo: string;

	@IsNotEmpty()
	@IsString()
	id_receptor: string; // receptor id para relacionar
}
