import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { Icon } from "../../../web/src/components/Icon";

// Short confirmation pop-ups ("Saved.") shown in the corner after an action succeeds.
// useFeedback() in ui.tsx sends its success messages here; errors stay inline next to the form.
type Toast = { id: number; text: string; leaving?: boolean };
const ToastContext = createContext<((text: string) => void) | null>(null);

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);
  const dismiss = useCallback((id: number) => {
    setToasts((list) => list.map((toast) => (toast.id === id ? { ...toast, leaving: true } : toast)));
    window.setTimeout(() => setToasts((list) => list.filter((toast) => toast.id !== id)), 200);
  }, []);
  const show = useCallback((text: string) => {
    const id = ++nextId.current;
    setToasts((list) => [...list.slice(-2), { id, text }]);
  }, []);
  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className="toast-region" role="status" aria-live="polite">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} dismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, dismiss }: { toast: Toast; dismiss: (id: number) => void }) {
  const [paused, setPaused] = useState(false);
  const { id, leaving } = toast;
  useEffect(() => {
    if (paused || leaving) return;
    const timer = window.setTimeout(() => dismiss(id), 4500);
    return () => window.clearTimeout(timer);
  }, [paused, leaving, id, dismiss]);
  return (
    <div
      className={`toast${toast.leaving ? " is-leaving" : ""}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <span className="toast-icon">
        <Icon name="check" />
      </span>
      <p>{toast.text}</p>
      <button className="icon-button" onClick={() => dismiss(id)} aria-label="Dismiss">
        <Icon name="close" />
      </button>
    </div>
  );
}
