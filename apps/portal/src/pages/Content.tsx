import { useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import type { WebsiteContent } from "../../../web/src/data/WebsiteContent";
import { useWorkspace } from "../data/workspaceContext";
import { applyDocument, documents } from "../data/content";
import { can, type DocumentId } from "../data/types";
import {
  BackLink,
  date,
  EmptyState,
  Icon,
  PageHeader,
  useFeedback,
  useUnsavedChanges,
} from "../components/ui";
import { applySection, ContentFields, pageSections, sectionValue } from "../components/ContentFields";
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
  const query = search.trim().toLowerCase();
  const entries = documents.filter((doc) =>
    `${doc.title} ${doc.description} ${doc.category}`.toLowerCase().includes(query),
  );
  const groups = [...new Set(entries.map((doc) => doc.category))];
  return (
    <>
      <PageHeader title="Website content">
        Pick a page to change its text and photos. Saved changes go live straight away.
      </PageHeader>
      <div className="content-toolbar">
        <label className="content-search">
          <Icon name="search" />
          <span className="sr-only">Search website pages</span>
          <input
            type="search"
            placeholder="Search pages, e.g. loans, board, footer…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
        <span className="content-count">
          {entries.length} of {documents.length} pages
        </span>
      </div>
      {groups.map((group) => (
        <section className="content-group" key={group}>
          <h2>{groupLabels[group] ?? group}</h2>
          <div className="content-grid">
            {entries
              .filter((doc) => doc.category === group)
              .map((doc) => {
                const entry = state.content.entries.find((item) => item.id === doc.id);
                return (
                  <Link className="content-card" to={`/content/${doc.id}`} key={doc.id}>
                    <span className="content-card-icon">
                      <Icon name={groupIcons[group] ?? "book"} />
                    </span>
                    <span className="content-card-text">
                      <strong>{doc.title}</strong>
                      <small>{doc.description}</small>
                    </span>
                    <span className="content-card-foot">
                      <span>{entry ? `Updated ${date(entry.updatedAt)}` : "Not edited yet"}</span>
                      <span className="content-card-edit">
                        Edit <Icon name="arrow" />
                      </span>
                    </span>
                  </Link>
                );
              })}
          </div>
        </section>
      ))}
      {!entries.length ? (
        <EmptyState title="No pages found">Try a different search.</EmptyState>
      ) : null}
    </>
  );
}

