import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { Fragment, useState } from "react";
import { copyFields, defaultCopy, type CopyField } from "../../../web/src/data/copy";
import { emptyPerson, imageLibrary, slugify, uniqueSlug, type Person } from "../../../web/src/data/content";
import type { WebsiteContent } from "../../../web/src/data/WebsiteContent";
import { productFields } from "../data/content";
import { useWorkspace } from "../data/workspaceContext";
import type { DocumentId } from "../data/types";
import { Field, Icon } from "./ui";
import { Bone } from "./Skeleton";
import { readableError } from "../../../web/src/data/errors";

// Labels, buttons and other one-liners get a single-line box; paragraphs get a box that grows as you type.
const isShort = (text = "") => text.length <= 60 && !text.includes("\n");

function ImageField({
  label,
  value,
  onChange,
  noneLabel,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  // When given, adds a choice for no image (stored as an empty value).
  noneLabel?: string;
}) {
  const [error, setError] = useState("");
  const uploadUrl = useMutation(api.media.uploadUrl);
  const register = useMutation(api.media.register);
  const resolved = useQuery(api.media.url, value.startsWith("storage:") ? { storageId: value.slice(8) as Id<"_storage"> } : "skip");
  const [uploading,setUploading] = useState(false);
  async function upload(file?: File) {
    if (!file) return;
    setError("");
    if (
      !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
      file.size > 2 * 1024 * 1024
    ) {
      setError(
        "Choose a PNG, JPEG or WebP photo up to 2 MB.",
      );
      return;
    }
    setUploading(true);
    try {
      const url=await uploadUrl();
      const response=await fetch(url,{method:"POST",headers:{"Content-Type":file.type},body:file});
      if(!response.ok) throw new Error("Photo upload failed. Please try again.");
      const {storageId}=await response.json();
      onChange(await register({storageId}));
    } catch(error) {setError(readableError(error,"Photo upload failed. Please try again."));}
    finally {setUploading(false);}
  }

  return (
    <div className="image-field">
      {value.startsWith("storage:") && resolved === undefined ? (
        <Bone />
      ) : value ? (
        <img src={value.startsWith("storage:") ? resolved ?? "/images/sofora-logo.png" : value} alt="Current content image" />
      ) : (
        <span className="image-field-empty">No image</span>
      )}
      <div>
        <Field label={label}>
          <select
            value={value.startsWith("storage:") ? "custom" : value}
            onChange={(event) => onChange(event.target.value)}
          >
            {noneLabel ? <option value="">{noneLabel}</option> : null}
            {imageLibrary.map((image) => (
              <option key={image.path} value={image.path}>
                {image.title}
              </option>
            ))}
            {value.startsWith("storage:") ? (
              <option value="custom">Uploaded photo</option>
            ) : null}
          </select>
        </Field>
        <label className="upload-control">
          <span className="btn btn-secondary btn-small">
            <Icon name="plus" />
            {uploading ? "Uploading…" : "Upload a photo"}
          </span>
          <input
            className="sr-only"
              type="file"
              disabled={uploading}
              accept="image/png,image/jpeg,image/webp"
              onChange={(event) => {
                upload(event.target.files?.[0]);
                event.target.value = "";
              }}
            />
        </label>
        <small>PNG, JPEG or WebP · up to 2 MB</small>
        {error ? (
          <p className="field-error" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}

type ListKey = "loans" | "savings" | "faqs" | "contact" | "board" | "staff" | "partners";
// One entry of the editor's section menu: some text fields, and maybe one of the page's lists.
export type EditorSection = { title: string; fields: CopyField[]; list?: ListKey };

// A page's list joins its text section of the same name, or gets its own section after the page header.
const pageLists: Partial<Record<DocumentId, [ListKey, string]>> = {
  loans: ["loans", "Loan products"],
  saving: ["savings", "Savings products"],
  faq: ["faqs", "Questions"],
  contact: ["contact", "Details"],
  board: ["board", "Board members"],
  staff: ["staff", "Staff members"],
  partners: ["partners", "Partner cards"],
};
const sectionTitles: Record<string, string> = {
  Brand: "Brand identity",
  Header: "Header & navigation",
  Layout: "Page titles & descriptions",
};

export function pageSections(id: DocumentId): EditorSection[] {
  const sections: EditorSection[] = [];
  for (const field of copyFields.filter((field) => field.page === id)) {
    const title = sectionTitles[field.section] ?? field.section;
    const section = sections.find((item) => item.title === title);
    if (section) section.fields.push(field);
    else sections.push({ title, fields: [field] });
  }
  const list = pageLists[id];
  if (list) {
    const section = sections.find((item) => item.title === list[1]);
    if (section) section.list = list[0];
    else sections.splice(sections[0]?.title === "Page header" ? 1 : 0, 0, { title: list[1], fields: [], list: list[0] });
  }
  return sections;
}

// What a section holds, to tell whether it has unsaved changes.
export const sectionValue = (section: EditorSection, content: WebsiteContent) =>
  JSON.stringify([section.fields.map((field) => content.copy[field.key]), section.list ? content[section.list] : null]);

// `target` with this section's values taken from `source`.
export function applySection(target: WebsiteContent, source: WebsiteContent, section: EditorSection) {
  const next = structuredClone(target);
  for (const field of section.fields) next.copy[field.key] = source.copy[field.key];
  if (section.list) (next as Record<string, unknown>)[section.list] = structuredClone(source[section.list]);
  return next;
}

export function ContentFields({
  section,
  content,
  onChange,
  disabled,
}: {
  section: EditorSection;
  content: WebsiteContent;
  onChange: (content: WebsiteContent) => void;
  disabled: boolean;
}) {
  // People already on the live site keep their page address when renamed.
  const { published } = useWorkspace().state.content;
  const savedSlugs = {
    board: new Set(published.board.map((p) => p.slug)),
    staff: new Set(published.staff.map((p) => p.slug)),
  };
  const list = section.list;
  function update(updateContent: (next: WebsiteContent) => void) {
    const next = structuredClone(content);
    updateContent(next);
    onChange(next);
  }
  return (
    <fieldset disabled={disabled} className="editor-fields">
              {section.fields
                .map((field) =>
                  field.kind === "image" ? (
                    <ImageField
                      key={field.key}
                      label={field.label}
                      value={content.copy[field.key]}
                      onChange={(value) =>
                        update((next) => {
                          next.copy[field.key] = value;
                        })
                      }
                    />
                  ) : (
                    <Field key={field.key} label={field.label}>
                      {field.kind === "url" ? (
                        <input
                          type="url"
                          value={content.copy[field.key]}
                          onChange={(event) =>
                            update((next) => {
                              next.copy[field.key] = event.target.value;
                            })
                          }
                        />
                      ) : isShort(defaultCopy[field.key]) ? (
                        <input
                          type="text"
                          value={content.copy[field.key]}
                          onChange={(event) =>
                            update((next) => {
                              next.copy[field.key] = event.target.value;
                            })
                          }
                        />
                      ) : (
                        <textarea
                          className="auto-grow"
                          rows={2}
                          value={content.copy[field.key]}
                          onChange={(event) =>
                            update((next) => {
                              next.copy[field.key] = event.target.value;
                            })
                          }
                        />
                      )}
                    </Field>
                  ),
                )}
        {list === "loans" || list === "savings"
          ? ([list] as const).map((list) => (
                <Fragment key={list}>
                  <p className="quiet">
                    Each product has its own page on the website. Lists take one item per line.
                  </p>
                  {content[list].map((product, index) => (
                    <details className="repeat-item" key={product.id}>
                      <summary className="repeat-summary">
                        {product.title || `Product ${index + 1}`}
                        <Icon name="plus" />
                      </summary>
                      {productFields.map(([key, label]) => (
                        <Field key={key} label={label}>
                          {key === "title" ? (
                            <input
                              value={product[key]}
                              onChange={(event) =>
                                update((next) => {
                                  next[list][index]![key] = event.target.value;
                                })
                              }
                            />
                          ) : (
                            <textarea
                              rows={key === "description" || key === "audience" ? 3 : 5}
                              value={product[key]}
                              onChange={(event) =>
                                update((next) => {
                                  next[list][index]![key] = event.target.value;
                                })
                              }
                            />
                          )}
                        </Field>
                      ))}
                    </details>
                  ))}
                </Fragment>
            ))
          : null}
        {list === "contact" ? (
          <>
              <Field label="Email address">
                <input
                  type="email"
                  value={content.contact.email}
                  onChange={(event) =>
                    update((next) => {
                      next.contact.email = event.target.value;
                    })
                  }
                />
              </Field>
              <Field label="Office address">
                <textarea
                  value={content.contact.address}
                  onChange={(event) =>
                    update((next) => {
                      next.contact.address = event.target.value;
                    })
                  }
                />
              </Field>
              <Field
                label="Telephone numbers"
                hint="One number per line. The first is used in the website header and footer."
              >
                <textarea
                  rows={5}
                  value={content.contact.phones.join("\n")}
                  onChange={(event) =>
                    update((next) => {
                      next.contact.phones = event.target.value.split("\n");
                    })
                  }
                />
              </Field>
          </>
        ) : null}
        {list === "board" || list === "staff"
          ? ([list] as const).map((directory) => {
              const base = directory === "board" ? "/board-of-directors/" : "/staff/";
              const list = content[directory];
              return (
                <Fragment key={directory}>
                    <p className="quiet">
                      Each person has their own page on the website, opened from their card. These listings are
                      separate from portal accounts. Biographies take a blank line between paragraphs.
                    </p>
                    {list.map((person, index) => {
                      const isNew = !savedSlugs[directory].has(person.slug);
                      const set = (change: (p: Person) => void) =>
                        update((next) => change(next[directory][index]!));
                      return (
                        <details className="repeat-item" key={index} open={isNew || undefined}>
                          <summary className="repeat-summary">
                            <span>
                              {person.name || "New person"}
                              {person.role ? <small> · {person.role}</small> : null}
                            </span>
                            <Icon name="plus" />
                          </summary>
                          <div className="two-fields">
                            <Field label="Name">
                              <input
                                value={person.name}
                                onChange={(event) =>
                                  update((next) => {
                                    const p = next[directory][index]!;
                                    p.name = event.target.value;
                                    // New people get their page address from the name; saved ones keep theirs so links still work.
                                    if (isNew)
                                      p.slug = uniqueSlug(
                                        slugify(p.name),
                                        next[directory].filter((_, i) => i !== index).map((o) => o.slug),
                                      );
                                  })
                                }
                              />
                            </Field>
                            <Field label="Role">
                              <input value={person.role} onChange={(event) => set((p) => void (p.role = event.target.value))} />
                            </Field>
                          </div>
                          <Field
                            label="Page address"
                            hint={
                              isNew
                                ? `Filled in from the name. The page will be at ${base}${person.slug || "…"}/`
                                : `The page is at ${base}${person.slug}/. Changing this breaks links to the old address.`
                            }
                          >
                            <input
                              value={person.slug}
                              onChange={(event) =>
                                set((p) => void (p.slug = event.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, "-")))
                              }
                            />
                          </Field>
                          <ImageField label="Photo" value={person.photo} onChange={(value) => set((p) => void (p.photo = value))} />
                          <Field label="Quote (optional)">
                            <textarea rows={2} value={person.quote} onChange={(event) => set((p) => void (p.quote = event.target.value))} />
                          </Field>
                          <Field label="Biography">
                            <textarea rows={6} value={person.bio} onChange={(event) => set((p) => void (p.bio = event.target.value))} />
                          </Field>
                          <Field label={directory === "board" ? "Responsibilities (one per line)" : "How they can help (one per line)"}>
                            <textarea rows={4} value={person.focus} onChange={(event) => set((p) => void (p.focus = event.target.value))} />
                          </Field>
                          <div className="two-fields">
                            <Field label={directory === "board" ? "On the board since (optional)" : "With Sofora since (optional)"}>
                              <input value={person.since} placeholder="e.g. 2019" onChange={(event) => set((p) => void (p.since = event.target.value))} />
                            </Field>
                            <Field label="Email (optional)">
                              <input type="email" value={person.email} onChange={(event) => set((p) => void (p.email = event.target.value.trim()))} />
                            </Field>
                          </div>
                          <div className="repeat-actions">
                            <button
                              className="text-button"
                              type="button"
                              disabled={index === 0}
                              onClick={() => update((next) => void next[directory].splice(index - 1, 0, next[directory].splice(index, 1)[0]!))}
                            >
                              Move up
                            </button>
                            <button
                              className="text-button"
                              type="button"
                              disabled={index === list.length - 1}
                              onClick={() => update((next) => void next[directory].splice(index + 1, 0, next[directory].splice(index, 1)[0]!))}
                            >
                              Move down
                            </button>
                            <button
                              className="text-button danger-text"
                              type="button"
                              onClick={() => update((next) => void next[directory].splice(index, 1))}
                            >
                              Remove person
                            </button>
                          </div>
                        </details>
                      );
                    })}
                    <button
                      className="btn btn-secondary"
                      type="button"
                      onClick={() => update((next) => void next[directory].push({ ...emptyPerson }))}
                    >
                      <Icon name="plus" />
                      Add person
                    </button>
                </Fragment>
              );
            })
          : null}
        {list === "partners" ? (
          <>
              <p className="quiet">
                Shown as cards in this order. A partner with a website opens it in a new tab; without a logo, the
                short name is shown instead.
              </p>
              {content.partners.map((partner, index) => (
                <div className="repeat-item" key={index}>
                  <div className="two-fields">
                    <Field label="Short name">
                      <input
                        value={partner.name}
                        onChange={(event) =>
                          update((next) => {
                            next.partners[index]!.name = event.target.value;
                          })
                        }
                      />
                    </Field>
                    <Field label="Website (optional)">
                      <input
                        type="url"
                        placeholder="https://"
                        value={partner.url}
                        onChange={(event) =>
                          update((next) => {
                            next.partners[index]!.url = event.target.value.trim();
                          })
                        }
                      />
                    </Field>
                  </div>
                  <Field label="Full name">
                    <input
                      value={partner.fullName}
                      onChange={(event) =>
                        update((next) => {
                          next.partners[index]!.fullName = event.target.value;
                        })
                      }
                    />
                  </Field>
                  <ImageField
                    label="Logo"
                    noneLabel="No logo (show the short name)"
                    value={partner.logo}
                    onChange={(value) =>
                      update((next) => {
                        next.partners[index]!.logo = value;
                      })
                    }
                  />
                  <div className="repeat-actions">
                    <button
                      className="text-button"
                      type="button"
                      disabled={index === 0}
                      onClick={() =>
                        update((next) => {
                          next.partners.splice(index - 1, 0, next.partners.splice(index, 1)[0]!);
                        })
                      }
                    >
                      Move up
                    </button>
                    <button
                      className="text-button"
                      type="button"
                      disabled={index === content.partners.length - 1}
                      onClick={() =>
                        update((next) => {
                          next.partners.splice(index + 1, 0, next.partners.splice(index, 1)[0]!);
                        })
                      }
                    >
                      Move down
                    </button>
                    <button
                      className="text-button danger-text"
                      type="button"
                      onClick={() =>
                        update((next) => {
                          next.partners.splice(index, 1);
                        })
                      }
                    >
                      Remove partner
                    </button>
                  </div>
                </div>
              ))}
              <button
                className="btn btn-secondary"
                type="button"
                onClick={() =>
                  update((next) => {
                    next.partners.push({ name: "", fullName: "", logo: "", url: "" });
                  })
                }
              >
                <Icon name="plus" />
                Add partner
              </button>
          </>
        ) : null}
        {list === "faqs" ? (
          <>
              {content.faqs.map((faq, index) => (
                <div className="repeat-item" key={index}>
                  <Field label={`Question ${index + 1}`}>
                    <input
                      value={faq.question}
                      onChange={(event) =>
                        update((next) => {
                          next.faqs[index]!.question = event.target.value;
                        })
                      }
                    />
                  </Field>
                  <Field label="Answer">
                    <textarea
                      rows={4}
                      value={faq.answer}
                      onChange={(event) =>
                        update((next) => {
                          next.faqs[index]!.answer = event.target.value;
                        })
                      }
                    />
                  </Field>
                  <button
                    className="text-button danger-text"
                    type="button"
                    onClick={() =>
                      update((next) => {
                        next.faqs.splice(index, 1);
                      })
                    }
                  >
                    Remove question
                  </button>
                </div>
              ))}
              <button
                className="btn btn-secondary"
                type="button"
                onClick={() =>
                  update((next) => {
                    next.faqs.push({ question: "", answer: "" });
                  })
                }
              >
                <Icon name="plus" />
                Add question
              </button>
          </>
        ) : null}
    </fieldset>
  );
}
