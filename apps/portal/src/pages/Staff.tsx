import { useState, type FormEvent } from "react";
import { useWorkspace } from "../data/WorkspaceProvider";
import { can, roleLabels, type Role, type StaffUser } from "../data/types";
import {
  Avatar,
  EmptyState,
  Field,
  Icon,
  Modal,
  PageHeader,
  useFeedback,
  useUnsavedChanges,
} from "../components/ui";

const roleDescriptions: Record<Role, string> = {
  admin: "Full access, staff management and final application decisions.",
  editor: "Edit website content. Saved changes go live straight away.",
  officer: "Record and review applications, add notes and recommend decisions.",
};
const roles = Object.keys(roleLabels) as Role[];
const newUser: StaffUser = {
  id: "",
  name: "",
  email: "",
  roles: ["editor"],
  active: true,
  loginEmail: "",
  activated: false,
};

export function Staff() {
  const { state, user, invite } = useWorkspace();
  const { run, message } = useFeedback();
  const [activationLink, setActivationLink] = useState("");
  const [editing, setEditing] = useState<StaffUser | null>(null);
  const [search, setSearch] = useState("");
  if (!can(user, "staff:manage"))
    return (
      <EmptyState title="Administrator access required">
        Only Administrators can manage staff and assign roles.
      </EmptyState>
    );
  const users = state.users.filter((person) =>
    `${person.name} ${person.email}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  return (
    <>
      <PageHeader
        eyebrow="The people behind the progress"
        title="Staff & roles"
        action={
          <button
            className="btn"
            onClick={() => setEditing(structuredClone(newUser))}
          >
            <Icon name="plus" />
            Add staff member
          </button>
        }
      >
        Give each teammate the access they need to do good work.
      </PageHeader>
      {message}
      {activationLink ? <section className="notice notice-success"><label className="field"><span>Activation link — share privately with this staff member</span><input readOnly value={activationLink} onFocus={event=>event.target.select()} /></label><button className="text-button" onClick={()=>setActivationLink("")}>Dismiss</button></section> : null}
      <div className="role-grid">
        {roles.map((role) => (
          <div className="role-card" key={role}>
            <span className="row-symbol">
              <Icon
                name={
                  role === "admin"
                    ? "shield"
                    : role === "officer"
                      ? "briefcase"
                      : "book"
                }
              />
            </span>
            <h2>{roleLabels[role]}</h2>
            <p>{roleDescriptions[role]}</p>
            <span className="subtle-tag">
              {
                state.users.filter(
                  (person) => person.active && person.roles.includes(role),
                ).length
              }{" "}
              active
            </span>
          </div>
        ))}
      </div>
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Your team</h2>
            <p className="quiet">A person can have more than one role.</p>
          </div>
          <label className="search-field">
            <span className="sr-only">Search staff</span>
            <input
              type="search"
              placeholder="Search your team…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
        </div>
        {users.length ? (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Staff member</th>
                  <th>Roles</th>
                  <th>Status</th>
                  <th>
                    <span className="sr-only">Manage</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((person) => (
                  <tr key={person.id}>
                    <td>
                      <div className="person-cell">
                        <Avatar name={person.name} />
                        <span>
                          <strong>
                            {person.name}
                            {person.id === user.id ? (
                              <span className="you-label">You</span>
                            ) : null}
                          </strong>
                          <small>{person.email}</small>
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="role-tags">
                        {person.roles.map((role) => (
                          <span
                            key={role}
                            className={`role-tag role-tag-${role}`}
                          >
                            {roleLabels[role]}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <span
                        className={`staff-status${person.active ? "" : " inactive"}`}
                      >
                        <span />
                        {person.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      {!person.activated && person.active ? <button className="text-button" onClick={()=>void run(async()=>{const token=await invite(person.id);setActivationLink(`${window.location.origin}/login#invitation=${encodeURIComponent(token)}&email=${encodeURIComponent(person.loginEmail)}`);},"Activation link created. It expires in seven days.")}>Create activation link</button> : null}
                      <button
                        className="btn btn-small btn-secondary"
                        onClick={() => setEditing(structuredClone(person))}
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="No teammates found">
            Try another name or email address.
          </EmptyState>
        )}
        <div className="table-footer">
          <span>{users.length} staff members</span>
          <span>Staff accounts · access managed by administrators</span>
        </div>
      </section>
      <div className="demo-footnote"><Icon name="people" /><p>Add a staff member, then create an activation link for them to set their password. Links must be shared privately; no email is sent automatically.</p></div>
      {editing ? (
        <StaffEditor initial={editing} onClose={() => setEditing(null)} />
      ) : null}
    </>
  );
}

function StaffEditor({
  initial,
  onClose,
}: {
  initial: StaffUser;
  onClose: () => void;
}) {
  const { saveUser, user } = useWorkspace();
  const [person, setPerson] = useState(initial);
  const [confirmClose, setConfirmClose] = useState(false);
  const dirty = JSON.stringify(person) !== JSON.stringify(initial);
  const clearDirty = useUnsavedChanges(dirty);
  const { run, message } = useFeedback();
  function close() {
    if (dirty) setConfirmClose(true);
    else onClose();
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (await run(() => saveUser(person), "Staff member saved.")) {
      clearDirty();
      onClose();
    }
  }
  return (
    <Modal
      title={
        initial.id
          ? `Manage ${initial.name.split(" ")[0]}`
          : "Add a staff member"
      }
      onClose={close}
    >
      {message}
      {confirmClose ? (
        <div className="notice notice-warning">
          <p>Discard the unsaved changes to this staff member?</p>
          <div className="modal-actions">
            <button
              className="btn btn-secondary"
              onClick={() => setConfirmClose(false)}
            >
              Keep editing
            </button>
            <button
              className="btn"
              onClick={() => {
                clearDirty();
                onClose();
              }}
            >
              Discard changes
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={submit}>
          <div className="two-fields">
            <Field label="Full name">
              <input
                required
                value={person.name}
                onChange={(event) =>
                  setPerson({ ...person, name: event.target.value })
                }
              />
            </Field>
            <Field label="Email address">
              <input
                required
                type="email"
                value={person.email}
                onChange={(event) =>
                  setPerson({ ...person, email: event.target.value })
                }
              />
            </Field>
          </div>
          <fieldset className="role-options">
            <legend>Assign roles</legend>
            {roles.map((role) => (
              <label
                className={`role-option${person.roles.includes(role) ? " selected" : ""}`}
                key={role}
              >
                <input
                  type="checkbox"
                  checked={person.roles.includes(role)}
                  onChange={(event) =>
                    setPerson({
                      ...person,
                      roles: event.target.checked
                        ? [...person.roles, role]
                        : person.roles.filter((item) => item !== role),
                    })
                  }
                />
                <span>
                  <strong>{roleLabels[role]}</strong>
                  <small>{roleDescriptions[role]}</small>
                </span>
              </label>
            ))}
          </fieldset>
          <label className="check-label">
            <input
              type="checkbox"
              checked={person.active}
              disabled={person.id === user.id}
              onChange={(event) =>
                setPerson({ ...person, active: event.target.checked })
              }
            />
            Active staff account
          </label>
          <p className="quiet">
            {person.id === user.id
              ? "Another Administrator must deactivate your account."
              : "Inactive accounts cannot access the workspace or receive new assignments."}{" "}
            Activated users retain their original sign-in email. This email is used for contact details.
          </p>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={close}>
              Cancel
            </button>
            <button className="btn" disabled={!person.roles.length}>
              {initial.id ? "Save changes" : "Add staff member"}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
