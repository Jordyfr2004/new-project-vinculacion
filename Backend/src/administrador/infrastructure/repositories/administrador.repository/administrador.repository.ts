import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Administrador } from 'src/administrador/domain/models/administrador/administrador';

@Injectable()
export class AdministradorRepository {
	constructor(
		@InjectRepository(Administrador)
		private readonly repo: Repository<Administrador>,
	) {}

	async create(admin: Partial<Administrador>): Promise<Administrador> {
		const e = this.repo.create(admin as any);
		const saved = await this.repo.save(e as any);
		return saved as Administrador;
	}

	async findAll(): Promise<Administrador[]> {
		return this.repo.find();
	}

	async findOne(id: string): Promise<Administrador | null> {
		return this.repo.findOne({ where: { id_admin: id } });
	}

	async update(id: string, partial: Partial<Administrador>): Promise<Administrador | null> {
		await this.repo.update({ id_admin: id } as any, partial as any);
		return this.findOne(id);
	}

	async delete(id: string): Promise<void> {
		await this.repo.delete({ id_admin: id } as any);
	}
}
