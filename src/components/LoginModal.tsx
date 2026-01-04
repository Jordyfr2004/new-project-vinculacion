'use client';

import { useState, useEffect, FormEvent } from 'react';
import { X, Mail, Lock, User, Phone, CreditCard } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'login' | 'register';
  initialUserType?: 'receptor' | 'donante';
}

export default function LoginModal({ isOpen, onClose, mode, initialUserType }: LoginModalProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [currentMode, setCurrentMode] = useState<'login' | 'register'>(mode);
  const [selectedUserType, setSelectedUserType] = useState<'receptor' | 'donante'>(initialUserType || 'receptor');
  const [registerErrors, setRegisterErrors] = useState<Record<string, string>>({});

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register state
  const [registerData, setRegisterData] = useState({
    nombres: '',
    apellidos: '',
    email: '',
    password: '',
    telefono: '',
    ci: '',
    tipo_donante: 'individual',
  });

  // Reset form when modal opens and block body scroll
  useEffect(() => {
    if (isOpen) {
      // Bloquear scroll del body
      document.body.style.overflow = 'hidden';
      
      setCurrentMode(mode);
      if (initialUserType) {
        setSelectedUserType(initialUserType);
      }
      setMessage(null);
      setLoginEmail('');
      setLoginPassword('');
      setRegisterData({
        nombres: '',
        apellidos: '',
        email: '',
        password: '',
        telefono: '',
        ci: '',
        tipo_donante: 'individual',
      });
    } else {
      // Restaurar scroll del body
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup al desmontar
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, mode, initialUserType]);

  if (!isOpen) return null;

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const { data: sessionData, error: loginError } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (loginError) {
        setMessage({ text: loginError.message || 'Error al iniciar sesión', type: 'error' });
        setIsLoading(false);
        return;
      }

      if (!sessionData.user) {
        throw new Error('No se pudo obtener el usuario autenticado.');
      }

      // Obtener el rol del usuario - manejar caso donde no existe en users
      const { data: userData, error: rolError } = await supabase
        .from('users')
        .select('rol')
        .eq('id', sessionData.user.id)
        .maybeSingle();

      if (rolError) {
        console.error('Error obteniendo rol:', rolError);
        throw new Error('Error al obtener información del usuario. Por favor, contacta al administrador.');
      }

      if (!userData) {
        throw new Error('Usuario no encontrado en el sistema. Por favor, contacta al administrador.');
      }

      // Redirect based on role
      if (userData.rol === 'admin') {
        router.push('/admin');
      } else if (userData.rol === 'donante') {
        router.push('/donantes');
      } else if (userData.rol === 'receptor') {
        router.push('/receptores');
      } else {
        throw new Error('Rol de usuario no válido.');
      }

      onClose();
    } catch (err: any) {
      console.error(err);
      const { showError } = await import('@/lib/utils/errorHandler');
      setMessage({ text: showError(err), type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      setRegisterErrors({});
      
      // Validar datos antes de enviar
      const { validateRegistro } = await import('@/lib/utils/formValidation');
      const validation = validateRegistro({
        nombres: registerData.nombres,
        apellidos: registerData.apellidos,
        email: registerData.email,
        password: registerData.password,
        telefono: registerData.telefono,
        ci: selectedUserType === 'receptor' ? registerData.ci : undefined,
        tipo_donante: selectedUserType === 'donante' ? registerData.tipo_donante : undefined,
      });

      if (!validation.valid) {
        // Mapear errores a campos específicos
        const fieldErrors: Record<string, string> = {};
        validation.errors.forEach((error) => {
          if (error.includes('Nombres')) fieldErrors.nombres = error;
          else if (error.includes('Apellidos')) fieldErrors.apellidos = error;
          else if (error.includes('correo') || error.includes('Email')) fieldErrors.email = error;
          else if (error.includes('contraseña') || error.includes('Contraseña')) fieldErrors.password = error;
          else if (error.includes('teléfono') || error.includes('Teléfono')) fieldErrors.telefono = error;
          else if (error.includes('cédula') || error.includes('Cédula')) fieldErrors.ci = error;
        });
        
        setRegisterErrors(fieldErrors);
        setMessage({ 
          text: validation.errors.join('. '), 
          type: 'error' 
        });
        setIsLoading(false);
        return;
      }

      // Call API to register user (handles both auth.users and public.users)
      const registerResponse = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: registerData.email.trim(),
          password: registerData.password,
          nombres: registerData.nombres.trim(),
          apellidos: registerData.apellidos.trim(),
          telefono: registerData.telefono.replace(/\s/g, ''),
          rol: selectedUserType,
          ci: selectedUserType === 'receptor' ? registerData.ci.trim() : undefined,
          tipo_donante: selectedUserType === 'donante' ? registerData.tipo_donante : undefined,
        }),
      });

      const registerResult = await registerResponse.json();

      if (!registerResponse.ok) {
        throw new Error(registerResult.error || 'Error al registrar usuario');
      }

      setMessage({ text: 'Usuario registrado correctamente. Por favor, inicia sesión.', type: 'success' });
      
      // Reset form
      setRegisterData({
        nombres: '',
        apellidos: '',
        email: '',
        password: '',
        telefono: '',
        ci: '',
        tipo_donante: 'individual',
      });
      setRegisterErrors({});

      // Switch to login after 2 seconds
      setTimeout(() => {
        setCurrentMode('login');
        setMessage(null);
      }, 2000);
    } catch (err: any) {
      console.error(err);
      const { showError } = await import('@/lib/utils/errorHandler');
      setMessage({ text: showError(err), type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-hide">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">
            {currentMode === 'login' ? 'Iniciar Sesión' : 'Registro'}
          </h2>

          {/* Toggle between login and register */}
          <div className="flex items-center justify-center mb-4 sm:mb-6 bg-slate-800 rounded-lg p-1">
            <button
              type="button"
              onClick={() => {
                setCurrentMode('login');
                setMessage(null);
              }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                currentMode === 'login'
                  ? 'bg-green-500 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => {
                setCurrentMode('register');
                setMessage(null);
              }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                currentMode === 'register'
                  ? 'bg-green-500 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Registrarse
            </button>
          </div>

          {currentMode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="ejemplo@correo.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              {message && (
                <div
                  className={`p-3 rounded-lg ${
                    message.type === 'error' ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'
                  }`}
                >
                  {message.text}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-lg text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </button>

              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => setCurrentMode('register')}
                  className="text-sm text-green-400 hover:text-green-300 transition-colors"
                >
                  ¿No tienes cuenta? Regístrate aquí
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3 sm:space-y-4">
              {/* User Type Selector */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2 sm:mb-3">
                  ¿Qué quieres ser?
                </label>
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedUserType('receptor')}
                    className={`p-3 sm:p-4 rounded-lg border-2 transition-all ${
                      selectedUserType === 'receptor'
                        ? 'border-green-500 bg-green-500/10 text-white'
                        : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-base sm:text-lg font-semibold mb-1">Receptor</div>
                      <div className="text-xs">Recibir ayuda</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedUserType('donante')}
                    className={`p-3 sm:p-4 rounded-lg border-2 transition-all ${
                      selectedUserType === 'donante'
                        ? 'border-green-500 bg-green-500/10 text-white'
                        : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-base sm:text-lg font-semibold mb-1">Donante</div>
                      <div className="text-xs">Ayudar a otros</div>
                    </div>
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Nombres
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      value={registerData.nombres}
                      onChange={(e) => {
                        setRegisterData({ ...registerData, nombres: e.target.value });
                        if (registerErrors.nombres) {
                          const newErrors = { ...registerErrors };
                          delete newErrors.nombres;
                          setRegisterErrors(newErrors);
                        }
                      }}
                      className={`w-full pl-10 pr-4 py-2.5 sm:py-3 bg-slate-800 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all text-sm sm:text-base ${
                        registerErrors.nombres
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-slate-700 focus:ring-green-500'
                      }`}
                      placeholder="Juan"
                      required
                    />
                    {registerErrors.nombres && (
                      <p className="mt-1 text-xs text-red-400">{registerErrors.nombres}</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Apellidos
                  </label>
                    <input
                      type="text"
                      value={registerData.apellidos}
                      onChange={(e) => {
                        setRegisterData({ ...registerData, apellidos: e.target.value });
                        if (registerErrors.apellidos) {
                          const newErrors = { ...registerErrors };
                          delete newErrors.apellidos;
                          setRegisterErrors(newErrors);
                        }
                      }}
                      className={`w-full px-4 py-2.5 sm:py-3 bg-slate-800 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all text-sm sm:text-base ${
                        registerErrors.apellidos
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-slate-700 focus:ring-green-500'
                      }`}
                      placeholder="Pérez"
                      required
                    />
                    {registerErrors.apellidos && (
                      <p className="mt-1 text-xs text-red-400">{registerErrors.apellidos}</p>
                    )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="email"
                      value={registerData.email}
                      onChange={(e) => {
                        setRegisterData({ ...registerData, email: e.target.value });
                        if (registerErrors.email) {
                          const newErrors = { ...registerErrors };
                          delete newErrors.email;
                          setRegisterErrors(newErrors);
                        }
                      }}
                      className={`w-full pl-10 pr-4 py-2.5 sm:py-3 bg-slate-800 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all text-sm sm:text-base ${
                        registerErrors.email
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-slate-700 focus:ring-green-500'
                      }`}
                      placeholder="ejemplo@correo.com"
                      required
                    />
                    {registerErrors.email && (
                      <p className="mt-1 text-xs text-red-400">{registerErrors.email}</p>
                    )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Teléfono
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="tel"
                      value={registerData.telefono}
                      onChange={(e) => {
                        setRegisterData({ ...registerData, telefono: e.target.value });
                        if (registerErrors.telefono) {
                          const newErrors = { ...registerErrors };
                          delete newErrors.telefono;
                          setRegisterErrors(newErrors);
                        }
                      }}
                      className={`w-full pl-10 pr-4 py-2.5 sm:py-3 bg-slate-800 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all text-sm sm:text-base ${
                        registerErrors.telefono
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-slate-700 focus:ring-green-500'
                      }`}
                      placeholder="1234567890"
                      required
                    />
                    {registerErrors.telefono && (
                      <p className="mt-1 text-xs text-red-400">{registerErrors.telefono}</p>
                    )}
                  </div>
                </div>
                {selectedUserType === 'receptor' ? (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Cédula
                    </label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        value={registerData.ci}
                        onChange={(e) => {
                          setRegisterData({ ...registerData, ci: e.target.value });
                          if (registerErrors.ci) {
                            const newErrors = { ...registerErrors };
                            delete newErrors.ci;
                            setRegisterErrors(newErrors);
                          }
                        }}
                        className={`w-full pl-10 pr-4 py-2.5 sm:py-3 bg-slate-800 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all text-sm sm:text-base ${
                          registerErrors.ci
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-slate-700 focus:ring-green-500'
                        }`}
                        placeholder="12345678"
                        required
                      />
                      {registerErrors.ci && (
                        <p className="mt-1 text-xs text-red-400">{registerErrors.ci}</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Tipo de Donante
                    </label>
                    <select
                      value={registerData.tipo_donante}
                      onChange={(e) => setRegisterData({ ...registerData, tipo_donante: e.target.value })}
                      className="w-full px-4 py-2.5 sm:py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                      required
                    >
                      <option value="individual">Individual</option>
                      <option value="empresa">Empresa</option>
                      <option value="organizacion">Organización</option>
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="password"
                      value={registerData.password}
                      onChange={(e) => {
                        setRegisterData({ ...registerData, password: e.target.value });
                        if (registerErrors.password) {
                          const newErrors = { ...registerErrors };
                          delete newErrors.password;
                          setRegisterErrors(newErrors);
                        }
                      }}
                      className={`w-full pl-10 pr-4 py-2.5 sm:py-3 bg-slate-800 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all text-sm sm:text-base ${
                        registerErrors.password
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-slate-700 focus:ring-green-500'
                      }`}
                      placeholder="Mínimo 6 caracteres"
                      required
                      minLength={6}
                    />
                    {registerErrors.password && (
                      <p className="mt-1 text-xs text-red-400">{registerErrors.password}</p>
                    )}
                    {!registerErrors.password && registerData.password && (
                      <p className="mt-1 text-xs text-slate-400">
                        {registerData.password.length < 6
                          ? `Faltan ${6 - registerData.password.length} caracteres`
                          : '✓ Contraseña válida'}
                      </p>
                    )}
                </div>
              </div>

              {message && (
                <div
                  className={`p-2.5 sm:p-3 rounded-lg text-sm ${
                    message.type === 'error' ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'
                  }`}
                >
                  {message.text}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-lg text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                {isLoading ? 'Registrando...' : 'Registrarse'}
              </button>

              <div className="text-center mt-3 sm:mt-4">
                <button
                  type="button"
                  onClick={() => setCurrentMode('login')}
                  className="text-sm text-green-400 hover:text-green-300 transition-colors"
                >
                  ¿Ya tienes cuenta? Inicia sesión aquí
                </button>
              </div>
            </form>
          )}

          <div className="mt-4 sm:mt-6 text-center">
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white text-sm transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
