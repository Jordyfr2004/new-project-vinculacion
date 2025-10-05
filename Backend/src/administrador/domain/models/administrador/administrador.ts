import { SolicitudModel } from "src/receptores/domain/models/solicitud.model/solicitud.model";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('administrador')
export class Administrador {
    @PrimaryGeneratedColumn('uuid')
    id_admin: string;

    @Column()
    nombre: string;

    @Column()
    email: string;

    @Column()
    password: string;

    @OneToMany(() => SolicitudModel, (solicitud) => solicitud.admin)
    solicitudes: SolicitudModel[];
}
