import { useEffect } from "react";
import { Link, useParams } from "react-router";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { can } from "../data/types";
import { useWorkspace } from "../data/workspaceContext";
import { Avatar, BackLink, date, EmptyState, Icon, PageHeader } from "../components/ui";
import { DetailSkeleton } from "../components/Skeleton";

export function ContactDetail() {
  const { id } = useParams();
  const { user } = useWorkspace();
  const message = useQuery(
    api.contact.detail,
    can(user, "applications:view") && id ? { id: id as Id<"contactMessages"> } : "skip",
  );
  const markRead = useMutation(api.contact.markRead);
  useEffect(() => {
    if (message && !message.read && id) void markRead({ id: id as Id<"contactMessages"> });
  }, [message, id, markRead]);
  if (!can(user, "applications:view"))
    return (
      <EmptyState title="Contact inbox access required">
        Your current role cannot view contact messages.
      </EmptyState>
    );
  if (message === undefined) return <DetailSkeleton label="Loading message…" />;
  if (!message)
    return (
      <EmptyState
        title="Message not found"
        action={
          <Link className="btn" to="/contact">
            Back to contact inbox
          </Link>
        }
      >
        Choose a message from the inbox.
      </EmptyState>
    );
  const mailto = `mailto:${encodeURIComponent(message.email)}?subject=${encodeURIComponent(`Re: ${message.reference} — ${message.topic}`)}&body=${encodeURIComponent(`Hi ${message.name},\n\n`)}`;
  return (
    <>
      <BackLink to="/contact">Contact inbox</BackLink>
      <PageHeader
        eyebrow={`${message.reference} · ${message.read ? "Read" : "New"}`}
        title={message.name}
        action={
          <a className="btn" href={mailto}>
            <Icon name="mail" />
            Reply by email
          </a>
        }
      >
        Received {date(message.submittedAt)} · Submitted from the website contact form
      </PageHeader>
      <div className="detail-layout">
        <div className="detail-main">
          <section className="panel">
            <div className="panel-heading">
              <div className="person-cell">
                <Avatar name={message.name} large />
                <div>
                  <h2>Contact details</h2>
                  <small>{message.topic}</small>
                </div>
              </div>
            </div>
            <dl className="detail-grid">
              <div>
                <dt>Full name</dt>
                <dd>{message.name}</dd>
              </div>
              <div>
                <dt>Email address</dt>
                <dd>
                  <a href={`mailto:${message.email}`}>{message.email}</a>
                </dd>
              </div>
              <div>
                <dt>Phone number</dt>
                <dd>{message.phone || "—"}</dd>
              </div>
              <div>
                <dt>Reason for contacting</dt>
                <dd>{message.topic}</dd>
              </div>
              <div className="span-two">
                <dt>Message</dt>
                <dd>{message.message}</dd>
              </div>
            </dl>
          </section>
        </div>
      </div>
    </>
  );
}
