'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Hero from '@/components/Hero';
import HowItWorks from '@/components/HowItWorks';
import Impact from '@/components/Impact';
import Contact from '@/components/Contact';
import LoginModal from '@/components/LoginModal';

export default function Home() {
  const router = useRouter();
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [loginModalMode, setLoginModalMode] = useState<'login' | 'register'>('login');
  const [userType, setUserType] = useState<'receptor' | 'donante'>('receptor');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthAndRedirect();
  }, []);

  const checkAuthAndRedirect = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const { data: userData } = await supabase
          .from('users')
          .select('rol')
          .eq('id', session.user.id)
          .maybeSingle();
        
        if (userData?.rol) {
          if (userData.rol === 'admin') {
            router.replace('/admin');
            return;
          } else if (userData.rol === 'donante') {
            router.replace('/donantes');
            return;
          } else if (userData.rol === 'receptor') {
            router.replace('/receptores');
            return;
          }
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error checking auth:', error);
      setLoading(false);
    }
  };

  const handleLoginClick = () => {
    setLoginModalMode('login');
    setLoginModalOpen(true);
  };

  const handleRegisterClick = (type: 'receptor' | 'donante' = 'receptor') => {
    setUserType(type);
    setLoginModalMode('register');
    setLoginModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-white">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Header onLoginClick={handleLoginClick} onRegisterClick={handleRegisterClick} />
      
      <main>
        <Hero onDonateClick={() => handleRegisterClick('donante')} />
        <HowItWorks />
        <Impact 
          onDonateClick={() => handleRegisterClick('donante')}
          onRegisterClick={() => handleRegisterClick('receptor')}
        />
        <Contact />
      </main>

      <Footer />

      {/* Login/Register Modal */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        mode={loginModalMode}
        initialUserType={userType}
      />
    </div>
  );
}
