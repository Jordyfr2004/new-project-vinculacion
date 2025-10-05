import { Injectable, NotFoundException } from '@nestjs/common';
import { ReceptorRepository } from 'src/receptores/infrastructure/repositories/receptor.repository/receptor.repository';
import { CreateReceptorDto } from 'src/receptores/domain/dto/create-receptor.dto/create-receptor.dto';
import { UpdateReceptorDto } from 'src/receptores/domain/dto/update-receptor.dto/update-receptor.dto';

@Injectable()
export class ReceptoresService {
	constructor(private readonly repository: ReceptorRepository) {}

	async create(dto: CreateReceptorDto) {
		return this.repository.create(dto as any);
	}

	async findAll() {
		return this.repository.findAll();
	}

	async findOne(id: string) {
		const r = await this.repository.findOne(id);
		if (!r) throw new NotFoundException('Receptor no encontrado');
		return r;
	}

	async update(id: string, dto: UpdateReceptorDto) {
		const u = await this.repository.update(id, dto as any);
		if (!u) throw new NotFoundException('Receptor no encontrado');
		return u;
	}

	async remove(id: string) {
		const r = await this.repository.findOne(id);
		if (!r) throw new NotFoundException('Receptor no encontrado');
		await this.repository.delete(id);
		return { deleted: true };
	}
}
