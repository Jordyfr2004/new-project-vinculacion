import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt.auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { CreateSolicitudDto } from 'src/receptores/domain/dto/create-solicitud.dto/create-solicitud.dto';
import { UpdateSolicitudDto } from 'src/receptores/domain/dto/update-solicitud.dto/update-solicitud.dto';
import { SolicitudService } from 'src/receptores/services/solicitud/solicitud.service';
import * as jwt from 'jsonwebtoken';


@Controller('solicitud')

export class SolicitudController {
    constructor(private readonly solicitudService: SolicitudService) {}


    @Post()
    create(@Body() dto: CreateSolicitudDto, @Req() req: Request) {
        const authHeader = req.headers['authorization'];
        if (!authHeader) throw new UnauthorizedException('Token requerido.');

        const token = authHeader.replace('Bearer ', '');
        const secret = process.env.JWT_SECRET;
        if(!secret) throw new Error('JWT no definido');
        try {
            const payload = jwt.verify(token, secret) as any;
            dto.id_receptor = payload.id_receptor;

            dto.estado = 'pendiente';
            return this.solicitudService.create(dto);
        } catch (err) {
            throw new UnauthorizedException('token invalido');
        }
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @Get()
    findAll() {
        return this.solicitudService.findAll();
    }

    @Roles('admin')
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.solicitudService.findById(id);
    }

    

    @Roles('admin')
    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateSolicitudDto) {
        return this.solicitudService.update(id, dto);
    }

    @Roles('admin')
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.solicitudService.remove(id);
    }
}
