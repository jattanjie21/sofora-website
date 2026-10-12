import { useState, type FormEvent } from "react";
import { Link, NavLink, useSearchParams } from "react-router";
import { useMutation } from "convex/react";
import { ConvexError } from "convex/values";
import { api } from "../../../../convex/_generated/api";
import { useWebsite } from "../data/WebsiteContent";
import { ApplicationUpload } from "../components/ApplicationUpload";
import { FormError, SubmitSuccess, useFormTimer } from "../components/SubmitSuccess";
import { Icon } from "../components/Icon";
import { HeroBanner, usePageTitle } from "../components/ui";
import type { NewApplication } from "../../../portal/src/data/types";
import type { Id } from "../../../../convex/_generated/dataModel";

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
  const elapsed = useFormTimer();
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
    attachments: [],
  });
  const [idDocument, setIdDocument] = useState<Id<"_storage"> | "">("");
  const [photoDocument, setPhotoDocument] = useState<Id<"_storage"> | "">("");
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
    if (!idDocument || !photoDocument) {
      setError(c["shared.forms-uploads-missing"]);
      setPending(false);
      return;
    }
    try {
      const result = await submitApplication({
        input: {
          ...form,
          assigneeId: "",
          attachments: [
            { role: "id", storageId: idDocument },
            { role: "photo", storageId: photoDocument },
          ],
        },
        requestId,
        consent,
        website,
        elapsedMs: elapsed(),
      });
      setReference(result.reference);
    } catch (error) {
      setError(
        error instanceof ConvexError && typeof error.data === "string"
          ? error.data
          : c["shared.forms-submit-error"],
      );
    } finally {
      setPending(false);
    }
  }

  if (reference)
    return (
      <SubmitSuccess>
        <h2>{c["shared.forms-success-heading"]}</h2>
        <p>{c["shared.forms-success-text"].replaceAll("{name}", form.name)}</p>
        <p className="application-reference-label">{c["shared.forms-reference-label"]}</p>
        <strong>{reference}</strong>
        <p>{c["shared.forms-success-note"]}</p>
        <Link className="btn" to="/">
          {c["shared.forms-home-button"]}
          <Icon name="arrow" />
        </Link>
      </SubmitSuccess>
    );

  const group = formName === "kafo";
  return (
    <div className="application-layout">
      <form className="application-card application-form" onSubmit={submit}>
        <FormError message={error} />
        <fieldset disabled={pending}>
          <legend>
            <span className="legend-step">1</span>
            {group ? c["shared.forms-organisation-heading"] : c["shared.forms-personal-heading"]}
          </legend>
          <div className="form-grid">
            <label>
              {group ? c["shared.forms-organisation-name"] : c["shared.forms-name"]}
              <input autoComplete={group ? "organization" : "name"} required maxLength={150} value={form.name} onChange={(e) => change("name", e.target.value)} />
            </label>
            <label>
              {c["shared.forms-email"]}
              <input type="email" autoComplete="email" required maxLength={254} value={form.email} onChange={(e) => change("email", e.target.value)} />
            </label>
            <label>
              {c["shared.forms-phone"]}
              <input type="tel" autoComplete="tel" required maxLength={30} value={form.phone} onChange={(e) => change("phone", e.target.value)} />
            </label>
            <label>
              {group ? c["shared.forms-organisation-type"] : c["shared.forms-occupation"]}
              <input required maxLength={200} value={form.occupation} onChange={(e) => change("occupation", e.target.value)} />
            </label>
            <label className="full">
              {c["shared.forms-address"]}
              <textarea autoComplete="street-address" required maxLength={2000} rows={2} value={form.address} onChange={(e) => change("address", e.target.value)} />
            </label>
          </div>
        </fieldset>
        <fieldset disabled={pending}>
          <legend>
            <span className="legend-step">2</span>
            {kind === "loan" ? c["shared.forms-loan-heading"] : c["shared.forms-membership-heading"]}
          </legend>
          <div className="form-grid">
            {kind === "loan" ? (
              <>
                <label>
                  {c["shared.forms-account-number"]}
                  <input required maxLength={100} value={form.memberNumber} onChange={(e) => change("memberNumber", e.target.value)} />
                </label>
                <label>
                  {c["shared.forms-loan-purpose"]}
                  <select value={form.product} onChange={(e) => change("product", e.target.value)}>
                    {loans.map((loan) => (
                      <option key={loan.id} value={loan.id}>{loan.title}</option>
                    ))}
                  </select>
                </label>
                <label>
                  {c["shared.forms-loan-amount"]}
                  <input type="number" min="0.01" max="10000000000" step="0.01" required value={form.amount || ""} onChange={(e) => change("amount", Number(e.target.value))} />
                </label>
                <label>
                  {c["shared.forms-loan-months"]}
                  <input type="number" min="1" max="1200" step="1" required value={form.months || ""} onChange={(e) => change("months", Number(e.target.value))} />
                </label>
              </>
            ) : group ? null : (
              <label>
                {c["shared.forms-membership-type"]}
                <select value={form.membershipType} onChange={(e) => change("membershipType", e.target.value as typeof form.membershipType)}>
                  <option value="personal">{c["shared.forms-membership-type-personal"]}</option>
                  <option value="group">{c["shared.forms-membership-type-group"]}</option>
                  <option value="children">{c["shared.forms-membership-type-children"]}</option>
                </select>
              </label>
            )}
            <label className="full">
              {kind === "loan" ? c["shared.forms-loan-details"] : c["shared.forms-membership-details"]}
              <textarea required maxLength={4000} rows={4} value={form.purpose} onChange={(e) => change("purpose", e.target.value)} />
            </label>
          </div>
        </fieldset>
        <fieldset disabled={pending}>
          <legend>
            <span className="legend-step">3</span>
            {c["shared.forms-uploads-heading"]}
          </legend>
          <p className="application-upload-intro">{c["shared.forms-upload-intro"]}</p>
          <div className="application-upload-grid">
            <ApplicationUpload
              label={c["shared.forms-upload-id-label"]}
              hint={c["shared.forms-upload-id-hint"]}
              requestId={requestId}
              role="id"
              storageId={idDocument}
              onChange={setIdDocument}
              disabled={pending}
            />
            <ApplicationUpload
              label={c["shared.forms-upload-photo-label"]}
              hint={c["shared.forms-upload-photo-hint"]}
              requestId={requestId}
              role="photo"
              storageId={photoDocument}
              onChange={setPhotoDocument}
              disabled={pending}
            />
          </div>
          <label className="application-trap" aria-hidden="true">
            Website
            <input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
          </label>
          <label className="consent">
            <input type="checkbox" required checked={consent} onChange={(e) => setConsent(e.target.checked)} />
            <span>{c["shared.forms-consent"]}</span>
          </label>
          <button className={`btn${pending ? " is-sending" : ""}`}>
            {pending ? <span className="btn-spinner" aria-hidden="true" /> : null}
            {pending ? c["shared.forms-submitting"] : c["shared.forms-submit"]}
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
          <h3>{c["shared.forms-paper-heading"]}</h3>
          <p>{c["shared.forms-paper-text"]}</p>
          <a className="btn btn-small" href={pdf} download>
            <Icon name="download" />
            {c["shared.forms-paper-button"]}
          </a>
        </div>
        <div className="side-card">
          <h3>{c["shared.forms-help-heading"]}</h3>
          <p>{c["shared.forms-help-text"]}</p>
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
