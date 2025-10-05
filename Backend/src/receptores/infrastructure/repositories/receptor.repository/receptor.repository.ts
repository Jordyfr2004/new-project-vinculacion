import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Receptor } from 'src/receptores/domain/models/receptor/receptor';

@Injectable()
export class ReceptorRepository {
	constructor(
		@InjectRepository(Receptor)
		private readonly repo: Repository<Receptor>,
	) {}

	async create(data: Partial<Receptor>): Promise<Receptor> {
		const e = this.repo.create(data as any);
		return (await this.repo.save(e as any)) as Receptor;
	}

	async findAll(): Promise<Receptor[]> {
		return this.repo.find({ relations: ['solicitudes'] });
	}

	async findOne(id: string): Promise<Receptor | null> {
		return this.repo.findOne({ where: { id_receptor: id }, relations: ['solicitudes'] });
	}

	async update(id: string, partial: Partial<Receptor>): Promise<Receptor | null> {
		await this.repo.update({ id_receptor: id } as any, partial as any);
		return this.findOne(id);
	}

	async delete(id: string): Promise<void> {
		await this.repo.delete({ id_receptor: id } as any);
	}
}
