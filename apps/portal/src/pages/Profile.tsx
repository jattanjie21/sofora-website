import { useState, type FormEvent } from "react";
import { useWorkspace } from "../data/WorkspaceProvider";
import { roleLabels } from "../data/types";
import {
  Avatar,
  Field,
  Icon,
  PageHeader,
  useFeedback,
  useUnsavedChanges,
} from "../components/ui";

export function Profile() {
  const { user, saveProfile } = useWorkspace();
  const [details, setDetails] = useState({
    name: user.name,
    email: user.email,
  });
  const dirty = details.name !== user.name || details.email !== user.email;
  const clearDirty = useUnsavedChanges(dirty);
  const { run, message, pending } = useFeedback();

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (await run(() => saveProfile(details), "Your profile has been saved.")) {
      setDetails({ name: details.name.trim(), email: details.email.trim() });
      clearDirty();
    }
  }

  return (
    <>
      <PageHeader eyebrow="Your space in Sofora" title="My profile">
        A few details that help your team know you.
      </PageHeader>
      {message}
      <div className="profile-layout">
        <aside className="panel profile-summary" aria-label="Your account">
          <Avatar name={user.name} large />
          <h2>{user.name}</h2>
          <p>{user.email}</p>
          <span className="staff-status">
            <span /> Active staff account
          </span>
          <div className="profile-access">
            <h3>
              <Icon name="shield" /> Your workspace roles
            </h3>
            <div className="role-tags">
              {user.roles.map((role) => (
                <span className={`role-tag role-tag-${role}`} key={role}>
                  {roleLabels[role]}
                </span>
              ))}
            </div>
            <p>Your administrator manages your roles and workspace access.</p>
          </div>
        </aside>
        <section
          className="panel profile-details"
          aria-labelledby="profile-details-title"
        >
          <div className="panel-heading">
            <div>
              <h2 id="profile-details-title">Personal details</h2>
              <p className="quiet">
                Keep your name and contact email up to date.
              </p>
            </div>
            <Icon name="people" />
          </div>
          <form className="panel-body" onSubmit={submit}>
            <Field label="Full name">
              <input
                name="name"
                disabled={pending}
                autoComplete="name"
                required
                value={details.name}
                onChange={(event) =>
                  setDetails({ ...details, name: event.target.value })
                }
              />
            </Field>
            <Field
              label="Email address"
              hint={`Contact email. Your sign-in email is ${user.loginEmail}.`}
            >
              <input
                name="email"
                disabled={pending}
                type="email"
                autoComplete="email"
                required
                value={details.email}
                onChange={(event) =>
                  setDetails({ ...details, email: event.target.value })
                }
              />
            </Field>
            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                disabled={!dirty || pending}
                onClick={() => {
                  setDetails({ name: user.name, email: user.email });
                  clearDirty();
                }}
              >
                Discard changes
              </button>
              <button className="btn" disabled={!dirty || pending}>
                Save changes <Icon name="check" />
              </button>
            </div>
          </form>
        </section>
      </div>
      <div className="demo-footnote">
        <Icon name="people" />
        <p>Profile changes are shared with your Sofora team.</p>
      </div>
    </>
  );
}
