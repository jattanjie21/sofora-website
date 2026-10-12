import { useState, type FormEvent } from "react";
import { Link, NavLink, useSearchParams } from "react-router";
import { useMutation } from "convex/react";
import { ConvexError } from "convex/values";
import { api } from "../../../../convex/_generated/api";
import { useWebsite } from "../data/WebsiteContent";
import { Icon } from "../components/Icon";
import { HeroBanner, usePageTitle } from "../components/ui";
import type { NewApplication } from "../../../portal/src/data/types";

export type FormName = "registration" | "membership" | "kafo" | "loan";

const forms: FormName[] = ["membership", "loan", "kafo", "registration"];
const formPaths: Record<FormName, string> = {
  membership: "/membership-application-form/",
  loan: "/loan-application-form/",
  kafo: "/kafo-application-form/",
  registration: "/registration-form/",
};

// The four forms from the old website, each sending an application to the staff portal.
export function Apply({ form, preview = false }: { form: FormName; preview?: boolean }) {
  const { copy: c } = useWebsite();
  const title = {
    registration: c["shared.nav-registration-form"],
    membership: c["shared.nav-membership-form"],
    kafo: c["shared.nav-kafo-form"],
    loan: c["shared.nav-loan-form"],
  }[form];
  usePageTitle(title);
  const pdf = {
    registration: c["downloads.file-2-path"],
    membership: c["downloads.file-4-path"],
    kafo: c["downloads.file-3-path"],
    loan: c["downloads.file-1-path"],
  }[form];
  return (
    <>
      <HeroBanner title={title} intro={c[`shared.forms-intro-${form}`]} image={c["shared.forms-hero-image"]}>
        <nav className="gallery-tabs" aria-label={c["shared.nav-forms-downloads"]}>
          {forms.map((name) => (
            <NavLink key={name} to={formPaths[name]}>
              {c[`shared.forms-tab-${name}`]}
            </NavLink>
          ))}
        </nav>
        <span className="hero-meta">
          <Icon name="calendar" />
          {c["shared.forms-time"]}
        </span>
      </HeroBanner>
      <div className="container application-body">
        {preview ? (
          <p className="application-card">Applications can only be submitted from the public website.</p>
        ) : (
          <ApplicationForm key={form} form={form} pdf={pdf} />
        )}
      </div>
    </>
  );
}

