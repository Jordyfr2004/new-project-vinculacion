import { IDonacion } from "src/donantes/domain/interfaces/donacion/donacion.interface";
import { DonacionModel } from "src/donantes/domain/models/donacion.model/donacion.model";


export class DonacionMapper {
    static toDomain( entity:DonacionModel):IDonacion {
        return{
            id_donacion: entity.id_donacion,
            descripcion: entity.descripcion,
        };
    }
}
