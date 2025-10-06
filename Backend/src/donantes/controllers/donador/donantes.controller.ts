import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateDonadorDto } from 'src/donantes/domain/dto/create-donador.dto/create-donador.dto';
import { DonadorService } from 'src/donantes/services/donador/donador.service';

@Controller('donantes')
export class DonantesController {
    constructor(private readonly donantesService: DonadorService) {}

    @Get()
    findAll() {
        return this.donantesService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.donantesService.findById(id);
    }

    @Post()
    create(@Body() dto: CreateDonadorDto){
        return this.donantesService.create(dto);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: Partial<CreateDonadorDto>) {
        return this.donantesService.update(id, dto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.donantesService.remove(id);
    }
}
