import { Body, Controller, Delete, Get, Param, Post, Put, UsePipes, ValidationPipe } from '@nestjs/common';
import { ReceptoresService } from 'src/receptores/services/receptores/receptores.service';
import { CreateReceptorDto } from 'src/receptores/domain/dto/create-receptor.dto/create-receptor.dto';
import { UpdateReceptorDto } from 'src/receptores/domain/dto/update-receptor.dto/update-receptor.dto';

@Controller('receptor')
export class ReceptorController {
	constructor(private readonly service: ReceptoresService) {}

	@Post()
	@UsePipes(new ValidationPipe({ whitelist: true }))
	async create(@Body() dto: CreateReceptorDto) {
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
	async update(@Param('id') id: string, @Body() dto: UpdateReceptorDto) {
		return { data: await this.service.update(id, dto) };
	}

	@Delete(':id')
	async remove(@Param('id') id: string) {
		return await this.service.remove(id);
	}
}
