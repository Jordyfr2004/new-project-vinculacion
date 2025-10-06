import { Injectable } from '@nestjs/common';
import { CreateAdministradorDto } from 'src/administrador/domain/dto/create-administrador.dto/create-administrador.dto';
import { AdministradorRepository } from 'src/administrador/infrastructure/repositories/administrador.repository/administrador.repository';

@Injectable()
export class AdministradorService {
    constructor(private readonly adminRepo:AdministradorRepository){}

    create(dto: CreateAdministradorDto){
        return this.adminRepo.create(dto);
    }

    findAll(){
        return this.adminRepo.finAll();
    }

    findById( id: string){
        return this.adminRepo.findById(id);
    }

    update(id: string, dto: Partial<any>){
        return this.adminRepo.update(id, dto);
    }

    remove(id: string){
        return this.adminRepo.delete(id);
    }

    getHello(): string{
        return 'bienvenido administrador';
    }

    
}
