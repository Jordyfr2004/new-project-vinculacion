import { ISolicitud } from "src/receptores/domain/interfaces/solicitud/solicitud.interface";
import { SolicitudModel } from "src/receptores/domain/models/solicitud.model/solicitud.model";

export class SolicitudMapper {
    static toDomain( entity: SolicitudModel): ISolicitud {
        return{
            id_solicitud: entity.id_solicitud,
            estado: entity.estado,
            motivo: entity.motivo,
        }
    }
}
