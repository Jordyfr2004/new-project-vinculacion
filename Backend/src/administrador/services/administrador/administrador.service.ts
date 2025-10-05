import { Injectable, NotFoundException } from '@nestjs/common';
import { AdministradorRepository } from 'src/administrador/infrastructure/repositories/administrador.repository/administrador.repository';
import { CreateAdministradorDto } from 'src/administrador/domain/dto/create-administrador.dto/create-administrador.dto';
import { UpdateAdministradorDto } from 'src/administrador/domain/dto/update-administrador.dto/update-administrador.dto';

@Injectable()
export class AdministradorService {
	constructor(private readonly repository: AdministradorRepository) {}

	async create(dto: CreateAdministradorDto) {
		const created = await this.repository.create(dto as any);
		return created;
	}

	async findAll() {
		return this.repository.findAll();
	}

	async findOne(id: string) {
		const found = await this.repository.findOne(id);
		if (!found) throw new NotFoundException('Administrador no encontrado');
		return found;
	}

	async update(id: string, dto: UpdateAdministradorDto) {
		const updated = await this.repository.update(id, dto as any);
		if (!updated) throw new NotFoundException('Administrador no encontrado');
		return updated;
	}

	async remove(id: string) {
		const found = await this.repository.findOne(id);
		if (!found) throw new NotFoundException('Administrador no encontrado');
		await this.repository.delete(id);
		return { deleted: true };
	}
}
