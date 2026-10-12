import { useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useWorkspace } from "../data/WorkspaceProvider";
import { can, type Application, type NewApplication } from "../data/types";
import {
  BackLink,
  EmptyState,
  Field,
  Icon,
  PageHeader,
  useFeedback,
  useUnsavedChanges,
} from "../components/ui";

function initialForm(application?: Application): NewApplication {
  return {
    kind: application?.kind ?? "membership",
    name: application?.name ?? "",
    email: application?.email ?? "",
    phone: application?.phone ?? "",
    address: application?.address ?? "",
    occupation: application?.occupation ?? "",
    purpose: application?.purpose ?? "",
    assigneeId: application?.assigneeId ?? "",
    membershipType:
      application?.kind === "membership"
        ? application.membershipType
        : "personal",
    product: application?.kind === "loan" ? application.product : "business",
    amount: application?.kind === "loan" ? application.amount : 50000,
    months: application?.kind === "loan" ? application.months : 24,
    memberNumber: application?.kind === "loan" ? application.memberNumber : "",
  };
}

export function ApplicationForm() {
  const { id } = useParams();
  const { state, user } = useWorkspace();
  const application = state.applications.find((item) => item.id === id);
  if (!can(user, "applications:review"))
    return (
      <EmptyState title="Application access required">
        Your role cannot create or edit applications.
      </EmptyState>
    );
  if (id && !application)
    return (
      <EmptyState title="Application not found">
        Return to the application queue to choose a record.
      </EmptyState>
    );
  if (
    application &&
    !["new", "in_review", "needs_information"].includes(application.status)
  )
    return (
      <EmptyState
        title="Applicant details are locked"
        action={
          <Link className="btn" to={`/applications/${application.id}`}>
            Back to application
          </Link>
        }
      >
        An application awaiting a decision must return to review before its
        details can change. Final decisions cannot be edited.
      </EmptyState>
    );
  return <Form key={id ?? "new"} application={application} />;
}

