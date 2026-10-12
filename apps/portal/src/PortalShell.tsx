import { useEffect, useRef, useState } from "react";
import {
  Link,
  NavLink,
  Outlet,
  useBlocker,
  useLocation,
  useNavigate,
} from "react-router";
import { useWorkspace } from "./data/WorkspaceProvider";
import { can, type Permission } from "./data/types";
import { AccountMenu, type AccountAction } from "./components/AccountMenu";
import { DirtyContext, Icon, Modal, useFeedback } from "./components/ui";

const navigation: {
  to: string;
  label: string;
  icon: "home" | "book" | "briefcase" | "people";
  permission?: Permission;
}[] = [
  { to: "/", label: "Overview", icon: "home" },
  {
    to: "/content",
    label: "Website content",
    icon: "book",
    permission: "content:view",
  },
  {
    to: "/applications",
    label: "Applications",
    icon: "briefcase",
    permission: "applications:view",
  },
  {
    to: "/staff",
    label: "Staff & roles",
    icon: "people",
    permission: "staff:manage",
  },
];

export function PortalShell() {
  const { user, signOut } = useWorkspace();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountAction, setAccountAction] = useState<AccountAction | null>(
    null,
  );
  const menuButton = useRef<HTMLButtonElement>(null);
  const sidebar = useRef<HTMLElement>(null);
  const dirty = useRef(false);
  const [guard] = useState(() => ({
    set: (value: boolean) => {
      dirty.current = value;
    },
    clear: () => {
      dirty.current = false;
    },
  }));
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      dirty.current && currentLocation.pathname !== nextLocation.pathname,
  );
  const { run, message } = useFeedback();
  const active = navigation.find((item) =>
    item.to === "/"
      ? location.pathname === "/"
      : location.pathname.startsWith(item.to),
  );
  const pageLabel =
    location.pathname === "/profile"
      ? "My profile"
      : (active?.label ?? "Page not found");

  useEffect(() => {
    const handle = (event: BeforeUnloadEvent) => {
      if (dirty.current) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handle);
    return () => window.removeEventListener("beforeunload", handle);
  }, []);
  useEffect(() => {
    setMenuOpen(false);
    document.title = `Sofora — ${pageLabel}`;
    document.getElementById("portal-main")?.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }, [location.pathname, pageLabel]);
  useEffect(() => {
    if (menuOpen)
      sidebar.current?.querySelector<HTMLAnchorElement>("nav a")?.focus();
  }, [menuOpen]);

  async function performAccountAction() {
    if (await run(signOut, "Logged out.")) navigate("/login", {replace:true});
  }
  function requestAccountAction(action: AccountAction) {
    if (dirty.current) {
      setAccountAction(action);
      return;
    }
    void performAccountAction();
  }
  return (
    <DirtyContext.Provider value={guard}>
      <a className="skip-link" href="#portal-main">
        Skip to content
      </a>
      <div className="portal-shell">
        <aside
          ref={sidebar}
          id="portal-navigation"
          className={`sidebar${menuOpen ? " sidebar-open" : ""}`}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setMenuOpen(false);
              menuButton.current?.focus();
            }
          }}
        >
          <Link className="portal-brand" to="/">
            <img src="/images/sofora-logo.png" width="56" height="56" alt="" />
            <span>
              <strong>
                SOFORA<span>.</span>
              </strong>
              <small>STAFF WORKSPACE</small>
            </span>
          </Link>
          <p className="sidebar-label">Your workspace</p>
          <nav aria-label="Staff portal">
            {navigation
              .filter((item) => !item.permission || can(user, item.permission))
              .map((item) => (
                <NavLink to={item.to} key={item.to} end={item.to === "/"}>
                  <Icon name={item.icon} />
                  <span>{item.label}</span>
                </NavLink>
              ))}
          </nav>
          <div className="sidebar-note">
            <span className="note-mark">
              <Icon name="sprout" />
            </span>
            <p>
              Small steps.
              <br />
              <strong>Shared progress.</strong>
            </p>
            <small>A little care behind every member’s next chapter.</small>
          </div>
          <div className="sidebar-bottom">
            <div className="demo-label"><span /> Connected workspace</div>
            <p>Shared with your Sofora team.</p>
            <AccountMenu key={location.pathname + user.id} onAction={requestAccountAction} />
          </div>
        </aside>
        {menuOpen ? (
          <button
            className="nav-backdrop"
            aria-label="Close navigation"
            onClick={() => {
              setMenuOpen(false);
              menuButton.current?.focus();
            }}
          />
        ) : null}
        <div className="workspace">
          <header className="topbar">
            <div className="breadcrumb">
              <button
                ref={menuButton}
                className="icon-button mobile-menu"
                aria-label="Toggle navigation"
                aria-expanded={menuOpen}
                aria-controls="portal-navigation"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                <Icon name={menuOpen ? "close" : "menu"} />
              </button>
              <span>Workspace</span>
              <span className="breadcrumb-slash">/</span>
              <strong>{pageLabel}</strong>
            </div>
            <span className="subtle-tag">Staff workspace</span>
          </header>
          <main id="portal-main" tabIndex={-1} className="main-content">
            {message}
            <Outlet key={user.id} />
          </main>
          <footer className="workspace-footer">
            <span>Sofora Cooperative Credit Union</span>
            <span>People helping people.</span>
          </footer>
        </div>
      </div>
      {blocker.state === "blocked" || accountAction ? (
        <Modal
          title="Leave unsaved changes?"
          onClose={() => {
            if (blocker.state === "blocked") blocker.reset();
            setAccountAction(null);
          }}
        >
          <p>
            Your latest form edits have not been saved. Leave this screen and
            discard them?
          </p>
          <div className="modal-actions">
            <button
              className="btn btn-secondary"
              onClick={() => {
                if (blocker.state === "blocked") blocker.reset();
                setAccountAction(null);
              }}
            >
              Keep editing
            </button>
            <button
              className="btn"
              onClick={() => {
                guard.clear();
                if (accountAction) {
                  setAccountAction(null);
                  void performAccountAction();
                } else if (blocker.state === "blocked") blocker.proceed();
              }}
            >
              Discard and continue
            </button>
          </div>
        </Modal>
      ) : null}
    </DirtyContext.Provider>
  );
}
