import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateReceptorDto } from 'src/receptores/domain/dto/create-receptor.dto/create-receptor.dto';
import { ReceptorRepository } from 'src/receptores/infrastructure/repositories/receptor.repository/receptor.repository';
import { ConfigService } from '@nestjs/config';
import { hashPassword } from 'src/common/crytpto/password';
import { IReceptor } from 'src/receptores/domain/interfaces/receptor/receptor.interface';


@Injectable()
export class ReceptoresService {
    constructor(
        private readonly receptorRepo: ReceptorRepository,
        private readonly configService: ConfigService,
    ){}

    async create( dto: CreateReceptorDto){
        const pepper = this.configService.get<string>('PEPPER');
        const hashed = await hashPassword(dto.password, pepper);

        const nuevoReceptor =({
            ...dto,
            password: hashed,
        })
        return await this.receptorRepo.create(nuevoReceptor);
    }


    findAll(){
        return this.receptorRepo.findAll();
    }

    findById( id: string){
        return this.receptorRepo.findById(id);
    }

    async update(id: string, dto: Partial<IReceptor>): Promise<IReceptor | null>{
        const existente = await this.receptorRepo.findById(id);
        if(!existente) throw new NotFoundException('Receptor no encontrado');
        const patch: Partial<IReceptor>= { ...dto};

        if (dto.password){
            const pepper = this.configService.get<string>('PEPPER');
            patch.password = await hashPassword(dto.password, pepper);
        }
        return this.receptorRepo.update(id, patch);
    }

    remove(id: string){
        return this.receptorRepo.delete(id);
    }

    async findByCiWithPassword(cedula: string){
        return this.receptorRepo.finByCiWithPassword(cedula);
    }
}
