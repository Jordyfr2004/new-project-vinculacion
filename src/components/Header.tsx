'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Heart, Menu, X, LogOut, User, LogIn, Package, ShoppingCart, FileText, Settings, Calendar } from 'lucide-react';
import NotificationBell from './NotificationBell';
import NotificationCenter from './NotificationCenter';

interface HeaderProps {
  onLoginClick?: () => void;
  onRegisterClick?: (userType?: 'receptor' | 'donante') => void;
}

export default function Header({ onLoginClick, onRegisterClick }: HeaderProps) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    checkUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkUser();
    });
    return () => subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user ?? null;
      if (user) {
        setIsLoggedIn(true);
        const { data } = await supabase
          .from('users')
          .select('rol')
          .eq('id', user.id)
          .maybeSingle();
        if (data) {
          setUserRole(data.rol);
        } else {
          setIsLoggedIn(false);
          setUserRole(null);
        }
      } else {
        setIsLoggedIn(false);
        setUserRole(null);
      }
    } catch (error) {
      console.error('Error checking user:', error);
      setIsLoggedIn(false);
      setUserRole(null);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setUserRole(null);
    router.push('/');
  };

  const getDashboardPath = () => {
    if (userRole === 'admin') return '/admin';
    if (userRole === 'donante') return '/donantes';
    if (userRole === 'receptor') return '/receptores';
    return '/public';
  };

  return (
    <>
    <header className="sticky top-0 z-50 w-full bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg group-hover:scale-110 transition-transform">
              <Heart className="w-5 h-5 text-white" fill="currentColor" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
              Sistema de Ayuda Social y Donaciones
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {isLoggedIn ? (
              // Usuario logueado
              <div className="flex items-center space-x-4">
                {userRole === 'admin' ? (
                  // Navegación solo para admin
                  <>
                    <Link
                      href="/admin"
                      className="flex items-center space-x-2 px-3 py-2 text-slate-300 hover:text-green-400 transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Dashboard</span>
                    </Link>
                    <Link
                      href="/admin/inventario"
                      className="flex items-center space-x-2 px-3 py-2 text-slate-300 hover:text-green-400 transition-colors"
                    >
                      <Package className="w-4 h-4" />
                      <span>Inventario</span>
                    </Link>
                    <Link
                      href="/admin/donaciones"
                      className="flex items-center space-x-2 px-3 py-2 text-slate-300 hover:text-green-400 transition-colors"
                    >
                      <Heart className="w-4 h-4" />
                      <span>Donaciones</span>
                    </Link>
                    <Link
                      href="/admin/solicitudes"
                      className="flex items-center space-x-2 px-3 py-2 text-slate-300 hover:text-green-400 transition-colors"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Solicitudes</span>
                    </Link>
                    <Link
                      href="/admin/asignaciones"
                      className="flex items-center space-x-2 px-3 py-2 text-slate-300 hover:text-green-400 transition-colors"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>Asignaciones</span>
                    </Link>
                    <Link
                      href="/admin/eventos"
                      className="flex items-center space-x-2 px-3 py-2 text-slate-300 hover:text-green-400 transition-colors"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>Eventos</span>
                    </Link>
                  </>
                ) : (
                  // Donante/Receptor solo ven "Mi Panel"
                  <Link
                    href={getDashboardPath()}
                    className="flex items-center space-x-2 px-4 py-2 text-slate-300 hover:text-green-400 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span>Mi Panel</span>
                  </Link>
                )}
                <NotificationBell onClick={() => setShowNotifications(true)} />
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors text-slate-300"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Salir</span>
                </button>
              </div>
            ) : (
              <>
                <Link href="/#contacto" className="text-slate-300 hover:text-green-400 transition-colors">
                  Contacto
                </Link>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={onLoginClick}
                    className="flex items-center space-x-2 px-4 py-2 text-slate-300 hover:text-green-400 transition-colors"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Iniciar Sesión</span>
                  </button>
                  <button
                    onClick={() => onRegisterClick?.('receptor')}
                    className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-lg text-white font-semibold transition-all shadow-lg shadow-green-500/25"
                  >
                    Registrarse
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-slate-300 hover:text-green-400 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-800">
            <div className="flex flex-col space-y-4">
              {isLoggedIn ? (
                // Usuario logueado
                <>
                  {userRole === 'admin' ? (
                    // Navegación solo para admin
                    <>
                      <Link
                        href="/admin"
                        className="flex items-center space-x-2 text-slate-300 hover:text-green-400 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Settings className="w-4 h-4" />
                        <span>Dashboard</span>
                      </Link>
                      <Link
                        href="/admin/inventario"
                        className="flex items-center space-x-2 text-slate-300 hover:text-green-400 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Package className="w-4 h-4" />
                        <span>Inventario</span>
                      </Link>
                      <Link
                        href="/admin/donaciones"
                        className="flex items-center space-x-2 text-slate-300 hover:text-green-400 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Heart className="w-4 h-4" />
                        <span>Donaciones</span>
                      </Link>
                      <Link
                        href="/admin/solicitudes"
                        className="flex items-center space-x-2 text-slate-300 hover:text-green-400 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <FileText className="w-4 h-4" />
                        <span>Solicitudes</span>
                      </Link>
                      <Link
                        href="/admin/asignaciones"
                        className="flex items-center space-x-2 text-slate-300 hover:text-green-400 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <ShoppingCart className="w-4 h-4" />
                        <span>Asignaciones</span>
                      </Link>
                      <Link
                        href="/admin/eventos"
                        className="flex items-center space-x-2 text-slate-300 hover:text-green-400 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Calendar className="w-4 h-4" />
                        <span>Eventos</span>
                      </Link>
                    </>
                  ) : (
                    // Donante/Receptor solo ven "Mi Panel"
                    <Link
                      href={getDashboardPath()}
                      className="flex items-center space-x-2 text-slate-300 hover:text-green-400 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      <span>Mi Panel</span>
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center space-x-2 text-slate-300 hover:text-red-400 transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Salir</span>
                  </button>
                </>
              ) : (
                // Usuario no logueado - muestra navegación principal
                <>
                  <Link
                    href="/#inicio"
                    className="text-slate-300 hover:text-green-400 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Inicio
                  </Link>
                  <Link
                    href="/#como-funciona"
                    className="text-slate-300 hover:text-green-400 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Cómo Funciona
                  </Link>
                  <Link
                    href="/#impacto"
                    className="text-slate-300 hover:text-green-400 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Impacto
                  </Link>
                  <Link
                    href="/#contacto"
                    className="text-slate-300 hover:text-green-400 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Contacto
                  </Link>
                  <button
                    onClick={() => {
                      onLoginClick?.();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center space-x-2 text-slate-300 hover:text-green-400 transition-colors text-left"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Iniciar Sesión</span>
                  </button>
                  <button
                    onClick={() => {
                      onRegisterClick?.('receptor');
                      setIsMenuOpen(false);
                    }}
                    className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-lg text-white font-semibold transition-all text-center"
                  >
                    Registrarse
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
    <NotificationCenter isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
    </>
  );
}
