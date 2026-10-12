import { Link } from "react-router";
import { useWorkspace } from "../data/WorkspaceProvider";
import { documents } from "../data/content";
import { can, roleLabels } from "../data/types";
import {
  ActivityList,
  Avatar,
  Badge,
  Icon,
  PageHeader,
} from "../components/ui";

export function Overview() {
  const { state, user, totals } = useWorkspace();
  const contentAccess = can(user, "content:view");
  const applicationAccess = can(user, "applications:view");
  const pending = state.applications.filter(
    (application) => !["approved", "rejected"].includes(application.status),
  );
  const activity = state.activity.filter((item) => {
    if (can(user, "staff:manage")) return true;
    return (
      (contentAccess && item.scope === "content") ||
      (applicationAccess && item.scope === "applications")
    );
  });
  return (
    <>
      <PageHeader
        eyebrow="A little care. A lasting difference."
        title={`Welcome back, ${user.name.split(" ")[0]}.`}
        action={
          applicationAccess ? (
            <Link className="btn" to="/applications/new">
              <Icon name="plus" />
              New application
            </Link>
          ) : (
            <Link className="btn" to="/content">
              Manage content
              <Icon name="arrow" />
            </Link>
          )
        }
      >
        Here’s what’s happening across your Sofora workspace.
      </PageHeader>
      <div className="overview-welcome">
        <div>
          <span className="kicker light-kicker">
            Together, behind the scenes
          </span>
          <h2>
            Good work starts
            <br />
            with a clear picture.
          </h2>
          <p>
            Your team, your website and your community.
            <br />
            Everything you need to keep things moving.
          </p>
          <span className="welcome-role">
            {user.roles.map((role) => roleLabels[role]).join(" · ")}
          </span>
        </div>
        <div className="welcome-art" aria-hidden="true">
          <div className="welcome-circle">
            <Icon name="sprout" />
          </div>
          <span className="welcome-orbit orbit-one" />
          <span className="welcome-orbit orbit-two" />
          <span className="welcome-dot" />
          <p>ROOTED IN TOGETHERNESS</p>
        </div>
      </div>
      <div className="stat-grid">
        {applicationAccess ? (
          <>
            <Link className="stat-card" to="/applications">
              <span>
                Open applications
                <Icon name="briefcase" />
              </span>
              <strong>{(totals.total-totals.approved-totals.rejected).toString().padStart(2,"0")}</strong>
              <small>
                Membership and loan requests <span>↗</span>
              </small>
            </Link>
            <Link className="stat-card" to="/applications?status=recommended">
              <span>
                Awaiting a decision
                <Icon name="shield" />
              </span>
              <strong>
                {totals.recommended.toString().padStart(2,"0")}
              </strong>
              <small>
                Reviewed and recommended <span>↗</span>
              </small>
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
              <small>
                Edit what’s on the website <span>↗</span>
              </small>
            </Link>
          </>
        ) : null}
      </div>
      <div className="overview-columns">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <p className="kicker">The next step</p>
              <h2>Needs your attention</h2>
            </div>
            <span className="subtle-tag">Your workspace</span>
          </div>
          {applicationAccess
            ? pending.slice(0, 4).map((application) => (
                <Link
                  className="attention-row"
                  to={`/applications/${application.id}`}
                  key={application.id}
                >
                  <Avatar name={application.name} />
                  <div>
                    <strong>{application.name}</strong>
                    <small>
                      {application.reference} ·{" "}
                      {application.kind === "loan" ? "Loan" : "Membership"}
                    </small>
                  </div>
                  <Badge status={application.status} />
                  <Icon name="arrow" />
                </Link>
              ))
            : null}
          {!applicationAccess || !pending.length ? (
            <p className="panel-empty">
              You’re all caught up. Your team’s next steps will appear here.
            </p>
          ) : null}
        </section>
        <section className="panel">
          <div className="panel-heading">
            <div>
              <p className="kicker">Around the workspace</p>
              <h2>Recent activity</h2>
            </div>
            <Icon name="people" />
          </div>
          <div className="panel-body">
            <ActivityList items={activity} limit={6} />
          </div>
        </section>
      </div>
      <div className="demo-footnote">
        <Icon name="shield" />
        <p>
          <strong>One shared workspace.</strong> Published content and submitted applications stay connected with the website.
        </p>
      </div>
    </>
  );
}
