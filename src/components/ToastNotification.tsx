import React from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  text: string;
  type: 'success' | 'error' | 'info';
}

interface ToastNotificationProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-none">
      {toasts.map((toast) => {
        let bgStyle = 'bg-[#111827] text-white border-2 border-[#FACC15] shadow-[3px_3px_0px_#FACC15]';
        let Icon = CheckCircle2;
        let iconColor = 'text-[#FACC15]';

        if (toast.type === 'error') {
          bgStyle = 'bg-[#EF4444] text-white border-2 border-[#111827] shadow-[3px_3px_0px_#111827]';
          Icon = AlertTriangle;
          iconColor = 'text-white';
        } else if (toast.type === 'info') {
          bgStyle = 'bg-white text-[#111827] border-2 border-[#111827] shadow-[3px_3px_0px_#111827]';
          Icon = Info;
          iconColor = 'text-[#3B82F6]';
        }

        return (
          <div
            key={toast.id}
            className={`p-3.5 rounded-xl ${bgStyle} flex items-center justify-between gap-3 text-xs font-black pointer-events-auto transition-all transform animate-in slide-in-from-bottom-5`}
          >
            <div className="flex items-center gap-2.5">
              <Icon className={`w-4 h-4 shrink-0 ${iconColor}`} />
              <span>{toast.text}</span>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="p-1 hover:opacity-75"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
