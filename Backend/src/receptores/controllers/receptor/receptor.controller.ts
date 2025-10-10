import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt.auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { CreateReceptorDto, VerifyCedulaDto } from 'src/receptores/domain/dto/create-receptor.dto/create-receptor.dto';
import { ReceptoresService } from 'src/receptores/services/receptores/receptores.service';

@Controller('receptor')
export class ReceptorController {
    constructor(private readonly receptServices: ReceptoresService){}

    @Post('verificar')
    verifyCi(@Body() dto: VerifyCedulaDto){
        return this.receptServices.verifyCi(dto.cedula);
    }

    @Post()
    create(@Body() dto: CreateReceptorDto, @Req() req: Request) {
        const token = req.headers['authorization']?.replace('Bearer ', '');
        return this.receptServices.create(dto, token)
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @Get()
    findAll(@Req() req: Request){
        const user = req['user'];

        if (user.rol ==='admin'){
            return this.receptServices.findAll();
        }
        return this.receptServices.findById(user.id_receptor);
    }

    @Roles('admin')
    @Get(':id')
    findOne(@Param('id')id: string){
        return this.receptServices.findById(id);
    }

    
    //@Post()
    //create(@Body() dto: CreateReceptorDto){
    //    return this.receptServives.create(dto);
    //}

    @Roles('admin')
    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: CreateReceptorDto){
        return this.receptServices.update(id, dto);
    }

    @Roles('admin')
    @Delete(':id')
    remove(@Param('id') id: string){
        return this.receptServices.remove(id);
    }
}
