import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { IDonador, IDonadorRepository } from "src/donantes/domain/interfaces/donador/donador.interface";
import { Donador } from "src/donantes/domain/models/donador/donador";
import { Repository } from "typeorm";


@Injectable()
export class DonadorRepository implements IDonadorRepository {
    constructor(
        @InjectRepository( Donador)
        private readonly repo: Repository<Donador>,
    ){}

    async create(donante: Partial<IDonador>): Promise<IDonador> {
        const nuevoDonante = this.repo.create(donante);
        return await this.repo.save(nuevoDonante);
    }

    async findAll(): Promise<IDonador[]> {
        return this.repo.find({
            relations:['donaciones']
        });
    }

    async findById(id: string): Promise<IDonador | null> {
        return this.repo.findOne({ where: { id_donante: id }, relations:['donaciones']});
    }

    async findByEmail(email: string): Promise<IDonador | null> {
        return this.repo.findOne({ where: { email: email } });
    }

    async update(id: string, data: Partial<IDonador>): Promise<IDonador | null> {
        const entity = await this.repo.findOne({ where: { id_donante: id } });
        if (!entity) return null;
        Object.assign(entity, data);
        return await this.repo.save(entity);
    }

    async delete(id: string): Promise<void> {
        await this.repo.delete(id);
    }

    

}
