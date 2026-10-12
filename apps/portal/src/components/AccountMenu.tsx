import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { useWorkspace } from "../data/WorkspaceProvider";
import { roleLabels } from "../data/types";
import { Avatar, Icon } from "./ui";

export type AccountAction = { type: "logout" };

export function AccountMenu({
  onAction,
}: {
  onAction: (action: AccountAction) => void;
}) {
  const { user } = useWorkspace();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const roles = user.roles.map((role) => roleLabels[role]).join(" + ");

  useEffect(() => {
    if (!open) return;
    panel.current?.querySelector<HTMLAnchorElement>("a")?.focus();
    function outside(event: PointerEvent) {
      if (event.target instanceof Node && !root.current?.contains(event.target))
        setOpen(false);
    }
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [open]);

  function choose(action: AccountAction) {
    setOpen(false);
    trigger.current?.focus();
    onAction(action);
  }

  return (
    <div
      className="account-menu"
      ref={root}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          event.stopPropagation();
          setOpen(false);
          trigger.current?.focus();
        }
      }}
    >
      <button
        className="account-trigger"
        ref={trigger}
        aria-expanded={open}
        aria-controls="account-panel"
        aria-haspopup="dialog"
        onClick={() => setOpen(!open)}
      >
        <Avatar name={user.name} />
        <span className="account-identity">
          <strong>{user.name}</strong>
          <small title={roles}>{roles}</small>
        </span>
        <span className={`account-chevron${open ? " is-open" : ""}`}>
          <Icon name="arrow" />
        </span>
      </button>
      {open ? (
        <div
          id="account-panel"
          className="account-panel"
          ref={panel}
          role="dialog"
          aria-label="Your account"
        >
          <div className="account-panel-heading">
            <strong>{user.name}</strong>
            <span>{user.email}</span>
          </div>
          <Link
            className="account-action"
            to="/profile"
            onClick={() => setOpen(false)}
          >
            <Icon name="people" /> My profile <span aria-hidden="true">→</span>
          </Link>
          <button
            className="account-action account-logout"
            onClick={() => choose({ type: "logout" })}
          >
            <Icon name="arrow" /> Log out
          </button>
        </div>
      ) : null}
    </div>
  );
}
