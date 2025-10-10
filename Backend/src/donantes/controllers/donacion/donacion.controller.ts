import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt.auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { CreateDonacionDto } from 'src/donantes/domain/dto/create-donacion.dto/create-donacion.dto';
import { DonacionService } from 'src/donantes/services/donacion/donacion.service';

@Controller('donacion')
@UseGuards(JwtAuthGuard, RolesGuard)

export class DonacionController {
    constructor(private readonly donacionService: DonacionService ) {}

    @Roles('donante','admin')
    @Get()
    async findAll(@Req() req: Request) {
        // Si es admin → ve todas las donaciones
        const user = req['user'];
        if (user.rol === 'admin'){
            return this.donacionService.findAll();
        }
        // Si es donante → solo las suyas
        return this.donacionService.findByDonante(user.id);
    }

    @Roles('admin','donante')
    @Get(':id')
    findOne(@Param('id') id:string) {
        return this.donacionService.findById(id);
    }

    @Roles('donante')
    @Post()
    create(@Body() dto: CreateDonacionDto) {
        return this.donacionService.create(dto);
    }

    @Roles('donante')
    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: Partial<CreateDonacionDto>) {
        return this.donacionService.update(id, dto);
    }

    @Roles('admin','donante')
    @Delete(':id')
    remove(@Param('id') id:string){
        return this.donacionService.remove(id);
    }
}


