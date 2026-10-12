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
  icon: "home" | "browser" | "briefcase" | "people";
  permission?: Permission;
}[] = [
  { to: "/", label: "Overview", icon: "home" },
  {
    to: "/content",
    label: "Website content",
    icon: "browser",
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
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem("sofora-sidebar") === "collapsed";
    } catch {
      return false;
    }
  });
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
    try {
      localStorage.setItem("sofora-sidebar", collapsed ? "collapsed" : "open");
    } catch {
      // Private windows can block storage; the sidebar still works.
    }
  }, [collapsed]);
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
      <div className={`portal-shell${collapsed ? " is-collapsed" : ""}`}>
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
          <div className="sidebar-head">
            <Link className="portal-brand" to="/" aria-label="Sofora CCU home">
              <img src="/images/logo-white.png" width="48" height="48" alt="" />
              <strong>Sofora CCU</strong>
            </Link>
            <button
              className="sidebar-toggle"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-expanded={!collapsed}
              aria-controls="portal-navigation"
              onClick={() => setCollapsed(!collapsed)}
            >
              <Icon name={collapsed ? "chevronRight" : "chevronLeft"} />
            </button>
          </div>
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
          <header className="mobile-topbar">
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
