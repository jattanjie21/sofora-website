import { useEffect, useRef, type ReactNode } from "react";

// The "sent" screen that replaces a website form after it submits: an animated tick, then the
// receipt text. It scrolls into view and takes focus, because long forms leave people at the bottom.
export function SubmitSuccess({ className = "", children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const top = element.getBoundingClientRect().top + window.scrollY - 120;
    if (Math.abs(window.scrollY - top) > 40) window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    element.focus({ preventScroll: true });
  }, []);
  return (
    <div ref={ref} tabIndex={-1} className={`application-card application-receipt submit-success ${className}`} role="status">
      <span className="success-mark" aria-hidden="true">
        <span className="success-burst">
          {Array.from({ length: 8 }, (_, n) => (
            <i key={n} style={{ rotate: `${n * 45}deg` }} />
          ))}
        </span>
        <svg viewBox="0 0 52 52">
          <circle className="success-circle" cx="26" cy="26" r="24" />
          <path className="success-check" d="M15 27.5l7 7L37.5 19" />
        </svg>
      </span>
      <div className="success-content">{children}</div>
    </div>
  );
}

// Milliseconds since the form appeared; the server treats very fast submissions as bots.
export function useFormTimer() {
  const started = useRef(0);
  useEffect(() => {
    started.current = Date.now();
  }, []);
  return () => Date.now() - started.current;
}

// A form error that scrolls into view, since the send button is far below the top of long forms.
export function FormError({ message }: { message: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    if (message) ref.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [message]);
  return message ? (
    <p ref={ref} className="field-error form-error" role="alert">
      {message}
    </p>
  ) : null;
}
