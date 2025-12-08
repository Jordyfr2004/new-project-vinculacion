// Utilidades de validación completas

export const validators = {
  email: (email: string): { valid: boolean; message?: string } => {
    if (!email || email.trim().length === 0) {
      return { valid: false, message: 'El correo electrónico es requerido' };
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { valid: false, message: 'El formato del correo electrónico no es válido' };
    }
    return { valid: true };
  },

  phone: (phone: string): { valid: boolean; message?: string } => {
    if (!phone || phone.trim().length === 0) {
      return { valid: false, message: 'El teléfono es requerido' };
    }
    const cleanPhone = phone.replace(/\s/g, '').replace(/[-\+\(\)]/g, '');
    const phoneRegex = /^[0-9]{10,15}$/;
    if (!phoneRegex.test(cleanPhone)) {
      return { valid: false, message: 'El teléfono debe tener entre 10 y 15 dígitos' };
    }
    return { valid: true };
  },

  ci: (ci: string): { valid: boolean; message?: string } => {
    if (!ci || ci.trim().length === 0) {
      return { valid: false, message: 'La cédula es requerida' };
    }
    const ciRegex = /^[0-9]{7,10}$/;
    if (!ciRegex.test(ci)) {
      return { valid: false, message: 'La cédula debe tener entre 7 y 10 dígitos' };
    }
    return { valid: true };
  },

  password: (password: string): { valid: boolean; message?: string } => {
    if (!password || password.length === 0) {
      return { valid: false, message: 'La contraseña es requerida' };
    }
    if (password.length < 6) {
      return { valid: false, message: 'La contraseña debe tener al menos 6 caracteres' };
    }
    if (password.length > 100) {
      return { valid: false, message: 'La contraseña no puede tener más de 100 caracteres' };
    }
    return { valid: true };
  },

  required: (value: any, fieldName?: string): { valid: boolean; message?: string } => {
    if (typeof value === 'string') {
      if (!value || value.trim().length === 0) {
        return { valid: false, message: `${fieldName || 'Este campo'} es requerido` };
      }
    } else if (value === null || value === undefined) {
      return { valid: false, message: `${fieldName || 'Este campo'} es requerido` };
    } else if (typeof value === 'number' && (isNaN(value) || value === 0)) {
      return { valid: false, message: `${fieldName || 'Este campo'} es requerido` };
    }
    return { valid: true };
  },

  positiveNumber: (value: number, fieldName?: string): { valid: boolean; message?: string } => {
    if (value === null || value === undefined || isNaN(value)) {
      return { valid: false, message: `${fieldName || 'Este campo'} debe ser un número válido` };
    }
    if (value <= 0) {
      return { valid: false, message: `${fieldName || 'Este campo'} debe ser mayor a 0` };
    }
    if (value > 1000000) {
      return { valid: false, message: `${fieldName || 'Este campo'} no puede ser mayor a 1,000,000` };
    }
    return { valid: true };
  },

  futureDate: (date: string, allowToday: boolean = false): { valid: boolean; message?: string } => {
    if (!date) {
      return { valid: true }; // Fecha opcional
    }
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);
    
    if (isNaN(selectedDate.getTime())) {
      return { valid: false, message: 'La fecha no es válida' };
    }
    
    if (!allowToday && selectedDate < today) {
      return { valid: false, message: 'La fecha no puede ser anterior a hoy' };
    }
    
    if (allowToday && selectedDate < today) {
      return { valid: false, message: 'La fecha no puede ser anterior a hoy' };
    }
    
    return { valid: true };
  },

  textLength: (text: string, min: number, max: number, fieldName?: string): { valid: boolean; message?: string } => {
    if (!text) {
      return { valid: true }; // Opcional
    }
    if (text.length < min) {
      return { valid: false, message: `${fieldName || 'Este campo'} debe tener al menos ${min} caracteres` };
    }
    if (text.length > max) {
      return { valid: false, message: `${fieldName || 'Este campo'} no puede tener más de ${max} caracteres` };
    }
    return { valid: true };
  },

  selectOption: (value: string, options: string[]): { valid: boolean; message?: string } => {
    if (!value || value.trim().length === 0) {
      return { valid: false, message: 'Debes seleccionar una opción' };
    }
    if (!options.includes(value)) {
      return { valid: false, message: 'La opción seleccionada no es válida' };
    }
    return { valid: true };
  },
};

export const validateForm = (fields: Record<string, any>, rules: Record<string, any>): {
  valid: boolean;
  errors: Record<string, string>;
} => {
  const errors: Record<string, string> = {};

  for (const [field, value] of Object.entries(fields)) {
    const fieldRules = rules[field];
    if (!fieldRules) continue;

    // Required validation
    if (fieldRules.required && !validators.required(value)) {
      errors[field] = fieldRules.requiredMessage || `${field} es requerido`;
      continue;
    }

    // Skip other validations if field is empty and not required
    if (!value && !fieldRules.required) continue;

    // Email validation
    if (fieldRules.email && !validators.email(value)) {
      errors[field] = fieldRules.emailMessage || 'Email inválido';
      continue;
    }

    // Phone validation
    if (fieldRules.phone && !validators.phone(value)) {
      errors[field] = fieldRules.phoneMessage || 'Teléfono inválido';
      continue;
    }

    // CI validation
    if (fieldRules.ci && !validators.ci(value)) {
      errors[field] = fieldRules.ciMessage || 'Cédula inválida';
      continue;
    }

    // Password validation
    if (fieldRules.password) {
      const passwordResult = validators.password(value);
      if (!passwordResult.valid) {
        errors[field] = passwordResult.message || 'Contraseña inválida';
        continue;
      }
    }

    // Positive number validation
    if (fieldRules.positiveNumber && !validators.positiveNumber(value)) {
      errors[field] = fieldRules.positiveNumberMessage || 'Debe ser un número positivo';
      continue;
    }

    // Future date validation
    if (fieldRules.futureDate && !validators.futureDate(value)) {
      errors[field] = fieldRules.futureDateMessage || 'La fecha debe ser futura';
      continue;
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};
