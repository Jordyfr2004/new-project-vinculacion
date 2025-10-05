import { Body, Controller, Delete, Get, Param, Post, Put, UsePipes, ValidationPipe } from '@nestjs/common';
import { SolicitudService } from 'src/receptores/services/solicitud/solicitud.service';
import { CreateSolicitudDto } from 'src/receptores/domain/dto/create-solicitud.dto/create-solicitud.dto';
import { UpdateSolicitudDto } from 'src/receptores/domain/dto/update-solicitud.dto/update-solicitud.dto';

@Controller('solicitud')
export class SolicitudController {
	constructor(private readonly service: SolicitudService) {}

	@Post()
	@UsePipes(new ValidationPipe({ whitelist: true }))
	async create(@Body() dto: CreateSolicitudDto) {
		const created = await this.service.create(dto);
		return { data: created };
	}

	@Get()
	async findAll() {
		return { data: await this.service.findAll() };
	}

	@Get(':id')
	async findOne(@Param('id') id: string) {
		return { data: await this.service.findOne(id) };
	}

	@Put(':id')
	@UsePipes(new ValidationPipe({ whitelist: true }))
	async update(@Param('id') id: string, @Body() dto: UpdateSolicitudDto) {
		return { data: await this.service.update(id, dto) };
	}

	@Delete(':id')
	async remove(@Param('id') id: string) {
		return await this.service.remove(id);
	}
}
