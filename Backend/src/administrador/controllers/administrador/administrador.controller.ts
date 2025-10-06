import { Body, Controller, Delete, Get, Param, Patch, Post} from '@nestjs/common';
import { CreateAdministradorDto } from 'src/administrador/domain/dto/create-administrador.dto/create-administrador.dto';
import { AdministradorService } from 'src/administrador/services/administrador/administrador.service';

@Controller('administrador')
export class AdministradorController {
    constructor(private readonly administradorServices: AdministradorService) {}
    

    @Get()
    findAll() {
        return this.administradorServices.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.administradorServices.findById(id);
    }

    @Post()
    create(@Body() dto: CreateAdministradorDto){
        return this.administradorServices.create(dto);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: Partial<CreateAdministradorDto>){
        return this.administradorServices.update(id, dto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.administradorServices.remove(id);
    }
}
