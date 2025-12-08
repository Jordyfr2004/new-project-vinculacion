-- ============================================
-- ESQUEMA COMPLETO - BANCO DE ALIMENTOS
-- Diseño profesional, ético y mantenible
-- Sistema estándar de gestión de donaciones
-- VERSIÓN COMPATIBLE CON TABLAS EXISTENTES
-- ============================================

-- ============================================
-- USUARIOS Y AUTENTICACIÓN
-- ============================================

-- Tabla única de usuarios (elimina la necesidad de donantes/receptores separados)
-- Si la tabla ya existe, solo agregamos las columnas faltantes
CREATE TABLE IF NOT EXISTS public.users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  email character varying NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  rol character varying NOT NULL CHECK (rol IN ('admin', 'donante', 'receptor')),
  CONSTRAINT users_pkey PRIMARY KEY (id)
);

-- Agregar columnas nuevas si no existen (para migración)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS nombres character varying;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS apellidos character varying;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS telefono character varying;

-- Campos específicos para DONANTES (solo si rol = 'donante')
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS tipo_donante character varying DEFAULT 'individual';

-- Campos específicos para RECEPTORES (solo si rol = 'receptor')
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS ci character varying;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS direccion text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS estado_receptor character varying DEFAULT 'activo';

-- Privacidad y consentimiento (ÉTICO Y PROFESIONAL)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS acepta_terminos boolean NOT NULL DEFAULT false;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS fecha_aceptacion_terminos timestamp with time zone;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS consentimiento_datos boolean NOT NULL DEFAULT false;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS fecha_consentimiento timestamp with time zone;

-- Control de estado
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS activo boolean NOT NULL DEFAULT true;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS deleted_at timestamp with time zone;

-- Limpiar datos antes de agregar constraints
DO $$ 
BEGIN
  -- Limpiar tipo_donante para usuarios que no son donantes
  UPDATE public.users 
  SET tipo_donante = NULL 
  WHERE rol != 'donante' AND tipo_donante IS NOT NULL;

  -- Asignar tipo_donante por defecto a donantes que no lo tienen
  UPDATE public.users 
  SET tipo_donante = 'individual' 
  WHERE rol = 'donante' AND (tipo_donante IS NULL OR tipo_donante NOT IN ('individual', 'empresa', 'organizacion'));

  -- Limpiar ci para usuarios que no son receptores
  UPDATE public.users 
  SET ci = NULL 
  WHERE rol != 'receptor' AND ci IS NOT NULL;

  -- Limpiar estado_receptor para usuarios que no son receptores
  UPDATE public.users 
  SET estado_receptor = NULL 
  WHERE rol != 'receptor' AND estado_receptor IS NOT NULL;

  -- Asignar estado_receptor por defecto a receptores que no lo tienen
  UPDATE public.users 
  SET estado_receptor = 'activo' 
  WHERE rol = 'receptor' AND (estado_receptor IS NULL OR estado_receptor NOT IN ('activo', 'inactivo', 'suspendido'));
END $$;

-- Agregar constraints si no existen (después de limpiar datos)
DO $$ 
BEGIN
  -- Constraint para tipo_donante (más flexible para migración)
  -- Primero eliminar constraint antiguo si existe
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'users_tipo_donante_check'
  ) THEN
    ALTER TABLE public.users DROP CONSTRAINT users_tipo_donante_check;
  END IF;

  -- Agregar constraint nuevo
  ALTER TABLE public.users 
  ADD CONSTRAINT users_tipo_donante_check 
  CHECK (
    (rol = 'donante' AND tipo_donante IN ('individual', 'empresa', 'organizacion')) OR
    (rol != 'donante' AND (tipo_donante IS NULL OR tipo_donante IN ('individual', 'empresa', 'organizacion')))
  );

  -- Constraint para ci (más flexible - permite NULL para no receptores)
  -- Primero eliminar constraint antiguo si existe
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'users_ci_check'
  ) THEN
    ALTER TABLE public.users DROP CONSTRAINT users_ci_check;
  END IF;

  -- Agregar constraint nuevo
  ALTER TABLE public.users 
  ADD CONSTRAINT users_ci_check 
  CHECK (
    (rol = 'receptor' AND ci IS NOT NULL) OR
    (rol != 'receptor')
  );

  -- Constraint para estado_receptor (más flexible)
  -- Primero eliminar constraint antiguo si existe
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'users_estado_receptor_check'
  ) THEN
    ALTER TABLE public.users DROP CONSTRAINT users_estado_receptor_check;
  END IF;

  -- Agregar constraint nuevo
  ALTER TABLE public.users 
  ADD CONSTRAINT users_estado_receptor_check 
  CHECK (
    (rol = 'receptor' AND (estado_receptor IS NULL OR estado_receptor IN ('activo', 'inactivo', 'suspendido'))) OR
    (rol != 'receptor')
  );

  -- Unique constraint para ci (solo si no existe)
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'users_ci_key'
  ) THEN
    CREATE UNIQUE INDEX IF NOT EXISTS users_ci_key ON public.users(ci) WHERE ci IS NOT NULL;
  END IF;
