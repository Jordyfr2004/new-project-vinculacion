import { IsOptional, IsString } from 'class-validator';

export class UpdateSolicitudDto {
	@IsOptional()
	@IsString()
	estado?: string;

	@IsOptional()
	@IsString()
	motivo?: string;
}
