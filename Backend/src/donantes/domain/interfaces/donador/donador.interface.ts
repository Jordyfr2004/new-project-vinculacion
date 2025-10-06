export interface IDonador {
    id_donante: string;
    tipo_donante: string;
    nombre: string;
    direccion: string;
    telefono: string;
    email: string;
    password: string;
}

export interface IDonadorRepository {
    create(donante: Partial<IDonador>): Promise<IDonador>;
    findAll(): Promise<IDonador[]>;
    findById(id: string): Promise<IDonador | null>;
    findByEmail(email: string): Promise<IDonador | null>;
    update(id: string, data: Partial<IDonador>): Promise<IDonador | null>;
    delete(id: string): Promise<void>;

}
