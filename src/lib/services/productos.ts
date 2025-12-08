import { supabase } from '@/lib/supabase/client';
import type { Producto, Categoria, Lote } from '@/types';

export const productosService = {
  // Categorías
  async getCategorias(): Promise<Categoria[]> {
    const { data, error } = await supabase
      .from('categorias')
      .select('*')
      .order('nombre');
    
    if (error) throw error;
    return data || [];
  },

  async createCategoria(categoria: Omit<Categoria, 'categoria_id' | 'created_at' | 'updated_at'>): Promise<Categoria> {
    const { data, error } = await supabase
      .from('categorias')
      .insert([categoria])
      .select()
      .maybeSingle();
    
    if (error) throw error;
    if (!data) throw new Error('No se pudo crear la categoría');
    return data;
  },

  // Productos
  async getProductos(): Promise<Producto[]> {
    const { data, error } = await supabase
      .from('productos')
      .select(`
        *,
        categoria:categorias(*)
      `)
      .order('nombre');
    
    if (error) throw error;
    return data || [];
  },

  async getProducto(id: string): Promise<Producto | null> {
    const { data, error } = await supabase
      .from('productos')
      .select(`
        *,
        categoria:categorias(*)
      `)
      .eq('producto_id', id)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async createProducto(producto: Omit<Producto, 'producto_id' | 'created_at' | 'updated_at'>): Promise<Producto> {
    // Validaciones
    if (!producto.nombre || producto.nombre.trim().length < 2) {
      throw new Error('El nombre del producto debe tener al menos 2 caracteres');
    }

    if (!producto.categoria_id) {
      throw new Error('Debes seleccionar una categoría');
    }

    if (producto.stock_actual < 0) {
      throw new Error('El stock actual no puede ser negativo');
    }

    if (producto.stock_minimo < 0) {
      throw new Error('El stock mínimo no puede ser negativo');
    }

    const unidadesValidas = ['kg', 'unidad', 'litro', 'caja', 'bolsa'];
    if (!unidadesValidas.includes(producto.unidad_medida)) {
      throw new Error('La unidad de medida no es válida');
    }

    const { data, error } = await supabase
      .from('productos')
      .insert([producto])
      .select(`
        *,
        categoria:categorias(*)
      `)
      .maybeSingle();
    
    if (error) throw error;
    if (!data) throw new Error('No se pudo crear el producto');
    return data;
  },

  async updateProducto(id: string, producto: Partial<Producto>): Promise<Producto> {
    // Validaciones
    if (producto.nombre !== undefined && producto.nombre.trim().length < 2) {
      throw new Error('El nombre del producto debe tener al menos 2 caracteres');
    }

    if (producto.stock_actual !== undefined && producto.stock_actual < 0) {
      throw new Error('El stock actual no puede ser negativo');
    }

    if (producto.stock_minimo !== undefined && producto.stock_minimo < 0) {
      throw new Error('El stock mínimo no puede ser negativo');
    }

    if (producto.unidad_medida !== undefined) {
      const unidadesValidas = ['kg', 'unidad', 'litro', 'caja', 'bolsa'];
      if (!unidadesValidas.includes(producto.unidad_medida)) {
        throw new Error('La unidad de medida no es válida');
      }
    }

    const { data, error } = await supabase
      .from('productos')
      .update(producto)
      .eq('producto_id', id)
      .select(`
        *,
        categoria:categorias(*)
      `)
      .maybeSingle();
    
    if (error) throw error;
    if (!data) throw new Error('No se pudo actualizar el producto');
    return data;
  },

  async deleteProducto(id: string): Promise<void> {
    const { error } = await supabase
      .from('productos')
      .delete()
      .eq('producto_id', id);
    
    if (error) throw error;
  },

  async getProductosBajoStock(): Promise<Producto[]> {
    try {
      // Primero obtener todos los productos
      const { data: productos, error } = await supabase
        .from('productos')
        .select(`
          *,
          categoria:categorias(*)
        `)
        .order('stock_actual');
      
      if (error) throw error;
      
      // Filtrar productos donde stock_actual <= stock_minimo
      const productosBajoStock = productos?.filter(p => 
        Number(p.stock_actual) <= Number(p.stock_minimo)
      ) || [];
      
      return productosBajoStock;
    } catch (error) {
      console.warn('Error en getProductosBajoStock:', error);
      return [];
    }
  },

  // Lotes
  async getLotes(productoId?: string): Promise<Lote[]> {
    let query = supabase
      .from('lotes')
      .select(`
        *,
        producto:productos(*)
      `)
      .order('fecha_vencimiento', { ascending: true });

    if (productoId) {
      query = query.eq('producto_id', productoId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async getLotesPorVencer(dias: number = 7): Promise<Lote[]> {
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() + dias);

    const { data, error } = await supabase
      .from('lotes')
      .select(`
        *,
        producto:productos(*)
      `)
      .eq('estado', 'disponible')
      .lte('fecha_vencimiento', fechaLimite.toISOString().split('T')[0])
      .order('fecha_vencimiento', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  async createLote(lote: Omit<Lote, 'lote_id' | 'fecha_ingreso'>): Promise<Lote> {
    const { data, error } = await supabase
      .from('lotes')
      .insert([lote])
      .select(`
        *,
        producto:productos(*)
      `)
      .maybeSingle();
    
    if (error) throw error;
    if (!data) throw new Error('No se pudo crear el lote');
    return data;
  },
};
