'use client';

import { useState, useEffect } from 'react';
import { X, Bell, Trash2, Heart, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { notificacionesService } from '@/lib/services/notificaciones';
import { Notificacion } from '@/types';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [usuarioId, setUsuarioId] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUsuarioId(user.id);
        if (isOpen) {
          fetchNotificaciones(user.id);
        }
      }
    };

    if (isOpen) {
      getUser();
    }
  }, [isOpen]);

  const fetchNotificaciones = async (userId: string) => {
    try {
      setIsLoading(true);
      const notifs = await notificacionesService.getNotificacionesUsuario(userId);
      setNotificaciones(notifs);
    } catch (error) {
      console.error('Error fetching notificaciones:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (notificacionId: string) => {
    try {
      await notificacionesService.marcarComoLeida(notificacionId);
      setNotificaciones((prev) =>
        prev.map((notif) =>
          notif.notificacion_id === notificacionId ? { ...notif, leida: true } : notif
        )
      );
    } catch (error) {
      console.error('Error marking notificacion as read:', error);
    }
  };

  const handleDelete = async (notificacionId: string) => {
    try {
      await notificacionesService.deleteNotificacion(notificacionId);
      setNotificaciones((prev) =>
        prev.filter((notif) => notif.notificacion_id !== notificacionId)
      );
    } catch (error) {
      console.error('Error deleting notificacion:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!usuarioId) return;
    try {
      await notificacionesService.marcarTodasComoLeidas(usuarioId);
      setNotificaciones((prev) => prev.map((notif) => ({ ...notif, leida: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const getIconByType = (tipo: string) => {
    switch (tipo) {
      case 'evento':
        return <Bell className="w-4 h-4 text-blue-400" />;
      case 'donacion':
        return <Heart className="w-4 h-4 text-red-400" />;
      case 'solicitud':
        return <AlertCircle className="w-4 h-4 text-yellow-400" />;
      case 'asignacion':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      default:
        return <Bell className="w-4 h-4 text-slate-400" />;
    }
  };

  const getPriorityColor = (prioridad: string) => {
    switch (prioridad) {
      case 'alta':
        return 'border-l-4 border-l-red-500';
      case 'normal':
        return 'border-l-4 border-l-yellow-500';
      default:
        return 'border-l-4 border-l-slate-500';
    }
  };

  if (!isOpen) return null;

  const noLeidas = notificaciones.filter((n) => !n.leida).length;

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-h-[80vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-800/50">
          <div>
            <h2 className="text-lg font-bold text-white">Notificaciones</h2>
            {noLeidas > 0 && (
              <p className="text-sm text-slate-400">{noLeidas} no leídas</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {noLeidas > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 transition-colors"
              >
                Marcar todo como leído
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white transition-colors hover:bg-slate-700/50 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-slate-400">Cargando...</p>
            </div>
          ) : notificaciones.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 gap-2">
              <Bell className="w-8 h-8 text-slate-600" />
              <p className="text-slate-400">No hay notificaciones</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {notificaciones.map((notif) => (
                <div
                  key={notif.notificacion_id}
                  className={`p-4 hover:bg-slate-800/50 transition-colors cursor-pointer ${getPriorityColor(
                    notif.prioridad
                  )} ${!notif.leida ? 'bg-slate-800/30' : ''}`}
                  onClick={() => {
                    if (!notif.leida) {
                      handleMarkAsRead(notif.notificacion_id);
                    }
                    if (notif.accion_url) {
                      window.location.href = notif.accion_url;
                    }
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">{getIconByType(notif.tipo)}</div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white text-sm truncate">
                        {notif.titulo}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                        {notif.descripcion}
                      </p>
                      <p className="text-xs text-slate-500 mt-2">
                        {new Date(notif.fecha_creacion).toLocaleDateString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    {!notif.leida && (
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(notif.notificacion_id);
                    }}
                    className="mt-2 text-xs text-slate-500 hover:text-red-400 transition-colors flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
