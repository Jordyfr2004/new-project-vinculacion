import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateSolicitudDto } from 'src/receptores/domain/dto/create-solicitud.dto/create-solicitud.dto';
import { UpdateSolicitudDto } from 'src/receptores/domain/dto/update-solicitud.dto/update-solicitud.dto';
import { SolicitudService } from 'src/receptores/services/solicitud/solicitud.service';

@Controller('solicitud')
export class SolicitudController {
    constructor(private readonly solicitudService: SolicitudService) {}

    @Get()
    findAll() {
        return this.solicitudService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.solicitudService.findById(id);
    }

    @Post()
    create(@Body() dto: CreateSolicitudDto) {
        return this.solicitudService.create(dto);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateSolicitudDto) {
        return this.solicitudService.update(id, dto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.solicitudService.remove(id);
    }
}
