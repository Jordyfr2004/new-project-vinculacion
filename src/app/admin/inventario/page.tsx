'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { productosService } from '@/lib/services/productos';
import type { Producto, Categoria } from '@/types';
import Header from '@/components/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Table, { TableRow, TableCell } from '@/components/ui/Table';
import { Package, Plus, Edit, Trash2, AlertTriangle } from 'lucide-react';

export default function InventarioPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProducto, setEditingProducto] = useState<Producto | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    categoria_id: '',
    unidad_medida: 'kg' as 'kg' | 'unidad' | 'litro' | 'caja' | 'bolsa',
    stock_actual: 0,
    stock_minimo: 0,
  });

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
      const [productosData, categoriasData] = await Promise.all([
        productosService.getProductos(),
        productosService.getCategorias(),
      ]);

      setProductos(productosData);
      setCategorias(categoriasData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (producto?: Producto) => {
    setFormErrors({});
    if (producto) {
      setEditingProducto(producto);
      setFormData({
        nombre: producto.nombre,
        descripcion: producto.descripcion || '',
        categoria_id: producto.categoria_id,
        unidad_medida: producto.unidad_medida,
        stock_actual: producto.stock_actual,
        stock_minimo: producto.stock_minimo,
      });
    } else {
      setEditingProducto(null);
      setFormData({
        nombre: '',
        descripcion: '',
        categoria_id: '',
        unidad_medida: 'kg',
        stock_actual: 0,
        stock_minimo: 0,
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormErrors({});

    try {
      // Validaciones en tiempo real
      const errors: Record<string, string> = {};

      if (!formData.nombre || formData.nombre.trim().length < 2) {
        errors.nombre = 'El nombre debe tener al menos 2 caracteres';
      }

      if (!formData.categoria_id) {
        errors.categoria_id = 'Debes seleccionar una categoría';
      }

      if (formData.stock_actual < 0) {
        errors.stock_actual = 'El stock actual no puede ser negativo';
      }

      if (formData.stock_minimo < 0) {
        errors.stock_minimo = 'El stock mínimo no puede ser negativo';
      }

      if (formData.descripcion && formData.descripcion.length > 500) {
        errors.descripcion = 'La descripción no puede tener más de 500 caracteres';
      }

      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        setIsSubmitting(false);
        return;
      }

      // Validar formulario completo
      const { validateProducto } = await import('@/lib/utils/formValidation');
      const validation = validateProducto(formData);

      if (!validation.valid) {
        alert(validation.errors.join('\n'));
        setIsSubmitting(false);
        return;
      }

      if (editingProducto) {
        await productosService.updateProducto(editingProducto.producto_id, formData);
      } else {
        await productosService.createProducto(formData);
      }

      await loadData();
      setShowModal(false);
      setEditingProducto(null);
      setFormErrors({});
      alert('✅ Producto guardado exitosamente');
    } catch (error: any) {
      console.error('Error saving producto:', error);
      
      let errorMessage = 'Error al guardar producto';
      if (error.message) {
        errorMessage = error.message;
      } else if (error.code === '23503') {
        errorMessage = 'Error: La categoría seleccionada no existe';
      } else if (error.code === '23505') {
        errorMessage = 'Error: Ya existe un producto con este nombre';
      }
      
      alert(`❌ ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este producto? Esta acción no se puede deshacer.')) return;

    try {
      // Verificar si el producto tiene stock
      const producto = productos.find(p => p.producto_id === id);
      if (producto && producto.stock_actual > 0) {
        if (!confirm(`Este producto tiene ${producto.stock_actual} ${producto.unidad_medida} en stock. ¿Deseas eliminarlo de todas formas?`)) {
          return;
        }
      }

      await productosService.deleteProducto(id);
      await loadData();
      alert('✅ Producto eliminado exitosamente');
    } catch (error: any) {
      console.error('Error deleting producto:', error);
      
      let errorMessage = 'Error al eliminar producto';
      if (error.message) {
        errorMessage = error.message;
      } else if (error.code === '23503') {
        errorMessage = 'Error: No se puede eliminar porque está siendo usado en donaciones o asignaciones';
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

  const productosBajoStock = productos.filter(
    (p) => p.stock_actual <= p.stock_minimo
  );

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Header />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Gestión de Inventario</h1>
            <p className="text-slate-400">Administra los productos del sistema de ayuda social y donaciones</p>
          </div>
          <Button onClick={() => handleOpenModal()}>
            <Plus className="w-5 h-5 mr-2" />
            Nuevo Producto
          </Button>
        </div>

        {/* Alertas */}
        {productosBajoStock.length > 0 && (
          <Card className="mb-6 border-yellow-500/50">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-6 h-6 text-yellow-400" />
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Productos Bajo Stock
                </h3>
                <p className="text-slate-300">
                  {productosBajoStock.length} producto(s) necesitan reposición
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Tabla de Productos */}
        <Card title="Productos">
          <Table
            headers={[
              'Nombre',
              'Categoría',
              'Stock Actual',
              'Stock Mínimo',
              'Unidad',
              'Estado',
              'Acciones',
            ]}
          >
            {productos.map((producto) => {
              const bajoStock = producto.stock_actual <= producto.stock_minimo;
              return (
                <TableRow key={producto.producto_id}>
                  <TableCell>
                    <div>
                      <div className="font-medium text-white">{producto.nombre}</div>
                      {producto.descripcion && (
                        <div className="text-xs text-slate-400">{producto.descripcion}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {producto.categoria?.nombre || '-'}
                  </TableCell>
                  <TableCell>
                    <span className={bajoStock ? 'text-yellow-400 font-semibold' : 'text-white'}>
                      {producto.stock_actual}
                    </span>
                  </TableCell>
                  <TableCell>{producto.stock_minimo}</TableCell>
                  <TableCell>{producto.unidad_medida}</TableCell>
                  <TableCell>
                    {bajoStock ? (
                      <Badge variant="warning">Bajo Stock</Badge>
                    ) : (
                      <Badge variant="success">Disponible</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleOpenModal(producto)}
                        className="p-2 text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(producto.producto_id)}
                        className="p-2 text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </Table>
        </Card>
      </main>

      {/* Modal Producto */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingProducto(null);
        }}
        title={editingProducto ? 'Editar Producto' : 'Nuevo Producto'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Nombre *
            </label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => {
                setFormData({ ...formData, nombre: e.target.value });
                if (formErrors.nombre) {
                  const newErrors = { ...formErrors };
                  delete newErrors.nombre;
                  setFormErrors(newErrors);
                }
              }}
              className={`w-full px-4 py-3 bg-slate-800 border rounded-lg text-white focus:outline-none focus:ring-2 transition-all ${
                formErrors.nombre
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-slate-700 focus:ring-green-500'
              }`}
              required
            />
            {formErrors.nombre && (
              <p className="mt-1 text-sm text-red-400">{formErrors.nombre}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Descripción
            </label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Categoría *
              </label>
              <select
                value={formData.categoria_id}
                onChange={(e) => {
                  setFormData({ ...formData, categoria_id: e.target.value });
                  if (formErrors.categoria_id) {
                    const newErrors = { ...formErrors };
                    delete newErrors.categoria_id;
                    setFormErrors(newErrors);
                  }
                }}
                className={`w-full px-4 py-3 bg-slate-800 border rounded-lg text-white focus:outline-none focus:ring-2 transition-all ${
                  formErrors.categoria_id
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-slate-700 focus:ring-green-500'
                }`}
                required
              >
                <option value="">Seleccionar...</option>
                {categorias.map((cat) => (
                  <option key={cat.categoria_id} value={cat.categoria_id}>
                    {cat.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Unidad de Medida *
              </label>
              <select
                value={formData.unidad_medida}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    unidad_medida: e.target.value as any,
                  })
                }
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              >
                <option value="kg">Kilogramos (kg)</option>
                <option value="unidad">Unidad</option>
                <option value="litro">Litros</option>
                <option value="caja">Caja</option>
                <option value="bolsa">Bolsa</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Stock Actual *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.stock_actual}
                onChange={(e) => {
                  const value = parseFloat(e.target.value) || 0;
                  setFormData({ ...formData, stock_actual: value });
                  if (formErrors.stock_actual) {
                    const newErrors = { ...formErrors };
                    delete newErrors.stock_actual;
                    setFormErrors(newErrors);
                  }
                }}
                className={`w-full px-4 py-3 bg-slate-800 border rounded-lg text-white focus:outline-none focus:ring-2 transition-all ${
                  formErrors.stock_actual
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-slate-700 focus:ring-green-500'
                }`}
                required
              />
              {formErrors.stock_actual && (
                <p className="mt-1 text-sm text-red-400">{formErrors.stock_actual}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Stock Mínimo *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.stock_minimo}
                onChange={(e) => {
                  const value = parseFloat(e.target.value) || 0;
                  setFormData({ ...formData, stock_minimo: value });
                  if (formErrors.stock_minimo) {
                    const newErrors = { ...formErrors };
                    delete newErrors.stock_minimo;
                    setFormErrors(newErrors);
                  }
                }}
                className={`w-full px-4 py-3 bg-slate-800 border rounded-lg text-white focus:outline-none focus:ring-2 transition-all ${
                  formErrors.stock_minimo
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-slate-700 focus:ring-green-500'
                }`}
                required
              />
              <p className="mt-1 text-xs text-slate-400">
                📊 El stock mínimo es el nivel de inventario por debajo del cual el sistema mostrará alertas.
                Cuando el stock actual sea igual o menor a este valor, el producto aparecerá como "Bajo Stock"
                en el dashboard y en la página de inventario para que puedas solicitar más donaciones.
              </p>
              {formErrors.stock_minimo && (
                <p className="mt-1 text-sm text-red-400">{formErrors.stock_minimo}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end space-x-4 pt-4 border-t border-slate-700">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowModal(false);
                setEditingProducto(null);
              }}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : editingProducto ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
