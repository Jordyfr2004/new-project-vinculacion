# Banco de Alimentos - Sistema de Ayuda Social y Donación

Sistema completo de gestión para un banco de alimentos que conecta donantes con receptores, facilitando la donación y distribución de alimentos.

## 🚀 Características

### Funcionalidades Principales

- **Panel de Administrador**
  - Dashboard con estadísticas completas
  - Gestión de inventario (productos, categorías, lotes)
  - Gestión de donaciones (aprobar, procesar, rechazar)
  - Gestión de solicitudes (aprobar, crear asignaciones)
  - Gestión de asignaciones (marcar entregadas)
  - Alertas de productos bajo stock y lotes por vencer

- **Panel de Donante**
  - Dashboard personalizado
  - Registrar donaciones con múltiples productos
  - Ver historial de donaciones
  - Ver estado de cada donación

- **Panel de Receptor**
  - Dashboard personalizado
  - Crear solicitudes de alimentos
  - Ver estado de solicitudes
  - Ver asignaciones recibidas

- **Página Principal**
  - Diseño moderno y responsive
  - Información sobre el sistema
  - Modal unificado de login/registro
  - Selector de tipo de usuario (Receptor/Donante)

## 🛠️ Tecnologías

- **Frontend**: Next.js 15, React 19, TypeScript
- **Estilos**: Tailwind CSS 4
- **Base de Datos**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth
- **Iconos**: Lucide React

## 📋 Requisitos Previos

- Node.js 18+ 
- npm o yarn
- Cuenta de Supabase
- Base de datos configurada (ver `database/schema.sql`)

## 🔧 Instalación

### 1. Clonar el repositorio

```bash
git clone <tu-repositorio>
cd banco-de-alimentos-vinculacion
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

### 4. Configurar la base de datos

1. Ve a tu proyecto en Supabase
2. Abre el SQL Editor
3. Copia y ejecuta el contenido de `database/schema.sql`
4. Configura las políticas RLS según tus necesidades de seguridad

### 5. Ejecutar en desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📦 Construcción para Producción

### 1. Construir la aplicación

```bash
npm run build
```

### 2. Iniciar en producción

```bash
npm start
```

## 🔐 Configuración de Seguridad

### Row Level Security (RLS)

Después de crear las tablas, configura las políticas RLS en Supabase. Ejemplo básico:

```sql
-- Habilitar RLS
ALTER TABLE donaciones ENABLE ROW LEVEL SECURITY;

-- Política para que los donantes solo vean sus propias donaciones
CREATE POLICY "Donantes ven solo sus donaciones"
  ON donaciones FOR SELECT
  USING (auth.uid() = donante_id);

-- Política para que los receptores solo vean sus propias solicitudes
CREATE POLICY "Receptores ven solo sus solicitudes"
  ON solicitudes FOR SELECT
  USING (auth.uid() = receptor_id);

-- Política para que los admins vean todo
CREATE POLICY "Admins ven todo"
  ON donaciones FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.rol = 'admin'
    )
  );
```

## 📁 Estructura del Proyecto

```
banco-de-alimentos-vinculacion/
├── database/
│   ├── schema.sql          # Esquema completo de la base de datos
│   └── README.md           # Documentación del esquema
├── src/
│   ├── app/                # Páginas de Next.js
│   │   ├── admin/          # Panel de administrador
│   │   ├── donantes/       # Panel de donante
│   │   ├── receptores/     # Panel de receptor
│   │   └── page.tsx        # Página principal
│   ├── components/         # Componentes React
│   │   ├── ui/             # Componentes UI reutilizables
│   │   └── ...             # Otros componentes
│   ├── lib/
│   │   ├── services/       # Servicios para interactuar con la BD
│   │   └── supabase/       # Configuración de Supabase
│   └── types/              # Tipos TypeScript
└── public/                 # Archivos estáticos
```

## 🎯 Roles del Sistema

### Administrador
- Acceso completo al sistema
- Gestión de inventario
- Aprobar/rechazar donaciones
- Aprobar solicitudes y crear asignaciones
- Ver todas las estadísticas

### Donante
- Registrar donaciones
- Ver historial de donaciones
- Ver estado de donaciones

### Receptor
- Crear solicitudes de alimentos
- Ver estado de solicitudes
- Ver asignaciones recibidas

## 🔄 Flujo del Sistema

1. **Donante** registra una donación con productos
2. **Administrador** revisa y procesa la donación
3. **Receptor** crea una solicitud de alimentos
4. **Administrador** aprueba la solicitud y crea una asignación
5. **Administrador** marca la asignación como entregada

## 🐛 Solución de Problemas

### Error: "Error al cargar los datos"
- Verifica que todas las tablas estén creadas en Supabase
- Revisa que las variables de entorno estén configuradas correctamente
- Verifica los permisos RLS en Supabase

### Error de autenticación
- Verifica que Supabase Auth esté habilitado
- Revisa que las políticas RLS permitan las operaciones necesarias

### Error al crear donaciones/solicitudes
- Verifica que los productos existan en la base de datos
- Revisa que todos los campos requeridos estén completos

## 📝 Notas Importantes

- El sistema está diseñado para ser escalable y mantenible
- Todas las operaciones de base de datos están en servicios separados
- Los componentes UI son reutilizables
- El código sigue las mejores prácticas de Next.js 15 y React 19

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 👥 Autor

Sistema desarrollado para Banco de Alimentos - Manta, Ecuador

---

**¡Gracias por usar nuestro sistema!** 💚
