import { Injectable } from '@nestjs/common';
import { CreateDonacionDto } from 'src/donantes/domain/dto/create-donacion.dto/create-donacion.dto';
import { DonacionRepository } from 'src/donantes/infrastructure/repositories/donacion.repository/donacion.repository';

@Injectable()
export class DonacionService {
    constructor(private readonly donacionRepo:DonacionRepository){}


    create(dto: CreateDonacionDto){
        return this.donacionRepo.create(dto);
    }

    finAll(){
        return this.donacionRepo.findAll();
    }

    findById( id: string){
        return this.donacionRepo.findById(id);
    }

    remove(id: string){
        return this.donacionRepo.delete(id);
    }

    getHello(): string{
        return 'Donaciones';
    }
}
