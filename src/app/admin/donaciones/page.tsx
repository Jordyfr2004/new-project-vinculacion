'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { donacionesService } from '@/lib/services/donaciones';
import type { Donacion } from '@/types';
import Header from '@/components/Header';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Table, { TableRow, TableCell } from '@/components/ui/Table';
import { Heart, Eye, CheckCircle, XCircle } from 'lucide-react';

export default function DonacionesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [donaciones, setDonaciones] = useState<Donacion[]>([]);
  const [selectedDonacion, setSelectedDonacion] = useState<Donacion | null>(null);
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
      const data = await donacionesService.getDonaciones();
      setDonaciones(data);
    } catch (error) {
      console.error('Error loading donaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (donacion: Donacion) => {
    setSelectedDonacion(donacion);
    setShowDetailModal(true);
  };

  const handleUpdateEstado = async (donacionId: string, nuevoEstado: string) => {
    // Validar transición de estado
    const donacion = donaciones.find(d => d.donacion_id === donacionId);
    if (!donacion) {
      alert('Error: No se encontró la donación');
      return;
    }

    const estadosValidos: Record<string, string[]> = {
      'pendiente': ['recibida', 'rechazada'],
      'recibida': ['procesada', 'rechazada'],
      'procesada': [],
      'rechazada': [],
    };

    const estadosPermitidos = estadosValidos[donacion.estado] || [];
    if (!estadosPermitidos.includes(nuevoEstado)) {
      alert(`No se puede cambiar el estado de "${donacion.estado}" a "${nuevoEstado}". Estados permitidos: ${estadosPermitidos.join(', ')}`);
      return;
    }

    if (nuevoEstado === 'rechazada' && !confirm('¿Estás seguro de rechazar esta donación?')) {
      return;
    }

    if (nuevoEstado === 'procesada' && !confirm('¿Procesar esta donación? Esto actualizará el inventario.')) {
      return;
    }

    try {
      await donacionesService.updateEstadoDonacion(donacionId, nuevoEstado as any);
      await loadData();
      if (selectedDonacion?.donacion_id === donacionId) {
        setSelectedDonacion({
          ...selectedDonacion,
          estado: nuevoEstado as any,
        });
      }
      alert(`✅ Estado actualizado a "${nuevoEstado}"`);
    } catch (error: any) {
      console.error('Error updating estado:', error);
      
      let errorMessage = 'Error al actualizar el estado';
      if (error.message) {
        errorMessage = error.message;
      } else if (error.code === 'PGRST116') {
        errorMessage = 'Error: No se pudo conectar con la base de datos';
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

  const filteredDonaciones =
    filterEstado === 'todos'
      ? donaciones
      : donaciones.filter((d) => d.estado === filterEstado);

  const estadisticas = {
    total: donaciones.length,
    pendientes: donaciones.filter((d) => d.estado === 'pendiente').length,
    recibidas: donaciones.filter((d) => d.estado === 'recibida').length,
    procesadas: donaciones.filter((d) => d.estado === 'procesada').length,
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Header />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Gestión de Donaciones</h1>
          <p className="text-slate-400">Administra las donaciones recibidas</p>
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
                <Heart className="w-8 h-8 text-blue-400" />
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
                <Heart className="w-8 h-8 text-yellow-400" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Recibidas</p>
                <p className="text-3xl font-bold text-white">{estadisticas.recibidas}</p>
              </div>
              <div className="p-3 bg-green-500/10 rounded-lg">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Procesadas</p>
                <p className="text-3xl font-bold text-white">{estadisticas.procesadas}</p>
              </div>
              <div className="p-3 bg-emerald-500/10 rounded-lg">
                <CheckCircle className="w-8 h-8 text-emerald-400" />
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
            <option value="recibida">Recibidas</option>
            <option value="procesada">Procesadas</option>
            <option value="rechazada">Rechazadas</option>
          </select>
        </div>

        {/* Tabla */}
        <Card title="Donaciones">
          <Table
            headers={[
              'Fecha',
              'Donante',
              'Productos',
              'Estado',
              'Acciones',
            ]}
          >
            {filteredDonaciones.map((donacion) => (
              <TableRow key={donacion.donacion_id}>
                <TableCell>
                  {new Date(donacion.fecha_donacion).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {donacion.donante?.nombres ?? 'N/A'} {donacion.donante?.apellidos ?? ''}
                  <div className="text-xs text-slate-400">
                    {donacion.donante?.tipo_donante ?? 'N/A'}
                  </div>
                </TableCell>
                <TableCell>
                  {donacion.detalles?.length || 0} producto(s)
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      donacion.estado === 'procesada'
                        ? 'success'
                        : donacion.estado === 'pendiente'
                        ? 'warning'
                        : donacion.estado === 'rechazada'
                        ? 'danger'
                        : 'info'
                    }
                  >
                    {donacion.estado}
                  </Badge>
                </TableCell>
                <TableCell>
                  <button
                    onClick={() => handleViewDetails(donacion)}
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
      {selectedDonacion && (
        <Modal
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedDonacion(null);
          }}
          title="Detalles de Donación"
          size="lg"
        >
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Información del Donante</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-400">Nombre</p>
                  <p className="text-white">
                    {selectedDonacion.donante?.nombres ?? 'N/A'} {selectedDonacion.donante?.apellidos ?? ''}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Tipo</p>
                  <p className="text-white">{selectedDonacion.donante?.tipo_donante ?? 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Teléfono</p>
                  <p className="text-white">{selectedDonacion.donante?.telefono ?? 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Fecha</p>
                  <p className="text-white">
                    {new Date(selectedDonacion.fecha_donacion).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Productos Donados</h3>
              <div className="space-y-2">
                {selectedDonacion.detalles?.map((detalle, index) => (
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
                        {detalle.fecha_vencimiento && (
                          <p className="text-sm text-slate-400">
                            Vence: {new Date(detalle.fecha_vencimiento).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    {detalle.observaciones && (
                      <p className="text-sm text-slate-400 mt-2">{detalle.observaciones}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {selectedDonacion.observaciones && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Observaciones</h3>
                <p className="text-slate-300">{selectedDonacion.observaciones}</p>
              </div>
            )}

            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Cambiar Estado</h3>
              <div className="flex items-center space-x-2">
                {selectedDonacion.estado === 'pendiente' && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => handleUpdateEstado(selectedDonacion.donacion_id, 'recibida')}
                    >
                      Marcar como Recibida
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleUpdateEstado(selectedDonacion.donacion_id, 'rechazada')}
                    >
                      Rechazar
                    </Button>
                  </>
                )}
                {selectedDonacion.estado === 'recibida' && (
                  <Button
                    size="sm"
                    onClick={() => handleUpdateEstado(selectedDonacion.donacion_id, 'procesada')}
                  >
                    Procesar Donación
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
