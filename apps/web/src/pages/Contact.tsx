import { useState, type FormEvent } from "react";
import { useWebsite } from "../data/WebsiteContent";
import { Icon } from "../components/Icon";
import { PageHeader } from "../components/ui";

export function Contact() {
  const { copy: c, contact, loans } = useWebsite();
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
  return (
    <>
      <PageHeader title={c["contact.title"]} />
      <div className="container page-panel contact-layout">
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
          <button className="btn">{c["contact.form-button"]}</button>
          <p className="small-note">{c["contact.form-note"]}</p>
        </form>
        <aside className="contact-details">
          <h2>{c["contact.help-heading"]}</h2>
          <p className="org-name">{c["shared.name"]}</p>
          <h3>
            <Icon name="pin" />
            {c["contact.branch-heading"]}
          </h3>
          <p className="address">{contact.address}</p>
          <h3>
            <Icon name="phone" />
            {c["contact.call-heading"]}
          </h3>
          <p>
            {contact.phones.map((phone, index) => (
              <span key={phone}>
                {index ? " | " : ""}
                <a href={`tel:${phone.replace(/\s/g, "")}`}>{phone}</a>
              </span>
            ))}
          </p>
          <h3>
            <Icon name="mail" />
            {c["contact.email-heading"]}
          </h3>
          <p>
            <a href={`mailto:${contact.email}`}>{contact.email}</a>
          </p>
        </aside>
      </div>
    </>
  );
}
