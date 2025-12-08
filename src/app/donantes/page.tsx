'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { donacionesService } from '@/lib/services/donaciones';
import { productosService } from '@/lib/services/productos';
import type { Donacion, Producto, Categoria, DonacionDetalle, UnidadMedida } from '@/types';
import Header from '@/components/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Table, { TableRow, TableCell } from '@/components/ui/Table';
import { Package, Plus, History, TrendingUp, Heart, Eye, X } from 'lucide-react';

export default function DonantesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [donante, setDonante] = useState<any>(null);
  const [donaciones, setDonaciones] = useState<Donacion[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [showDonacionModal, setShowDonacionModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDonacion, setSelectedDonacion] = useState<Donacion | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Form state
  const [donacionData, setDonacionData] = useState({
    observaciones: '',
    detalles: [] as Array<{
      producto_id: string;
      cantidad: number;
      unidad_medida: UnidadMedida;
      fecha_vencimiento: string;
      observaciones: string;
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

      if (!userData || userData.rol !== 'donante') {
        router.push('/');
        return;
      }

      setUser(authUser);

      // Get donante profile (ahora está en users)
      const { data: donanteData, error: donanteError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .eq('rol', 'donante')
        .maybeSingle();

      if (donanteError) {
        console.error('Error obteniendo perfil de donante:', donanteError);
        alert('Error al cargar tu perfil. Por favor, contacta al administrador.');
        router.push('/');
        return;
      }

      if (!donanteData) {
        console.error('No se encontró perfil de donante para el usuario:', authUser.id);
        alert(
          '❌ No se encontró tu perfil de donante.\n\n' +
          'Esto puede ocurrir si tu rol fue cambiado manualmente.\n\n' +
          'Por favor, contacta al administrador para que corrija tu perfil.'
        );
        router.push('/');
        return;
      }

      setDonante(donanteData);
      loadData(donanteData.id);
    } catch (error) {
      console.error('Error checking auth:', error);
      router.push('/');
    }
  };

  const loadData = async (donanteId: string) => {
    try {
      const [donacionesData, productosData, categoriasData] = await Promise.all([
        donacionesService.getDonaciones(donanteId),
        productosService.getProductos(),
        productosService.getCategorias(),
      ]);

      setDonaciones(donacionesData);
      setProductos(productosData);
      setCategorias(categoriasData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProducto = () => {
    setDonacionData({
      ...donacionData,
      detalles: [
        ...donacionData.detalles,
        {
          producto_id: '',
          cantidad: 0,
          unidad_medida: 'kg',
          fecha_vencimiento: '',
          observaciones: '',
        },
      ],
    });
  };

  const handleRemoveProducto = (index: number) => {
    setDonacionData({
      ...donacionData,
      detalles: donacionData.detalles.filter((_, i) => i !== index),
    });
  };

  const handleUpdateDetalle = (index: number, field: string, value: any) => {
    const nuevosDetalles = [...donacionData.detalles];
    // Asegurar que unidad_medida sea del tipo correcto
    if (field === 'unidad_medida') {
      nuevosDetalles[index] = { ...nuevosDetalles[index], [field]: value as UnidadMedida };
    } else {
      nuevosDetalles[index] = { ...nuevosDetalles[index], [field]: value };
    }
    setDonacionData({ ...donacionData, detalles: nuevosDetalles });
    
    // Limpiar error del campo cuando se actualiza
    const errorKey = `detalle_${index}_${field}`;
    if (formErrors[errorKey]) {
      const newErrors = { ...formErrors };
      delete newErrors[errorKey];
      setFormErrors(newErrors);
    }
  };

  const validateDetalle = (detalle: any, index: number): string[] => {
    const errors: string[] = [];
    const errorKey = (field: string) => `detalle_${index}_${field}`;

    if (!detalle.producto_id || detalle.producto_id.trim() === '') {
      errors.push(errorKey('producto_id'));
      setFormErrors(prev => ({ ...prev, [errorKey('producto_id')]: 'Debes seleccionar un producto' }));
    }

    if (!detalle.cantidad || detalle.cantidad <= 0) {
      errors.push(errorKey('cantidad'));
      setFormErrors(prev => ({ ...prev, [errorKey('cantidad')]: 'La cantidad debe ser mayor a 0' }));
    }

    if (!detalle.unidad_medida) {
      errors.push(errorKey('unidad_medida'));
      setFormErrors(prev => ({ ...prev, [errorKey('unidad_medida')]: 'Debes seleccionar una unidad de medida' }));
    }

    if (detalle.fecha_vencimiento) {
      const fecha = new Date(detalle.fecha_vencimiento);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      if (fecha < hoy) {
        errors.push(errorKey('fecha_vencimiento'));
        setFormErrors(prev => ({ ...prev, [errorKey('fecha_vencimiento')]: 'La fecha no puede ser anterior a hoy' }));
      }
    }

    return errors;
  };

  const handleSubmitDonacion = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert('Error: No se pudo verificar tu identidad. Por favor, inicia sesión nuevamente.');
      return;
    }

    if (!donante) {
      alert('❌ Error: No se encontró tu perfil de donante. Por favor, recarga la página o contacta al administrador.');
      return;
    }

    if (donacionData.detalles.length === 0) {
      alert('Debes agregar al menos un producto a la donación');
      return;
    }

    setIsSubmitting(true);
    setFormErrors({});
    
    try {
      // Validar cada detalle
      const detallesErrors: string[] = [];
      donacionData.detalles.forEach((detalle, index) => {
        const errors = validateDetalle(detalle, index);
        detallesErrors.push(...errors);
      });

      if (detallesErrors.length > 0) {
        setIsSubmitting(false);
        return;
      }

      // Validar formulario completo
      const { validateDonacion } = await import('@/lib/utils/formValidation');
      const validation = validateDonacion(donacionData);

      if (!validation.valid) {
        alert(validation.errors.join('\n'));
        setIsSubmitting(false);
        return;
      }

      // Filtrar detalles válidos
      const validDetalles = donacionData.detalles.filter(
        (d) => d.producto_id && d.producto_id.trim() !== '' && d.cantidad > 0
      );

      if (validDetalles.length === 0) {
        alert('Debes agregar al menos un producto con cantidad mayor a 0');
        setIsSubmitting(false);
        return;
      }

      // Verificar que el donante existe
      if (!donante) {
        alert('❌ Error: No se encontró tu perfil de donante. Por favor, contacta al administrador.');
        setIsSubmitting(false);
        return;
      }

      const nuevaDonacion = await donacionesService.createDonacion(
        {
          donante_id: donante.id, // Usar id del usuario (ahora todo está en users)
          estado: 'pendiente',
          observaciones: donacionData.observaciones,
        },
        validDetalles.map((d) => ({
          producto_id: d.producto_id,
          cantidad: d.cantidad,
          unidad_medida: d.unidad_medida as UnidadMedida,
          fecha_vencimiento: d.fecha_vencimiento || undefined,
          observaciones: d.observaciones,
        }))
      );

      // Reload donaciones usando id
      await loadData(donante.id);

      // Reset form
      setDonacionData({
        observaciones: '',
        detalles: [],
      });
      setFormErrors({});
      setShowDonacionModal(false);
      alert('✅ Donación registrada exitosamente. Será revisada por el administrador.');
    } catch (error: any) {
      console.error('Error creating donacion:', error);
      
      // Mensajes de error más específicos
      let errorMessage = 'Error al registrar donación';
      if (error.message) {
        errorMessage = error.message;
      } else if (error.code === '23503') {
        errorMessage = 'Error: El producto seleccionado no existe';
      } else if (error.code === '23505') {
        errorMessage = 'Error: Ya existe una donación con estos datos';
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
    total_donaciones: donaciones.length,
    donaciones_pendientes: donaciones.filter((d) => d.estado === 'pendiente').length,
    donaciones_procesadas: donaciones.filter((d) => d.estado === 'procesada').length,
    total_productos: donaciones.reduce(
      (sum, d) => sum + (d.detalles?.length || 0),
      0
    ),
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Header />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Panel de Donante
          </h1>
          <p className="text-slate-400">
            Bienvenido, {donante?.nombres ?? user?.user_metadata?.nombres ?? 'Usuario'} {donante?.apellidos ?? user?.user_metadata?.apellidos ?? ''}
          </p>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Total Donaciones</p>
                <p className="text-3xl font-bold text-white">{estadisticas.total_donaciones}</p>
              </div>
              <div className="p-3 bg-green-500/10 rounded-lg">
                <Heart className="w-8 h-8 text-green-400" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Pendientes</p>
                <p className="text-3xl font-bold text-white">{estadisticas.donaciones_pendientes}</p>
              </div>
              <div className="p-3 bg-yellow-500/10 rounded-lg">
                <Package className="w-8 h-8 text-yellow-400" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Procesadas</p>
                <p className="text-3xl font-bold text-white">{estadisticas.donaciones_procesadas}</p>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <TrendingUp className="w-8 h-8 text-blue-400" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Productos Donados</p>
                <p className="text-3xl font-bold text-white">{estadisticas.total_productos}</p>
              </div>
              <div className="p-3 bg-purple-500/10 rounded-lg">
                <Package className="w-8 h-8 text-purple-400" />
              </div>
            </div>
          </Card>
        </div>

        {/* Actions */}
        <div className="mb-8">
          <Button onClick={() => setShowDonacionModal(true)}>
            <Plus className="w-5 h-5 mr-2" />
            Nueva Donación
          </Button>
        </div>

        {/* Donaciones */}
        <Card title="Mis Donaciones">
          {donaciones.length === 0 ? (
            <p className="text-slate-400 text-center py-8">
              No has realizado ninguna donación aún
            </p>
          ) : (
            <Table headers={['Fecha', 'Productos', 'Estado', 'Acciones']}>
              {donaciones.map((donacion) => (
                <TableRow key={donacion.donacion_id}>
                  <TableCell>
                    {new Date(donacion.fecha_donacion).toLocaleDateString()}
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
                          : 'default'
                      }
                    >
                      {donacion.estado}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => {
                        setSelectedDonacion(donacion);
                        setShowDetailModal(true);
                      }}
                      className="px-3 py-1 text-sm bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                    >
                      Ver Detalles
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </Table>
          )}
        </Card>
      </main>

      {/* Modal Nueva Donación */}
      <Modal
        isOpen={showDonacionModal}
        onClose={() => setShowDonacionModal(false)}
        title="Nueva Donación"
        size="lg"
      >
        <form onSubmit={handleSubmitDonacion} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Observaciones
            </label>
            <textarea
              value={donacionData.observaciones}
              onChange={(e) =>
                setDonacionData({ ...donacionData, observaciones: e.target.value })
              }
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500"
              rows={3}
              placeholder="Información adicional sobre la donación..."
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-slate-300">
                Productos a Donar
              </label>
              <Button type="button" size="sm" onClick={handleAddProducto}>
                <Plus className="w-4 h-4 mr-1" />
                Agregar Producto
              </Button>
            </div>

            {donacionData.detalles.length === 0 ? (
              <p className="text-slate-400 text-center py-4">
                Agrega productos a tu donación
              </p>
            ) : (
              <div className="space-y-4">
                {donacionData.detalles.map((detalle, index) => (
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
                          Cantidad
                        </label>
                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={detalle.cantidad || ''}
                          onChange={(e) =>
                            handleUpdateDetalle(index, 'cantidad', parseFloat(e.target.value) || 0)
                          }
                          className={`w-full px-3 py-2 bg-slate-900 border rounded-lg text-white text-sm focus:outline-none focus:ring-2 transition-all ${
                            formErrors[`detalle_${index}_cantidad`]
                              ? 'border-red-500 focus:ring-red-500'
                              : 'border-slate-700 focus:ring-green-500'
                          }`}
                          required
                        />
                        {formErrors[`detalle_${index}_cantidad`] && (
                          <p className="mt-1 text-xs text-red-400">{formErrors[`detalle_${index}_cantidad`]}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs text-slate-400 mb-1">
                          Unidad de Medida
                        </label>
                        <select
                          value={detalle.unidad_medida}
                          onChange={(e) =>
                            handleUpdateDetalle(index, 'unidad_medida', e.target.value)
                          }
                          className={`w-full px-3 py-2 bg-slate-900 border rounded-lg text-white text-sm focus:outline-none focus:ring-2 transition-all ${
                            formErrors[`detalle_${index}_unidad_medida`]
                              ? 'border-red-500 focus:ring-red-500'
                              : 'border-slate-700 focus:ring-green-500'
                          }`}
                          required
                        >
                          <option value="kg">Kilogramos (kg)</option>
                          <option value="unidad">Unidad</option>
                          <option value="litro">Litros</option>
                          <option value="caja">Caja</option>
                          <option value="bolsa">Bolsa</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs text-slate-400 mb-1">
                          Fecha de Vencimiento (opcional)
                        </label>
                        <input
                          type="date"
                          value={detalle.fecha_vencimiento}
                          onChange={(e) =>
                            handleUpdateDetalle(index, 'fecha_vencimiento', e.target.value)
                          }
                          className={`w-full px-3 py-2 bg-slate-900 border rounded-lg text-white text-sm focus:outline-none focus:ring-2 transition-all ${
                            formErrors[`detalle_${index}_fecha_vencimiento`]
                              ? 'border-red-500 focus:ring-red-500'
                              : 'border-slate-700 focus:ring-green-500'
                          }`}
                        />
                        {formErrors[`detalle_${index}_fecha_vencimiento`] && (
                          <p className="mt-1 text-xs text-red-400">{formErrors[`detalle_${index}_fecha_vencimiento`]}</p>
                        )}
                      </div>
                    </div>

                    <div className="mt-3">
                      <label className="block text-xs text-slate-400 mb-1">
                        Observaciones (opcional)
                      </label>
                      <input
                        type="text"
                        value={detalle.observaciones}
                        onChange={(e) =>
                          handleUpdateDetalle(index, 'observaciones', e.target.value)
                        }
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Notas sobre este producto..."
                      />
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
              onClick={() => setShowDonacionModal(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || donacionData.detalles.length === 0}>
              {isSubmitting ? 'Registrando...' : 'Registrar Donación'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Detalles Donación */}
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
              <h3 className="text-lg font-semibold text-white mb-4">Información General</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-400">Fecha</p>
                  <p className="text-white">
                    {new Date(selectedDonacion.fecha_donacion).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Estado</p>
                  <Badge
                    variant={
                      selectedDonacion.estado === 'procesada'
                        ? 'success'
                        : selectedDonacion.estado === 'pendiente'
                        ? 'warning'
                        : 'default'
                    }
                  >
                    {selectedDonacion.estado}
                  </Badge>
                </div>
              </div>
              {selectedDonacion.observaciones && (
                <div className="mt-4">
                  <p className="text-sm text-slate-400 mb-1">Observaciones</p>
                  <p className="text-slate-300">{selectedDonacion.observaciones}</p>
                </div>
              )}
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
                        {detalle.observaciones && (
                          <p className="text-sm text-slate-400 mt-1">{detalle.observaciones}</p>
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
