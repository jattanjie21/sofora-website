import { useState, type FormEvent } from "react";
import { Link } from "react-router";
import { useMutation } from "convex/react";
import { ConvexError } from "convex/values";
import { api } from "../../../../convex/_generated/api";
import { useWebsite } from "../data/WebsiteContent";
import { Icon } from "../components/Icon";
import { FormError, SubmitSuccess, useFormTimer } from "../components/SubmitSuccess";
import { CtaBanner, HeroBanner, usePageTitle } from "../components/ui";

const tel = (phone: string) => `tel:${phone.replace(/\s/g, "")}`;

const enquiryTopics = ["membership", "loans", "savings", "general", "other"] as const;

export function Contact({ preview = false }: { preview?: boolean }) {
  const { copy: c, contact } = useWebsite();
  usePageTitle(c["contact.title"]);
  const place = encodeURIComponent(c["contact.map-location"]);
  return (
    <>
      <HeroBanner title={c["contact.title"]} intro={c["contact.intro"]} image={c["contact.hero-image"]} />
      <div className="container contact-body">
        <div className="contact-cards">
          <div className="contact-card">
            <span className="contact-card-icon">
              <Icon name="pin" />
            </span>
            <h3>{c["contact.branch-heading"]}</h3>
            <p className="address">{contact.address}</p>
          </div>
          <div className="contact-card">
            <span className="contact-card-icon">
              <Icon name="phone" />
            </span>
            <h3>{c["contact.call-heading"]}</h3>
            <ul className="contact-phones">
              {contact.phones.map((phone) => (
                <li key={phone}>
                  <a href={tel(phone)}>{phone}</a>
                </li>
              ))}
            </ul>
          </div>
          <div className="contact-card">
            <span className="contact-card-icon">
              <Icon name="mail" />
            </span>
            <h3>{c["contact.email-heading"]}</h3>
            <p>
              <a href={`mailto:${contact.email}`}>{contact.email}</a>
            </p>
          </div>
        </div>
        <div className="contact-layout">
          <ContactForm preview={preview} />
          <aside className="contact-map">
            <iframe
              src={`https://maps.google.com/maps?q=${place}&z=15&output=embed`}
              title={c["contact.branch-heading"]}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <div className="contact-map-info">
              <div>
                <h3>{c["contact.help-heading"]}</h3>
                <p>{c["shared.name"]}</p>
              </div>
              <a className="text-link" href={`https://www.google.com/maps/search/?api=1&query=${place}`} target="_blank" rel="noreferrer">
                {c["contact.map-button"]}
                <Icon name="northeast" />
              </a>
            </div>
          </aside>
        </div>
      </div>
      <CtaBanner
        heading={c["contact.cta-heading"]}
        text={c["contact.cta-text"]}
        primary={[c["contact.cta-button"], "/membership-application-form/"]}
        secondary={[c["contact.cta-loan"], "/loan-application-form/"]}
      />
    </>
  );
}

function ContactForm({ preview }: { preview: boolean }) {
  const { copy: c } = useWebsite();
  const submitMessage = useMutation(api.contact.submit);
  const [requestId] = useState(() => crypto.randomUUID());
  const elapsed = useFormTimer();
  const [form, setForm] = useState({ name: "", email: "", phone: "", topic: "", message: "" });
  const [website, setWebsite] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [reference, setReference] = useState("");
  const set = (key: keyof typeof form) => (event: { target: { value: string } }) =>
    setForm({ ...form, [key]: event.target.value });

  async function send(event: FormEvent) {
    event.preventDefault();
    if (pending) return;
    if (preview) {
      setError("Messages can only be sent from the public website.");
      return;
    }
    setPending(true);
    setError("");
    try {
      const result = await submitMessage({ input: form, requestId, website, elapsedMs: elapsed() });
      setReference(result.reference);
    } catch (submitError) {
      setError(
        submitError instanceof ConvexError && typeof submitError.data === "string"
          ? submitError.data
          : c["contact.form-error"],
      );
    } finally {
      setPending(false);
    }
  }

  if (reference)
    return (
      <SubmitSuccess className="contact-form">
        <h2>{c["contact.form-success-heading"]}</h2>
        <p>
          {c["contact.form-success-text"]} {c["contact.form-success-greeting"].replaceAll("{name}", form.name)}
        </p>
        <p className="application-reference-label">{c["contact.form-reference-label"]}</p>
        <strong>{reference}</strong>
        <p>{c["contact.form-success-note"]}</p>
        <Link className="btn" to="/">
          {c["contact.form-home-button"]}
          <Icon name="arrow" />
        </Link>
      </SubmitSuccess>
    );

  return (
    <form className="contact-form" onSubmit={send}>
      <h2>{c["contact.form-heading"]}</h2>
      <p>{c["contact.form-text"]}</p>
      <FormError message={error} />
      <div className="form-grid">
        <label>
          <span className="sr-only">{c["contact.form-name"]}</span>
          <input required autoComplete="name" placeholder={c["contact.form-name"]} value={form.name} onChange={set("name")} disabled={pending} />
        </label>
        <label>
          <span className="sr-only">{c["contact.form-email"]}</span>
          <input required type="email" autoComplete="email" placeholder={c["contact.form-email"]} value={form.email} onChange={set("email")} disabled={pending} />
        </label>
        <label className="full">
          <span className="sr-only">{c["contact.form-phone"]}</span>
          <input type="tel" autoComplete="tel" placeholder={c["contact.form-phone"]} value={form.phone} onChange={set("phone")} disabled={pending} />
        </label>
        <label className="full contact-reason">
          <span>{c["contact.form-reason-label"]}</span>
          <select required value={form.topic} onChange={set("topic")} disabled={pending} aria-label={c["contact.form-reason-label"]}>
            <option value="">{c["contact.form-reason-placeholder"]}</option>
            {enquiryTopics.map((id) => (
              <option key={id} value={c[`contact.form-topic-${id}`]}>
                {c[`contact.form-topic-${id}`]}
              </option>
            ))}
          </select>
        </label>
        <label className="full">
          <span className="sr-only">{c["contact.form-message"]}</span>
          <textarea required rows={5} placeholder={c["contact.form-message"]} value={form.message} onChange={set("message")} disabled={pending} />
        </label>
      </div>
      <label className="application-trap" aria-hidden="true">
        Website
        <input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
      </label>
      <button className={`btn${pending ? " is-sending" : ""}`} disabled={pending}>
        {pending ? <span className="btn-spinner" aria-hidden="true" /> : null}
        {pending ? c["contact.form-sending"] : c["contact.form-button"]}
        {pending ? null : <Icon name="arrow" />}
      </button>
    </form>
  );
}
