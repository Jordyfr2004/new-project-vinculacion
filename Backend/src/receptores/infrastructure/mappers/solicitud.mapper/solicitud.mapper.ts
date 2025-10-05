import { SolicitudModel } from 'src/receptores/domain/models/solicitud.model/solicitud.model';
import { CreateSolicitudDto } from 'src/receptores/domain/dto/create-solicitud.dto/create-solicitud.dto';
import { UpdateSolicitudDto } from 'src/receptores/domain/dto/update-solicitud.dto/update-solicitud.dto';

export class SolicitudMapper {
	static toEntity(dto: CreateSolicitudDto | UpdateSolicitudDto): Partial<SolicitudModel> {
		const e: Partial<SolicitudModel> = {};
		if ('estado' in dto) e.estado = dto['estado'];
		if ('motivo' in dto) e.motivo = dto['motivo'];
		return e;
	}

	static toDto(entity: SolicitudModel) {
		return {
			id_solicitud: entity.id_solicitud,
			estado: entity.estado,
			motivo: entity.motivo,
			fecha_solicitud: entity.fecha_solicitud,
			receptor: entity.receptor ? { id_receptor: entity.receptor.id_receptor } : null,
			admin: entity.admin ? { id_admin: entity.admin.id_admin } : null,
		};
	}
}
