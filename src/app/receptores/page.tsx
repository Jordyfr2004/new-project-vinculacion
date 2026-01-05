'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { solicitudesService } from '@/lib/services/solicitudes';
import { asignacionesService } from '@/lib/services/asignaciones';
import { productosService } from '@/lib/services/productos';
import type { Solicitud, Asignacion, Producto, SolicitudDetalle, UnidadMedida } from '@/types';
import Header from '@/components/Header';
import EventBanner from '@/components/EventBanner';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Table, { TableRow, TableCell } from '@/components/ui/Table';
import { Package, Plus, ShoppingCart, FileText, CheckCircle, Eye, X } from 'lucide-react';

export default function ReceptoresPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [receptor, setReceptor] = useState<any>(null);
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [showSolicitudModal, setShowSolicitudModal] = useState(false);
  const [showSolicitudDetailModal, setShowSolicitudDetailModal] = useState(false);
  const [showAsignacionDetailModal, setShowAsignacionDetailModal] = useState(false);
  const [selectedSolicitud, setSelectedSolicitud] = useState<Solicitud | null>(null);
  const [selectedAsignacion, setSelectedAsignacion] = useState<Asignacion | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Form state
  const [solicitudData, setSolicitudData] = useState({
    motivo: '',
    prioridad: 'normal' as 'baja' | 'normal' | 'alta' | 'urgente',
    observaciones: '',
    detalles: [] as Array<{
      producto_id: string;
      cantidad_solicitada: number;
      unidad_medida: UnidadMedida;
    }>,
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        router.push('/');
        return;
      }

      const { data: userData } = await supabase
        .from('users')
        .select('rol')
        .eq('id', authUser.id)
        .maybeSingle();

      if (!userData || userData.rol !== 'receptor') {
        router.push('/');
        return;
      }

      setUser(authUser);

      // Get receptor profile (ahora está en users)
      const { data: receptorData, error: receptorError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .eq('rol', 'receptor')
        .maybeSingle();

      if (receptorError) {
        console.error('Error obteniendo perfil de receptor:', receptorError);
        alert('Error al cargar tu perfil. Por favor, contacta al administrador.');
        router.push('/');
        return;
      }

      if (!receptorData) {
        console.error('No se encontró perfil de receptor para el usuario:', authUser.id);
        alert(
          '❌ No se encontró tu perfil de receptor.\n\n' +
          'Esto puede ocurrir si tu rol fue cambiado manualmente.\n\n' +
          'Por favor, contacta al administrador para que corrija tu perfil.'
        );
        router.push('/');
        return;
      }

      setReceptor(receptorData);
      loadData(receptorData.id);
    } catch (error) {
      console.error('Error checking auth:', error);
      router.push('/');
    }
  };

  const loadData = async (receptorId: string) => {
    try {
      const [solicitudesData, asignacionesData, productosData] = await Promise.all([
        solicitudesService.getSolicitudes(receptorId),
        asignacionesService.getAsignaciones(receptorId),
        productosService.getProductos(),
      ]);

      setSolicitudes(solicitudesData);
      setAsignaciones(asignacionesData);
      setProductos(productosData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProducto = () => {
    setSolicitudData({
      ...solicitudData,
      detalles: [
        ...solicitudData.detalles,
        {
          producto_id: '',
          cantidad_solicitada: 0,
          unidad_medida: 'kg',
        },
      ],
    });
  };

  const handleRemoveProducto = (index: number) => {
    setSolicitudData({
      ...solicitudData,
      detalles: solicitudData.detalles.filter((_, i) => i !== index),
    });
  };

  const handleUpdateDetalle = (index: number, field: string, value: any) => {
    const nuevosDetalles = [...solicitudData.detalles];
    // Asegurar que unidad_medida sea del tipo correcto
    if (field === 'unidad_medida') {
      nuevosDetalles[index] = { ...nuevosDetalles[index], [field]: value as UnidadMedida };
    } else {
      nuevosDetalles[index] = { ...nuevosDetalles[index], [field]: value };
    }
    setSolicitudData({ ...solicitudData, detalles: nuevosDetalles });
    
    // Limpiar error del campo cuando se actualiza
    const errorKey = `detalle_${index}_${field}`;
    if (formErrors[errorKey]) {
      const newErrors = { ...formErrors };
      delete newErrors[errorKey];
      setFormErrors(newErrors);
    }
  };

  const handleMotivoChange = (value: string) => {
    setSolicitudData({ ...solicitudData, motivo: value });
    if (formErrors.motivo) {
      const newErrors = { ...formErrors };
      delete newErrors.motivo;
      setFormErrors(newErrors);
    }
  };

  const handleSubmitSolicitud = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert('Error: No se pudo verificar tu identidad. Por favor, inicia sesión nuevamente.');
      return;
    }

    if (solicitudData.detalles.length === 0) {
      alert('Debes agregar al menos un producto a la solicitud');
      return;
    }

    setIsSubmitting(true);
    setFormErrors({});
    
    try {
      // Validar motivo
      if (!solicitudData.motivo || solicitudData.motivo.trim().length < 10) {
        setFormErrors(prev => ({ ...prev, motivo: 'El motivo debe tener al menos 10 caracteres' }));
        setIsSubmitting(false);
        return;
      }

      // Validar cada detalle
      const detallesErrors: string[] = [];
      solicitudData.detalles.forEach((detalle, index) => {
        if (!detalle.producto_id || detalle.producto_id.trim() === '') {
          detallesErrors.push(`detalle_${index}_producto_id`);
          setFormErrors(prev => ({ ...prev, [`detalle_${index}_producto_id`]: 'Debes seleccionar un producto' }));
        }
        if (!detalle.cantidad_solicitada || detalle.cantidad_solicitada <= 0) {
          detallesErrors.push(`detalle_${index}_cantidad_solicitada`);
          setFormErrors(prev => ({ ...prev, [`detalle_${index}_cantidad_solicitada`]: 'La cantidad debe ser mayor a 0' }));
        }
      });

      if (detallesErrors.length > 0 || formErrors.motivo) {
        setIsSubmitting(false);
        return;
      }

      // Validar formulario completo
      const { validateSolicitud } = await import('@/lib/utils/formValidation');
      const validation = validateSolicitud(solicitudData);

      if (!validation.valid) {
        alert(validation.errors.join('\n'));
        setIsSubmitting(false);
        return;
      }

      // Filtrar detalles válidos
      const validDetalles = solicitudData.detalles.filter(
        (d) => d.producto_id && d.producto_id.trim() !== '' && d.cantidad_solicitada > 0
      );

      if (validDetalles.length === 0) {
        alert('Debes agregar al menos un producto con cantidad mayor a 0');
        setIsSubmitting(false);
        return;
      }

      // Verificar que el receptor existe
      if (!receptor) {
        alert('❌ Error: No se encontró tu perfil de receptor. Por favor, contacta al administrador.');
        setIsSubmitting(false);
        return;
      }

      const nuevaSolicitud = await solicitudesService.createSolicitud(
        {
          receptor_id: receptor.id, // Usar id del usuario (ahora todo está en users)
          estado: 'pendiente',
          motivo: solicitudData.motivo,
          prioridad: solicitudData.prioridad,
          observaciones: solicitudData.observaciones,
        },
        validDetalles.map((d) => ({
          producto_id: d.producto_id,
          cantidad_solicitada: d.cantidad_solicitada,
          unidad_medida: d.unidad_medida as UnidadMedida,
        }))
      );

      // Reload solicitudes usando id
      await loadData(receptor.id);

      // Reset form
      setSolicitudData({
        motivo: '',
        prioridad: 'normal',
        observaciones: '',
        detalles: [],
      });
      setFormErrors({});
      setShowSolicitudModal(false);
      alert('✅ Solicitud enviada exitosamente. Será revisada por el administrador.');
    } catch (error: any) {
      console.error('Error creating solicitud:', error);
      
      // Mensajes de error más específicos
      let errorMessage = 'Error al enviar solicitud';
      if (error.message) {
        errorMessage = error.message;
      } else if (error.code === '23503') {
        errorMessage = 'Error: El producto seleccionado no existe';
      } else if (error.code === '23505') {
        errorMessage = 'Error: Ya existe una solicitud con estos datos';
      } else if (error.code === 'PGRST116') {
        errorMessage = 'Error: No se pudo conectar con la base de datos';
      }
      
      alert(`❌ ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
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

  const estadisticas = {
    total_solicitudes: solicitudes.length,
    solicitudes_pendientes: solicitudes.filter((s) => s.estado === 'pendiente').length,
    solicitudes_aprobadas: solicitudes.filter((s) => s.estado === 'aprobada').length,
    total_asignaciones: asignaciones.length,
    asignaciones_entregadas: asignaciones.filter((a) => a.estado === 'entregada').length,
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Header />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Banner de eventos */}
        <div className="mb-12">
          <EventBanner maxEventos={3} />
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Panel de Receptor</h1>
          <p className="text-slate-400">
            Bienvenido, {receptor?.nombres ?? user?.user_metadata?.nombres ?? 'Usuario'} {receptor?.apellidos ?? user?.user_metadata?.apellidos ?? ''}
          </p>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Solicitudes</p>
                <p className="text-3xl font-bold text-white">{estadisticas.total_solicitudes}</p>
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
                <p className="text-3xl font-bold text-white">{estadisticas.solicitudes_pendientes}</p>
              </div>
              <div className="p-3 bg-yellow-500/10 rounded-lg">
                <Package className="w-8 h-8 text-yellow-400" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Aprobadas</p>
                <p className="text-3xl font-bold text-white">{estadisticas.solicitudes_aprobadas}</p>
              </div>
              <div className="p-3 bg-green-500/10 rounded-lg">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Asignaciones</p>
                <p className="text-3xl font-bold text-white">{estadisticas.total_asignaciones}</p>
              </div>
              <div className="p-3 bg-purple-500/10 rounded-lg">
                <ShoppingCart className="w-8 h-8 text-purple-400" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Entregadas</p>
                <p className="text-3xl font-bold text-white">{estadisticas.asignaciones_entregadas}</p>
              </div>
              <div className="p-3 bg-emerald-500/10 rounded-lg">
                <CheckCircle className="w-8 h-8 text-emerald-400" />
              </div>
            </div>
          </Card>
        </div>

        {/* Actions */}
        <div className="mb-8">
          <Button onClick={() => setShowSolicitudModal(true)}>
            <Plus className="w-5 h-5 mr-2" />
            Nueva Solicitud
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Solicitudes */}
          <Card title="Mis Solicitudes">
            {solicitudes.length === 0 ? (
              <p className="text-slate-400 text-center py-8">
                No has realizado ninguna solicitud aún
              </p>
            ) : (
              <div className="space-y-3">
                {solicitudes.map((solicitud) => (
                  <div
                    key={solicitud.solicitud_id}
                    className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-green-500/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-400">
                        {new Date(solicitud.fecha_solicitud).toLocaleDateString()}
                      </span>
                      <div className="flex items-center space-x-2">
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
                      </div>
                    </div>
                    <p className="text-white font-medium mb-1">
                      {solicitud.detalles?.length || 0} producto(s) solicitado(s)
                    </p>
                    {solicitud.motivo && (
                      <p className="text-sm text-slate-400 mb-3 line-clamp-2">{solicitud.motivo}</p>
                    )}
                    <button
                      onClick={() => {
                        setSelectedSolicitud(solicitud);
                        setShowSolicitudDetailModal(true);
                      }}
                      className="w-full px-3 py-2 text-sm bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors flex items-center justify-center space-x-2"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Ver Detalles</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Asignaciones */}
          <Card title="Asignaciones Recibidas">
            {asignaciones.length === 0 ? (
              <p className="text-slate-400 text-center py-8">
                No has recibido ninguna asignación aún
              </p>
            ) : (
              <div className="space-y-3">
                {asignaciones.map((asignacion) => (
                  <div
                    key={asignacion.asignacion_id}
                    className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-green-500/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-400">
                        {new Date(asignacion.fecha_asignacion).toLocaleDateString()}
                      </span>
                      <Badge
                        variant={
                          asignacion.estado === 'entregada'
                            ? 'success'
                            : asignacion.estado === 'pendiente'
                            ? 'warning'
                            : 'default'
                        }
                      >
                        {asignacion.estado}
                      </Badge>
                    </div>
                    <p className="text-white font-medium mb-1">
                      {asignacion.detalles?.length || 0} producto(s) asignado(s)
                    </p>
                    {asignacion.fecha_entrega && (
                      <p className="text-sm text-slate-400 mb-3">
                        Entrega: {new Date(asignacion.fecha_entrega).toLocaleDateString()}
                      </p>
                    )}
                    <button
                      onClick={() => {
                        setSelectedAsignacion(asignacion);
                        setShowAsignacionDetailModal(true);
                      }}
                      className="w-full px-3 py-2 text-sm bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors flex items-center justify-center space-x-2"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Ver Detalles</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </main>

      {/* Modal Nueva Solicitud */}
      <Modal
        isOpen={showSolicitudModal}
        onClose={() => setShowSolicitudModal(false)}
        title="Nueva Solicitud de Alimentos"
        size="lg"
      >
        <form onSubmit={handleSubmitSolicitud} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Motivo de la Solicitud
            </label>
            <textarea
              value={solicitudData.motivo}
              onChange={(e) => handleMotivoChange(e.target.value)}
              className={`w-full px-4 py-3 bg-slate-800 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                formErrors.motivo
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-slate-700 focus:ring-green-500'
              }`}
              rows={3}
              placeholder="Describe el motivo de tu solicitud (mínimo 10 caracteres)..."
              required
            />
            {formErrors.motivo && (
              <p className="mt-1 text-sm text-red-400">{formErrors.motivo}</p>
            )}
            {!formErrors.motivo && solicitudData.motivo && (
              <p className="mt-1 text-xs text-slate-400">
                {solicitudData.motivo.length}/500 caracteres
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Prioridad
            </label>
            <select
              value={solicitudData.prioridad}
              onChange={(e) =>
                setSolicitudData({
                  ...solicitudData,
                  prioridad: e.target.value as any,
                })
              }
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="baja">Baja</option>
              <option value="normal">Normal</option>
              <option value="alta">Alta</option>
              <option value="urgente">Urgente</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Observaciones (opcional)
            </label>
            <textarea
              value={solicitudData.observaciones}
              onChange={(e) =>
                setSolicitudData({ ...solicitudData, observaciones: e.target.value })
              }
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500"
              rows={2}
              placeholder="Información adicional..."
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-slate-300">
                Productos Solicitados
              </label>
              <Button type="button" size="sm" onClick={handleAddProducto}>
                <Plus className="w-4 h-4 mr-1" />
                Agregar Producto
              </Button>
            </div>

            {solicitudData.detalles.length === 0 ? (
              <p className="text-slate-400 text-center py-4">
                Agrega productos a tu solicitud
              </p>
            ) : (
              <div className="space-y-4">
                {solicitudData.detalles.map((detalle, index) => (
                  <div
                    key={index}
                    className="p-4 bg-slate-800 rounded-lg border border-slate-700"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="text-white font-medium">Producto {index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => handleRemoveProducto(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        Eliminar
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">
                          Producto
                        </label>
                        <select
                          value={detalle.producto_id}
                          onChange={(e) =>
                            handleUpdateDetalle(index, 'producto_id', e.target.value)
                          }
                          className={`w-full px-3 py-2 bg-slate-900 border rounded-lg text-white text-sm focus:outline-none focus:ring-2 transition-all ${
                            formErrors[`detalle_${index}_producto_id`]
                              ? 'border-red-500 focus:ring-red-500'
                              : 'border-slate-700 focus:ring-green-500'
                          }`}
                          required
                        >
                          <option value="">Seleccionar...</option>
                          {productos.map((p) => (
                            <option key={p.producto_id} value={p.producto_id}>
                              {p.nombre} ({p.unidad_medida})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs text-slate-400 mb-1">
                          Cantidad Solicitada
                        </label>
                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={detalle.cantidad_solicitada || ''}
                          onChange={(e) =>
                            handleUpdateDetalle(
                              index,
                              'cantidad_solicitada',
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className={`w-full px-3 py-2 bg-slate-900 border rounded-lg text-white text-sm focus:outline-none focus:ring-2 transition-all ${
                            formErrors[`detalle_${index}_cantidad_solicitada`]
                              ? 'border-red-500 focus:ring-red-500'
                              : 'border-slate-700 focus:ring-green-500'
                          }`}
                          required
                        />
                        {formErrors[`detalle_${index}_cantidad_solicitada`] && (
                          <p className="mt-1 text-xs text-red-400">{formErrors[`detalle_${index}_cantidad_solicitada`]}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end space-x-4 pt-4 border-t border-slate-700">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowSolicitudModal(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || solicitudData.detalles.length === 0}
            >
              {isSubmitting ? 'Enviando...' : 'Enviar Solicitud'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Detalles Solicitud */}
      {selectedSolicitud && (
        <Modal
          isOpen={showSolicitudDetailModal}
          onClose={() => {
            setShowSolicitudDetailModal(false);
            setSelectedSolicitud(null);
          }}
          title="Detalles de Solicitud"
          size="lg"
        >
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Información General</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-400">Fecha</p>
                  <p className="text-white">
                    {new Date(selectedSolicitud.fecha_solicitud).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Estado</p>
                  <Badge
                    variant={
                      selectedSolicitud.estado === 'aprobada'
                        ? 'success'
                        : selectedSolicitud.estado === 'pendiente'
                        ? 'warning'
                        : selectedSolicitud.estado === 'rechazada'
                        ? 'danger'
                        : 'default'
                    }
                  >
                    {selectedSolicitud.estado}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Prioridad</p>
                  <Badge
                    variant={
                      selectedSolicitud.prioridad === 'urgente'
                        ? 'danger'
                        : selectedSolicitud.prioridad === 'alta'
                        ? 'warning'
                        : 'info'
                    }
                  >
                    {selectedSolicitud.prioridad}
                  </Badge>
                </div>
              </div>
              {selectedSolicitud.motivo && (
                <div className="mt-4">
                  <p className="text-sm text-slate-400 mb-1">Motivo</p>
                  <p className="text-slate-300">{selectedSolicitud.motivo}</p>
                </div>
              )}
              {selectedSolicitud.observaciones && (
                <div className="mt-4">
                  <p className="text-sm text-slate-400 mb-1">Observaciones</p>
                  <p className="text-slate-300">{selectedSolicitud.observaciones}</p>
                </div>
              )}
            </div>

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
          </div>
        </Modal>
      )}

      {/* Modal Detalles Asignación */}
      {selectedAsignacion && (
        <Modal
          isOpen={showAsignacionDetailModal}
          onClose={() => {
            setShowAsignacionDetailModal(false);
            setSelectedAsignacion(null);
          }}
          title="Detalles de Asignación"
          size="lg"
        >
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Información General</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-400">Fecha Asignación</p>
                  <p className="text-white">
                    {new Date(selectedAsignacion.fecha_asignacion).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Estado</p>
                  <Badge
                    variant={
                      selectedAsignacion.estado === 'entregada'
                        ? 'success'
                        : selectedAsignacion.estado === 'pendiente'
                        ? 'warning'
                        : 'default'
                    }
                  >
                    {selectedAsignacion.estado}
                  </Badge>
                </div>
                {selectedAsignacion.fecha_entrega && (
                  <div>
                    <p className="text-sm text-slate-400">Fecha Entrega</p>
                    <p className="text-white">
                      {new Date(selectedAsignacion.fecha_entrega).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
              {selectedAsignacion.observaciones && (
                <div className="mt-4">
                  <p className="text-sm text-slate-400 mb-1">Observaciones</p>
                  <p className="text-slate-300">{selectedAsignacion.observaciones}</p>
                </div>
              )}
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
                          <p className="text-xs text-slate-500 mt-1">
                            Lote: {detalle.lote.lote_id.substring(0, 8)}...
                            {detalle.lote.fecha_vencimiento && (
                              <> | Vence: {new Date(detalle.lote.fecha_vencimiento).toLocaleDateString()}</>
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
