import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import { useWorkspace } from "../data/WorkspaceProvider";
import { can, statusLabels, type ApplicationStatus } from "../data/types";
import {
  Avatar,
  Badge,
  date,
  EmptyState,
  Icon,
  money,
  PageHeader,
} from "../components/ui";

const statuses: ApplicationStatus[] = [
  "new",
  "in_review",
  "needs_information",
  "recommended",
  "approved",
  "rejected",
];

export function Applications() {
  const { state, user, totals, loadMore, hasMore, loadingMore } = useWorkspace();
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [assigned, setAssigned] = useState(false);
  const kind = params.get("kind") ?? "all";
  const status = params.get("status") ?? "all";
  if (!can(user, "applications:view"))
    return (
      <EmptyState title="Application access required">
        Ask your Administrator for application access.
      </EmptyState>
    );
  function filter(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (value === "all") next.delete(key);
    else next.set(key, value);
    setParams(next);
  }
  const applications = state.applications.filter(
    (application) =>
      (kind === "all" || application.kind === kind) &&
      (status === "all" || application.status === status) &&
      (!assigned || application.assigneeId === user.id) &&
      `${application.name} ${application.reference} ${application.email}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  return (
    <>
      <PageHeader
        eyebrow="Every application has a story"
        title="Applications"
        action={
          <Link className="btn" to="/applications/new">
            <Icon name="plus" />
            New application
          </Link>
        }
      >
        Help the next member take their next step.
      </PageHeader>
      <div className="application-overview">
        <div>
          <strong>
            {totals.total.toString().padStart(2, "0")}
          </strong>
          <span>Total applications</span>
        </div>
        <div>
          <strong>
            {totals.new.toString()
              .padStart(2, "0")}
          </strong>
          <span>Ready to review</span>
        </div>
        <div>
          <strong>
            {totals.needs_information.toString()
              .padStart(2, "0")}
          </strong>
          <span>Need information</span>
        </div>
        <div>
          <strong>
            {totals.recommended.toString()
              .padStart(2, "0")}
          </strong>
          <span>Awaiting a decision</span>
        </div>
      </div>
      <section className="panel">
        <div className="filter-bar table-tabs">
          <div className="tabs" aria-label="Application type">
            {[
              ["all", "All applications"],
              ["membership", "Membership"],
              ["loan", "Loans"],
            ].map(([value, label]) => (
              <button
                key={value}
                aria-pressed={kind === value}
                className={kind === value ? "active" : ""}
                onClick={() => filter("kind", value!)}
              >
                {label}
                <span>
                  {
                    value === "all" ? totals.total : value === "loan" ? totals.loan : totals.membership
                  }
                </span>
              </button>
            ))}
          </div>
        </div>
        <div className="table-filters">
          <label className="search-field">
            <span className="sr-only">Search applications</span>
            <input
              type="search"
              placeholder="Search name, reference or email…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
          <label className="status-filter">
            <span className="sr-only">Application status</span>
            <select
              value={status}
              onChange={(event) => filter("status", event.target.value)}
            >
              <option value="all">All statuses</option>
              {statuses.map((value) => (
                <option key={value} value={value}>
                  {statusLabels[value]}
                </option>
              ))}
            </select>
          </label>
          <label className="check-label">
            <input
              type="checkbox"
              checked={assigned}
              onChange={(event) => setAssigned(event.target.checked)}
            />
            Assigned to me
          </label>
        </div>
        {applications.length ? (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Applicant</th>
                  <th>Application</th>
                  <th>Status</th>
                  <th>Assigned to</th>
                  <th>Received</th>
                  <th>
                    <span className="sr-only">Open</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {applications.map((application) => (
                  <tr key={application.id}>
                    <td>
                      <Link
                        className="person-cell"
                        to={`/applications/${application.id}`}
                      >
                        <Avatar name={application.name} />
                        <span>
                          <strong>{application.name}</strong>
                          <small>{application.reference}</small>
                        </span>
                      </Link>
                    </td>
                    <td>
                      <span className="cell-main">
                        {application.kind === "loan"
                          ? "Loan application"
                          : "Membership"}
                      </span>
                      <small className="cell-sub">
                        {application.kind === "loan"
                          ? money(application.amount)
                          : `${application.membershipType[0]!.toUpperCase()}${application.membershipType.slice(1)} savings`}
                      </small>
                    </td>
                    <td>
                      <Badge status={application.status} />
                    </td>
                    <td>
                      <span className={application.assigneeId ? "" : "quiet"}>
                        {state.users.find(
                          (person) => person.id === application.assigneeId,
                        )?.name ?? "Unassigned"}
                      </span>
                    </td>
                    <td className="nowrap">{date(application.submittedAt)}</td>
                    <td>
                      <Link
                        className="icon-button"
                        aria-label={`Open application for ${application.name}`}
                        to={`/applications/${application.id}`}
                      >
                        <Icon name="arrow" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="No applications found">
            Try another filter or record a new application.
          </EmptyState>
        )}
        <div className="table-footer">
          <span>
            {applications.length} of {state.applications.length} applications
          </span>
          <span>{state.applications.length} loaded · {totals.total} total</span>
        </div>
      </section>
      {hasMore || loadingMore ? <div className="form-actions"><span className="quiet">Filters apply to loaded records. Load more to search older applications.</span><button className="btn btn-secondary" disabled={loadingMore} onClick={loadMore}>{loadingMore ? "Loading…" : "Load more applications"}</button></div> : null}
    </>
  );
}
