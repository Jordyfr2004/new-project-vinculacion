'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Hero from '@/components/Hero';
import HowItWorks from '@/components/HowItWorks';
import Impact from '@/components/Impact';
import Contact from '@/components/Contact';
import LoginModal from '@/components/LoginModal';

export default function Home() {
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [loginModalMode, setLoginModalMode] = useState<'login' | 'register'>('login');
  const [userType, setUserType] = useState<'receptor' | 'donante'>('receptor');

  const handleLoginClick = () => {
    setLoginModalMode('login');
    setLoginModalOpen(true);
  };

  const handleRegisterClick = (type: 'receptor' | 'donante' = 'receptor') => {
    setUserType(type);
    setLoginModalMode('register');
    setLoginModalOpen(true);
  };

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