END $$;

-- Índices para usuarios
CREATE INDEX IF NOT EXISTS idx_users_rol ON public.users(rol);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_ci ON public.users(ci) WHERE ci IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_activo ON public.users(activo) WHERE activo = true AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_users_tipo_donante ON public.users(tipo_donante) WHERE rol = 'donante';

-- ============================================
-- GESTIÓN DE PRODUCTOS E INVENTARIO
-- ============================================

-- Categorías de productos
CREATE TABLE IF NOT EXISTS public.categorias (
  categoria_id uuid NOT NULL DEFAULT gen_random_uuid(),
  nombre character varying NOT NULL UNIQUE,
  descripcion text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT categorias_pkey PRIMARY KEY (categoria_id)
);

-- Agregar columnas si no existen
ALTER TABLE public.categorias ADD COLUMN IF NOT EXISTS activo boolean NOT NULL DEFAULT true;
ALTER TABLE public.categorias ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone NOT NULL DEFAULT now();

-- Productos/Inventario
CREATE TABLE IF NOT EXISTS public.productos (
  producto_id uuid NOT NULL DEFAULT gen_random_uuid(),
  nombre character varying NOT NULL,
  descripcion text,
  categoria_id uuid NOT NULL,
  unidad_medida character varying NOT NULL DEFAULT 'kg' CHECK (unidad_medida IN ('kg', 'unidad', 'litro', 'caja', 'bolsa')),
  stock_actual numeric NOT NULL DEFAULT 0 CHECK (stock_actual >= 0),
  stock_minimo numeric NOT NULL DEFAULT 0 CHECK (stock_minimo >= 0),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT productos_pkey PRIMARY KEY (producto_id),
  CONSTRAINT productos_categoria_id_fkey FOREIGN KEY (categoria_id) REFERENCES public.categorias(categoria_id) ON DELETE RESTRICT
);

-- Agregar columna activo si no existe
ALTER TABLE public.productos ADD COLUMN IF NOT EXISTS activo boolean NOT NULL DEFAULT true;

-- Lote/Inventario detallado (para control de fechas de vencimiento)
CREATE TABLE IF NOT EXISTS public.lotes (
  lote_id uuid NOT NULL DEFAULT gen_random_uuid(),
  producto_id uuid NOT NULL,
  cantidad numeric NOT NULL CHECK (cantidad > 0),
  fecha_vencimiento date,
  fecha_ingreso timestamp with time zone NOT NULL DEFAULT now(),
  estado character varying NOT NULL DEFAULT 'disponible' CHECK (estado IN ('disponible', 'asignado', 'vencido', 'descartado')),
  donacion_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT lotes_pkey PRIMARY KEY (lote_id),
  CONSTRAINT lotes_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(producto_id) ON DELETE CASCADE
);

-- ============================================
-- GESTIÓN DE DONACIONES
-- ============================================

-- Donaciones (ahora referencia directamente a users)
CREATE TABLE IF NOT EXISTS public.donaciones (
  donacion_id uuid NOT NULL DEFAULT gen_random_uuid(),
  donante_id uuid NOT NULL,
  fecha_donacion timestamp with time zone NOT NULL DEFAULT now(),
  estado character varying NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'recibida', 'rechazada', 'procesada')),
  observaciones text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT donaciones_pkey PRIMARY KEY (donacion_id)
);

