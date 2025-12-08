// ============================================
// TIPOS TYPESCRIPT - BANCO DE ALIMENTOS
// ============================================

export type UserRole = 'admin' | 'donante' | 'receptor';

export interface User {
  id: string;
  email: string;
  // Campos básicos (pueden ser NULL en migraciones)
  nombres?: string | null;
  apellidos?: string | null;
  telefono?: string | null;
  rol: UserRole;
  // Campos específicos para donantes
  tipo_donante?: 'individual' | 'empresa' | 'organizacion' | null;
  // Campos específicos para receptores
  ci?: string | null;
  direccion?: string | null;
  estado_receptor?: 'activo' | 'inactivo' | 'suspendido' | null;
  // Privacidad
  acepta_terminos: boolean;
  fecha_aceptacion_terminos?: string | null;
  consentimiento_datos: boolean;
  fecha_consentimiento?: string | null;
  // Control de estado
  activo: boolean;
  deleted_at?: string | null;
  created_at: string;
  updated_at: string;
}

// Interfaces de compatibilidad (para referencias en tipos relacionados)
export interface Donante extends Omit<User, 'rol' | 'ci' | 'direccion' | 'estado_receptor'> {
  donante_id: string; // Alias de id para compatibilidad
  tipo_donante: 'individual' | 'empresa' | 'organizacion';
}

export interface Receptor extends Omit<User, 'rol' | 'tipo_donante'> {
  receptor_id: string; // Alias de id para compatibilidad
  ci: string;
  direccion?: string;
  estado: 'activo' | 'inactivo' | 'suspendido'; // Alias de estado_receptor
}

// ============================================
// GESTIÓN DE PRODUCTOS
// ============================================

export interface Categoria {
  categoria_id: string;
  nombre: string;
  descripcion?: string | null;
  activo?: boolean; // Campo agregado en el schema
  created_at: string;
  updated_at?: string; // Campo agregado en el schema
}

export type UnidadMedida = 'kg' | 'unidad' | 'litro' | 'caja' | 'bolsa';

export interface Producto {
  producto_id: string;
  nombre: string;
  descripcion?: string | null;
  categoria_id: string;
  categoria?: Categoria;
  unidad_medida: UnidadMedida;
  stock_actual: number;
  stock_minimo: number;
  activo?: boolean; // Campo agregado en el schema
  created_at: string;
  updated_at: string;
}

export interface Lote {
  lote_id: string;
  producto_id: string;
  producto?: Producto;
  cantidad: number;
  fecha_vencimiento?: string;
  fecha_ingreso: string;
  estado: 'disponible' | 'asignado' | 'vencido' | 'descartado';
  donacion_id?: string;
}

// ============================================
// GESTIÓN DE DONACIONES
// ============================================

export type EstadoDonacion = 'pendiente' | 'recibida' | 'rechazada' | 'procesada';

export interface Donacion {
  donacion_id: string;
  donante_id: string;
  donante?: User; // Ahora es User, no Donante
  fecha_donacion: string;
  estado: EstadoDonacion;
  observaciones?: string;
  created_at: string;
  updated_at: string;
  detalles?: DonacionDetalle[];
}

export interface DonacionDetalle {
  detalle_id: string;
  donacion_id: string;
  producto_id: string;
  producto?: Producto;
  cantidad: number;
  unidad_medida: UnidadMedida;
  fecha_vencimiento?: string;
  observaciones?: string;
}

// ============================================
// GESTIÓN DE SOLICITUDES
// ============================================

export type EstadoSolicitud = 'pendiente' | 'aprobada' | 'rechazada' | 'completada' | 'cancelada';
export type PrioridadSolicitud = 'baja' | 'normal' | 'alta' | 'urgente';

export interface Solicitud {
  solicitud_id: string;
  receptor_id: string;
  receptor?: User; // Ahora es User, no Receptor
  fecha_solicitud: string;
  estado: EstadoSolicitud;
  motivo?: string | null; // Opcional en el schema
  prioridad: PrioridadSolicitud;
  observaciones?: string | null;
  created_at: string;
  updated_at: string;
  detalles?: SolicitudDetalle[];
}

export interface SolicitudDetalle {
  detalle_id: string;
  solicitud_id: string;
  producto_id: string;
  producto?: Producto;
  cantidad_solicitada: number;
  cantidad_asignada: number;
  unidad_medida: UnidadMedida;
}

// ============================================
// GESTIÓN DE ASIGNACIONES
// ============================================

export type EstadoAsignacion = 'pendiente' | 'entregada' | 'cancelada';

export interface Asignacion {
  asignacion_id: string;
  solicitud_id: string;
  solicitud?: Solicitud;
  receptor_id: string;
  receptor?: User; // Ahora es User, no Receptor
  fecha_asignacion: string;
  fecha_entrega?: string;
  estado: EstadoAsignacion;
  observaciones?: string;
  created_at: string;
  updated_at: string;
  detalles?: AsignacionDetalle[];
}

export interface AsignacionDetalle {
  detalle_id: string;
  asignacion_id: string;
  producto_id: string;
  producto?: Producto;
  lote_id?: string;
  lote?: Lote;
  cantidad: number;
  unidad_medida: UnidadMedida;
}

// ============================================
// ESTADÍSTICAS Y REPORTES
// ============================================

export interface Estadisticas {
  total_donantes: number;
  total_receptores: number;
  total_donaciones: number;
  total_solicitudes: number;
  total_asignaciones: number;
  stock_total: number;
  productos_bajo_stock: number;
  productos_por_vencer: number;
}

export interface DashboardData {
  estadisticas: Estadisticas;
  donaciones_recientes: Donacion[];
  solicitudes_pendientes: Solicitud[];
  productos_bajo_stock: Producto[];
  lotes_por_vencer: Lote[];
}