function Form({ application }: { application?: Application }) {
  const { state, addApplication, saveApplicationDetails } = useWorkspace();
  const [requestId] = useState(() => crypto.randomUUID());
  const [initial] = useState(() => initialForm(application));
  const [revision] = useState(application?.revision ?? 0);
  const [form, setForm] = useState(initial);
  const [amount, setAmount] = useState(String(initial.amount));
  const [months, setMonths] = useState(String(initial.months));
  const clearDirty = useUnsavedChanges(
    JSON.stringify(initial) !== JSON.stringify(form) ||
      amount !== String(initial.amount) ||
      months !== String(initial.months),
  );
  const { run, message, pending } = useFeedback();
  const navigate = useNavigate();
  const back = application
    ? `/applications/${application.id}`
    : "/applications";
  function update<K extends keyof NewApplication>(
    key: K,
    value: NewApplication[K],
  ) {
    setForm((previous) => ({ ...previous, [key]: value }));
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    let savedId = application?.id ?? "";
    const saved = await run(
      async () => {
        const input = {
          ...form,
          amount: Number(amount),
          months: Number(months),
        };
        if (application) await saveApplicationDetails(application.id, input, revision);
        else savedId = await addApplication(input, requestId);
      },
      application ? "Applicant details saved." : "Application recorded.",
    );
    if (saved) {
      clearDirty();
      navigate(`/applications/${savedId}`);
    }
  }
  return (
    <>
      <BackLink to={back}>
        {application ? "Application details" : "Applications"}
      </BackLink>
      <PageHeader
        eyebrow={application?.reference ?? "Make room for a new beginning"}
        title={application ? "Edit applicant details" : "New application"}
      >
        Record the details shared with your team. Applications are saved to the shared workspace.
      </PageHeader>
      {message}
      <form onSubmit={submit} className="application-form-layout">
        <div>
          <section className="panel">
            <div className="panel-heading">
              <h2>
                01 <span>Application type</span>
              </h2>
            </div>
            <div className="panel-body">
              <div className="type-options">
                {(["membership", "loan"] as const).map((kind) => (
                  <label
                    key={kind}
                    className={`type-option${form.kind === kind ? " selected" : ""}`}
                  >
                    <input
                      type="radio"
                      name="application-kind"
                      value={kind}
                      checked={form.kind === kind}
                      disabled={!!application}
                      onChange={() => update("kind", kind)}
                    />
                    <Icon
                      name={kind === "membership" ? "people" : "briefcase"}
                    />
                    <span>
                      <strong>
                        {kind === "membership"
                          ? "Membership"
                          : "Loan application"}
                      </strong>
                      <small>
                        {kind === "membership"
                          ? "A new member of our community"
                          : "Support for their next step"}
                      </small>
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </section>
          <section className="panel">
            <div className="panel-heading">
              <h2>
                02 <span>Applicant details</span>
              </h2>
            </div>
            <div className="panel-body form-grid">
              <Field label="Full name">
                <input
                  required
                  autoComplete="off"
                  value={form.name}
                  onChange={(event) => update("name", event.target.value)}
                  placeholder="e.g. Fatou Camara"
                />
              </Field>
              <Field label="Email address">
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(event) => update("email", event.target.value)}
                  placeholder="name@example.test"
                />
              </Field>
              <Field label="Phone number">
                <input
                  required
                  type="tel"
                  value={form.phone}
                  onChange={(event) => update("phone", event.target.value)}
                  placeholder="+220 000 0000"
                />
              </Field>
              <Field label="Occupation">
                <input
                  required
                  value={form.occupation}
                  onChange={(event) => update("occupation", event.target.value)}
                  placeholder="e.g. Shop owner"
                />
              </Field>
              <div className="span-two">
                <Field label="Residential or business address">
                  <textarea
                    required
                    rows={2}
                    value={form.address}
                    onChange={(event) => update("address", event.target.value)}
                    placeholder="Area, town or city"
                  />
                </Field>
              </div>
            </div>
          </section>
          <section className="panel">
            <div className="panel-heading">
              <h2>
                03{" "}
                <span>
                  {form.kind === "loan" ? "Loan request" : "Membership request"}
                </span>
              </h2>
            </div>
            <div className="panel-body form-grid">
              {form.kind === "membership" ? (
                <Field label="Membership type">
                  <select
                    value={form.membershipType}
                    onChange={(event) =>
                      update(
                        "membershipType",
                        event.target.value as NewApplication["membershipType"],
                      )
                    }
                  >
                    <option value="personal">Personal</option>
                    <option value="group">Group / business</option>
                    <option value="children">Children’s savings</option>
                  </select>
                </Field>
              ) : (
                <>
                  <Field label="Member number">
                    <input
                      required
                      value={form.memberNumber}
                      onChange={(event) =>
                        update("memberNumber", event.target.value)
                      }
                      placeholder="Your member number"
                    />
                  </Field>
                  <Field label="Loan product">
                    <select
                      value={form.product}
                      onChange={(event) =>
                        update("product", event.target.value)
                      }
                    >
                      {state.content.published.loans.map((loan) => (
                        <option key={loan.id} value={loan.id}>
                          {loan.title}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Requested amount (GMD)">
                    <input
                      type="number"
                      required
                      min="0.01"
                      step="0.01"
                      value={amount}
                      onChange={(event) => setAmount(event.target.value)}
                    />
                  </Field>
                  <Field label="Repayment period (months)">
                    <input
                      type="number"
                      required
                      min="1"
                      step="1"
                      value={months}
                      onChange={(event) => setMonths(event.target.value)}
                    />
                  </Field>
                </>
              )}
              <div className="span-two">
                <Field
                  label={
                    form.kind === "loan"
                      ? "Purpose of the loan"
                      : "Reason for joining"
                  }
                >
                  <textarea
                    required
                    rows={4}
                    value={form.purpose}
                    onChange={(event) => update("purpose", event.target.value)}
                    placeholder="A little context about the applicant’s goals…"
                  />
                </Field>
              </div>
            </div>
          </section>
          <div className="form-actions">
            <Link className="btn btn-secondary" to={back}>
              Cancel
            </Link>
            <button className="btn" type="submit" disabled={pending}>
              {application ? "Save details" : "Record application"}
              <Icon name="arrow" />
            </button>
          </div>
        </div>
        <aside>
          <section className="panel">
            <div className="panel-body">
              <p className="kicker">A clear next step</p>
              <h2>Who will take it from here?</h2>
              <Field label="Assign to">
                <select
                  value={form.assigneeId}
                  onChange={(event) => update("assigneeId", event.target.value)}
                >
                  <option value="">Leave unassigned</option>
                  {state.users
                    .filter((person) => person.activated && can(person, "applications:review"))
                    .map((person) => (
                      <option key={person.id} value={person.id}>
                        {person.name}
                      </option>
                    ))}
                </select>
              </Field>
              <p className="quiet">
                An Application Officer reviews the request and recommends an
                outcome. An Administrator records the final decision.
              </p>
            </div>
          </section>
          <p className="page-note">
            This records the application for staff review. Contact the applicant separately.
          </p>
        </aside>
      </form>
    </>
  );
}
