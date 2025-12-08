'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { asignacionesService } from '@/lib/services/asignaciones';
import type { Asignacion } from '@/types';
import Header from '@/components/Header';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Table, { TableRow, TableCell } from '@/components/ui/Table';
import { ShoppingCart, Eye, CheckCircle, Calendar } from 'lucide-react';

export default function AsignacionesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);
  const [selectedAsignacion, setSelectedAsignacion] = useState<Asignacion | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filterEstado, setFilterEstado] = useState<string>('todos');

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

      loadData();
    } catch (error) {
      console.error('Error checking auth:', error);
      router.push('/');
    }
  };

  const loadData = async () => {
    try {
      const data = await asignacionesService.getAsignaciones();
      setAsignaciones(data);
    } catch (error) {
      console.error('Error loading asignaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (asignacion: Asignacion) => {
    setSelectedAsignacion(asignacion);
    setShowDetailModal(true);
  };

  const handleUpdateEstado = async (asignacionId: string, nuevoEstado: string, fechaEntrega?: string) => {
    // Validar transición de estado
    const asignacion = asignaciones.find(a => a.asignacion_id === asignacionId);
    if (!asignacion) {
      alert('Error: No se encontró la asignación');
      return;
    }

    const estadosValidos: Record<string, string[]> = {
      'pendiente': ['entregada', 'cancelada'],
      'entregada': [],
      'cancelada': [],
    };

    const estadosPermitidos = estadosValidos[asignacion.estado] || [];
    if (!estadosPermitidos.includes(nuevoEstado)) {
      alert(`No se puede cambiar el estado de "${asignacion.estado}" a "${nuevoEstado}". Estados permitidos: ${estadosPermitidos.join(', ')}`);
      return;
    }

    try {
      await asignacionesService.updateAsignacion(asignacionId, {
        estado: nuevoEstado as any,
        fecha_entrega: fechaEntrega,
      });
      await loadData();
      if (selectedAsignacion?.asignacion_id === asignacionId) {
        setSelectedAsignacion({
          ...selectedAsignacion,
          estado: nuevoEstado as any,
          fecha_entrega: fechaEntrega,
        });
      }
      alert(`✅ Estado actualizado a "${nuevoEstado}"`);
    } catch (error: any) {
      console.error('Error updating estado:', error);
      
      let errorMessage = 'Error al actualizar el estado';
      if (error.message) {
        errorMessage = error.message;
      }
      
      alert(`❌ ${errorMessage}`);
    }
  };

  const handleMarcarEntregada = () => {
    if (!selectedAsignacion) {
      alert('Error: No se encontró la asignación');
      return;
    }

    if (selectedAsignacion.estado !== 'pendiente') {
      alert(`No se puede marcar como entregada una asignación con estado "${selectedAsignacion.estado}"`);
      return;
    }

    if (!confirm('¿Confirmar que esta asignación ha sido entregada al receptor?')) {
      return;
    }

    const fechaEntrega = new Date().toISOString().split('T')[0];
    handleUpdateEstado(selectedAsignacion.asignacion_id, 'entregada', fechaEntrega);
    setShowDetailModal(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-300">Cargando...</p>
        </div>
      </div>
    );
  }

  const filteredAsignaciones =
    filterEstado === 'todos'
      ? asignaciones
      : asignaciones.filter((a) => a.estado === filterEstado);

  const estadisticas = {
    total: asignaciones.length,
    pendientes: asignaciones.filter((a) => a.estado === 'pendiente').length,
    entregadas: asignaciones.filter((a) => a.estado === 'entregada').length,
    canceladas: asignaciones.filter((a) => a.estado === 'cancelada').length,
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Header />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Gestión de Asignaciones</h1>
          <p className="text-slate-400">Administra las asignaciones de alimentos</p>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Total</p>
                <p className="text-3xl font-bold text-white">{estadisticas.total}</p>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <ShoppingCart className="w-8 h-8 text-blue-400" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Pendientes</p>
                <p className="text-3xl font-bold text-white">{estadisticas.pendientes}</p>
              </div>
              <div className="p-3 bg-yellow-500/10 rounded-lg">
                <ShoppingCart className="w-8 h-8 text-yellow-400" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Entregadas</p>
                <p className="text-3xl font-bold text-white">{estadisticas.entregadas}</p>
              </div>
              <div className="p-3 bg-green-500/10 rounded-lg">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Canceladas</p>
                <p className="text-3xl font-bold text-white">{estadisticas.canceladas}</p>
              </div>
              <div className="p-3 bg-red-500/10 rounded-lg">
                <CheckCircle className="w-8 h-8 text-red-400" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filtros */}
        <div className="mb-6 flex items-center space-x-4">
          <label className="text-slate-300">Filtrar por estado:</label>
          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="todos">Todos</option>
            <option value="pendiente">Pendientes</option>
            <option value="entregada">Entregadas</option>
            <option value="cancelada">Canceladas</option>
          </select>
        </div>

        {/* Tabla */}
        <Card title="Asignaciones">
          <Table
            headers={[
              'Fecha',
              'Receptor',
              'Productos',
              'Fecha Entrega',
              'Estado',
              'Acciones',
            ]}
          >
            {filteredAsignaciones.map((asignacion) => (
              <TableRow key={asignacion.asignacion_id}>
                <TableCell>
                  {new Date(asignacion.fecha_asignacion).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {asignacion.receptor?.nombres ?? 'N/A'} {asignacion.receptor?.apellidos ?? ''}
                  <div className="text-xs text-slate-400">
                    CI: {asignacion.receptor?.ci ?? 'N/A'}
                  </div>
                </TableCell>
                <TableCell>
                  {asignacion.detalles?.length || 0} producto(s)
                </TableCell>
                <TableCell>
                  {asignacion.fecha_entrega
                    ? new Date(asignacion.fecha_entrega).toLocaleDateString()
                    : '-'}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      asignacion.estado === 'entregada'
                        ? 'success'
                        : asignacion.estado === 'pendiente'
                        ? 'warning'
                        : 'danger'
                    }
                  >
                    {asignacion.estado}
                  </Badge>
                </TableCell>
                <TableCell>
                  <button
                    onClick={() => handleViewDetails(asignacion)}
                    className="p-2 text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </Table>
        </Card>
      </main>

      {/* Modal Detalles */}
      {selectedAsignacion && (
        <Modal
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedAsignacion(null);
          }}
          title="Detalles de Asignación"
          size="lg"
        >
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Información del Receptor</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-400">Nombre</p>
                  <p className="text-white">
                    {selectedAsignacion.receptor?.nombres ?? 'N/A'} {selectedAsignacion.receptor?.apellidos ?? ''}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Cédula</p>
                  <p className="text-white">{selectedAsignacion.receptor?.ci ?? 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Teléfono</p>
                  <p className="text-white">{selectedAsignacion.receptor?.telefono ?? 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Fecha Asignación</p>
                  <p className="text-white">
                    {new Date(selectedAsignacion.fecha_asignacion).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Productos Asignados</h3>
              <div className="space-y-2">
                {selectedAsignacion.detalles?.map((detalle, index) => (
                  <div
                    key={index}
                    className="p-4 bg-slate-800 rounded-lg border border-slate-700"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">
                          {detalle.producto?.nombre || 'Producto'}
                        </p>
                        <p className="text-sm text-slate-400">
                          Cantidad: {detalle.cantidad} {detalle.unidad_medida}
                        </p>
                        {detalle.lote && (
                          <p className="text-xs text-slate-500">
                            Lote: {detalle.lote.lote_id.substring(0, 8)}...
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selectedAsignacion.observaciones && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Observaciones</h3>
                <p className="text-slate-300">{selectedAsignacion.observaciones}</p>
              </div>
            )}

            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Acciones</h3>
              <div className="flex items-center space-x-2">
                {selectedAsignacion.estado === 'pendiente' && (
                  <>
                    <Button size="sm" onClick={handleMarcarEntregada}>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Marcar como Entregada
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() =>
                        handleUpdateEstado(selectedAsignacion.asignacion_id, 'cancelada')
                      }
                    >
                      Cancelar
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
