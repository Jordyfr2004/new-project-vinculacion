import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { CreateDonacionDto } from 'src/donantes/domain/dto/create-donacion.dto/create-donacion.dto';
import { DonacionService } from 'src/donantes/services/donacion/donacion.service';

@Controller('donacion')
export class DonacionController {
    constructor(private readonly donacionService: DonacionService ) {}
    @Get()
    findAll() {
        return this.donacionService.finAll();
    }

    @Get(':id')
    findOne(@Param('id') id:string) {
        return this.donacionService.findById(id);
    }

    @Post()
    create(@Body() dto: CreateDonacionDto) {
        return this.donacionService.create(dto);
    }

    @Delete(':id')
    remove(@Param('id') id:string){
        return this.donacionService.remove(id);
    }
}


