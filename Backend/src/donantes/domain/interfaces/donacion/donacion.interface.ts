export interface IDonacion {
    id_donacion: string;
    descripcion: string;

}
export interface IDonacionRepository {
    create(donacion: Partial<IDonacion>): Promise<IDonacion>;
    findAll(): Promise<IDonacion[]>;
    findById(id: string): Promise<IDonacion | null>;
    update(id: string, data: Partial<IDonacion>): Promise<IDonacion | null>;
    delete(id: string): Promise<void>;
}