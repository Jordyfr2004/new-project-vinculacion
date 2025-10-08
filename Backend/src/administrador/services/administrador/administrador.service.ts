import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IAdministrador } from 'src/administrador/domain/interfaces/administrador/administrador.interface';

import { AdministradorRepository } from 'src/administrador/infrastructure/repositories/administrador.repository/administrador.repository';
import { hashPassword } from 'src/common/crytpto/password';

@Injectable()
export class AdministradorService {
    constructor(
        private readonly adminRepo:AdministradorRepository,
        private readonly configService: ConfigService,

    ){}

    async create(dto: { nombre: string; email: string; password: string}){
        const pepper = this.configService.get<string>('PEPPER');
        const hashed = await hashPassword(dto.password, pepper)

        const nuevoAdmin =({
            ...dto,
            password: hashed,
        }) 
        return await this.adminRepo.create(nuevoAdmin);
    }

    async findAll(){
        return await this.adminRepo.finAll();
    }

    async findById( id: string){

        return this.adminRepo.findById(id);
    }

    async update(id: string, dto: Partial<IAdministrador>): Promise<IAdministrador | null>{
        const existente = await this.adminRepo.findById(id);
        if(!existente) throw new NotFoundException('Administrador no encontrado');
        const patch: Partial<IAdministrador> = { ...dto};

        if (dto.password) {
            const pepper = this.configService.get<string>('PEPPER');
            patch.password = await hashPassword(dto.password, pepper);
        }

        return  await this.adminRepo.update(id, patch);
    }

    remove(id: string){
        return this.adminRepo.delete(id);
    }

    getHello(): string{
        return 'bienvenido administrador';
    }

    async findByEmailWithPassword(email: string){
        return this.adminRepo.finByEmailWithPassword(email);
    }

    
}
