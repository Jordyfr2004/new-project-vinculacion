

export interface ISolicitud {
    id_solicitud: string;
    estado: string;
    motivo: string;
}


export interface ISolicitudRepository {
    create(solicitud: Partial<ISolicitud>): Promise<ISolicitud>;
    findAll(): Promise<ISolicitud[]>;
    findById(id: string): Promise<ISolicitud | null>;
    update(id: string, data: Partial<ISolicitud>): Promise<ISolicitud | null>
    delete(id: string): Promise<void>;
}
