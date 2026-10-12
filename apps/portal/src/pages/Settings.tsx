import { useState, type KeyboardEvent, type ReactNode } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useWorkspace } from "../data/workspaceContext";
import { can } from "../data/types";
import {
  emailPattern,
  emailTemplateKeys,
  emailTemplates,
  teamLists,
  withEmailDefaults,
  type EmailSettings,
  type EmailTemplate,
  type TeamList,
} from "../data/email";
import { date, EmptyState, Field, Icon, PageHeader, useFeedback, useUnsavedChanges } from "../components/ui";
import { SettingsSkeleton } from "../components/Skeleton";

const memberTemplates: EmailTemplate[] = ["applicationReceived", "contactReceived", "informationRequested", "approved", "rejected"];
const teamTemplates: EmailTemplate[] = ["teamApplication", "teamContact"];
const statusLabels: Record<string, string> = {
  waiting: "Queued",
  queued: "Queued",
  sent: "Sent",
  delivered: "Delivered",
  delivery_delayed: "Delayed",
  bounced: "Bounced",
  failed: "Failed",
  spam: "Marked as spam",
  cancelled: "Cancelled",
  unknown: "Unknown",
};

export function Settings() {
  const { user } = useWorkspace();
  const data = useQuery(api.email.settings, can(user, "staff:manage") ? {} : "skip");
  if (!can(user, "staff:manage"))
    return <EmptyState title="Administrator access required">Only administrators can change settings.</EmptyState>;
  if (!data) return <SettingsSkeleton />;
  return <EmailSettingsForm initial={withEmailDefaults(data.value as Partial<EmailSettings>)} status={data.status} />;
}

