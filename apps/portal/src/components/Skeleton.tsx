// Placeholder layouts shown while portal data loads from Convex.
// Each one mirrors the page it stands in for, so nothing jumps when data arrives.
import type { ReactNode } from "react";

export function Bone({
  width,
  height,
  round = false,
  light = false,
}: {
  width?: number | string;
  height?: number | string;
  round?: boolean;
  light?: boolean;
}) {
  return (
    <span
      className={`bone${round ? " bone-round" : ""}${light ? " bone-light" : ""}`}
      style={{ width, height }}
    />
  );
}

// Announces loading once to screen readers and hides the shapes from them.
function Loading({ label, children }: { label: string; children: ReactNode }) {
  return (
    <>
      <p className="sr-only" role="status">
        {label}
      </p>
      <div className="skeleton" aria-hidden="true">
        {children}
      </div>
    </>
  );
}

function Heading({ back = false, action = false }: { back?: boolean; action?: boolean }) {
  return (
    <>
      {back ? (
        <div className="back-link">
          <Bone width={130} height={12} />
        </div>
      ) : null}
      <div className="page-heading">
        <div className="skeleton-lines">
          <Bone width={260} height={30} />
          <Bone width={340} height={12} />
        </div>
        {action ? <Bone width={150} height={43} /> : null}
      </div>
    </>
  );
}

function Rows({ count = 8 }: { count?: number }) {
  return (
    <div className="skeleton-rows">
      {Array.from({ length: count }, (_, n) => (
        <div className="skeleton-row" key={n}>
          <Bone width={37} height={37} round />
          <div className="skeleton-lines">
            <Bone width="45%" />
            <Bone width="25%" height={10} />
          </div>
          <div className="skeleton-lines skeleton-hide-small">
            <Bone width="60%" />
            <Bone width="40%" height={10} />
          </div>
          <Bone width={78} height={24} />
          <Bone width={90} height={12} />
        </div>
      ))}
    </div>
  );
}

function Fields({ count }: { count: number }) {
  return (
    <div className="panel-body form-grid">
      {Array.from({ length: count }, (_, n) => (
        <div className="skeleton-lines" key={n}>
          <Bone width={110} height={12} />
          <Bone width="100%" height={43} />
        </div>
      ))}
    </div>
  );
}

function PanelHeading() {
  return (
    <div className="panel-heading">
      <div className="person-cell">
        <Bone width={48} height={48} round />
        <div className="skeleton-lines">
          <Bone width={160} height={16} />
          <Bone width={110} height={10} />
        </div>
      </div>
    </div>
  );
}

function SidePanel() {
  return (
    <section className="panel">
      <div className="panel-body skeleton-lines">
        <Bone width={90} height={10} />
        <Bone width="80%" height={18} />
        <Bone width="100%" />
        <Bone width="70%" />
        <Bone width="100%" height={43} />
      </div>
    </section>
  );
}

