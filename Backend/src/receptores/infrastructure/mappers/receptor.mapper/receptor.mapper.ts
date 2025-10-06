import { IReceptor } from "src/receptores/domain/interfaces/receptor/receptor.interface";
import { Receptor } from "src/receptores/domain/models/receptor/receptor";

export class ReceptorMapper {
    static toDomain( entity: Receptor): IReceptor{
        return {
            id_receptor: entity.id_receptor,
            nombres: entity.nombres,
            apellidos: entity.apellidos,
            cedula: entity.cedula,
            email: entity.email,
            telefono: entity.telefono,
            direccion: entity.direccion,
        }
    }
}
