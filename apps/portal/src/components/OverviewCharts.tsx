import { Link } from "react-router";
import {
  statusLabels,
  type ApplicationStatus,
} from "../data/types";

type Totals = {
  total: number;
  membership: number;
  loan: number;
  new: number;
  in_review: number;
  needs_information: number;
  recommended: number;
  approved: number;
  rejected: number;
};

const pipeline: ApplicationStatus[] = [
  "new",
  "in_review",
  "needs_information",
  "recommended",
  "approved",
  "rejected",
];

function statusFilter(status: ApplicationStatus) {
  return `/applications?status=${status}`;
}

export function OverviewCharts({ totals }: { totals: Totals }) {
  const statusItems = pipeline.map((status) => ({
    label: statusLabels[status],
    value: totals[status],
    href: statusFilter(status),
  }));
  const typeItems = [
    {
      label: "Membership",
      value: totals.membership,
      href: "/applications?kind=membership",
    },
    {
      label: "Loans",
      value: totals.loan,
      href: "/applications?kind=loan",
    },
  ] as const;
  const statusMax = Math.max(1, ...statusItems.map((item) => item.value));
  const typeMax = Math.max(1, ...typeItems.map((item) => item.value));

  return (
    <div className="overview-charts">
      <section className="panel overview-chart">
        <div className="panel-heading">
          <h2>Application Status</h2>
        </div>
        <div className="panel-body">
          <div
            className="chart-bars"
            role="list"
            aria-label="Application status counts"
          >
            {statusItems.map((item) => (
              <Link
                className="chart-bar-row"
                key={item.label}
                to={item.href}
                role="listitem"
              >
                <span className="chart-bar-label">{item.label}</span>
                <span
                  className="chart-bar-track"
                  aria-hidden="true"
                >
                  <span
                    className="chart-bar-fill chart-bar-fill-status"
                    style={{
                      width: `${(item.value / statusMax) * 100}%`,
                    }}
                  />
                </span>
                <span className="chart-bar-value">{item.value}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="panel overview-chart">
        <div className="panel-heading">
          <h2>Application Types</h2>
        </div>
        <div className="panel-body chart-column-panel">
          <div
            className="chart-columns"
            role="list"
            aria-label="Application type counts"
          >
            {typeItems.map((item) => (
              <Link
                className="chart-column"
                key={item.label}
                to={item.href}
                role="listitem"
              >
                <span className="chart-column-value">{item.value}</span>
                <span
                  className="chart-column-track"
                  aria-hidden="true"
                >
                  <span
                    className="chart-column-fill"
                    style={{
                      height: `${(item.value / typeMax) * 100}%`,
                    }}
                  />
                </span>
                <span className="chart-column-label">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
