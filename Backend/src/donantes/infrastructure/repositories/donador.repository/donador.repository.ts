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
        return this.repo.find();
    }

    async findById(id: string): Promise<IDonador | null> {
        return this.repo.findOne({ where: { id_donante: id } });
    }

    async findByEmail(email: string): Promise<IDonador | null> {
        return this.repo.findOne({ where: { email: email } });
    }

    async delete(id: string): Promise<void> {
        await this.repo.delete(id);
    }

}
