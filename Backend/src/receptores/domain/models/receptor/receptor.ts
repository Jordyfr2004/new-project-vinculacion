import { OneToMany,Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm"
import { SolicitudModel } from "../solicitud.model/solicitud.model";

@Entity('receptores')
export class Receptor {
    @PrimaryGeneratedColumn('uuid')
    id_receptor: string;

    @Column()
    nombres: string;

    @Column()
    apellidos: string;

    @Column( { unique: true})
    cedula: string
    
    @Column()
    email: string;

    @Column()
    telefono: string;

    @Column()
    direccion: string;

    @Column({ select : false})
    password: string;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
    fecha_registro: Date

    @OneToMany(() => SolicitudModel, (solicitud) => solicitud.receptor)
    solicitudes: SolicitudModel[];

}