export function OverviewSkeleton() {
  return (
    <Loading label="Loading overview…">
      <Heading />
      <div className="kpi-grid">
        {[0, 1, 2, 3].map((n) => (
          <div className="kpi" key={n}>
            <Bone width={40} height={40} />
            <Bone width="70%" height={13} />
            <strong>
              <Bone width={48} height={34} />
            </strong>
          </div>
        ))}
      </div>
      <div className="overview-grid">
        <div className="overview-main">
          <div className="overview-charts">
            {[0, 1].map((n) => (
              <section className="panel overview-chart" key={n}>
                <div className="panel-heading">
                  <Bone width={160} height={16} />
                </div>
                <div className="panel-body skeleton-lines">
                  {[90, 70, 55, 40, 25].map((width) => (
                    <Bone width={`${width}%`} height={18} key={width} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
        <section className="panel overview-recent">
          <div className="overview-recent-head">
            <Bone width={180} height={16} />
          </div>
          <div className="panel-body skeleton-lines">
            {[0, 1, 2, 3, 4].map((n) => (
              <Bone width="100%" height={36} key={n} />
            ))}
          </div>
        </section>
      </div>
    </Loading>
  );
}

export function ListSkeleton({ stats = 0, label = "Loading…" }: { stats?: number; label?: string }) {
  return (
    <Loading label={label}>
      <Heading action />
      {stats ? (
        <div className="application-overview">
          {Array.from({ length: stats }, (_, n) => (
            <div className="skeleton-lines" key={n}>
              <Bone width={50} height={31} />
              <Bone width={100} height={11} />
            </div>
          ))}
        </div>
      ) : null}
      <section className="panel">
        <div className="table-tabs skeleton-tabs">
          {[110, 80, 90].map((width) => (
            <Bone width={width} height={14} key={width} />
          ))}
        </div>
        <div className="table-filters">
          <Bone width={320} height={40} />
        </div>
        <Rows />
      </section>
    </Loading>
  );
}

export function ContentListSkeleton() {
  return (
    <Loading label="Loading website pages…">
      <Heading />
      <div className="content-toolbar">
        <Bone width={420} height={48} />
      </div>
      <div className="content-grid">
        {Array.from({ length: 9 }, (_, n) => (
          <div className="content-card" key={n}>
            <Bone width={42} height={42} />
            <div className="skeleton-lines">
              <Bone width="55%" height={16} />
              <Bone width="90%" height={12} />
            </div>
          </div>
        ))}
      </div>
    </Loading>
  );
}

export function SettingsSkeleton() {
  return (
    <Loading label="Loading settings…">
      <Heading />
      <div className="settings-layout">
        <div className="settings-main">
          {[0, 1].map((n) => (
            <section className="panel" key={n}>
              <PanelHeading />
              <Fields count={3} />
            </section>
          ))}
        </div>
        <aside className="settings-aside">
          <SidePanel />
        </aside>
      </div>
    </Loading>
  );
}

export function EditorSkeleton() {
  return (
    <Loading label="Loading page content…">
      <Heading back />
      <div className="page-editor">
        <aside className="section-menu skeleton-lines">
          <Bone width={120} height={10} />
          {[0, 1, 2, 3, 4].map((n) => (
            <Bone key={n} width="100%" height={36} />
          ))}
        </aside>
        <div className="editor-main">
          <section className="panel">
            <PanelHeading />
            <Fields count={6} />
          </section>
        </div>
      </div>
    </Loading>
  );
}

export function DetailSkeleton({ label = "Loading…" }: { label?: string }) {
  return (
    <Loading label={label}>
      <Heading back action />
      <div className="detail-layout">
        <div className="detail-main">
          <section className="panel">
            <PanelHeading />
            <div className="detail-grid">
              {Array.from({ length: 6 }, (_, n) => (
                <div className="skeleton-lines" key={n}>
                  <Bone width={90} height={10} />
                  <Bone width="70%" />
                </div>
              ))}
            </div>
          </section>
        </div>
        <aside className="detail-aside">
          <SidePanel />
        </aside>
      </div>
    </Loading>
  );
}

export function FormSkeleton() {
  return (
    <Loading label="Loading application form…">
      <Heading back />
      <div className="application-form-layout">
        <section className="panel">
          <div className="panel-heading">
            <Bone width={200} height={16} />
          </div>
          <Fields count={8} />
        </section>
        <SidePanel />
      </div>
    </Loading>
  );
}

export function ProfileSkeleton() {
  return (
    <Loading label="Loading your profile…">
      <Heading />
      <div className="profile-layout">
        <section className="panel">
          <div className="panel-body skeleton-lines skeleton-center">
            <Bone width={72} height={72} round />
            <Bone width="60%" height={18} />
            <Bone width="45%" height={12} />
          </div>
        </section>
        <section className="panel">
          <PanelHeading />
          <Fields count={2} />
        </section>
      </div>
    </Loading>
  );
}

// Picks the content skeleton that matches a portal address.
export function PageSkeleton({ path }: { path: string }) {
  if (path === "/") return <OverviewSkeleton />;
  if (path === "/profile") return <ProfileSkeleton />;
  if (path === "/content") return <ContentListSkeleton />;
  if (path.startsWith("/content/")) return <EditorSkeleton />;
  if (path === "/applications") return <ListSkeleton stats={4} label="Loading applications…" />;
  if (path === "/applications/new" || path.endsWith("/edit")) return <FormSkeleton />;
  if (path.startsWith("/applications/")) return <DetailSkeleton label="Loading application…" />;
  if (path === "/contact") return <ListSkeleton stats={2} label="Loading contact messages…" />;
  if (path.startsWith("/contact/")) return <DetailSkeleton label="Loading message…" />;
  if (path === "/staff") return <ListSkeleton label="Loading staff…" />;
  if (path === "/settings") return <SettingsSkeleton />;
  return <OverviewSkeleton />;
}

// The whole portal frame (sidebar, page, footer) before the workspace is ready.
export function ShellSkeleton({ path }: { path: string }) {
  let collapsed = false;
  try {
    collapsed = localStorage.getItem("sofora-sidebar") === "collapsed";
  } catch {
    // Private windows can block storage; fall back to the open sidebar.
  }
  return (
    <div className={`portal-shell${collapsed ? " is-collapsed" : ""}`}>
      <aside className="sidebar" aria-hidden="true">
        <div className="sidebar-head">
          <div className="portal-brand">
            <img src="/images/logo-white.png" width="48" height="48" alt="" />
            <strong>Sofora CCU</strong>
          </div>
        </div>
        <nav className="skeleton-nav">
          {[0, 1, 2, 3, 4].map((n) => (
            <span key={n}>
              <Bone width={22} height={22} round light />
              <Bone width="60%" light />
            </span>
          ))}
        </nav>
        <div className="sidebar-bottom skeleton-account">
          <Bone width={37} height={37} round light />
          <Bone width="55%" light />
        </div>
      </aside>
      <div className="workspace">
        <header className="mobile-topbar" aria-hidden="true">
          <Bone width={40} height={40} />
        </header>
        <main className="main-content">
          <PageSkeleton path={path} />
        </main>
        <footer className="workspace-footer">
          <span>Sofora Cooperative Credit Union</span>
          <span>People helping people.</span>
        </footer>
      </div>
    </div>
  );
}