function ApplicationForm({ form: formName, pdf }: { form: FormName; pdf: string }) {
  const { copy: c, loans, contact } = useWebsite();
  const [params] = useSearchParams();
  const submitApplication = useMutation(api.applications.submit);
  const [requestId] = useState(() => crypto.randomUUID());
  const kind = formName === "loan" ? "loan" : "membership";
  const requested = params.get("product");
  const [form, setForm] = useState<Omit<NewApplication, "assigneeId">>({
    kind,
    name: "",
    email: "",
    phone: "",
    address: "",
    occupation: "",
    purpose: "",
    membershipType: formName === "kafo" ? "group" : "personal",
    product: loans.some((loan) => loan.id === requested) ? requested! : loans[0]!.id,
    amount: 0,
    months: 12,
    memberNumber: "",
  });
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [reference, setReference] = useState("");
  function change<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((previous) => ({ ...previous, [key]: value }));
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    setError("");
    try {
      const result = await submitApplication({ input: { ...form, assigneeId: "" }, requestId, consent, website });
      setReference(result.reference);
    } catch (error) {
      setError(
        error instanceof ConvexError && typeof error.data === "string"
          ? error.data
          : "We couldn’t submit your application. Please try again or contact Sofora.",
      );
    } finally {
      setPending(false);
    }
  }

  if (reference)
    return (
      <div className="application-card application-receipt" role="status">
        <span className="application-receipt-icon">
          <Icon name="check" />
        </span>
        <h2>Application received</h2>
        <p>Thank you, {form.name}. Our team will review your application and contact you.</p>
        <p className="application-reference-label">Your application reference</p>
        <strong>{reference}</strong>
        <p>Keep this reference for any follow-up. Submitting an application does not confirm membership or loan approval.</p>
        <Link className="btn" to="/">
          Back to Home
          <Icon name="arrow" />
        </Link>
      </div>
    );

  const group = formName === "kafo";
  return (
    <div className="application-layout">
      <form className="application-card application-form" onSubmit={submit}>
        {error ? <p className="field-error" role="alert">{error}</p> : null}
        <fieldset disabled={pending}>
          <legend>
            <span className="legend-step">1</span>
            {group ? "Organisation details" : "Personal details"}
          </legend>
          <div className="form-grid">
            <label>
              {group ? "Organisation’s name" : "Full name"}
              <input autoComplete={group ? "organization" : "name"} required maxLength={150} value={form.name} onChange={(e) => change("name", e.target.value)} />
            </label>
            <label>
              Email address
              <input type="email" autoComplete="email" required maxLength={254} value={form.email} onChange={(e) => change("email", e.target.value)} />
            </label>
            <label>
              Phone/Mobile
              <input type="tel" autoComplete="tel" required maxLength={30} value={form.phone} onChange={(e) => change("phone", e.target.value)} />
            </label>
            <label>
              {group ? "Type of organisation / business activity" : "Occupation"}
              <input required maxLength={200} value={form.occupation} onChange={(e) => change("occupation", e.target.value)} />
            </label>
            <label className="full">
              Address
              <textarea autoComplete="street-address" required maxLength={2000} rows={2} value={form.address} onChange={(e) => change("address", e.target.value)} />
            </label>
          </div>
        </fieldset>
        <fieldset disabled={pending}>
          <legend>
            <span className="legend-step">2</span>
            {kind === "loan" ? "Loan details" : "Membership"}
          </legend>
          <div className="form-grid">
            {kind === "loan" ? (
              <>
                <label>
                  Account number
                  <input required maxLength={100} value={form.memberNumber} onChange={(e) => change("memberNumber", e.target.value)} />
                </label>
                <label>
                  Purpose of loan
                  <select value={form.product} onChange={(e) => change("product", e.target.value)}>
                    {loans.map((loan) => (
                      <option key={loan.id} value={loan.id}>{loan.title}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Amount applied (GMD)
                  <input type="number" min="0.01" max="10000000000" step="0.01" required value={form.amount || ""} onChange={(e) => change("amount", Number(e.target.value))} />
                </label>
                <label>
                  Loan duration (months)
                  <input type="number" min="1" max="1200" step="1" required value={form.months || ""} onChange={(e) => change("months", Number(e.target.value))} />
                </label>
              </>
            ) : group ? null : (
              <label>
                Type of membership
                <select value={form.membershipType} onChange={(e) => change("membershipType", e.target.value as typeof form.membershipType)}>
                  <option value="personal">Personal (sole or joint)</option>
                  <option value="group">Group / corporate / business</option>
                  <option value="children">Children’s saving (parent or guardian applies)</option>
                </select>
              </label>
            )}
            <label className="full">
              {kind === "loan" ? "Tell us more about the loan" : "Monthly saving amount and anything else we should know"}
              <textarea required maxLength={4000} rows={4} value={form.purpose} onChange={(e) => change("purpose", e.target.value)} />
            </label>
          </div>
          <label className="application-trap" aria-hidden="true">
            Website
            <input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
          </label>
          <label className="consent">
            <input type="checkbox" required checked={consent} onChange={(e) => setConsent(e.target.checked)} />
            <span>I confirm these details are accurate and agree that Sofora may use them to review this application and contact me about it.</span>
          </label>
          <button className="btn">
            {pending ? "Submitting…" : "Submit application"}
            {pending ? null : <Icon name="arrow" />}
          </button>
        </fieldset>
      </form>
      <aside className="application-aside">
        <div className="side-card">
          <h3>{c["shared.forms-steps-heading"]}</h3>
          <ol className="side-steps">
            {([1, 2, 3] as const).map((n) => (
              <li key={n}>{c[`shared.forms-step-${n}`]}</li>
            ))}
          </ol>
        </div>
        <div className="side-card side-card-navy">
          <h3>Prefer the paper form?</h3>
          <p>Download the fillable PDF, complete it and bring it to our branch office with your passport size photo and ID card or passport.</p>
          <a className="btn btn-small" href={pdf} download>
            <Icon name="download" />
            Download PDF
          </a>
        </div>
        <div className="side-card">
          <h3>Need help?</h3>
          <p>Please do not enter ID numbers, bank passwords or card details in this form.</p>
          <ul className="side-contacts">
            {contact.phones[0] ? (
              <li>
                <Icon name="phone" />
                <a href={`tel:${contact.phones[0].replace(/\s/g, "")}`}>{contact.phones[0]}</a>
              </li>
            ) : null}
            <li>
              <Icon name="mail" />
              <a href={`mailto:${contact.email}`}>{contact.email}</a>
            </li>
          </ul>
        </div>
      </aside>
    </div>
  );
}
