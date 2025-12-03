export type UserRole = 'admin' | 'donante' | 'receptor';


export interface User {
    id: string;
    email: string;
    rol: UserRole;
    created_at: string;
    updated_at: string;
}

export interface Donante {
    donante_id: string;
    nombres: string;
    apellidos: string;
    telefono: string;
    tipo_donante: string;
    created_at: string;
}

export interface Receptor {
    receptor_id: string;
    nombres: string;
    apellidos: string;
    ci: string;
    telefono: string;
    created_at: string;
}