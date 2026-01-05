'use client';

import { Bell } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { notificacionesService } from '@/lib/services/notificaciones';

interface NotificationBellProps {
  onClick?: () => void;
}

export default function NotificationBell({ onClick }: NotificationBellProps) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkUnreadCount();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkUnreadCount();
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUnreadCount = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const count = await notificacionesService.countNotificacionesNoLeidas(user.id);
        setUnreadCount(count);
      }
    } catch (error) {
      console.error('Error checking unread count:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={onClick}
      className="relative p-2 text-slate-300 hover:text-green-400 transition-colors"
      aria-label="Notificaciones"
    >
      <Bell className="w-5 h-5" />
      {unreadCount > 0 && (
        <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  );
}
