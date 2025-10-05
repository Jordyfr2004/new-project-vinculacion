import { Injectable, NotFoundException } from '@nestjs/common';
import { SolicitudRepository } from 'src/receptores/infrastructure/repositories/solicitud.repository/solicitud.repository';
import { ReceptorRepository } from 'src/receptores/infrastructure/repositories/receptor.repository/receptor.repository';
import { CreateSolicitudDto } from 'src/receptores/domain/dto/create-solicitud.dto/create-solicitud.dto';
import { UpdateSolicitudDto } from 'src/receptores/domain/dto/update-solicitud.dto/update-solicitud.dto';

@Injectable()
export class SolicitudService {
	constructor(
		private readonly repository: SolicitudRepository,
		private readonly receptorRepo: ReceptorRepository,
	) {}

	async create(dto: CreateSolicitudDto) {
		// verificar receptor
		const receptor = await this.receptorRepo.findOne(dto.id_receptor);
		if (!receptor) throw new NotFoundException('Receptor no encontrado');
		const data: any = { estado: dto.estado, motivo: dto.motivo, receptor };
		return this.repository.create(data);
	}

	async findAll() {
		return this.repository.findAll();
	}

	async findOne(id: string) {
		const s = await this.repository.findOne(id);
		if (!s) throw new NotFoundException('Solicitud no encontrada');
		return s;
	}

	async update(id: string, dto: UpdateSolicitudDto) {
		const u = await this.repository.update(id, dto as any);
		if (!u) throw new NotFoundException('Solicitud no encontrada');
		return u;
	}

	async remove(id: string) {
		const s = await this.repository.findOne(id);
		if (!s) throw new NotFoundException('Solicitud no encontrada');
		await this.repository.delete(id);
		return { deleted: true };
	}
}
