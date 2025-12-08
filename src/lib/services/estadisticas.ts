import { supabase } from '@/lib/supabase/client';
import type { Estadisticas, DashboardData, Donacion, Solicitud, Producto, Lote } from '@/types';
import { productosService } from './productos';
import { donacionesService } from './donaciones';
import { solicitudesService } from './solicitudes';

export const estadisticasService = {
  async getEstadisticas(): Promise<Estadisticas> {
    try {
      // Contar donantes
      const { count: totalDonantes, error: errorDonantes } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('rol', 'donante');
      if (errorDonantes) console.warn('Error contando donantes:', errorDonantes);

      // Contar receptores
      const { count: totalReceptores, error: errorReceptores } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('rol', 'receptor');
      if (errorReceptores) console.warn('Error contando receptores:', errorReceptores);

      // Contar donaciones
      const { count: totalDonaciones, error: errorDonaciones } = await supabase
        .from('donaciones')
        .select('*', { count: 'exact', head: true });
      if (errorDonaciones) console.warn('Error contando donaciones:', errorDonaciones);

      // Contar solicitudes
      const { count: totalSolicitudes, error: errorSolicitudes } = await supabase
        .from('solicitudes')
        .select('*', { count: 'exact', head: true });
      if (errorSolicitudes) console.warn('Error contando solicitudes:', errorSolicitudes);

      // Contar asignaciones
      const { count: totalAsignaciones, error: errorAsignaciones } = await supabase
        .from('asignaciones')
        .select('*', { count: 'exact', head: true });
      if (errorAsignaciones) console.warn('Error contando asignaciones:', errorAsignaciones);

      // Calcular stock total
      const { data: productos, error: errorProductos } = await supabase
        .from('productos')
        .select('stock_actual');
      if (errorProductos) console.warn('Error obteniendo productos:', errorProductos);

      const stockTotal = productos?.reduce((sum, p) => sum + (Number(p.stock_actual) || 0), 0) || 0;

      // Productos bajo stock
      let productosBajoStock: Producto[] = [];
      try {
        productosBajoStock = await productosService.getProductosBajoStock();
      } catch (error) {
        console.warn('Error obteniendo productos bajo stock:', error);
      }

      // Productos por vencer (próximos 7 días)
      let lotesPorVencer: Lote[] = [];
      try {
        lotesPorVencer = await productosService.getLotesPorVencer(7);
      } catch (error) {
        console.warn('Error obteniendo lotes por vencer:', error);
      }

      return {
        total_donantes: totalDonantes || 0,
        total_receptores: totalReceptores || 0,
        total_donaciones: totalDonaciones || 0,
        total_solicitudes: totalSolicitudes || 0,
        total_asignaciones: totalAsignaciones || 0,
        stock_total: stockTotal,
        productos_bajo_stock: productosBajoStock.length,
        productos_por_vencer: lotesPorVencer.length,
      };
    } catch (error) {
      console.error('Error en getEstadisticas:', error);
      // Retornar valores por defecto en caso de error
      return {
        total_donantes: 0,
        total_receptores: 0,
        total_donaciones: 0,
        total_solicitudes: 0,
        total_asignaciones: 0,
        stock_total: 0,
        productos_bajo_stock: 0,
        productos_por_vencer: 0,
      };
    }
  },

  async getDashboardData(): Promise<DashboardData> {
    const estadisticas = await this.getEstadisticas();
    
    // Donaciones recientes (últimas 5)
    let donacionesRecientes: Donacion[] = [];
    try {
      donacionesRecientes = await donacionesService.getDonaciones();
    } catch (error) {
      console.warn('Error obteniendo donaciones:', error);
    }
    const donacionesLimitadas = donacionesRecientes.slice(0, 5);

    // Solicitudes pendientes
    let solicitudesPendientes: Solicitud[] = [];
    try {
      solicitudesPendientes = await solicitudesService.getSolicitudesPorEstado('pendiente');
    } catch (error) {
      console.warn('Error obteniendo solicitudes:', error);
    }

    // Productos bajo stock
    let productosBajoStock: Producto[] = [];
    try {
      productosBajoStock = await productosService.getProductosBajoStock();
    } catch (error) {
      console.warn('Error obteniendo productos bajo stock:', error);
    }

    // Lotes por vencer
    let lotesPorVencer: Lote[] = [];
    try {
      lotesPorVencer = await productosService.getLotesPorVencer(7);
    } catch (error) {
      console.warn('Error obteniendo lotes por vencer:', error);
    }

    return {
      estadisticas,
      donaciones_recientes: donacionesLimitadas,
      solicitudes_pendientes: solicitudesPendientes,
      productos_bajo_stock: productosBajoStock,
      lotes_por_vencer: lotesPorVencer,
    };
  },
};
