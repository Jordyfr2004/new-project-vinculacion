import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { hashPassword } from 'src/common/crytpto/password';
import { IDonador } from 'src/donantes/domain/interfaces/donador/donador.interface';
import { DonadorRepository } from 'src/donantes/infrastructure/repositories/donador.repository/donador.repository';

@Injectable()
export class DonadorService {
    constructor(
        private readonly donadorRepo: DonadorRepository,
        private readonly configService: ConfigService,
     ){}
    
    
    async create(dto: { nombre: string; email: string; password: string}): Promise<IDonador>{
        const pepper = this.configService.get<string>('PEPPER');
        const hashed = await  hashPassword(dto.password, pepper);

        const newDonante = {
            ...dto,
            password: hashed,
        };

        return await this.donadorRepo.create(newDonante);
    }

    findAll(){
        return this.donadorRepo.findAll();
    }

    findById( id: string){
        return this.donadorRepo.findById(id);
    }

    async update(id: string, dto: Partial<IDonador>): Promise<IDonador | null>{
        const existente = await this.donadorRepo.findById(id);
        if(!existente) throw new NotFoundException('Donante no encontrado');

        const patch: Partial<IDonador> = { ...dto};
        if (dto.password) {
            const pepper = this.configService.get<string>('PEPPER');
            patch.password = await hashPassword(dto.password, pepper);
        }
        return await this.donadorRepo.update(id, patch);
    }

    remove(id: string){
        return this.donadorRepo.delete(id);
    }
    getHello(): string{
        return 'bienvenido donante';
    }

    async findByEmailWithPassword(email: string){
        return this.donadorRepo.findEmailWithPassword(email);
    }

}
