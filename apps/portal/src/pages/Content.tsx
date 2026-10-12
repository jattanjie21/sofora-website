import { useState } from "react";
import { Link, useParams } from "react-router";
import type { WebsiteContent } from "../../../web/src/data/WebsiteContent";
import { useWorkspace } from "../data/WorkspaceProvider";
import { applyDocument, documents } from "../data/content";
import { can, type DocumentId } from "../data/types";
import {
  ActivityList,
  BackLink,
  date,
  EmptyState,
  Icon,
  PageHeader,
  useFeedback,
  useUnsavedChanges,
} from "../components/ui";
import { ContentFields } from "../components/ContentFields";
import { WebsitePreview } from "../components/WebsitePreview";

export function ContentList() {
  const { state, user } = useWorkspace();
  const [search, setSearch] = useState("");
  if (!can(user, "content:view"))
    return (
      <EmptyState title="Content access required">
        Ask your Administrator for content access.
      </EmptyState>
    );
  const entries = documents.filter((doc) =>
    `${doc.title} ${doc.description}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  return (
    <>
      <PageHeader title="Website content" />
      <div className="filter-bar">
        <label className="search-field">
          <span className="sr-only">Search website content</span>
          <input
            type="search"
            placeholder="Search pages…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
      </div>
      <div className="content-grid">
        {entries.map((doc) => {
          const entry = state.content.entries.find(
            (item) => item.id === doc.id,
          );
          return (
            <Link
              className={`content-card content-card-${doc.id}`}
              to={`/content/${doc.id}`}
              key={doc.id}
            >
              <h2>{doc.title}</h2>
              {entry ? (
                <span className="sr-only">{`Updated ${date(entry.updatedAt)}`}</span>
              ) : null}
            </Link>
          );
        })}
      </div>
      {!entries.length ? (
        <EmptyState title="No content found">Try a different search.</EmptyState>
      ) : null}
    </>
  );
}

export function ContentEditor() {
  const { id } = useParams();
  const { user } = useWorkspace();
  const doc = documents.find((item) => item.id === id);
  if (!can(user, "content:view"))
    return (
      <EmptyState title="Content access required">
        Your current role cannot access website content.
      </EmptyState>
    );
  if (!doc)
    return (
      <EmptyState
        title="Page not found"
        action={
          <Link className="btn" to="/content">
            Back to content
          </Link>
        }
      >
        Choose a page from the content library.
      </EmptyState>
    );
  return <Editor key={doc.id} id={doc.id} />;
}

function Editor({ id }: { id: DocumentId }) {
  const { state, user, saveContent } = useWorkspace();
  const doc = documents.find((item) => item.id === id)!;
  const entry = state.content.entries.find((item) => item.id === id)!;
  const [content, setContent] = useState<WebsiteContent>(() =>
    structuredClone(state.content.published),
  );
  const [revision, setRevision] = useState(entry.revision);
  const [baseline, setBaseline] = useState(() => JSON.stringify(content));
  const dirty = baseline !== JSON.stringify(content);
  const clearDirty = useUnsavedChanges(dirty);
  const [view, setView] = useState<"edit" | "preview">("edit");
  const { run, message, pending } = useFeedback();
  const editable = can(user, "content:edit");

  async function save() {
    if (
      await run(
        async () => setRevision(await saveContent(id, content, revision)),
        "Saved. The website is updated.",
      )
    ) {
      setBaseline(JSON.stringify(content));
      clearDirty();
    }
  }
  return (
    <>
      <BackLink to="/content">Website content</BackLink>
      <PageHeader eyebrow={doc.category} title={doc.title}>
        {doc.description}
      </PageHeader>
      {message}
      <div className="editor-layout">
        <div className="editor-main">
          <div className="editor-topbar">
            <div className="tabs" aria-label="Content view">
              {(
                [
                  ["edit", "Edit"],
                  ["preview", "Preview"],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  className={view === key ? "active" : ""}
                  aria-pressed={view === key}
                  onClick={() => setView(key)}
                >
                  {label}
                </button>
              ))}
            </div>
            <span className={`save-indicator${dirty ? " has-changes" : ""}`}>
              <span />
              {dirty ? "Unsaved changes" : "Saved"}
            </span>
          </div>
          {view === "edit" ? (
            <ContentFields
              id={id}
              content={content}
              onChange={setContent}
              disabled={!editable}
            />
          ) : (
            <WebsitePreview
              path={doc.path}
              content={applyDocument(state.content.published, content, id)}
              version={dirty ? "Unsaved changes" : "Live"}
            />
          )}
          {editable ? (
            <div className="editor-savebar">
              <span>
                {dirty
                  ? "Saving updates the public website straight away."
                  : "Everything is saved."}
              </span>
              <div>
                <button
                  className="btn"
                  onClick={save}
                  disabled={!dirty || pending}
                >
                  <Icon name="check" />
                  {pending ? "Saving…" : "Save"}
                </button>
              </div>
            </div>
          ) : null}
        </div>
        <aside className="editor-aside">
          <section className="panel">
            <div className="panel-body">
              <p className="kicker">Page activity</p>
              <ActivityList items={entry.history} limit={6} />
              <div className="last-published">
                Last updated
                <br />
                <strong>{date(entry.updatedAt)}</strong>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </>
  );
}