-- Actualizar foreign key si apunta a donantes
DO $$
BEGIN
  -- Eliminar constraint antiguo si existe
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'donaciones_donante_id_fkey'
    AND EXISTS (
      SELECT 1 FROM information_schema.table_constraints tc
      JOIN information_schema.constraint_column_usage ccu 
        ON tc.constraint_name = ccu.constraint_name
      WHERE tc.constraint_name = 'donaciones_donante_id_fkey'
        AND ccu.table_name = 'donantes'
    )
  ) THEN
    ALTER TABLE public.donaciones DROP CONSTRAINT donaciones_donante_id_fkey;
  END IF;

  -- Agregar constraint nuevo que apunta a users
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'donaciones_donante_id_fkey'
    AND EXISTS (
      SELECT 1 FROM information_schema.table_constraints tc
      JOIN information_schema.constraint_column_usage ccu 
        ON tc.constraint_name = ccu.constraint_name
      WHERE tc.constraint_name = 'donaciones_donante_id_fkey'
        AND ccu.table_name = 'users'
    )
  ) THEN
    ALTER TABLE public.donaciones 
    ADD CONSTRAINT donaciones_donante_id_fkey 
    FOREIGN KEY (donante_id) REFERENCES public.users(id) ON DELETE RESTRICT;
  END IF;
END $$;

-- Detalle de donaciones (productos donados)
CREATE TABLE IF NOT EXISTS public.donaciones_detalle (
  detalle_id uuid NOT NULL DEFAULT gen_random_uuid(),
  donacion_id uuid NOT NULL,
  producto_id uuid NOT NULL,
  cantidad numeric NOT NULL CHECK (cantidad > 0),
  unidad_medida character varying NOT NULL,
  fecha_vencimiento date,
  observaciones text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT donaciones_detalle_pkey PRIMARY KEY (detalle_id),
  CONSTRAINT donaciones_detalle_donacion_id_fkey FOREIGN KEY (donacion_id) REFERENCES public.donaciones(donacion_id) ON DELETE CASCADE,
  CONSTRAINT donaciones_detalle_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(producto_id) ON DELETE RESTRICT
);

-- ============================================
-- GESTIÓN DE SOLICITUDES Y ASIGNACIONES
-- ============================================

-- Solicitudes de alimentos (ahora referencia directamente a users)
CREATE TABLE IF NOT EXISTS public.solicitudes (
  solicitud_id uuid NOT NULL DEFAULT gen_random_uuid(),
  receptor_id uuid NOT NULL,
  fecha_solicitud timestamp with time zone NOT NULL DEFAULT now(),
  estado character varying NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aprobada', 'rechazada', 'completada', 'cancelada')),
  motivo text,
  prioridad character varying NOT NULL DEFAULT 'normal' CHECK (prioridad IN ('baja', 'normal', 'alta', 'urgente')),
  observaciones text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT solicitudes_pkey PRIMARY KEY (solicitud_id)
);

-- Actualizar foreign key si apunta a receptores
DO $$
BEGIN
  -- Eliminar constraint antiguo si existe
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'solicitudes_receptor_id_fkey'
    AND EXISTS (
      SELECT 1 FROM information_schema.table_constraints tc
      JOIN information_schema.constraint_column_usage ccu 
        ON tc.constraint_name = ccu.constraint_name
      WHERE tc.constraint_name = 'solicitudes_receptor_id_fkey'
        AND ccu.table_name = 'receptores'
    )
  ) THEN
    ALTER TABLE public.solicitudes DROP CONSTRAINT solicitudes_receptor_id_fkey;
  END IF;

  -- Agregar constraint nuevo que apunta a users
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'solicitudes_receptor_id_fkey'
    AND EXISTS (
      SELECT 1 FROM information_schema.table_constraints tc
      JOIN information_schema.constraint_column_usage ccu 
        ON tc.constraint_name = ccu.constraint_name
      WHERE tc.constraint_name = 'solicitudes_receptor_id_fkey'
        AND ccu.table_name = 'users'
    )
  ) THEN
    ALTER TABLE public.solicitudes 
    ADD CONSTRAINT solicitudes_receptor_id_fkey 
    FOREIGN KEY (receptor_id) REFERENCES public.users(id) ON DELETE RESTRICT;
  END IF;
END $$;

