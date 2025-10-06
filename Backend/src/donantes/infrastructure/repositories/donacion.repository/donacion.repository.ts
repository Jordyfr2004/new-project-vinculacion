import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { IDonacion, IDonacionRepository } from "src/donantes/domain/interfaces/donacion/donacion.interface";
import { DonacionModel } from "src/donantes/domain/models/donacion.model/donacion.model";
import { Repository } from "typeorm";



@Injectable()
export class DonacionRepository implements IDonacionRepository {
    constructor(
        @InjectRepository( DonacionModel)
        private readonly repo: Repository<DonacionModel>,
    ) {}

    async create(donacion: Partial<IDonacion>): Promise<IDonacion> {
        const nuevaDonacion = this.repo.create(donacion);
        return await this.repo.save(nuevaDonacion);
    }

    async findAll(): Promise<IDonacion[]> {
        return this.repo.find();
    }

    async findById(id: string): Promise<IDonacion | null> {
        return this.repo.findOne({ where: { id_donacion: id } });
    }

    async delete(id: string): Promise<void> {
        await this.repo.delete(id);
    }
}