const groupLabels: Record<string, string> = { "Public page": "Main pages", "Across the website": "Across the whole website" };
const groupIcons: Record<string, "home" | "people" | "briefcase" | "book" | "image" | "browser" | "user"> = {
  "Public page": "home",
  "About Us": "book",
  Team: "people",
  Services: "briefcase",
  Blog: "book",
  Gallery: "image",
  "Across the website": "browser",
};

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
  const sections = useMemo(() => pageSections(id), [id]);
  // `saved` is what the website shows; `content` also holds edits not saved yet. Each section saves on its own.
  const [saved, setSaved] = useState<WebsiteContent>(() => structuredClone(state.content.published));
  const [content, setContent] = useState(saved);
  const [revision, setRevision] = useState(entry.revision);
  const [active, setActive] = useState(0);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"edit" | "preview">("edit");
  const { run, message, pending } = useFeedback();
  // Which section the save message belongs to, so it doesn't follow you to other sections.
  const [messageFor, setMessageFor] = useState<number | null>(null);
  const editable = can(user, "content:edit");
  const changed = sections.map((section) => sectionValue(section, saved) !== sectionValue(section, content));
  const unsaved = changed.filter(Boolean).length;
  const clearDirty = useUnsavedChanges(unsaved > 0);
  const section = sections[active]!;

  const query = search.trim().toLowerCase();
  const matches = sections
    .map((item, index) => ({ item, index }))
    .filter(({ item }) =>
      `${item.title} ${item.fields.map((field) => `${field.label} ${content.copy[field.key]}`).join(" ")}`
        .toLowerCase()
        .includes(query),
    );

  function open(index: number) {
    setActive(index);
    setView("edit");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  async function save() {
    const next = applySection(saved, content, section);
    setMessageFor(active);
    if (await run(async () => setRevision(await saveContent(id, next, revision)), `Saved “${section.title}”. The website is updated.`)) {
      setSaved(next);
      if (unsaved === 1) clearDirty();
    }
  }
  return (
    <>
      <BackLink to="/content">Website content</BackLink>
      <PageHeader eyebrow={doc.category} title={doc.title}>
        Pick a section of the page, make your changes, then press <strong>Save this section</strong>. Saved
        changes go live on the website straight away.
      </PageHeader>
      <div className="page-editor">
        <aside className="section-menu" aria-label="Sections of this page">
          <p className="section-menu-title">Sections of this page</p>
          {sections.length > 6 ? (
            <label className="section-menu-search">
              <Icon name="search" />
              <span className="sr-only">Find a section</span>
              <input
                type="search"
                placeholder="Find, e.g. heading, phone…"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>
          ) : null}
          <ol>
            {matches.map(({ item, index }) => (
              <li key={item.title}>
                <button
                  type="button"
                  className={index === active ? "active" : ""}
                  aria-current={index === active ? "true" : undefined}
                  onClick={() => open(index)}
                >
                  <span className="section-number">{index + 1}</span>
                  <span className="section-menu-label">{item.title}</span>
                  {changed[index] ? (
                    <span className="section-menu-unsaved" title="Not saved yet">
                      <span className="sr-only">(not saved yet)</span>
                    </span>
                  ) : null}
                </button>
              </li>
            ))}
          </ol>
          {!matches.length ? <p className="section-menu-empty">Nothing matches. Try another word.</p> : null}
          <p className="section-menu-foot">
            {unsaved
              ? `${unsaved} ${unsaved === 1 ? "section has" : "sections have"} changes not saved yet (marked with a dot).`
              : `Last saved ${date(entry.updatedAt)}.`}
          </p>
        </aside>
        {/* On phones the menu above becomes this drop-down. */}
        <label className="section-select">
          <span>Section</span>
          <select value={active} onChange={(event) => open(Number(event.target.value))}>
            {sections.map((item, index) => (
              <option key={item.title} value={index}>
                {index + 1}. {item.title}
                {changed[index] ? " (not saved)" : ""}
              </option>
            ))}
          </select>
        </label>
        <div className="editor-main">
          <div className="editor-topbar">
            <div className="tabs editor-toggle" aria-label="Content view">
              {(
                [
                  ["edit", "Edit"],
                  ["preview", "Preview the page"],
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
          </div>
          {view === "edit" ? (
            <section className="editor-section section-card">
              <header className="section-card-head">
                <span className="section-number">{active + 1}</span>
                <div>
                  <h2>{section.title}</h2>
                  <small>
                    Section {active + 1} of {sections.length}
                  </small>
                </div>
              </header>
              <div className="editor-section-body">
                <ContentFields section={section} content={content} onChange={setContent} disabled={!editable} />
              </div>
              {messageFor === active ? <div className="section-card-message">{message}</div> : null}
              {editable ? (
                <div className="editor-savebar">
                  <span className={`editor-savebar-status${changed[active] ? " has-changes" : ""}`}>
                    <span />
                    {changed[active] ? "This section has changes that are not saved yet." : "Everything in this section is saved."}
                  </span>
                  <div>
                    {changed[active] ? (
                      <button
                        className="btn btn-secondary"
                        onClick={() => setContent(applySection(content, saved, section))}
                        disabled={pending}
                      >
                        Undo changes
                      </button>
                    ) : null}
                    <button className="btn" onClick={save} disabled={!changed[active] || pending}>
                      <Icon name="check" />
                      {pending ? "Saving…" : "Save this section"}
                    </button>
                  </div>
                </div>
              ) : null}
              <nav className="section-card-steps" aria-label="Other sections">
                {active > 0 ? (
                  <button type="button" className="text-button" onClick={() => open(active - 1)}>
                    <Icon name="chevronLeft" />
                    {sections[active - 1]!.title}
                  </button>
                ) : (
                  <span />
                )}
                {active < sections.length - 1 ? (
                  <button type="button" className="text-button" onClick={() => open(active + 1)}>
                    Next: {sections[active + 1]!.title}
                    <Icon name="chevronRight" />
                  </button>
                ) : null}
              </nav>
            </section>
          ) : (
            <WebsitePreview
              path={doc.path}
              content={applyDocument(state.content.published, content, id)}
              version={unsaved ? "Including changes not saved yet" : "Live"}
            />
          )}
        </div>
      </div>
    </>
  );
}
