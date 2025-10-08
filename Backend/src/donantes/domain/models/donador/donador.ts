import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { DonacionModel } from "../donacion.model/donacion.model";

@Entity('donantes')
export class Donador {
    @PrimaryGeneratedColumn('uuid')
    id_donante: string;

    @Column()
    tipo_donante: string;

    @Column()
    nombre: string;

    @Column()
    direccion:string;

    @Column()
    telefono:string;

    @Column({unique: true})
    email:string;

    @Column({select: false})
    password:string;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
    fecha_creacion: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
    fecha_actualizacion: Date;

    @OneToMany(() => DonacionModel, donacion => donacion.donador)
    donaciones: DonacionModel[];
}
