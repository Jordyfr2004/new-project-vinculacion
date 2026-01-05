'use client';

import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        className={`relative w-full ${sizes[size]} bg-slate-900 border border-slate-800 rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden my-4 sm:my-0`}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || true) && (
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-800">
            {title && <h2 className="text-xl sm:text-2xl font-bold text-white">{title}</h2>}
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800 ml-2 flex-shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(100vh-120px)]">{children}</div>
      </div>
    </div>
  );
}
