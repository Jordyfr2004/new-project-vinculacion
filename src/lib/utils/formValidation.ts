// Validaciones específicas para formularios del sistema

import { validators } from './validation';

export const validateDonacion = (donacion: {
  observaciones?: string;
  detalles: Array<{
    producto_id: string;
    cantidad: number;
    unidad_medida: string;
    fecha_vencimiento?: string;
    observaciones?: string;
  }>;
}): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Validar que haya al menos un producto
  if (!donacion.detalles || donacion.detalles.length === 0) {
    errors.push('Debes agregar al menos un producto a la donación');
    return { valid: false, errors };
  }

  // Validar cada detalle
  donacion.detalles.forEach((detalle, index) => {
    const num = index + 1;

    // Validar producto
    if (!detalle.producto_id || detalle.producto_id.trim() === '') {
      errors.push(`Producto ${num}: Debes seleccionar un producto`);
    }

    // Validar cantidad
    const cantidadValidation = validators.positiveNumber(detalle.cantidad, `Producto ${num} - Cantidad`);
    if (!cantidadValidation.valid) {
      errors.push(`Producto ${num}: ${cantidadValidation.message}`);
    }

    // Validar unidad de medida
    const unidadesValidas = ['kg', 'unidad', 'litro', 'caja', 'bolsa'];
    const unidadValidation = validators.selectOption(detalle.unidad_medida, unidadesValidas);
    if (!unidadValidation.valid) {
      errors.push(`Producto ${num}: ${unidadValidation.message}`);
    }

    // Validar fecha de vencimiento si se proporciona
    if (detalle.fecha_vencimiento) {
      const fechaValidation = validators.futureDate(detalle.fecha_vencimiento, true);
      if (!fechaValidation.valid) {
        errors.push(`Producto ${num}: ${fechaValidation.message}`);
      }
    }

    // Validar observaciones (opcional pero con límite)
    if (detalle.observaciones) {
      const obsValidation = validators.textLength(detalle.observaciones, 0, 500, `Producto ${num} - Observaciones`);
      if (!obsValidation.valid) {
        errors.push(`Producto ${num}: ${obsValidation.message}`);
      }
    }
  });

  // Validar observaciones generales
  if (donacion.observaciones) {
    const obsValidation = validators.textLength(donacion.observaciones, 0, 1000, 'Observaciones');
    if (!obsValidation.valid) {
      errors.push(obsValidation.message || '');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

export const validateSolicitud = (solicitud: {
  motivo: string;
  prioridad: string;
  observaciones?: string;
  detalles: Array<{
    producto_id: string;
    cantidad_solicitada: number;
    unidad_medida: string;
  }>;
}): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Validar motivo (opcional en el schema, pero validamos si se proporciona)
  if (solicitud.motivo && solicitud.motivo.trim().length > 0) {
    const motivoLength = validators.textLength(solicitud.motivo, 10, 500, 'Motivo');
    if (!motivoLength.valid) {
      errors.push(motivoLength.message || '');
    }
  }

  // Validar prioridad
  const prioridadesValidas = ['baja', 'normal', 'alta', 'urgente'];
  const prioridadValidation = validators.selectOption(solicitud.prioridad, prioridadesValidas);
  if (!prioridadValidation.valid) {
    errors.push(prioridadValidation.message || '');
  }

  // Validar que haya al menos un producto
  if (!solicitud.detalles || solicitud.detalles.length === 0) {
    errors.push('Debes agregar al menos un producto a la solicitud');
    return { valid: false, errors };
  }

  // Validar cada detalle
  solicitud.detalles.forEach((detalle, index) => {
    const num = index + 1;

    // Validar producto
    if (!detalle.producto_id || detalle.producto_id.trim() === '') {
      errors.push(`Producto ${num}: Debes seleccionar un producto`);
    }

    // Validar cantidad
    const cantidadValidation = validators.positiveNumber(detalle.cantidad_solicitada, `Producto ${num} - Cantidad`);
    if (!cantidadValidation.valid) {
      errors.push(`Producto ${num}: ${cantidadValidation.message}`);
    }

    // Validar unidad de medida
    const unidadesValidas = ['kg', 'unidad', 'litro', 'caja', 'bolsa'];
    const unidadValidation = validators.selectOption(detalle.unidad_medida, unidadesValidas);
    if (!unidadValidation.valid) {
      errors.push(`Producto ${num}: ${unidadValidation.message}`);
    }
  });

  // Validar observaciones
  if (solicitud.observaciones) {
    const obsValidation = validators.textLength(solicitud.observaciones, 0, 1000, 'Observaciones');
    if (!obsValidation.valid) {
      errors.push(obsValidation.message || '');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

export const validateProducto = (producto: {
  nombre: string;
  descripcion?: string;
  categoria_id: string;
  unidad_medida: string;
  stock_actual: number;
  stock_minimo: number;
}): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Validar nombre
  const nombreValidation = validators.required(producto.nombre, 'Nombre');
  if (!nombreValidation.valid) {
    errors.push(nombreValidation.message || '');
  } else {
    const nombreLength = validators.textLength(producto.nombre, 2, 100, 'Nombre');
    if (!nombreLength.valid) {
      errors.push(nombreLength.message || '');
    }
  }

  // Validar descripción
  if (producto.descripcion) {
    const descLength = validators.textLength(producto.descripcion, 0, 500, 'Descripción');
    if (!descLength.valid) {
      errors.push(descLength.message || '');
    }
  }

  // Validar categoría
  const categoriaValidation = validators.required(producto.categoria_id, 'Categoría');
  if (!categoriaValidation.valid) {
    errors.push(categoriaValidation.message || '');
  }

  // Validar unidad de medida
  const unidadesValidas = ['kg', 'unidad', 'litro', 'caja', 'bolsa'];
  const unidadValidation = validators.selectOption(producto.unidad_medida, unidadesValidas);
  if (!unidadValidation.valid) {
    errors.push(unidadValidation.message || '');
  }

  // Validar stock actual
  const stockActualValidation = validators.positiveNumber(producto.stock_actual, 'Stock Actual');
  if (!stockActualValidation.valid && producto.stock_actual !== 0) {
    errors.push(stockActualValidation.message || '');
  }

  // Validar stock mínimo
  const stockMinimoValidation = validators.positiveNumber(producto.stock_minimo, 'Stock Mínimo');
  if (!stockMinimoValidation.valid) {
    errors.push(stockMinimoValidation.message || '');
  }

  // Validar que stock mínimo no sea mayor que stock actual (solo advertencia, no error)
  if (producto.stock_minimo > producto.stock_actual && producto.stock_actual > 0) {
    // Esto es solo una advertencia, no un error bloqueante
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

export const validateRegistro = (data: {
  nombres: string;
  apellidos: string;
  email: string;
  password: string;
  telefono: string;
  ci?: string;
  tipo_donante?: string;
}): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Validar nombres
  const nombresValidation = validators.required(data.nombres, 'Nombres');
  if (!nombresValidation.valid) {
    errors.push(nombresValidation.message || '');
  } else {
    const nombresLength = validators.textLength(data.nombres, 2, 50, 'Nombres');
    if (!nombresLength.valid) {
      errors.push(nombresLength.message || '');
    }
  }

  // Validar apellidos
  const apellidosValidation = validators.required(data.apellidos, 'Apellidos');
  if (!apellidosValidation.valid) {
    errors.push(apellidosValidation.message || '');
  } else {
    const apellidosLength = validators.textLength(data.apellidos, 2, 50, 'Apellidos');
    if (!apellidosLength.valid) {
      errors.push(apellidosLength.message || '');
    }
  }

  // Validar email
  const emailValidation = validators.email(data.email);
  if (!emailValidation.valid) {
    errors.push(emailValidation.message || '');
  }

  // Validar password
  const passwordValidation = validators.password(data.password);
  if (!passwordValidation.valid) {
    errors.push(passwordValidation.message || '');
  }

  // Validar teléfono
  const phoneValidation = validators.phone(data.telefono);
  if (!phoneValidation.valid) {
    errors.push(phoneValidation.message || '');
  }

  // Validar CI (si es receptor)
  if (data.ci !== undefined) {
    const ciValidation = validators.ci(data.ci);
    if (!ciValidation.valid) {
      errors.push(ciValidation.message || '');
    }
  }

  // Validar tipo donante (si es donante)
  if (data.tipo_donante !== undefined) {
    const tiposValidos = ['individual', 'empresa', 'organizacion'];
    const tipoValidation = validators.selectOption(data.tipo_donante, tiposValidos);
    if (!tipoValidation.valid) {
      errors.push(tipoValidation.message || '');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};
