import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Donador } from "../donador/donador";


@Entity('donaciones')
export class DonacionModel {
    @PrimaryGeneratedColumn('uuid')
    id_donacion: string;

    @Column()
    descripcion:string

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
    fecha_creacion: Date;

    @ManyToOne(() => Donador, donador => donador.donaciones, { nullable: false })
    @JoinColumn({ name: 'id_donante' })
    donador: Donador;
}
