import { ISolicitud } from "../solicitud/solicitud.interface";


export interface IReceptor {
    id_receptor: string;
    nombres: string;
    apellidos: string;
    cedula: string;
    email: string;
    telefono: string;
    direccion: string;
    password: string;
    solicitudes?: ISolicitud[];
}


export interface IreceptorRepository {
    create(receptor: Partial<IReceptor>): Promise<IReceptor>;
    findAll(): Promise<IReceptor[]>;
    findById(id: string): Promise<IReceptor | null>;
    findByCedula(cedula: string): Promise<IReceptor | null>;
    update(id: string, data: Partial<IReceptor>): Promise<IReceptor | null>
    delete(id: string): Promise<void>;
}


