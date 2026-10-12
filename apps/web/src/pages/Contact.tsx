import { useState, type FormEvent } from "react";
import { useWebsite } from "../data/WebsiteContent";
import { Icon } from "../components/Icon";
import { CtaBanner, HeroBanner, usePageTitle } from "../components/ui";

const tel = (phone: string) => `tel:${phone.replace(/\s/g, "")}`;

export function Contact() {
  const { copy: c, contact, loans } = useWebsite();
  usePageTitle(c["contact.title"]);
  const [form, setForm] = useState({ name: "", email: "", phone: "", purpose: "", message: "" });
  const set = (key: keyof typeof form) => (event: { target: { value: string } }) =>
    setForm({ ...form, [key]: event.target.value });
  // There is no mail server: sending opens the visitor's email app, addressed to Sofora.
  function send(event: FormEvent) {
    event.preventDefault();
    const subject = form.purpose ? `${form.purpose} enquiry` : "Website enquiry";
    const body = [form.message, "", `${c["contact.form-name"]}: ${form.name}`, `${c["contact.form-email"]}: ${form.email}`, `${c["contact.form-phone"]}: ${form.phone}`].join("\n");
    window.location.href = `mailto:${contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }
  const place = encodeURIComponent(c["contact.map-location"]);
  return (
    <>
      <HeroBanner title={c["contact.title"]} intro={c["contact.intro"]} image={c["contact.hero-image"]}>
        <div className="hero-chips">
          {contact.phones[0] ? (
            <a href={tel(contact.phones[0])}>
              <Icon name="phone" />
              {contact.phones[0]}
            </a>
          ) : null}
          <a href={`mailto:${contact.email}`}>
            <Icon name="mail" />
            {contact.email}
          </a>
        </div>
      </HeroBanner>
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
          <form className="contact-form" onSubmit={send}>
            <h2>{c["contact.form-heading"]}</h2>
            <p>{c["contact.form-text"]}</p>
            <div className="form-grid">
              <label>
                <span className="sr-only">{c["contact.form-name"]}</span>
                <input required autoComplete="name" placeholder={c["contact.form-name"]} value={form.name} onChange={set("name")} />
              </label>
              <label>
                <span className="sr-only">{c["contact.form-email"]}</span>
                <input required type="email" autoComplete="email" placeholder={c["contact.form-email"]} value={form.email} onChange={set("email")} />
              </label>
              <label>
                <span className="sr-only">{c["contact.form-phone"]}</span>
                <input type="tel" autoComplete="tel" placeholder={c["contact.form-phone"]} value={form.phone} onChange={set("phone")} />
              </label>
              <label>
                <span className="sr-only">{c["contact.form-purpose"]}</span>
                <select value={form.purpose} onChange={set("purpose")}>
                  <option value="">{c["contact.form-purpose"]}</option>
                  {loans.map((loan) => (
                    <option key={loan.id}>{loan.title}</option>
                  ))}
                  <option>{c["contact.form-health"]}</option>
                </select>
              </label>
              <label className="full">
                <span className="sr-only">{c["contact.form-message"]}</span>
                <textarea rows={5} placeholder={c["contact.form-message"]} value={form.message} onChange={set("message")} />
              </label>
            </div>
            <button className="btn">
              {c["contact.form-button"]}
              <Icon name="arrow" />
            </button>
            <p className="small-note">{c["contact.form-note"]}</p>
          </form>
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
