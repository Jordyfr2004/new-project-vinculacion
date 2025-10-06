export interface IAdministrador {
    id_admin: string;
    nombre: string;
    email: string;
    password: string;
}


export interface IAdministradorRepository {
    create(admin: Partial<IAdministrador>): Promise<IAdministrador>;
    finAll(): Promise<IAdministrador[]>;
    findById(id: string): Promise<IAdministrador| null>;
    finByEmail(email: string): Promise<IAdministrador | null>;
    update(id: string, data: Partial<IAdministrador>): Promise<IAdministrador | null>;
    delete(id: string): Promise<void>;
}
