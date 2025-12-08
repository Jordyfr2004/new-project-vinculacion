'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { estadisticasService } from '@/lib/services/estadisticas';
import type { DashboardData } from '@/types';
import Header from '@/components/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { 
  Package, 
  Users, 
  Heart, 
  FileText, 
  TrendingUp, 
  AlertTriangle,
  Calendar,
  ShoppingCart
} from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/');
        return;
      }

      const { data: userData } = await supabase
        .from('users')
        .select('rol')
        .eq('id', user.id)
        .maybeSingle();

      if (!userData || userData.rol !== 'admin') {
        router.push('/');
        return;
      }

      setUserRole(userData.rol);
      loadDashboard();
    } catch (error) {
      console.error('Error checking auth:', error);
      router.push('/');
    }
  };

  const loadDashboard = async () => {
    try {
      const data = await estadisticasService.getDashboardData();
      setDashboardData(data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      // Aún así mostrar el dashboard con datos vacíos
      setDashboardData({
        estadisticas: {
          total_donantes: 0,
          total_receptores: 0,
          total_donaciones: 0,
          total_solicitudes: 0,
          total_asignaciones: 0,
          stock_total: 0,
          productos_bajo_stock: 0,
          productos_por_vencer: 0,
        },
        donaciones_recientes: [],
        solicitudes_pendientes: [],
        productos_bajo_stock: [],
        lotes_por_vencer: [],
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-300">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <p className="text-red-400">Error al cargar los datos</p>
      </div>
    );
  }

  const { estadisticas, donaciones_recientes, solicitudes_pendientes, productos_bajo_stock, lotes_por_vencer } = dashboardData;

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Header />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Panel de Administración</h1>
          <p className="text-slate-400">Gestión completa del banco de alimentos</p>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Total Donantes</p>
                <p className="text-3xl font-bold text-white">{estadisticas.total_donantes}</p>
              </div>
              <div className="p-3 bg-green-500/10 rounded-lg">
                <Users className="w-8 h-8 text-green-400" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Total Receptores</p>
                <p className="text-3xl font-bold text-white">{estadisticas.total_receptores}</p>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <Users className="w-8 h-8 text-blue-400" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Stock Total</p>
                <p className="text-3xl font-bold text-white">{estadisticas.stock_total.toLocaleString()} kg</p>
              </div>
              <div className="p-3 bg-purple-500/10 rounded-lg">
                <Package className="w-8 h-8 text-purple-400" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Solicitudes Pendientes</p>
                <p className="text-3xl font-bold text-white">{solicitudes_pendientes.length}</p>
              </div>
              <div className="p-3 bg-yellow-500/10 rounded-lg">
                <FileText className="w-8 h-8 text-yellow-400" />
              </div>
            </div>
          </Card>
        </div>

        {/* Alertas */}
        {(productos_bajo_stock.length > 0 || lotes_por_vencer.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {productos_bajo_stock.length > 0 && (
              <Card className="border-yellow-500/50">
                <div className="flex items-center space-x-3 mb-4">
                  <AlertTriangle className="w-6 h-6 text-yellow-400" />
                  <h3 className="text-lg font-semibold text-white">Productos Bajo Stock</h3>
                </div>
                <p className="text-slate-300 mb-4">
                  {productos_bajo_stock.length} producto(s) necesitan reposición
                </p>
                <Link href="/admin/inventario">
                  <Button size="sm">Ver Inventario</Button>
                </Link>
              </Card>
            )}

            {lotes_por_vencer.length > 0 && (
              <Card className="border-red-500/50">
                <div className="flex items-center space-x-3 mb-4">
                  <Calendar className="w-6 h-6 text-red-400" />
                  <h3 className="text-lg font-semibold text-white">Lotes por Vencer</h3>
                </div>
                <p className="text-slate-300 mb-4">
                  {lotes_por_vencer.length} lote(s) vencen en los próximos 7 días
                </p>
                <Link href="/admin/inventario">
                  <Button size="sm" variant="danger">Revisar Lotes</Button>
                </Link>
              </Card>
            )}
          </div>
        )}

        {/* Secciones principales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Donaciones Recientes */}
          <Card title="Donaciones Recientes" actions={
            <Link href="/admin/donaciones">
              <Button size="sm" variant="outline">Ver Todas</Button>
            </Link>
          }>
            {donaciones_recientes.length === 0 ? (
              <p className="text-slate-400 text-center py-8">No hay donaciones recientes</p>
            ) : (
              <div className="space-y-3">
                {donaciones_recientes.slice(0, 5).map((donacion) => (
                  <div
                    key={donacion.donacion_id}
                    className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg"
                  >
                    <div>
                      <p className="text-white font-medium">
                        {donacion.donante?.nombres ?? 'N/A'} {donacion.donante?.apellidos ?? ''}
                      </p>
                      <p className="text-slate-400 text-sm">
                        {new Date(donacion.fecha_donacion).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge
                      variant={
                        donacion.estado === 'procesada' ? 'success' :
                        donacion.estado === 'pendiente' ? 'warning' :
                        'default'
                      }
                    >
                      {donacion.estado}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Solicitudes Pendientes */}
          <Card title="Solicitudes Pendientes" actions={
            <Link href="/admin/solicitudes">
              <Button size="sm" variant="outline">Ver Todas</Button>
            </Link>
          }>
            {solicitudes_pendientes.length === 0 ? (
              <p className="text-slate-400 text-center py-8">No hay solicitudes pendientes</p>
            ) : (
              <div className="space-y-3">
                {solicitudes_pendientes.slice(0, 5).map((solicitud) => (
                  <div
                    key={solicitud.solicitud_id}
                    className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg"
                  >
                    <div>
                      <p className="text-white font-medium">
                        {solicitud.receptor?.nombres ?? 'N/A'} {solicitud.receptor?.apellidos ?? ''}
                      </p>
                      <p className="text-slate-400 text-sm">
                        {new Date(solicitud.fecha_solicitud).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={
                          solicitud.prioridad === 'urgente' ? 'danger' :
                          solicitud.prioridad === 'alta' ? 'warning' :
                          'info'
                        }
                      >
                        {solicitud.prioridad}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Acciones Rápidas */}
        <Card title="Acciones Rápidas">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/admin/inventario">
              <div className="p-4 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer text-center">
                <Package className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <p className="text-white font-medium">Inventario</p>
              </div>
            </Link>
            <Link href="/admin/donaciones">
              <div className="p-4 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer text-center">
                <Heart className="w-8 h-8 text-red-400 mx-auto mb-2" />
                <p className="text-white font-medium">Donaciones</p>
              </div>
            </Link>
            <Link href="/admin/solicitudes">
              <div className="p-4 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer text-center">
                <FileText className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <p className="text-white font-medium">Solicitudes</p>
              </div>
            </Link>
            <Link href="/admin/asignaciones">
              <div className="p-4 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer text-center">
                <ShoppingCart className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <p className="text-white font-medium">Asignaciones</p>
              </div>
            </Link>
          </div>
        </Card>
      </main>
    </div>
  );
}