-- Detalle de solicitudes (productos solicitados)
CREATE TABLE IF NOT EXISTS public.solicitudes_detalle (
  detalle_id uuid NOT NULL DEFAULT gen_random_uuid(),
  solicitud_id uuid NOT NULL,
  producto_id uuid NOT NULL,
  cantidad_solicitada numeric NOT NULL CHECK (cantidad_solicitada > 0),
  cantidad_asignada numeric DEFAULT 0 CHECK (cantidad_asignada >= 0),
  unidad_medida character varying NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT solicitudes_detalle_pkey PRIMARY KEY (detalle_id),
  CONSTRAINT solicitudes_detalle_solicitud_id_fkey FOREIGN KEY (solicitud_id) REFERENCES public.solicitudes(solicitud_id) ON DELETE CASCADE,
  CONSTRAINT solicitudes_detalle_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(producto_id) ON DELETE RESTRICT
);

-- Asignaciones (administrador asigna productos a receptores)
CREATE TABLE IF NOT EXISTS public.asignaciones (
  asignacion_id uuid NOT NULL DEFAULT gen_random_uuid(),
  solicitud_id uuid NOT NULL,
  receptor_id uuid NOT NULL,
  fecha_asignacion timestamp with time zone NOT NULL DEFAULT now(),
  fecha_entrega date,
  estado character varying NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'entregada', 'cancelada')),
  observaciones text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT asignaciones_pkey PRIMARY KEY (asignacion_id),
  CONSTRAINT asignaciones_solicitud_id_fkey FOREIGN KEY (solicitud_id) REFERENCES public.solicitudes(solicitud_id) ON DELETE RESTRICT
);

-- Actualizar foreign key si apunta a receptores
DO $$
BEGIN
  -- Eliminar constraint antiguo si existe
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'asignaciones_receptor_id_fkey'
    AND EXISTS (
      SELECT 1 FROM information_schema.table_constraints tc
      JOIN information_schema.constraint_column_usage ccu 
        ON tc.constraint_name = ccu.constraint_name
      WHERE tc.constraint_name = 'asignaciones_receptor_id_fkey'
        AND ccu.table_name = 'receptores'
    )
  ) THEN
    ALTER TABLE public.asignaciones DROP CONSTRAINT asignaciones_receptor_id_fkey;
  END IF;

  -- Agregar constraint nuevo que apunta a users
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'asignaciones_receptor_id_fkey'
    AND EXISTS (
      SELECT 1 FROM information_schema.table_constraints tc
      JOIN information_schema.constraint_column_usage ccu 
        ON tc.constraint_name = ccu.constraint_name
      WHERE tc.constraint_name = 'asignaciones_receptor_id_fkey'
        AND ccu.table_name = 'users'
    )
  ) THEN
    ALTER TABLE public.asignaciones 
    ADD CONSTRAINT asignaciones_receptor_id_fkey 
    FOREIGN KEY (receptor_id) REFERENCES public.users(id) ON DELETE RESTRICT;
  END IF;
END $$;

-- Detalle de asignaciones (productos asignados)
CREATE TABLE IF NOT EXISTS public.asignaciones_detalle (
  detalle_id uuid NOT NULL DEFAULT gen_random_uuid(),
  asignacion_id uuid NOT NULL,
  producto_id uuid NOT NULL,
  lote_id uuid,
  cantidad numeric NOT NULL CHECK (cantidad > 0),
  unidad_medida character varying NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT asignaciones_detalle_pkey PRIMARY KEY (detalle_id),
  CONSTRAINT asignaciones_detalle_asignacion_id_fkey FOREIGN KEY (asignacion_id) REFERENCES public.asignaciones(asignacion_id) ON DELETE CASCADE,
  CONSTRAINT asignaciones_detalle_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(producto_id) ON DELETE RESTRICT,
  CONSTRAINT asignaciones_detalle_lote_id_fkey FOREIGN KEY (lote_id) REFERENCES public.lotes(lote_id) ON DELETE SET NULL
);

-- ============================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- ============================================

CREATE INDEX IF NOT EXISTS idx_donaciones_donante_id ON public.donaciones(donante_id);
CREATE INDEX IF NOT EXISTS idx_donaciones_estado ON public.donaciones(estado);
CREATE INDEX IF NOT EXISTS idx_donaciones_fecha ON public.donaciones(fecha_donacion);

