import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Post,
	Put,
	UsePipes,
	ValidationPipe,
} from '@nestjs/common';
import { AdministradorService } from 'src/administrador/services/administrador/administrador.service';
import { CreateAdministradorDto } from 'src/administrador/domain/dto/create-administrador.dto/create-administrador.dto';
import { UpdateAdministradorDto } from 'src/administrador/domain/dto/update-administrador.dto/update-administrador.dto';

@Controller('administrador')
export class AdministradorController {
	constructor(private readonly service: AdministradorService) {}

	@Post()
	@UsePipes(new ValidationPipe({ whitelist: true }))
	async create(@Body() dto: CreateAdministradorDto) {
		const created = await this.service.create(dto);
		return { data: created };
	}

	@Get()
	async findAll() {
		const items = await this.service.findAll();
		return { data: items };
	}

	@Get(':id')
	async findOne(@Param('id') id: string) {
		const item = await this.service.findOne(id);
		return { data: item };
	}

	@Put(':id')
	@UsePipes(new ValidationPipe({ whitelist: true }))
	async update(@Param('id') id: string, @Body() dto: UpdateAdministradorDto) {
		const updated = await this.service.update(id, dto);
		return { data: updated };
	}

	@Delete(':id')
	async remove(@Param('id') id: string) {
		const res = await this.service.remove(id);
		return res;
	}
}
