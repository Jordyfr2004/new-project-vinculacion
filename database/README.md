# Esquema de Base de Datos - Banco de Alimentos

## 📋 Descripción

Este esquema implementa un sistema completo y estándar para la gestión de un banco de alimentos, incluyendo:

- Gestión de usuarios (admin, donantes, receptores)
- Catálogo de productos e inventario
- Control de lotes con fechas de vencimiento
- Registro de donaciones
- Sistema de solicitudes
- Asignación de alimentos
- Reportes y estadísticas

## 🚀 Instalación

### Instalación en Supabase

1. Ve a tu proyecto en Supabase
2. Abre el SQL Editor
3. Copia y pega el contenido de `schema.sql`
4. Ejecuta el script completo

**Nota:** Este esquema usa una tabla única `users` que incluye toda la información de donantes y receptores, eliminando la necesidad de tablas separadas. Esto hace el sistema más robusto, fácil de mantener y menos propenso a errores.

### Instalación con CLI

```bash
supabase db reset
psql -h [tu-host] -U postgres -d postgres -f schema.sql
```

### Nota sobre updated_at

Si encuentras errores con `updated_at` después de ejecutar el schema, ejecuta esto:

```sql
-- Agregar updated_at a users si no existe
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone NOT NULL DEFAULT now();

-- Recrear la función del trigger
CREATE OR REPLACE FUNCTION actualizar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns c
        WHERE c.table_schema = TG_TABLE_SCHEMA 
        AND c.table_name = TG_TABLE_NAME 
        AND c.column_name = 'updated_at'
    ) THEN
        NEW.updated_at = now();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

## 📊 Estructura de Tablas

### Usuarios y Perfiles
- `users` - Usuarios del sistema
- `donantes` - Perfil de donantes
- `receptores` - Perfil de receptores

### Productos e Inventario
- `categorias` - Categorías de productos
- `productos` - Catálogo de productos
- `lotes` - Control de lotes con fechas de vencimiento

### Donaciones
- `donaciones` - Registro de donaciones
- `donaciones_detalle` - Detalle de productos donados

### Solicitudes y Asignaciones
- `solicitudes` - Solicitudes de alimentos
- `solicitudes_detalle` - Detalle de productos solicitados
- `asignaciones` - Asignaciones de alimentos
- `asignaciones_detalle` - Detalle de productos asignados

## 🔧 Características

### Triggers Automáticos
- Actualización de `updated_at` en tablas relevantes
- Actualización de stock cuando se procesa una donación

### Validaciones
- Estados con CHECK constraints
- Valores únicos donde corresponde
- Relaciones con foreign keys

### Índices
- Optimización de consultas frecuentes
- Búsquedas por estado, fecha, etc.

## 📝 Notas Importantes

1. **Corrección del esquema original**: Se corrigió el typo `charaEcter` → `character` en la tabla `users`

2. **Campos adicionales**: Se agregaron campos estándar como:
   - `direccion` en receptores
   - `estado` en receptores
   - `observaciones` en múltiples tablas

3. **Control de lotes**: Sistema completo para rastrear productos por lote y fecha de vencimiento

4. **Estados**: Sistema de estados para todas las entidades principales

## 🔐 Permisos RLS (Row Level Security)

**IMPORTANTE**: Después de crear las tablas, configura las políticas RLS en Supabase según tus necesidades de seguridad.

Ejemplo básico:
```sql
-- Habilitar RLS
ALTER TABLE donaciones ENABLE ROW LEVEL SECURITY;

-- Política para que los donantes solo vean sus propias donaciones
CREATE POLICY "Donantes ven solo sus donaciones"
  ON donaciones FOR SELECT
  USING (auth.uid() = donante_id);
```

## 📈 Próximos Pasos

1. Configurar RLS policies
2. Crear funciones adicionales según necesidades
3. Configurar backups automáticos
4. Implementar notificaciones (opcional)
