import { Injectable } from '@nestjs/common';
import { SolicitudRepository } from 'src/receptores/infrastructure/repositories/solicitud.repository/solicitud.repository';
import { CreateSolicitudDto } from 'src/receptores/domain/dto/create-solicitud.dto/create-solicitud.dto';

@Injectable()
export class SolicitudService {
    constructor(private readonly soliRepo: SolicitudRepository){}

    create(dto: CreateSolicitudDto){
        return this.soliRepo.create(dto);
    }

    findAll(){
        return this.soliRepo.findAll();
    }

    findById(id: string){
        return this.soliRepo.findById(id);
    }

    update(id: string, dto: Partial<any>){
        return this.soliRepo.update(id, dto);
    }

    remove(id: string){
        return this.soliRepo.delete(id);
    }
    
}
