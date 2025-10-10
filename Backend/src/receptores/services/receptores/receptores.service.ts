import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateReceptorDto } from 'src/receptores/domain/dto/create-receptor.dto/create-receptor.dto';
import { ReceptorRepository } from 'src/receptores/infrastructure/repositories/receptor.repository/receptor.repository';
import * as jwt from 'jsonwebtoken';


@Injectable()
export class ReceptoresService {
    constructor(private readonly receptorRepo: ReceptorRepository){}

    
    async verifyCi(cedula: string){
        const receptor = await this.receptorRepo.findByCi(cedula);

        if(!receptor) {
            const secret = process.env.JWT_SECRET;
            if (!secret) throw new Error('JWT_SECRET no está definido en las variables de entorno');
            const token = jwt.sign({cedula}, secret,{ expiresIn: '1h'});
            return {
                existe: false,
                mensaje: 'no registrado, puede registrarse',
                token,
            };
        }

        return {
            existe: true,
            mensaje: 'Ya existe,no puede registrarse',
        }
    }

    async create(dto: CreateReceptorDto, token: string){
        const secret = process.env.JWT_SECRET;
        if (!secret) throw new Error('JWT_SECRET no está definido en las variables de entorno');
        try {
            const payload = jwt.verify(token, secret) as any;

            if (payload.cedula !== dto.cedula){
                throw new BadRequestException('El token no coincide con la cédula proporcionada');
            }

            const existe = await this.receptorRepo.findByCi(dto.cedula);
            if (existe) {
                throw new BadRequestException('Ya existe un receptor con esta cédula');
            }
            return this.receptorRepo.create(dto);
        } catch (err) {
            throw new BadRequestException('Token inválido o expirado');
        }
        
    }


    findAll(){
        return this.receptorRepo.findAll();
    }

    findById( id: string){
        return this.receptorRepo.findById(id);
    }

    update(id: string, dto: Partial<any>){
        return this.receptorRepo.update(id, dto);
    }

    remove(id: string){
        return this.receptorRepo.delete(id);
    }
}
