import { Administrador } from 'src/administrador/domain/models/administrador/administrador';
import { CreateAdministradorDto } from 'src/administrador/domain/dto/create-administrador.dto/create-administrador.dto';
import { UpdateAdministradorDto } from 'src/administrador/domain/dto/update-administrador.dto/update-administrador.dto';

export class AdministradorMapper {
	static toEntity(dto: CreateAdministradorDto | UpdateAdministradorDto): Partial<Administrador> {
		const entity: Partial<Administrador> = {};
		if ('nombre' in dto) entity.nombre = dto['nombre'];
		if ('email' in dto) entity.email = dto['email'];
		if ('contrasena' in dto) entity.contrasena = dto['contrasena'];
		return entity;
	}

	static toDto(entity: Administrador) {
		return {
			id_admin: entity.id_admin,
			nombre: entity.nombre,
			email: entity.email,
		};
	}
}
