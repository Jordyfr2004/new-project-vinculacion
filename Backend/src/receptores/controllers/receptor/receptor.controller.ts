import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateReceptorDto } from 'src/receptores/domain/dto/create-receptor.dto/create-receptor.dto';
import { ReceptoresService } from 'src/receptores/services/receptores/receptores.service';

@Controller('receptor')
export class ReceptorController {
    constructor(private readonly receptServives: ReceptoresService){}

    @Get()
    findAll(){
        return this.receptServives.findAll();
    }

    @Get(':id')
    findOne(@Param('id')id: string){
        return this.receptServives.findById(id);
    }

    @Post()
    create(@Body() dto: CreateReceptorDto){
        return this.receptServives.create(dto);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: CreateReceptorDto){
        return this.receptServives.update(id, dto);
    }

    @Delete(':id')
    remove(@Param('id') id: string){
        return this.receptServives.remove(id);
    }

}
