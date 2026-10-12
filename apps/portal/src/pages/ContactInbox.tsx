import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import { usePaginatedQuery, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { can } from "../data/types";
import { useWorkspace } from "../data/workspaceContext";
import { Avatar, date, EmptyState, Icon, PageHeader } from "../components/ui";
import { ListSkeleton } from "../components/Skeleton";

export function ContactInbox() {
  const { user } = useWorkspace();
  const totals = useQuery(api.contact.totals, can(user, "applications:view") ? {} : "skip");
  const queue = usePaginatedQuery(api.contact.list, can(user, "applications:view") ? {} : "skip", { initialNumItems: 50 });
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const filter = params.get("filter") ?? "all";
  if (!can(user, "applications:view"))
    return (
      <EmptyState title="Contact inbox access required">
        Ask your Administrator for application access to read website contact messages.
      </EmptyState>
    );
  if (!totals || queue.status === "LoadingFirstPage")
    return <ListSkeleton stats={2} label="Loading contact messages…" />;
  function setFilter(value: string) {
    const next = new URLSearchParams(params);
    if (value === "all") next.delete("filter");
    else next.set("filter", value);
    setParams(next);
  }
  const messages = queue.results.filter((message) => {
    if (filter === "unread" && message.read) return false;
    const haystack = `${message.name} ${message.reference} ${message.email} ${message.topic}`.toLowerCase();
    return haystack.includes(search.toLowerCase());
  });
  return (
    <>
      <PageHeader title="Contact" />
      <div className="application-overview">
        <div>
          <strong>{totals.total.toString().padStart(2, "0")}</strong>
          <span>Total messages</span>
        </div>
        <div>
          <strong>{totals.unread.toString().padStart(2, "0")}</strong>
          <span>Unread</span>
        </div>
      </div>
      <section className="panel">
        <div className="filter-bar table-tabs">
          <div className="tabs" aria-label="Message filter">
            {(
              [
                ["all", "All messages", totals.total],
                ["unread", "Unread", totals.unread],
              ] as const
            ).map(([value, label, count]) => (
              <button
                key={value}
                aria-pressed={filter === value}
                className={filter === value ? "active" : ""}
                onClick={() => setFilter(value)}
              >
                {label}
                <span>{count}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="table-filters">
          <label className="search-field">
            <span className="sr-only">Search contact messages</span>
            <input
              type="search"
              placeholder="Search name, reference, email or topic…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
        </div>
        {messages.length ? (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>From</th>
                  <th>Topic</th>
                  <th>Status</th>
                  <th>Received</th>
                  <th>
                    <span className="sr-only">Open</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {messages.map((message) => (
                  <tr key={message.id}>
                    <td>
                      <Link className="person-cell" to={`/contact/${message.id}`}>
                        <Avatar name={message.name} />
                        <span>
                          <strong>{message.name}</strong>
                          <small>{message.reference}</small>
                        </span>
                      </Link>
                    </td>
                    <td>
                      <span className="cell-main">{message.topic}</span>
                      <small className="cell-sub">{message.email}</small>
                    </td>
                    <td>
                      <span className={`badge badge-${message.read ? "approved" : "new"}`}>
                        <span />
                        {message.read ? "Read" : "New"}
                      </span>
                    </td>
                    <td className="nowrap">{date(message.submittedAt)}</td>
                    <td>
                      <Link
                        className="icon-button"
                        aria-label={`Open message from ${message.name}`}
                        to={`/contact/${message.id}`}
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
          <EmptyState title="No contact messages found">
            {filter === "unread" ? "You are up to date." : "Messages from the website contact form will appear here."}
          </EmptyState>
        )}
        <div className="table-footer">
          <span>
            {messages.length} of {queue.results.length} loaded messages
          </span>
          <span>
            {queue.results.length} loaded · {totals.total} total
          </span>
        </div>
      </section>
      {queue.status === "CanLoadMore" || queue.status === "LoadingMore" ? (
        <div className="form-actions">
          <span className="quiet">Filters apply to loaded records. Load more to search older messages.</span>
          <button className="btn btn-secondary" disabled={queue.status === "LoadingMore"} onClick={() => queue.loadMore(50)}>
            {queue.status === "LoadingMore" ? "Loading…" : "Load more messages"}
          </button>
        </div>
      ) : null}
    </>
  );
}
