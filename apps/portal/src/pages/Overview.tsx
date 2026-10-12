import { Link } from "react-router";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useWorkspace } from "../data/workspaceContext";
import { documents } from "../data/content";
import { can } from "../data/types";
import { OverviewCharts } from "../components/OverviewCharts";
import { date, Icon } from "../components/ui";
import { Bone } from "../components/Skeleton";

function greeting() {
  const hour = new Date().getHours();
  return hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
}

export function Overview() {
  const { user, totals, state } = useWorkspace();
  const contentAccess = can(user, "content:view");
  const applicationAccess = can(user, "applications:view");
  const contactTotals = useQuery(api.contact.totals, applicationAccess ? {} : "skip");
  const recentPages = [...state.content.entries]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 5)
    .map((entry) => ({ entry, doc: documents.find((doc) => doc.id === entry.id) }))
    .filter((item) => item.doc);
  const today = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  return (
    <>
      <section className="overview-hero">
        <div>
          <p className="overview-date">{today}</p>
          <h1>
            {greeting()}, {user.name.split(" ")[0]}
          </h1>
          <p className="overview-lead">Here’s what’s happening at Sofora today.</p>
        </div>
        <div className="overview-actions">
          {applicationAccess ? (
            <Link className="btn" to="/applications/new">
              <Icon name="plus" />
              New application
            </Link>
          ) : null}
          {contentAccess ? (
            <Link className={`btn${applicationAccess ? " btn-secondary" : ""}`} to="/content">
              <Icon name="browser" />
              Edit website
            </Link>
          ) : null}
        </div>
      </section>
      {applicationAccess ? (
        <div className="kpi-grid">
          <Kpi to="/applications" icon="briefcase" tone="blue" label="Open applications" value={totals.total - totals.approved - totals.rejected} />
          <Kpi to="/applications?status=recommended" icon="shield" tone="amber" label="Awaiting a decision" value={totals.recommended} />
          <Kpi to="/applications?status=needs_information" icon="user" tone="rose" label="Need information" value={totals.needs_information} />
          <Kpi to="/contact?filter=unread" icon="mail" tone="green" label="Unread messages" value={contactTotals?.unread} />
        </div>
      ) : null}
      <div className={`overview-grid${applicationAccess ? "" : " overview-grid-single"}`}>
        {applicationAccess ? (
          <div className="overview-main">
            <OverviewCharts totals={totals} />
            <div className="mini-stats">
              <Link to="/applications">
                <span>Total applications</span>
                <strong>{totals.total}</strong>
              </Link>
              <Link to="/applications?kind=membership">
                <span>Membership</span>
                <strong>{totals.membership}</strong>
              </Link>
              <Link to="/applications?kind=loan">
                <span>Loans</span>
                <strong>{totals.loan}</strong>
              </Link>
              <Link to="/applications?status=approved">
                <span>Approved</span>
                <strong>{totals.approved}</strong>
              </Link>
            </div>
          </div>
        ) : null}
        {contentAccess ? (
          <section className="panel overview-recent">
            <div className="overview-recent-head">
              <h2>Recently updated pages</h2>
              <Link className="text-button" to="/content">
                All {documents.length} pages <Icon name="arrow" />
              </Link>
            </div>
            {recentPages.length ? (
              <ul>
                {recentPages.map(({ entry, doc }) => (
                  <li key={entry.id}>
                    <Link to={`/content/${entry.id}`}>
                      <span className="overview-recent-icon">
                        <Icon name="book" />
                      </span>
                      <span>
                        <strong>{doc!.title}</strong>
                        <small>Updated {date(entry.updatedAt)}</small>
                      </span>
                      <Icon name="arrow" />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="quiet">No pages edited yet.</p>
            )}
          </section>
        ) : null}
      </div>
    </>
  );
}

function Kpi({ to, icon, tone, label, value }: { to: string; icon: "briefcase" | "shield" | "user" | "mail"; tone: string; label: string; value?: number }) {
  return (
    <Link className={`kpi kpi-${tone}`} to={to}>
      <span className="kpi-icon">
        <Icon name={icon} />
      </span>
      <span className="kpi-label">{label}</span>
      <strong aria-busy={value === undefined}>{value === undefined ? <Bone width={48} height={34} /> : value}</strong>
      <span className="kpi-link">
        View <Icon name="arrow" />
      </span>
    </Link>
  );
}
