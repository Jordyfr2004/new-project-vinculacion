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

    async update(id: string, data: Partial<IDonacion>): Promise<IDonacion | null> {
        const entity = await this.repo.findOne({ where: { id_donacion: id } });
        if (!entity) return null;
        Object.assign(entity, data);
        return await this.repo.save(entity);
    }

    async delete(id: string): Promise<void> {
        await this.repo.delete(id);
    }

    async findByIdDonante(idDonante: string) {
        return this.repo.find({ 
            where: { donador: { id_donante: idDonante}},
            relations: ['donador'],
        });
    }
    
    
}
