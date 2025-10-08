import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { IAdministrador, IAdministradorRepository } from "src/administrador/domain/interfaces/administrador/administrador.interface";
import { Administrador } from "src/administrador/domain/models/administrador/administrador";
import { Repository } from "typeorm";


@Injectable()
export class AdministradorRepository implements IAdministradorRepository {
    constructor (
        @InjectRepository( Administrador)
        private readonly repo: Repository<Administrador>,
    ){}

    async create(admin: Partial<IAdministrador>): Promise<IAdministrador> {
        const nuevoAdmin = this.repo.create(admin);
        return await this.repo.save(nuevoAdmin);
    }

    async finAll(): Promise<IAdministrador[]> {
        return await this.repo.find({ relations: ["solicitudes"] });
    }

    async findById(id: string): Promise<IAdministrador | null> {
        return await this.repo.findOne({ where: { id_admin: id }, relations: ["solicitudes"] });
    }

    async finByEmail(email: string): Promise<IAdministrador | null> {
        return await this.repo.findOne({ where: { email }});
    }

    async update(id: string, data: Partial<IAdministrador>): Promise<IAdministrador | null> {
        const entity = await this.repo.findOne({ where: { id_admin: id } });
        if (!entity) return null;
        Object.assign(entity, data);
        return await this.repo.save(entity);
    }

    async delete(id: string): Promise<void> {
        await this.repo.delete(id);
    }

    async finByEmailWithPassword(email: string): Promise<IAdministrador | null>{
        return this.repo
        .createQueryBuilder('admin')
        .addSelect('admin.password')
        .where('admin.email = :email', { email})
        .getOne();
    }

    


}
