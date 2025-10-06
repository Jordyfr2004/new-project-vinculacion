import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ISolicitud } from "src/receptores/domain/interfaces/solicitud/solicitud.interface";
import { SolicitudModel } from "src/receptores/domain/models/solicitud.model/solicitud.model";
import { Repository } from "typeorm";

@Injectable()
export class SolicitudRepository {
    constructor(
        @InjectRepository( SolicitudModel)
        private readonly repo: Repository<SolicitudModel>,
    ){}

    async create( solicitud: Partial< ISolicitud>): Promise<ISolicitud>{
        const nuevaSolicitud = this.repo.create(solicitud);
        return await this.repo.save(nuevaSolicitud);
    }

    async findAll(): Promise<ISolicitud[]> {
        return await this.repo.find({ relations: ["receptor"]})
    }

    async findById(id: string): Promise<ISolicitud | null> {
        return await this.repo.findOne({ where: { id_solicitud: id}, relations:["receptor"]});
    }

    async delete(id: string): Promise<void>{
        await this.repo.delete(id);
    }

    async update(id: string, data: Partial<ISolicitud>): Promise<ISolicitud | null> {
        const entity = await this.repo.findOne({ where: { id_solicitud: id } });
        if (!entity) return null;
        Object.assign(entity, data);
        return await this.repo.save(entity);
    }
}
