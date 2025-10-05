import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SolicitudModel } from 'src/receptores/domain/models/solicitud.model/solicitud.model';

@Injectable()
export class SolicitudRepository {
	constructor(
		@InjectRepository(SolicitudModel)
		private readonly repo: Repository<SolicitudModel>,
	) {}

	async create(data: Partial<SolicitudModel>): Promise<SolicitudModel> {
		const e = this.repo.create(data as any);
		return (await this.repo.save(e as any)) as SolicitudModel;
	}

	async findAll(): Promise<SolicitudModel[]> {
		return this.repo.find({ relations: ['receptor', 'admin'] });
	}

	async findOne(id: string): Promise<SolicitudModel | null> {
		return this.repo.findOne({ where: { id_solicitud: id }, relations: ['receptor', 'admin'] });
	}

	async update(id: string, partial: Partial<SolicitudModel>): Promise<SolicitudModel | null> {
		await this.repo.update({ id_solicitud: id } as any, partial as any);
		return this.findOne(id);
	}

	async delete(id: string): Promise<void> {
		await this.repo.delete({ id_solicitud: id } as any);
	}
}
