import { Injectable } from '@nestjs/common';
import { CreateDonadorDto } from 'src/donantes/domain/dto/create-donador.dto/create-donador.dto';
import { DonadorRepository } from 'src/donantes/infrastructure/repositories/donador.repository/donador.repository';

@Injectable()
export class DonadorService {
    constructor(private readonly donadorRepo: DonadorRepository ){}
    
    create(dto: CreateDonadorDto){
        return this.donadorRepo.create(dto);
    }

    findAll(){
        return this.donadorRepo.findAll();
    }

    findById( id: string){
        return this.donadorRepo.findById(id);
    }

    remove(id: string){
        return this.donadorRepo.delete(id);
    }
    getHello(): string{
        return 'bienvenido donante';
    }

}
