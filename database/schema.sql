-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.asignaciones (
  asignacion_id uuid NOT NULL DEFAULT gen_random_uuid(),
  solicitud_id uuid NOT NULL,
  receptor_id uuid NOT NULL,
  fecha_asignacion timestamp with time zone NOT NULL DEFAULT now(),
  fecha_entrega date,
  estado character varying NOT NULL DEFAULT 'pendiente'::character varying CHECK (estado::text = ANY (ARRAY['pendiente'::character varying, 'entregada'::character varying, 'cancelada'::character varying]::text[])),
  observaciones text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT asignaciones_pkey PRIMARY KEY (asignacion_id),
  CONSTRAINT asignaciones_solicitud_id_fkey FOREIGN KEY (solicitud_id) REFERENCES public.solicitudes(solicitud_id),
  CONSTRAINT asignaciones_receptor_id_fkey FOREIGN KEY (receptor_id) REFERENCES public.users(id)
);
CREATE TABLE public.asignaciones_detalle (
  detalle_id uuid NOT NULL DEFAULT gen_random_uuid(),
  asignacion_id uuid NOT NULL,
  producto_id uuid NOT NULL,
  lote_id uuid,
  cantidad numeric NOT NULL CHECK (cantidad > 0::numeric),
  unidad_medida character varying NOT NULL,
  CONSTRAINT asignaciones_detalle_pkey PRIMARY KEY (detalle_id),
  CONSTRAINT asignaciones_detalle_asignacion_id_fkey FOREIGN KEY (asignacion_id) REFERENCES public.asignaciones(asignacion_id),
  CONSTRAINT asignaciones_detalle_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(producto_id),
  CONSTRAINT asignaciones_detalle_lote_id_fkey FOREIGN KEY (lote_id) REFERENCES public.lotes(lote_id)
);
CREATE TABLE public.categorias (
  categoria_id uuid NOT NULL DEFAULT gen_random_uuid(),
  nombre character varying NOT NULL UNIQUE,
  descripcion text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  activo boolean NOT NULL DEFAULT true,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT categorias_pkey PRIMARY KEY (categoria_id)
);
CREATE TABLE public.donaciones (
  donacion_id uuid NOT NULL DEFAULT gen_random_uuid(),
  donante_id uuid NOT NULL,
  fecha_donacion timestamp with time zone NOT NULL DEFAULT now(),
  estado character varying NOT NULL DEFAULT 'pendiente'::character varying CHECK (estado::text = ANY (ARRAY['pendiente'::character varying, 'recibida'::character varying, 'rechazada'::character varying, 'procesada'::character varying]::text[])),
  observaciones text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT donaciones_pkey PRIMARY KEY (donacion_id),
  CONSTRAINT donaciones_donante_id_fkey FOREIGN KEY (donante_id) REFERENCES public.users(id)
);
CREATE TABLE public.donaciones_detalle (
  detalle_id uuid NOT NULL DEFAULT gen_random_uuid(),
  donacion_id uuid NOT NULL,
  producto_id uuid NOT NULL,
  cantidad numeric NOT NULL CHECK (cantidad > 0::numeric),
  unidad_medida character varying NOT NULL,
  fecha_vencimiento date,
  observaciones text,
  CONSTRAINT donaciones_detalle_pkey PRIMARY KEY (detalle_id),
  CONSTRAINT donaciones_detalle_donacion_id_fkey FOREIGN KEY (donacion_id) REFERENCES public.donaciones(donacion_id),
  CONSTRAINT donaciones_detalle_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(producto_id)
);
CREATE TABLE public.evento_asistencia (
  asistencia_id uuid NOT NULL DEFAULT gen_random_uuid(),
  evento_id uuid NOT NULL,
  usuario_id uuid NOT NULL,
  confirmado boolean NOT NULL DEFAULT false,
  fecha_confirmacion timestamp with time zone DEFAULT now(),
  asistio boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT evento_asistencia_pkey PRIMARY KEY (asistencia_id),
  CONSTRAINT evento_asistencia_evento_id_fkey FOREIGN KEY (evento_id) REFERENCES public.eventos(evento_id),
  CONSTRAINT evento_asistencia_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.users(id)
);
CREATE TABLE public.eventos (
  evento_id uuid NOT NULL DEFAULT gen_random_uuid(),
  titulo character varying NOT NULL,
  descripcion text NOT NULL,
  fecha_evento_inicio timestamp with time zone NOT NULL,
  fecha_evento_fin timestamp with time zone,
  ubicacion character varying NOT NULL,
  tipo character varying NOT NULL DEFAULT 'general'::character varying CHECK (tipo::text = ANY (ARRAY['donacion'::character varying, 'taller'::character varying, 'capacitacion'::character varying, 'recogida'::character varying, 'general'::character varying]::text[])),
  estado character varying NOT NULL DEFAULT 'planificado'::character varying CHECK (estado::text = ANY (ARRAY['planificado'::character varying, 'activo'::character varying, 'completado'::character varying, 'cancelado'::character varying]::text[])),
  imagen_url text,
  es_publico boolean NOT NULL DEFAULT true,
  dirigido_a jsonb DEFAULT '["donante", "receptor"]'::jsonb,
  capacidad_maxima integer,
  created_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  fecha_mostrar_desde timestamp with time zone DEFAULT now(),
  fecha_mostrar_hasta timestamp with time zone,
  CONSTRAINT eventos_pkey PRIMARY KEY (evento_id),
  CONSTRAINT eventos_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id)
);
CREATE TABLE public.lotes (
  lote_id uuid NOT NULL DEFAULT gen_random_uuid(),
  producto_id uuid NOT NULL,
  cantidad numeric NOT NULL CHECK (cantidad > 0::numeric),
  fecha_vencimiento date,
  fecha_ingreso timestamp with time zone NOT NULL DEFAULT now(),
  estado character varying NOT NULL DEFAULT 'disponible'::character varying CHECK (estado::text = ANY (ARRAY['disponible'::character varying, 'asignado'::character varying, 'vencido'::character varying, 'descartado'::character varying]::text[])),
  donacion_id uuid,
  CONSTRAINT lotes_pkey PRIMARY KEY (lote_id),
  CONSTRAINT lotes_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(producto_id)
);
CREATE TABLE public.notificaciones (
  notificacion_id uuid NOT NULL DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL,
  tipo character varying NOT NULL CHECK (tipo::text = ANY (ARRAY['evento'::character varying, 'donacion'::character varying, 'solicitud'::character varying, 'asignacion'::character varying, 'sistema'::character varying]::text[])),
  titulo character varying NOT NULL,
  descripcion text NOT NULL,
  accion_url text,
  leida boolean NOT NULL DEFAULT false,
  prioridad character varying NOT NULL DEFAULT 'normal'::character varying CHECK (prioridad::text = ANY (ARRAY['baja'::character varying, 'normal'::character varying, 'alta'::character varying]::text[])),
  fecha_creacion timestamp with time zone NOT NULL DEFAULT now(),
  fecha_lectura timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT notificaciones_pkey PRIMARY KEY (notificacion_id),
  CONSTRAINT notificaciones_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.users(id)
);
CREATE TABLE public.productos (
  producto_id uuid NOT NULL DEFAULT gen_random_uuid(),
  nombre character varying NOT NULL,
  descripcion text,
  categoria_id uuid NOT NULL,
  unidad_medida character varying NOT NULL DEFAULT 'kg'::character varying CHECK (unidad_medida::text = ANY (ARRAY['kg'::character varying, 'unidad'::character varying, 'litro'::character varying, 'caja'::character varying, 'bolsa'::character varying]::text[])),
  stock_actual numeric NOT NULL DEFAULT 0 CHECK (stock_actual >= 0::numeric),
  stock_minimo numeric NOT NULL DEFAULT 0 CHECK (stock_minimo >= 0::numeric),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  activo boolean NOT NULL DEFAULT true,
  CONSTRAINT productos_pkey PRIMARY KEY (producto_id),
  CONSTRAINT productos_categoria_id_fkey FOREIGN KEY (categoria_id) REFERENCES public.categorias(categoria_id)
);
CREATE TABLE public.solicitudes (
  solicitud_id uuid NOT NULL DEFAULT gen_random_uuid(),
  receptor_id uuid NOT NULL,
  fecha_solicitud timestamp with time zone NOT NULL DEFAULT now(),
  estado character varying NOT NULL DEFAULT 'pendiente'::character varying CHECK (estado::text = ANY (ARRAY['pendiente'::character varying, 'aprobada'::character varying, 'rechazada'::character varying, 'completada'::character varying, 'cancelada'::character varying]::text[])),
  motivo text,
  prioridad character varying NOT NULL DEFAULT 'normal'::character varying CHECK (prioridad::text = ANY (ARRAY['baja'::character varying, 'normal'::character varying, 'alta'::character varying, 'urgente'::character varying]::text[])),
  observaciones text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT solicitudes_pkey PRIMARY KEY (solicitud_id),
  CONSTRAINT solicitudes_receptor_id_fkey FOREIGN KEY (receptor_id) REFERENCES public.users(id)
);
CREATE TABLE public.solicitudes_detalle (
  detalle_id uuid NOT NULL DEFAULT gen_random_uuid(),
  solicitud_id uuid NOT NULL,
  producto_id uuid NOT NULL,
  cantidad_solicitada numeric NOT NULL CHECK (cantidad_solicitada > 0::numeric),
  cantidad_asignada numeric DEFAULT 0 CHECK (cantidad_asignada >= 0::numeric),
  unidad_medida character varying NOT NULL,
  CONSTRAINT solicitudes_detalle_pkey PRIMARY KEY (detalle_id),
  CONSTRAINT solicitudes_detalle_solicitud_id_fkey FOREIGN KEY (solicitud_id) REFERENCES public.solicitudes(solicitud_id),
  CONSTRAINT solicitudes_detalle_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(producto_id)
);
CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  email character varying NOT NULL UNIQUE,
  nombres character varying NOT NULL,
  apellidos character varying NOT NULL,
  telefono character varying NOT NULL,
  rol character varying NOT NULL CHECK (rol::text = ANY (ARRAY['admin'::character varying, 'donante'::character varying, 'receptor'::character varying]::text[])),
  tipo_donante character varying,
  ci character varying UNIQUE,
  direccion text,
  estado_receptor character varying DEFAULT 'activo'::character varying,
  acepta_terminos boolean NOT NULL DEFAULT true,
  fecha_aceptacion_terminos timestamp with time zone DEFAULT now(),
  consentimiento_datos boolean NOT NULL DEFAULT true,
  fecha_consentimiento timestamp with time zone DEFAULT now(),
  activo boolean NOT NULL DEFAULT true,
  deleted_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (id)
);