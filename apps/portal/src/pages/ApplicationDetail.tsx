import { useState } from "react";
import { Link, useParams } from "react-router";
import { useWorkspace } from "../data/WorkspaceProvider";
import { can, type Application } from "../data/types";
import {
  ActivityList,
  Avatar,
  BackLink,
  Badge,
  date,
  EmptyState,
  Field,
  Icon,
  Modal,
  money,
  PageHeader,
  useFeedback,
  useUnsavedChanges,
} from "../components/ui";

type ReviewAction =
  | "information"
  | "recommend_approve"
  | "recommend_reject"
  | "approve"
  | "reject";
const actionTitles: Record<ReviewAction, string> = {
  information: "Flag missing information",
  recommend_approve: "Recommend approval",
  recommend_reject: "Recommend rejection",
  approve: "Approve application",
  reject: "Reject application",
};

export function ApplicationDetail() {
  const { id } = useParams();
  const { state, user } = useWorkspace();
  const application = state.applications.find((item) => item.id === id);
  if (!can(user, "applications:view"))
    return (
      <EmptyState title="Application access required">
        Your current role cannot view applicant information.
      </EmptyState>
    );
  if (!application)
    return (
      <EmptyState
        title="Application not found"
        action={
          <Link className="btn" to="/applications">
            Back to applications
          </Link>
        }
      >
        Choose a record from the application queue.
      </EmptyState>
    );
  return <Detail key={application.id} application={application} />;
}

