import { Link } from "react-router";
import { useWorkspace } from "../data/WorkspaceProvider";
import { documents } from "../data/content";
import { can } from "../data/types";
import { OverviewCharts } from "../components/OverviewCharts";
import { Icon, PageHeader } from "../components/ui";

export function Overview() {
  const { user, totals } = useWorkspace();
  const contentAccess = can(user, "content:view");
  const applicationAccess = can(user, "applications:view");
  const pad = (value: number) => value.toString().padStart(2, "0");
  return (
    <>
      <PageHeader
        title={`Welcome back, ${user.name.split(" ")[0]}.`}
        action={
          contentAccess && !applicationAccess ? (
            <Link className="btn" to="/content">
              Manage content
              <Icon name="arrow" />
            </Link>
          ) : undefined
        }
      />
      <div className="stat-grid">
        {applicationAccess ? (
          <>
            <Link className="stat-card" to="/applications">
              <span>
                Open applications
                <Icon name="briefcase" />
              </span>
              <strong>{(totals.total-totals.approved-totals.rejected).toString().padStart(2,"0")}</strong>
            </Link>
            <Link className="stat-card" to="/applications?status=recommended">
              <span>
                Awaiting a decision
                <Icon name="shield" />
              </span>
              <strong>
                {totals.recommended.toString().padStart(2,"0")}
              </strong>
            </Link>
          </>
        ) : null}
        {contentAccess ? (
          <>
            <Link className="stat-card" to="/content">
              <span>
                Website pages
                <Icon name="book" />
              </span>
              <strong>{documents.length.toString().padStart(2, "0")}</strong>
            </Link>
          </>
        ) : null}
      </div>
      {applicationAccess ? (
        <div className="stat-grid overview-metrics-secondary">
          <Link className="stat-card" to="/applications">
            <span>
              Total applications
              <Icon name="briefcase" />
            </span>
            <strong>{pad(totals.total)}</strong>
          </Link>
          <Link
            className="stat-card"
            to="/applications?status=needs_information"
          >
            <span>
              Need information
              <Icon name="shield" />
            </span>
            <strong>{pad(totals.needs_information)}</strong>
          </Link>
          <Link className="stat-card" to="/applications?kind=membership">
            <span>
              Membership
              <Icon name="people" />
            </span>
            <strong>{pad(totals.membership)}</strong>
          </Link>
          <Link className="stat-card" to="/applications?kind=loan">
            <span>
              Loans
              <Icon name="briefcase" />
            </span>
            <strong>{pad(totals.loan)}</strong>
          </Link>
        </div>
      ) : null}
      {applicationAccess ? <OverviewCharts totals={totals} /> : null}
    </>
  );
}
