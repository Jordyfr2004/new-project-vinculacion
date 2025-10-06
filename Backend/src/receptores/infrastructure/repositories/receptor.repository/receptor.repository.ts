import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { IReceptor } from "src/receptores/domain/interfaces/receptor/receptor.interface";
import { Receptor } from "src/receptores/domain/models/receptor/receptor";
import { Repository } from "typeorm";

@Injectable()
export class ReceptorRepository {
    constructor (
        @InjectRepository( Receptor)
        private readonly repo: Repository<Receptor>,
    ){}

    async create( receptor: Partial<IReceptor>): Promise<IReceptor> {
        const nuevoReceptor = this.repo.create(receptor);
        return await this.repo.save(nuevoReceptor);
    }

    async findAll(): Promise<IReceptor[]> {
        return await this.repo.find({ relations:["solicitudes"]})
    }

    async findById(id: string): Promise<IReceptor | null> {
        return await this.repo.findOne({ where: { id_receptor: id}, relations:["solicitudes"]});
    }

    async  delete(id: string): Promise<void> {
        await this.repo.delete(id);
    }

    async update(id: string, data: Partial<IReceptor>): Promise<IReceptor | null> {
        const entity = await this.repo.findOne({ where: { id_receptor: id } });
        if (!entity) return null;
        Object.assign(entity, data);
        return await this.repo.save(entity);
    }
}
