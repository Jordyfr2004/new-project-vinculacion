import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDonacionDto } from 'src/donantes/domain/dto/create-donacion.dto/create-donacion.dto';
import { DonacionRepository } from 'src/donantes/infrastructure/repositories/donacion.repository/donacion.repository';
import { DonadorRepository } from 'src/donantes/infrastructure/repositories/donador.repository/donador.repository';

@Injectable()
export class DonacionService {
    constructor(
        private readonly donacionRepo:DonacionRepository,
        private readonly donadorRepo:DonadorRepository,
    ){}


    async create(dto: CreateDonacionDto){
        const donador = await this.donadorRepo.findById(dto.id_donante);
        if(!donador) throw new NotFoundException('Donador no encontrado');
        const payload = {
            descripcion: dto.descripcion,
            donador: { id_donante: dto.id_donante} as any,
        }

        return  await this.donacionRepo.create(payload);
    }

    finAll(){
        return this.donacionRepo.findAll();
    }

    findById( id: string){
        return this.donacionRepo.findById(id);
    }

    update(id: string, dto: Partial<any>){
        return this.donacionRepo.update(id, dto);
    }

    remove(id: string){
        return this.donacionRepo.delete(id);
    }

    getHello(): string{
        return 'Donaciones';
    }

    
}
