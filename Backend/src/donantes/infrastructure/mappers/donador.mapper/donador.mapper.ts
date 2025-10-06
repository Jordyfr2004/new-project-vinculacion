import { IDonador } from "src/donantes/domain/interfaces/donador/donador.interface";
import { Donador } from "src/donantes/domain/models/donador/donador";

export class DonadorMapper {
    static toDomain( entity:Donador): IDonador {
        return {
            id_donante: entity.id_donante,
            tipo_donante: entity.tipo_donante,
            nombre: entity.nombre,
            direccion: entity.direccion,
            telefono: entity.telefono,
            email: entity.email,
            password: entity.password
        }
    }
}
