import { useState, useCallback, useEffect, createContext, useContext, type ReactNode } from 'react';
import styles from './Toast.module.css';

type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  readonly id: number;
  readonly message: string;
  readonly type: ToastType;
}

interface ToastContextValue {
  readonly showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const CheckIcon = () => (
  <svg className={`${styles.icon} ${styles.successIcon}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

const ErrorIcon = () => (
  <svg className={`${styles.icon} ${styles.errorIcon}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="10" /><path d="M15 9l-6 6M9 9l6 6" />
  </svg>
);

const InfoIcon = () => (
  <svg className={`${styles.icon} ${styles.infoIcon}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" />
  </svg>
);

const ICON_MAP = { success: CheckIcon, error: ErrorIcon, info: InfoIcon };
const STYLE_MAP = { success: styles.toastSuccess, error: styles.toastError, info: styles.toastInfo };

let nextId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<readonly ToastItem[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = nextId++;
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className={styles.container}>
        {toasts.map((t) => (
          <ToastItemView key={t.id} toast={t} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItemView({ toast, onRemove }: { toast: ToastItem; onRemove: (id: number) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), 3000);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  const Icon = ICON_MAP[toast.type];

  return (
    <div className={`${styles.toast} ${STYLE_MAP[toast.type]}`}>
      <Icon />
      {toast.message}
    </div>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
