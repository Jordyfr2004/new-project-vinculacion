import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Receptor } from "../receptor/receptor";
import { Administrador } from "src/administrador/domain/models/administrador/administrador";

@Entity('solicitudes')

export class SolicitudModel {
    @PrimaryGeneratedColumn('uuid')
    id_solicitud: string

    @Column()
    estado: string

    @Column()
    motivo:string

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
    fecha_solicitud: Date

    @ManyToOne( () => Receptor, (receptor) => receptor.solicitudes, { onDelete : 'CASCADE'})
    receptor: Receptor

    @ManyToOne( () => Administrador, (admin) => admin.solicitudes, { onDelete: 'SET NULL', nullable: true})
    admin: Administrador;

}