function Detail({ application }: { application: Application }) {
  const { state, user, updateApplication } = useWorkspace();
  const [note, setNote] = useState("");
  const [action, setAction] = useState<ReviewAction | null>(null);
  const [reason, setReason] = useState("");
  const { run, message } = useFeedback();
  useUnsavedChanges(!!note.trim() || !!reason.trim());
  const closed =
    application.status === "approved" || application.status === "rejected";
  const product =
    application.kind === "loan"
      ? state.content.published.loans.find(
          (loan) => loan.id === application.product,
        )?.title
      : null;
  const assignee = state.users.find(
    (person) => person.id === application.assigneeId,
  );
  const officers = state.users.filter((person) =>
    person.activated && can(person, "applications:review"),
  );
  function openAction(next: ReviewAction) {
    setReason("");
    setAction(next);
  }
  async function performAction() {
    if (!action) return;
    const success = await run(async () => {
      if (action === "information")
        await updateApplication(application.id, {
          type: "request_information",
          text: reason,
        });
      else if (action === "recommend_approve" || action === "recommend_reject")
        await updateApplication(application.id, {
          type: "recommend",
          decision: action === "recommend_approve" ? "approve" : "reject",
          text: reason,
        });
      else
        await updateApplication(application.id, {
          type: "decide",
          decision: action === "approve" ? "approved" : "rejected",
          text: reason,
        });
    }, "Application updated. No message was sent to the applicant.");
    if (success) {
      setAction(null);
      setReason("");
    }
  }
  return (
    <>
      <BackLink to="/applications">Applications</BackLink>
      <PageHeader
        eyebrow={`${application.reference} · ${application.kind === "loan" ? "Loan application" : "Membership"}`}
        title={application.name}
        action={<Badge status={application.status} />}
      >
        Received {date(application.submittedAt)} · {application.source === "website" ? "Submitted online" : "Recorded by staff"}
      </PageHeader>
      {message}
      <div className="detail-layout">
        <div className="detail-main">
          <section className="panel">
            <div className="panel-heading">
              <div className="person-cell">
                <Avatar name={application.name} large />
                <div>
                  <h2>Applicant details</h2>
                  <small>Contact and background</small>
                </div>
              </div>
              {!closed && application.status !== "recommended" ? (
                <Link
                  className="text-button"
                  to={`/applications/${application.id}/edit`}
                >
                  Edit details
                  <Icon name="arrow" />
                </Link>
              ) : null}
            </div>
            <dl className="detail-grid">
              <div>
                <dt>Full name</dt>
                <dd>{application.name}</dd>
              </div>
              <div>
                <dt>Email address</dt>
                <dd>{application.email}</dd>
              </div>
              <div>
                <dt>Phone number</dt>
                <dd>{application.phone}</dd>
              </div>
              <div>
                <dt>Occupation</dt>
                <dd>{application.occupation}</dd>
              </div>
              <div className="span-two">
                <dt>Address</dt>
                <dd>{application.address}</dd>
              </div>
            </dl>
          </section>
          <section className="panel">
            <div className="panel-heading">
              <h2>
                {application.kind === "loan"
                  ? "Loan request"
                  : "Membership request"}
              </h2>
              <Icon
                name={application.kind === "loan" ? "briefcase" : "people"}
              />
            </div>
            <dl className="detail-grid">
              {application.kind === "loan" ? (
                <>
                  <div>
                    <dt>Product</dt>
                    <dd>{product ?? application.product}</dd>
                  </div>
                  <div>
                    <dt>Member number</dt>
                    <dd>{application.memberNumber}</dd>
                  </div>
                  <div>
                    <dt>Amount requested</dt>
                    <dd className="amount-display">
                      {money(application.amount)}
                    </dd>
                  </div>
                  <div>
                    <dt>Repayment period</dt>
                    <dd>{application.months} months</dd>
                  </div>
                </>
              ) : (
                <div>
                  <dt>Membership type</dt>
                  <dd>
                    {application.membershipType === "group"
                      ? "Group / business"
                      : application.membershipType === "children"
                        ? "Children’s savings"
                        : "Personal"}
                  </dd>
                </div>
              )}
              <div className="span-two">
                <dt>
                  {application.kind === "loan"
                    ? "Purpose of loan"
                    : "Reason for joining"}
                </dt>
                <dd>{application.purpose}</dd>
              </div>
            </dl>
          </section>
          {application.informationRequest ? (
            <section className="information-card">
              <Icon name="mail" />
              <div>
                <h2>Information to follow up</h2>
                <p>{application.informationRequest}</p>
                <small>
                  Internal flag only. Contact the applicant separately.
                </small>
              </div>
            </section>
          ) : null}
          {application.recommendation ? (
            <section className="panel">
              <div className="panel-heading">
                <h2>Officer’s recommendation</h2>
                <span
                  className={`subtle-tag ${application.recommendation.decision === "approve" ? "green-tag" : "red-tag"}`}
                >
                  {application.recommendation.decision === "approve"
                    ? "Approve"
                    : "Reject"}
                </span>
              </div>
              <div className="panel-body">
                <p className="preserve-lines">
                  {application.recommendation.reason}
                </p>
                <p className="quiet">
                  {
                    state.users.find(
                      (person) =>
                        person.id === application.recommendation?.actorId,
                    )?.name
                  }{" "}
                  · {date(application.recommendation.at)}
                </p>
              </div>
            </section>
          ) : null}
          {application.decision ? (
            <section className="panel">
              <div className="panel-heading">
                <h2>Administrator’s decision</h2>
                <Badge status={application.decision.outcome} />
              </div>
              <div className="panel-body">
                <p className="preserve-lines">{application.decision.reason}</p>
                <p className="quiet">
                  {
                    state.users.find(
                      (person) => person.id === application.decision?.actorId,
                    )?.name
                  }{" "}
                  · {date(application.decision.at)}
                </p>
              </div>
            </section>
          ) : null}
          <section className="panel">
            <div className="panel-heading">
              <h2>Internal notes</h2>
              <span className="subtle-tag">Team only</span>
            </div>
            <div className="panel-body">
              <form
                onSubmit={async (event) => {
                  event.preventDefault();
                  if (
                    await run(
                      () =>
                        updateApplication(application.id, {
                          type: "note",
                          text: note,
                        }),
                      "Internal note added.",
                    )
                  )
                    setNote("");
                }}
              >
                <Field label="Add a note">
                  <textarea
                    rows={3}
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    placeholder="Add context, a follow-up or something the next reviewer should know…"
                    required
                  />
                </Field>
                <div className="align-right">
                  <button className="btn btn-secondary" disabled={!note.trim()}>
                    Add note
                    <Icon name="plus" />
                  </button>
                </div>
              </form>
              <div className="notes-list">
                {application.notes.length ? (
                  application.notes.map((item) => (
                    <article className="note" key={item.id}>
                      <Avatar
                        name={
                          state.users.find(
                            (person) => person.id === item.actorId,
                          )?.name ?? "Staff"
                        }
                      />
                      <div>
                        <p className="preserve-lines">{item.message}</p>
                        <small>
                          {
                            state.users.find(
                              (person) => person.id === item.actorId,
                            )?.name
                          }{" "}
                          · {date(item.at)}
                        </small>
                      </div>
                    </article>
                  ))
                ) : (
                  <p className="quiet">
                    No notes yet. Keep useful context here for your team.
                  </p>
                )}
              </div>
            </div>
          </section>
        </div>
        <aside className="detail-aside">
          <section className="panel">
            <div className="panel-body">
              <p className="kicker">Keep it moving</p>
              <h2>The next step</h2>
              <Field label="Assigned to">
                <select
                  value={application.assigneeId}
                  disabled={closed}
                  onChange={(event) =>
                    run(
                      () =>
                        updateApplication(application.id, {
                          type: "assign",
                          userId: event.target.value,
                        }),
                      "Assignment updated.",
                    )
                  }
                >
                  <option value="">Unassigned</option>
                  {assignee &&
                  !officers.some((person) => person.id === assignee.id) ? (
                    <option value={assignee.id}>
                      {assignee.name} (unavailable)
                    </option>
                  ) : null}
                  {officers.map((person) => (
                    <option key={person.id} value={person.id}>
                      {person.name}
                    </option>
                  ))}
                </select>
              </Field>
              {closed ? (
                <p className="quiet">
                  A final decision has been recorded. You can still add
                  internal notes.
                </p>
              ) : (
                <div className="stack-actions">
                  {application.status === "new" ||
                  application.status === "needs_information" ? (
                    <>
                      <p className="quiet">
                        {application.status === "new"
                          ? "Start by reviewing the applicant’s details and the purpose of their request."
                          : "Update the details or add a note when the missing information arrives, then resume the review."}
                      </p>
                      <button
                        className="btn"
                        onClick={() =>
                          run(
                            () =>
                              updateApplication(application.id, {
                                type: "review",
                              }),
                            "Application is now in review.",
                          )
                        }
                      >
                        {application.status === "new"
                          ? "Start review"
                          : "Resume review"}
                        <Icon name="arrow" />
                      </button>
                    </>
                  ) : null}
                  {application.status === "in_review" ? (
                    <>
                      <p className="quiet">
                        Ready for a decision? Record your recommendation and
                        reasons for the administrator.
                      </p>
                      <button
                        className="btn"
                        onClick={() => openAction("recommend_approve")}
                      >
                        Recommend approval
                      </button>
                      <button
                        className="btn btn-secondary"
                        onClick={() => openAction("recommend_reject")}
                      >
                        Recommend rejection
                      </button>
                      <button
                        className="text-button"
                        onClick={() => openAction("information")}
                      >
                        Flag missing information
                      </button>
                    </>
                  ) : null}
                  {application.status === "recommended" ? (
                    <>
                      <p className="quiet">
                        {can(user, "applications:decide")
                          ? "Review the recommendation and record the final decision for this application."
                          : "The administrator will make the final decision. You can return the application to review if more work is needed."}
                      </p>
                      {can(user, "applications:decide") ? (
                        <>
                          <button
                            className="btn"
                            onClick={() => openAction("approve")}
                          >
                            <Icon name="check" />
                            Approve application
                          </button>
                          <button
                            className="btn btn-danger-outline"
                            onClick={() => openAction("reject")}
                          >
                            Reject application
                          </button>
                        </>
                      ) : null}
                      <button
                        className="text-button"
                        onClick={() =>
                          run(
                            () =>
                              updateApplication(application.id, {
                                type: "review",
                              }),
                            "Returned to review; the previous recommendation was cleared.",
                          )
                        }
                      >
                        Return to review
                      </button>
                    </>
                  ) : null}
                </div>
              )}
            </div>
          </section>
          <section className="panel">
            <div className="panel-body">
              <p className="kicker">Application history</p>
              <ActivityList items={application.history} limit={20} />
            </div>
          </section>
          <p className="page-note">
            Decisions are saved to the shared workspace. Contact the applicant separately; no payment or disbursement is triggered.
          </p>
        </aside>
      </div>
      {action ? (
        <Modal
          title={actionTitles[action]}
          onClose={() => {
            setAction(null);
            setReason("");
          }}
        >
          <p>
            {action === "information"
              ? "Record what the team needs to confirm. This flags the application for follow-up; it does not send a message."
              : action === "approve" || action === "reject"
                ? "This records the final decision. Include the reason so the team has a clear record."
                : "Explain your recommendation. An Administrator will review it before a final decision is recorded."}
          </p>
          <Field
            label={action === "information" ? "Missing information" : "Reason"}
          >
            <textarea
              autoFocus
              rows={4}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
            />
          </Field>
          <div className="modal-actions">
            <button
              className="btn btn-secondary"
              onClick={() => {
                setAction(null);
                setReason("");
              }}
            >
              Cancel
            </button>
            <button
              className={`btn${action === "reject" ? " btn-danger" : ""}`}
              disabled={!reason.trim()}
              onClick={performAction}
            >
              {actionTitles[action]}
            </button>
          </div>
        </Modal>
      ) : null}
    </>
  );
}