function EmailSettingsForm({
  initial,
  status,
}: {
  initial: EmailSettings;
  status: { configured: boolean; live: boolean; testRecipient: string; from: string; webhook: boolean };
}) {
  const { user } = useWorkspace();
  const saveSettings = useMutation(api.email.saveSettings);
  const [value, setValue] = useState(initial);
  const [baseline, setBaseline] = useState(() => JSON.stringify(initial));
  const dirty = baseline !== JSON.stringify(value);
  const clearDirty = useUnsavedChanges(dirty);
  const { run, message, pending } = useFeedback();

  function update(change: (next: EmailSettings) => void) {
    const next = structuredClone(value);
    change(next);
    setValue(next);
  }
  async function save() {
    if (await run(() => saveSettings({ value }), "Settings saved.")) {
      setBaseline(JSON.stringify(value));
      clearDirty();
    }
  }

  return (
    <>
      <PageHeader title="Settings">Choose who is told about website forms and what emails applicants receive.</PageHeader>
      <ConnectionBanner status={status} />
      {message}
      <div className="settings-layout">
        <div className="settings-main">
          <section className="panel settings-card">
            <SectionHeading icon="people" title="Team notifications">
              When someone submits a form on the website, these addresses get an email with a link to it in the portal.
            </SectionHeading>
            <div className="settings-body">
              {(Object.keys(teamLists) as TeamList[]).map((list) => (
                <AddressList
                  key={list}
                  label={teamLists[list]}
                  addresses={value.team[list]}
                  onChange={(addresses) => update((next) => void (next.team[list] = addresses))}
                />
              ))}
              <Field label="Reply-to address" hint="When an applicant replies to one of our emails, the reply goes here. Leave empty to use the sending address.">
                <input
                  type="email"
                  placeholder="info@soforaccu.com"
                  value={value.replyTo}
                  onChange={(event) => update((next) => void (next.replyTo = event.target.value))}
                />
              </Field>
            </div>
          </section>

          <section className="panel settings-card">
            <SectionHeading icon="mail" title="Which emails are sent">
              Switch an email off to stop sending it. Everything is still saved in the portal.
            </SectionHeading>
            <div className="settings-body">
              <p className="settings-group-label">To applicants and people who contact us</p>
              {memberTemplates.map((key) => (
                <Toggle key={key} template={key} value={value} update={update} />
              ))}
              <p className="settings-group-label">To the Sofora team</p>
              {teamTemplates.map((key) => (
                <Toggle key={key} template={key} value={value} update={update} />
              ))}
            </div>
          </section>

          <section className="panel settings-card">
            <SectionHeading icon="book" title="Email wording">
              Change the subject and opening text of each email. Use <code>{"{name}"}</code>, <code>{"{reference}"}</code> and{" "}
              <code>{"{type}"}</code> to fill in the person's name, the reference number and the application type.
            </SectionHeading>
            <div className="settings-body settings-wording">
              {emailTemplateKeys.map((key) => {
                const changed =
                  value.wording[key].subject !== emailTemplates[key].subject || value.wording[key].intro !== emailTemplates[key].intro;
                return (
                  <details className="settings-template" key={key}>
                    <summary>
                      <span>
                        <strong>{emailTemplates[key].label}</strong>
                        <small>{value.wording[key].subject}</small>
                      </span>
                      {changed ? <span className="settings-pill">Edited</span> : null}
                      <Icon name="plus" />
                    </summary>
                    <div>
                      <Field label="Subject">
                        <input
                          type="text"
                          value={value.wording[key].subject}
                          onChange={(event) => update((next) => void (next.wording[key].subject = event.target.value))}
                        />
                      </Field>
                      <Field label="Opening text">
                        <textarea
                          className="auto-grow"
                          rows={3}
                          value={value.wording[key].intro}
                          onChange={(event) => update((next) => void (next.wording[key].intro = event.target.value))}
                        />
                      </Field>
                      {changed ? (
                        <button
                          type="button"
                          className="text-button"
                          onClick={() =>
                            update(
                              (next) =>
                                void (next.wording[key] = { subject: emailTemplates[key].subject, intro: emailTemplates[key].intro }),
                            )
                          }
                        >
                          Reset to the default wording
                        </button>
                      ) : null}
                    </div>
                  </details>
                );
              })}
            </div>
          </section>

          <div className="editor-savebar">
            <span className={`editor-savebar-status${dirty ? " has-changes" : ""}`}>
              <span />
              {dirty ? "You have unsaved changes." : "All changes saved."}
            </span>
            <div>
              {dirty ? (
                <button className="btn btn-secondary" onClick={() => setValue(JSON.parse(baseline))} disabled={pending}>
                  Undo changes
                </button>
              ) : null}
              <button className="btn" onClick={save} disabled={!dirty || pending}>
                <Icon name="check" />
                {pending ? "Saving…" : "Save settings"}
              </button>
            </div>
          </div>
        </div>

        <aside className="settings-aside">
          <TestEmail defaultTo={user.email} disabled={!status.configured} />
          <RecentEmails />
        </aside>
      </div>
    </>
  );
}

function ConnectionBanner({
  status,
}: {
  status: { configured: boolean; live: boolean; testRecipient: string; from: string; webhook: boolean };
}) {
  if (!status.configured)
    return (
      <div className="settings-banner is-off">
        <Icon name="mail" />
        <div>
          <strong>Email isn't connected yet</strong>
          <p>Forms are still saved in the portal, but no emails are sent until the Resend API key is added on the server.</p>
        </div>
      </div>
    );
  return (
    <div className={`settings-banner ${status.live ? "is-live" : "is-test"}`}>
      <Icon name={status.live ? "check" : "shield"} />
      <div>
        <strong>{status.live ? "Email is on" : "Test mode"}</strong>
        <p>
          {status.live
            ? `Emails are sent from ${status.from}.`
            : `Emails are not sent to applicants or the team. Every email goes to ${status.testRecipient} instead, so you can check them safely.`}
          {status.webhook ? "" : " Delivery tracking isn't set up, so the log shows emails as Sent rather than Delivered."}
        </p>
      </div>
    </div>
  );
}

function SectionHeading({ icon, title, children }: { icon: "people" | "mail" | "book"; title: string; children: ReactNode }) {
  return (
    <div className="settings-heading">
      <span className="settings-heading-icon">
        <Icon name={icon} />
      </span>
      <div>
        <h2>{title}</h2>
        <p>{children}</p>
      </div>
    </div>
  );
}

