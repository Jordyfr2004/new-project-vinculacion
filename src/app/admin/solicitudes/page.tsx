'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { solicitudesService } from '@/lib/services/solicitudes';
import { asignacionesService } from '@/lib/services/asignaciones';
import type { Solicitud, Asignacion } from '@/types';
import Header from '@/components/Header';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Table, { TableRow, TableCell } from '@/components/ui/Table';
import { FileText, Eye, CheckCircle, XCircle, ShoppingCart } from 'lucide-react';

export default function SolicitudesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [selectedSolicitud, setSelectedSolicitud] = useState<Solicitud | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAsignacionModal, setShowAsignacionModal] = useState(false);
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
      const data = await solicitudesService.getSolicitudes();
      setSolicitudes(data);
    } catch (error) {
      console.error('Error loading solicitudes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (solicitud: Solicitud) => {
    setSelectedSolicitud(solicitud);
    setShowDetailModal(true);
  };

  const handleUpdateEstado = async (solicitudId: string, nuevoEstado: string) => {
    // Validar transición de estado
    const solicitud = solicitudes.find(s => s.solicitud_id === solicitudId);
    if (!solicitud) {
      alert('Error: No se encontró la solicitud');
      return;
    }

    const estadosValidos: Record<string, string[]> = {
      'pendiente': ['aprobada', 'rechazada'],
      'aprobada': ['completada', 'cancelada'],
      'rechazada': [],
      'completada': [],
      'cancelada': [],
    };

    const estadosPermitidos = estadosValidos[solicitud.estado] || [];
    if (!estadosPermitidos.includes(nuevoEstado)) {
      alert(`No se puede cambiar el estado de "${solicitud.estado}" a "${nuevoEstado}". Estados permitidos: ${estadosPermitidos.join(', ')}`);
      return;
    }

    if (nuevoEstado === 'rechazada' && !confirm('¿Estás seguro de rechazar esta solicitud?')) {
      return;
    }

    try {
      await solicitudesService.updateEstadoSolicitud(solicitudId, nuevoEstado as any);
      await loadData();
      if (selectedSolicitud?.solicitud_id === solicitudId) {
        setSelectedSolicitud({
          ...selectedSolicitud,
          estado: nuevoEstado as any,
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

  const handleCreateAsignacion = async () => {
    if (!selectedSolicitud) {
      alert('Error: No se encontró la solicitud');
      return;
    }

    // Validar que la solicitud esté pendiente
    if (selectedSolicitud.estado !== 'pendiente') {
      alert(`No se puede crear una asignación para una solicitud con estado "${selectedSolicitud.estado}"`);
      return;
    }

    // Validar que tenga productos
    if (!selectedSolicitud.detalles || selectedSolicitud.detalles.length === 0) {
      alert('Error: La solicitud no tiene productos');
      return;
    }

    // Verificar stock disponible (opcional, pero recomendado)
    try {
      const { productosService } = await import('@/lib/services/productos');
      const productos = await productosService.getProductos();
      
      const productosSinStock: string[] = [];
      const productosConStockInsuficiente: Array<{nombre: string; stock: number; solicitado: number}> = [];
      
      selectedSolicitud.detalles.forEach((detalle) => {
        const producto = productos.find(p => p.producto_id === detalle.producto_id);
        if (producto) {
          if (producto.stock_actual < detalle.cantidad_solicitada) {
            productosSinStock.push(`${producto.nombre} (Stock: ${producto.stock_actual} ${producto.unidad_medida}, Solicitado: ${detalle.cantidad_solicitada} ${detalle.unidad_medida})`);
            productosConStockInsuficiente.push({
              nombre: producto.nombre,
              stock: producto.stock_actual,
              solicitado: detalle.cantidad_solicitada
            });
          }
        } else {
          productosSinStock.push(`${detalle.producto_id} (Producto no encontrado)`);
        }
      });

      if (productosSinStock.length > 0) {
        const esBloqueante = productosConStockInsuficiente.some(p => p.stock === 0);
        
        if (esBloqueante) {
          alert(
            `❌ No se puede crear la asignación. Los siguientes productos no tienen stock disponible:\n${productosSinStock.join('\n')}\n\nPor favor, procesa donaciones primero o ajusta la solicitud.`
          );
          return;
        }
        
        const confirmar = confirm(
          `⚠️ Advertencia: Los siguientes productos tienen stock insuficiente:\n${productosSinStock.join('\n')}\n\n¿Deseas crear la asignación de todas formas? (Se asignará el stock disponible)`
        );
        if (!confirmar) return;
      }
    } catch (error) {
      console.warn('No se pudo verificar el stock:', error);
      // Continuar de todas formas
    }

    try {
      // Crear asignación básica
      const nuevaAsignacion = await asignacionesService.createAsignacion(
        {
          solicitud_id: selectedSolicitud.solicitud_id,
          receptor_id: selectedSolicitud.receptor_id,
          estado: 'pendiente',
        },
        selectedSolicitud.detalles.map((d) => ({
          producto_id: d.producto_id,
          cantidad: d.cantidad_solicitada,
          unidad_medida: d.unidad_medida,
        }))
      );

      // Actualizar solicitud a aprobada
      await solicitudesService.updateEstadoSolicitud(selectedSolicitud.solicitud_id, 'aprobada');

      setShowAsignacionModal(false);
      setShowDetailModal(false);
      await loadData();
      alert('✅ Asignación creada exitosamente');
    } catch (error: any) {
      console.error('Error creating asignacion:', error);
      
      let errorMessage = 'Error al crear la asignación';
      if (error.message) {
        errorMessage = error.message;
      } else if (error.code === '23503') {
        errorMessage = 'Error: El producto o receptor no existe';
      }
      
      alert(`❌ ${errorMessage}`);
    }
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

  const filteredSolicitudes =
    filterEstado === 'todos'
      ? solicitudes
      : solicitudes.filter((s) => s.estado === filterEstado);

  const estadisticas = {
    total: solicitudes.length,
    pendientes: solicitudes.filter((s) => s.estado === 'pendiente').length,
    aprobadas: solicitudes.filter((s) => s.estado === 'aprobada').length,
    rechazadas: solicitudes.filter((s) => s.estado === 'rechazada').length,
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Header />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Gestión de Solicitudes</h1>
          <p className="text-slate-400">Administra las solicitudes de alimentos</p>
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
                <FileText className="w-8 h-8 text-blue-400" />
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
                <FileText className="w-8 h-8 text-yellow-400" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Aprobadas</p>
                <p className="text-3xl font-bold text-white">{estadisticas.aprobadas}</p>
              </div>
              <div className="p-3 bg-green-500/10 rounded-lg">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Rechazadas</p>
                <p className="text-3xl font-bold text-white">{estadisticas.rechazadas}</p>
              </div>
              <div className="p-3 bg-red-500/10 rounded-lg">
                <XCircle className="w-8 h-8 text-red-400" />
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
            <option value="aprobada">Aprobadas</option>
            <option value="rechazada">Rechazadas</option>
            <option value="completada">Completadas</option>
          </select>
        </div>

        {/* Tabla */}
        <Card title="Solicitudes">
          <Table
            headers={[
              'Fecha',
              'Receptor',
              'Productos',
              'Prioridad',
              'Estado',
              'Acciones',
            ]}
          >
            {filteredSolicitudes.map((solicitud) => (
              <TableRow key={solicitud.solicitud_id}>
                <TableCell>
                  {new Date(solicitud.fecha_solicitud).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {solicitud.receptor?.nombres ?? 'N/A'} {solicitud.receptor?.apellidos ?? ''}
                  <div className="text-xs text-slate-400">
                    CI: {solicitud.receptor?.ci ?? 'N/A'}
                  </div>
                </TableCell>
                <TableCell>
                  {solicitud.detalles?.length || 0} producto(s)
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      solicitud.prioridad === 'urgente'
                        ? 'danger'
                        : solicitud.prioridad === 'alta'
                        ? 'warning'
                        : 'info'
                    }
                  >
                    {solicitud.prioridad}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      solicitud.estado === 'aprobada'
                        ? 'success'
                        : solicitud.estado === 'pendiente'
                        ? 'warning'
                        : solicitud.estado === 'rechazada'
                        ? 'danger'
                        : 'default'
                    }
                  >
                    {solicitud.estado}
                  </Badge>
                </TableCell>
                <TableCell>
                  <button
                    onClick={() => handleViewDetails(solicitud)}
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
      {selectedSolicitud && (
        <Modal
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedSolicitud(null);
          }}
          title="Detalles de Solicitud"
          size="lg"
        >
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Información del Receptor</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-400">Nombre</p>
                  <p className="text-white">
                    {selectedSolicitud.receptor?.nombres ?? 'N/A'} {selectedSolicitud.receptor?.apellidos ?? ''}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Cédula</p>
                  <p className="text-white">{selectedSolicitud.receptor?.ci ?? 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Teléfono</p>
                  <p className="text-white">{selectedSolicitud.receptor?.telefono ?? 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Fecha</p>
                  <p className="text-white">
                    {new Date(selectedSolicitud.fecha_solicitud).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {selectedSolicitud.motivo && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Motivo</h3>
                <p className="text-slate-300">{selectedSolicitud.motivo}</p>
              </div>
            )}

            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Productos Solicitados</h3>
              <div className="space-y-2">
                {selectedSolicitud.detalles?.map((detalle, index) => (
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
                          Solicitado: {detalle.cantidad_solicitada} {detalle.unidad_medida}
                        </p>
                        {detalle.cantidad_asignada > 0 && (
                          <p className="text-sm text-green-400">
                            Asignado: {detalle.cantidad_asignada} {detalle.unidad_medida}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selectedSolicitud.observaciones && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Observaciones</h3>
                <p className="text-slate-300">{selectedSolicitud.observaciones}</p>
              </div>
            )}

            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Acciones</h3>
              <div className="flex items-center space-x-2">
                {selectedSolicitud.estado === 'pendiente' && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => {
                        setShowAsignacionModal(true);
                      }}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Crear Asignación
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() =>
                        handleUpdateEstado(selectedSolicitud.solicitud_id, 'rechazada')
                      }
                    >
                      Rechazar
                    </Button>
                  </>
                )}
                {selectedSolicitud.estado === 'aprobada' && (
                  <Button
                    size="sm"
                    onClick={() =>
                      handleUpdateEstado(selectedSolicitud.solicitud_id, 'completada')
                    }
                  >
                    Marcar como Completada
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Confirmar Asignación */}
      <Modal
        isOpen={showAsignacionModal}
        onClose={() => setShowAsignacionModal(false)}
        title="Confirmar Asignación"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-slate-300">
            ¿Deseas crear una asignación para esta solicitud? Se asignarán los productos
            solicitados al receptor.
          </p>
          <div className="flex items-center justify-end space-x-4">
            <Button variant="outline" onClick={() => setShowAsignacionModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateAsignacion}>
              <ShoppingCart className="w-4 h-4 mr-2" />
              Crear Asignación
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
