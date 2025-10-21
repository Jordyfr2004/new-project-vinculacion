import { Body, Controller, Delete, ForbiddenException, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt.auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { CreateDonadorDto } from 'src/donantes/domain/dto/create-donador.dto/create-donador.dto';
import { UpdateDonadorDto } from 'src/donantes/domain/dto/update-donador.dto/update-donador.dto';
import { DonadorService } from 'src/donantes/services/donador/donador.service';

@Controller('donantes')

export class DonantesController {
    constructor(private readonly donantesService: DonadorService) {}



    @Post()
    create(@Body() dto: CreateDonadorDto){
        return this.donantesService.create(dto);
    }


    
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin','donante')
    @Get()
    async findAll( @Req() req: Request) {
        const user = req['user'];
        if (user.rol ==='admin'){
            return this.donantesService.findAll();
        }
        return this.donantesService.findById(user.id);
    }

    @Roles('admin','donante')
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.donantesService.findById(id);
    }

    

    @Roles('admin','donante')
    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateDonadorDto, @Req() req: Request,){
        const user = req['user'];
        if (user.rol !== 'admin' && user.id !== id){
            throw new ForbiddenException('No autorizado');
        }
        return this.donantesService.update(id, dto);
    }

    @Roles('admin','donante')
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.donantesService.remove(id);
    }
}
