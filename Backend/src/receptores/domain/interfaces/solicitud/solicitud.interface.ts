export interface Solicitud {
	id_solicitud: string;
	estado: string;
	motivo: string;
	fecha_solicitud?: Date;
	receptor?: { id_receptor: string } | null;
	admin?: { id_admin: string } | null;
}
