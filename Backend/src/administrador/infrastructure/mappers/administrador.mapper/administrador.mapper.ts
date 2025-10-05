import { IAdministrador } from "src/administrador/domain/interfaces/administrador/administrador.interface";
import { Administrador } from "src/administrador/domain/models/administrador/administrador";


export class AdministradorMapper {
    static toDomain( entity: Administrador): IAdministrador {
        return {
            id_admin: entity.id_admin,
            nombre: entity.nombre,
            email: entity.email,
            password: entity.password,
        };
    }
}
