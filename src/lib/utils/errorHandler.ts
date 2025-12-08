// Manejo centralizado de errores

export interface AppError {
  code?: string;
  message: string;
  userMessage: string;
}

export const handleError = (error: any): AppError => {
  // Si ya es un AppError, retornarlo
  if (error.userMessage) {
    return error;
  }

  // Errores de Supabase
  if (error.code) {
    switch (error.code) {
      case '23505': // Unique violation
        return {
          code: error.code,
          message: error.message,
          userMessage: 'Ya existe un registro con estos datos',
        };
      case '23503': // Foreign key violation
        return {
          code: error.code,
          message: error.message,
          userMessage: 'No se puede realizar esta acción porque está relacionado con otros datos',
        };
      case '23502': // Not null violation
        return {
          code: error.code,
          message: error.message,
          userMessage: 'Faltan datos requeridos',
        };
      case 'PGRST116': // Connection error
        return {
          code: error.code,
          message: error.message,
          userMessage: 'Error de conexión. Por favor, intenta nuevamente',
        };
      case '42501': // Insufficient privilege
        return {
          code: error.code,
          message: error.message,
          userMessage: 'No tienes permisos para realizar esta acción',
        };
      default:
        return {
          code: error.code,
          message: error.message,
          userMessage: error.message || 'Ocurrió un error inesperado',
        };
    }
  }

  // Errores de autenticación
  if (error.message) {
    if (error.message.includes('Invalid login credentials')) {
      return {
        message: error.message,
        userMessage: 'Credenciales incorrectas. Verifica tu correo o contraseña',
      };
    }
    if (error.message.includes('already registered')) {
      return {
        message: error.message,
        userMessage: 'Este correo electrónico ya está registrado',
      };
    }
    if (error.message.includes('Email rate limit exceeded')) {
      return {
        message: error.message,
        userMessage: 'Demasiados intentos. Por favor, espera unos minutos',
      };
    }
  }

  // Error genérico
  return {
    message: error.message || 'Error desconocido',
    userMessage: error.message || 'Ocurrió un error inesperado. Por favor, intenta nuevamente',
  };
};

export const showError = (error: any): string => {
  const appError = handleError(error);
  return appError.userMessage;
};