function AddressList({ label, addresses, onChange }: { label: string; addresses: string[]; onChange: (value: string[]) => void }) {
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  function add() {
    const items = draft
      .split(/[\s,;]+/)
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean);
    if (!items.length) return;
    const invalid = items.find((item) => !emailPattern.test(item));
    if (invalid) return setError(`"${invalid}" isn't a valid email address.`);
    onChange([...new Set([...addresses, ...items])]);
    setDraft("");
    setError("");
  }
  function onKey(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      add();
    } else if (event.key === "Backspace" && !draft && addresses.length) onChange(addresses.slice(0, -1));
  }
  return (
    <div className="field address-list">
      <span>{label}</span>
      <div className="address-box">
        {addresses.map((address) => (
          <span className="address-chip" key={address}>
            {address}
            <button type="button" aria-label={`Remove ${address}`} onClick={() => onChange(addresses.filter((item) => item !== address))}>
              <Icon name="close" />
            </button>
          </span>
        ))}
        <input
          type="email"
          aria-label={`Add an address for ${label.toLowerCase()}`}
          placeholder={addresses.length ? "Add another…" : "name@soforaccu.com"}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={onKey}
          onBlur={add}
        />
      </div>
      {error ? (
        <small className="field-error" role="alert">
          {error}
        </small>
      ) : !addresses.length ? (
        <small>Nobody is notified yet. Type an address and press Enter.</small>
      ) : null}
    </div>
  );
}

function Toggle({
  template,
  value,
  update,
}: {
  template: EmailTemplate;
  value: EmailSettings;
  update: (change: (next: EmailSettings) => void) => void;
}) {
  const on = value.enabled[template];
  return (
    <label className="settings-toggle">
      <span>
        <strong>{emailTemplates[template].label.replace(/ \(.*\)$/, "")}</strong>
        <small>{emailTemplates[template].when}</small>
      </span>
      <input
        type="checkbox"
        role="switch"
        checked={on}
        onChange={(event) => update((next) => void (next.enabled[template] = event.target.checked))}
      />
    </label>
  );
}

function TestEmail({ defaultTo, disabled }: { defaultTo: string; disabled: boolean }) {
  const sendTest = useMutation(api.email.sendTest);
  const [to, setTo] = useState(defaultTo);
  const [template, setTemplate] = useState<EmailTemplate>("applicationReceived");
  const { run, message, pending } = useFeedback();
  return (
    <section className="panel settings-card">
      <SectionHeading icon="mail" title="Send a test email">
        Check how an email looks. Saved wording is used, so save your changes first.
      </SectionHeading>
      <form
        className="settings-body"
        onSubmit={(event) => {
          event.preventDefault();
          void run(() => sendTest({ to, template }), `Test email sent to ${to}. It should arrive within a minute.`);
        }}
      >
        {message}
        <Field label="Send to">
          <input type="email" required value={to} onChange={(event) => setTo(event.target.value)} />
        </Field>
        <Field label="Email">
          <select value={template} onChange={(event) => setTemplate(event.target.value as EmailTemplate)}>
            {emailTemplateKeys.map((key) => (
              <option value={key} key={key}>
                {emailTemplates[key].label}
              </option>
            ))}
          </select>
        </Field>
        <button className="btn btn-secondary settings-test-button" disabled={disabled || pending}>
          <Icon name="arrow" />
          {pending ? "Sending…" : "Send test email"}
        </button>
      </form>
    </section>
  );
}

function RecentEmails() {
  const emails = useQuery(api.email.recent);
  return (
    <section className="panel settings-card">
      <SectionHeading icon="book" title="Recent emails">
        The last 30 emails sent by the website.
      </SectionHeading>
      {emails === undefined ? (
        <p className="quiet settings-body">Loading…</p>
      ) : !emails.length ? (
        <p className="quiet settings-body">No emails sent yet.</p>
      ) : (
        <ul className="email-log">
          {emails.map((item) => (
            <li key={item.id} title={item.error ?? undefined}>
              <span className={`email-status email-status-${item.status}`}>{statusLabels[item.status] ?? item.status}</span>
              <strong>{item.subject}</strong>
              <small>
                {item.to} · {date(item.at)}
              </small>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
