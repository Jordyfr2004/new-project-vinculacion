import { Injectable } from '@nestjs/common';
import { CreateReceptorDto } from 'src/receptores/domain/dto/create-receptor.dto/create-receptor.dto';
import { ReceptorRepository } from 'src/receptores/infrastructure/repositories/receptor.repository/receptor.repository';

@Injectable()
export class ReceptoresService {
    constructor(private readonly receptorRepo: ReceptorRepository){}

    create(dto: CreateReceptorDto){
        return this.receptorRepo.create(dto);
    }

    findAll(){
        return this.receptorRepo.findAll();
    }

    findById( id: string){
        return this.receptorRepo.findById(id);
    }

    update(id: string, dto: Partial<any>){
        return this.receptorRepo.update(id, dto);
    }

    remove(id: string){
        return this.receptorRepo.delete(id);
    }

    
}
