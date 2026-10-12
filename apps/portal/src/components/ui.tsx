import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Link } from "react-router";
import { ConvexError } from "convex/values";
import { Icon } from "../../../web/src/components/Icon";
import { useWorkspace } from "../data/WorkspaceProvider";
import {
  statusLabels,
  type Activity,
  type ApplicationStatus,
} from "../data/types";

export { Icon };
export const date = (value: string) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Africa/Banjul",
  }).format(new Date(value));
export const money = (value: number) =>
  new Intl.NumberFormat("en-GM", {
    style: "currency",
    currency: "GMD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

export function PageHeader({
  eyebrow,
  title,
  children,
  action,
}: {
  eyebrow?: string;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        {eyebrow ? <p className="kicker">{eyebrow}</p> : null}
        <h1>{title}</h1>
        {children ? <p className="page-description">{children}</p> : null}
      </div>
      {action ? <div className="heading-actions">{action}</div> : null}
    </div>
  );
}
export function Badge({
  status,
}: {
  status: ApplicationStatus;
}) {
  return (
    <span className={`badge badge-${status}`}>
      <span />
      {statusLabels[status]}
    </span>
  );
}
export function Avatar({
  name,
  large = false,
}: {
  name: string;
  large?: boolean;
}) {
  return (
    <span
      className={`avatar${large ? " avatar-large" : ""}`}
      aria-hidden="true"
    >
      {name
        .split(" ")
        .slice(0, 2)
        .map((part) => part[0])
        .join("")}
    </span>
  );
}
export function EmptyState({
  title,
  children,
  action,
}: {
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <span className="empty-symbol">
        <Icon name="sprout" />
      </span>
      <h2>{title}</h2>
      <p>{children}</p>
      {action}
    </div>
  );
}
export function BackLink({
  to,
  children,
}: {
  to: string;
  children: ReactNode;
}) {
  return (
    <Link className="back-link" to={to}>
      <span aria-hidden="true">←</span>
      {children}
    </Link>
  );
}
export function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  useEffect(() => {
    const dialog = ref.current!;
    const previous = document.activeElement as HTMLElement | null;
    dialog.showModal();
    return () => {
      dialog.close();
      previous?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className="modal"
      aria-labelledby={id}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <div className="modal-heading">
        <h2 id={id}>{title}</h2>
        <button
          className="icon-button"
          onClick={onClose}
          aria-label="Close dialog"
        >
          <Icon name="close" />
        </button>
      </div>
      {children}
    </dialog>
  );
}
export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
      {hint ? <small>{hint}</small> : null}
    </label>
  );
}
export function ActivityList({
  items,
  limit = 8,
}: {
  items: Activity[];
  limit?: number;
}) {
  const { state } = useWorkspace();
  if (!items.length) return <p className="quiet">No activity yet.</p>;
  return (
    <ol className="activity-list">
      {items.slice(0, limit).map((item) => (
        <li key={item.id}>
          <span className="activity-dot" />
          <div>
            <p>{item.message}</p>
            <small>
              {item.actorId === "website" ? "Website application" : state.users.find((person) => person.id === item.actorId)?.name ??
                "Former staff member"}{" "}
              <span>·</span> <time dateTime={item.at}>{date(item.at)}</time>
            </small>
          </div>
        </li>
      ))}
    </ol>
  );
}
export function useFeedback() {
  const [feedback, setFeedback] = useState<{
    text: string;
    error: boolean;
  } | null>(null);
  const inFlight = useRef(false);
  const [pending, setPending] = useState(false);
  async function run(action: () => unknown | Promise<unknown>, success: string) {
    if (inFlight.current) return false;
    inFlight.current = true; setPending(true);
    try {
      await action();
      setFeedback({ text: success, error: false });
      return true;
    } catch (error) {
      setFeedback({
        text:
          error instanceof ConvexError && typeof error.data === "string"
            ? error.data
            : error instanceof Error
            ? error.message
            : "The action could not be completed.",
        error: true,
      });
      return false;
    } finally { inFlight.current = false; setPending(false); }
  }
  const message = feedback ? (
    <div
      role={feedback.error ? "alert" : "status"}
      className={`notice ${feedback.error ? "notice-error" : "notice-success"}`}
    >
      {feedback.text}
      <button
        className="icon-button"
        onClick={() => setFeedback(null)}
        aria-label="Dismiss message"
      >
        <Icon name="close" />
      </button>
    </div>
  ) : null;
  return { run, message, pending };
}

export const DirtyContext = createContext<{
  set: (dirty: boolean) => void;
  clear: () => void;
}>({ set: () => {}, clear: () => {} });
export function useUnsavedChanges(dirty: boolean) {
  const guard = useContext(DirtyContext);
  useEffect(() => {
    guard.set(dirty);
    return () => guard.set(false);
  }, [dirty, guard]);
  return guard.clear;
}
