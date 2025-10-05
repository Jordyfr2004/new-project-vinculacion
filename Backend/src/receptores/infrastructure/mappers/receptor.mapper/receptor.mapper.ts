import { Receptor } from 'src/receptores/domain/models/receptor/receptor';
import { CreateReceptorDto } from 'src/receptores/domain/dto/create-receptor.dto/create-receptor.dto';
import { UpdateReceptorDto } from 'src/receptores/domain/dto/update-receptor.dto/update-receptor.dto';

export class ReceptorMapper {
	static toEntity(dto: CreateReceptorDto | UpdateReceptorDto): Partial<Receptor> {
		const e: Partial<Receptor> = {};
		if ('nombres' in dto) e.nombres = dto['nombres'];
		if ('apellidos' in dto) e.apellidos = dto['apellidos'];
		if ('cedula' in dto) e.cedula = dto['cedula'];
		if ('email' in dto) e.email = dto['email'];
		if ('telefono' in dto) e.telefono = dto['telefono'];
		if ('direccion' in dto) e.direccion = dto['direccion'];
		return e;
	}

	static toDto(entity: Receptor) {
		return {
			id_receptor: entity.id_receptor,
			nombres: entity.nombres,
			apellidos: entity.apellidos,
			cedula: entity.cedula,
			email: entity.email,
			telefono: entity.telefono,
			direccion: entity.direccion,
			fecha_registro: entity.fecha_registro,
		};
	}
}