CREATE INDEX IF NOT EXISTS idx_solicitudes_receptor_id ON public.solicitudes(receptor_id);
CREATE INDEX IF NOT EXISTS idx_solicitudes_estado ON public.solicitudes(estado);
CREATE INDEX IF NOT EXISTS idx_solicitudes_fecha ON public.solicitudes(fecha_solicitud);
CREATE INDEX IF NOT EXISTS idx_solicitudes_prioridad ON public.solicitudes(prioridad);

CREATE INDEX IF NOT EXISTS idx_asignaciones_receptor_id ON public.asignaciones(receptor_id);
CREATE INDEX IF NOT EXISTS idx_asignaciones_estado ON public.asignaciones(estado);
CREATE INDEX IF NOT EXISTS idx_asignaciones_fecha ON public.asignaciones(fecha_asignacion);

CREATE INDEX IF NOT EXISTS idx_productos_categoria_id ON public.productos(categoria_id);
-- Índice de productos activos (solo si la columna existe)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'productos' 
      AND column_name = 'activo'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_productos_activo ON public.productos(activo) WHERE activo = true;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_lotes_producto_id ON public.lotes(producto_id);
CREATE INDEX IF NOT EXISTS idx_lotes_fecha_vencimiento ON public.lotes(fecha_vencimiento);
CREATE INDEX IF NOT EXISTS idx_lotes_estado ON public.lotes(estado);

-- ============================================
-- FUNCIONES Y TRIGGERS
-- ============================================

-- Función para actualizar stock cuando se procesa una donación
CREATE OR REPLACE FUNCTION actualizar_stock_producto()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.estado = 'procesada' AND OLD.estado != 'procesada' THEN
    UPDATE public.productos
    SET stock_actual = stock_actual + (
      SELECT COALESCE(SUM(cantidad), 0)
      FROM public.donaciones_detalle
      WHERE donacion_id = NEW.donacion_id
        AND producto_id = productos.producto_id
    ),
    updated_at = now()
    WHERE producto_id IN (
      SELECT producto_id
      FROM public.donaciones_detalle
      WHERE donacion_id = NEW.donacion_id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_actualizar_stock ON public.donaciones;
CREATE TRIGGER trigger_actualizar_stock
  AFTER UPDATE ON public.donaciones
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_stock_producto();

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION actualizar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = TG_TABLE_SCHEMA 
    AND table_name = TG_TABLE_NAME 
    AND column_name = 'updated_at'
  ) THEN
    NEW.updated_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a tablas que tienen updated_at
DROP TRIGGER IF EXISTS trigger_users_updated_at ON public.users;
CREATE TRIGGER trigger_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_updated_at();

DROP TRIGGER IF EXISTS trigger_productos_updated_at ON public.productos;
CREATE TRIGGER trigger_productos_updated_at
  BEFORE UPDATE ON public.productos
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_updated_at();

DROP TRIGGER IF EXISTS trigger_donaciones_updated_at ON public.donaciones;
CREATE TRIGGER trigger_donaciones_updated_at
  BEFORE UPDATE ON public.donaciones
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_updated_at();

DROP TRIGGER IF EXISTS trigger_solicitudes_updated_at ON public.solicitudes;
CREATE TRIGGER trigger_solicitudes_updated_at
  BEFORE UPDATE ON public.solicitudes
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_updated_at();

DROP TRIGGER IF EXISTS trigger_asignaciones_updated_at ON public.asignaciones;
CREATE TRIGGER trigger_asignaciones_updated_at
  BEFORE UPDATE ON public.asignaciones
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_updated_at();

-- ============================================
-- DATOS INICIALES
-- ============================================

INSERT INTO public.categorias (nombre, descripcion) VALUES
  ('Granos y Cereales', 'Arroz, frijoles, lentejas, avena, etc.'),
  ('Frutas y Verduras', 'Frutas y verduras frescas'),
  ('Lácteos', 'Leche, queso, yogurt, etc.'),
  ('Carnes y Proteínas', 'Carne, pollo, pescado, huevos'),
  ('Productos Enlatados', 'Conservas, enlatados'),
  ('Productos Secos', 'Pasta, harina, azúcar, etc.'),
  ('Bebidas', 'Agua, jugos, refrescos'),
  ('Otros', 'Otros productos alimenticios')
ON CONFLICT (nombre) DO NOTHING;
