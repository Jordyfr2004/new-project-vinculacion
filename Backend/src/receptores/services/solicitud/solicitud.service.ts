import { Injectable, NotFoundException } from '@nestjs/common';
import { SolicitudRepository } from 'src/receptores/infrastructure/repositories/solicitud.repository/solicitud.repository';
import { CreateSolicitudDto } from 'src/receptores/domain/dto/create-solicitud.dto/create-solicitud.dto';
import { ReceptorRepository } from 'src/receptores/infrastructure/repositories/receptor.repository/receptor.repository';

@Injectable()
export class SolicitudService {
    constructor(
        private readonly soliRepo: SolicitudRepository,
        private readonly receptorRepo: ReceptorRepository
    ){}

    async create(dto: CreateSolicitudDto){
        const receptor = await this.receptorRepo.findById(dto.id_receptor);
        if(!receptor) throw new NotFoundException('Receptor no encontrado');
        const payload = {
            estado: dto.estado,
            motivo: dto.motivo,
            receptor: {id_receptor: dto.id_receptor},
            admin: dto.id_admin ? ({ id_admin: dto.id_admin} as any ) : null
        }
        return this.soliRepo.create(payload);
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
