import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { useState } from "react";
import { copyFields } from "../../../web/src/data/copy";
import { imageLibrary } from "../../../web/src/data/content";
import type { WebsiteContent } from "../../../web/src/data/WebsiteContent";
import type { DocumentId } from "../data/types";
import { Field, Icon } from "./ui";

function ImageField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
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
    } catch(error) {setError(error instanceof Error?error.message:"Photo upload failed.");}
    finally {setUploading(false);}
  }

  return (
    <div className="image-field">
      <img src={value.startsWith("storage:") ? resolved ?? "/images/sofora-logo.png" : value} alt="Current content image" />
      <div>
        <Field label={label}>
          <select
            value={value.startsWith("storage:") ? "custom" : value}
            onChange={(event) => onChange(event.target.value)}
          >
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
          <Icon name="plus" />
          <span>
            {uploading ? "Uploading…" : "Upload a photo"}
            <input
              type="file"
              disabled={uploading}
              accept="image/png,image/jpeg,image/webp"
              onChange={(event) => {
                upload(event.target.files?.[0]);
                event.target.value = "";
              }}
            />
          </span>
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

export function ContentFields({
  id,
  content,
  onChange,
  disabled,
}: {
  id: DocumentId;
  content: WebsiteContent;
  onChange: (content: WebsiteContent) => void;
  disabled: boolean;
}) {
  const [search, setSearch] = useState("");
  const fields = copyFields.filter(
    (field) =>
      field.page === id &&
      `${field.section} ${field.label} ${content.copy[field.key]}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  const sections = [...new Set(fields.map((field) => field.section))];
  function update(updateContent: (next: WebsiteContent) => void) {
    const next = structuredClone(content);
    updateContent(next);
    onChange(next);
  }
  return (
    <>
      <div className="editor-search">
        <Field label="Find a content field">
          <input
            type="search"
            placeholder="Search headings, paragraphs, labels…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </Field>
      </div>
      <fieldset disabled={disabled} className="editor-fields">
        {sections.map((section, index) => (
          <details
            className="editor-section"
            key={section}
            open={index === 0 || !!search}
          >
            <summary>
              <span>
                <span className="section-number">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {section.replace(
                  /^(Brand|Header|Footer|Layout)$/,
                  (label) =>
                    ({
                      Brand: "Brand identity",
                      Header: "Header & navigation",
                      Footer: "Footer",
                      Layout: "Page titles & descriptions",
                    })[label]!,
                )}
              </span>
              <Icon name="plus" />
            </summary>
            <div className="editor-section-body">
              {fields
                .filter((field) => field.section === section)
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
                      ) : (
                        <textarea
                          rows={content.copy[field.key].length > 100 ? 3 : 2}
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
            </div>
          </details>
        ))}
        {!fields.length ? (
          <p className="panel-empty">
            No matching copy fields. Try another search.
          </p>
        ) : null}
        {id === "loans" ? (
          <details className="editor-section" open>
            <summary>
              <span>Loan products</span>
              <Icon name="plus" />
            </summary>
            <div className="editor-section-body">
              {content.loans.map((product, index) => (
                <div className="repeat-item" key={product.id}>
                  <p className="kicker">
                    Loan {index + 1}
                  </p>
                  <Field label="Product name">
                    <input
                      value={product.title}
                      onChange={(event) =>
                        update((next) => {
                          next.loans[index]!.title = event.target.value;
                        })
                      }
                    />
                  </Field>
                  <Field label="Description">
                    <textarea
                      rows={3}
                      value={product.description}
                      onChange={(event) =>
                        update((next) => {
                          next.loans[index]!.description = event.target.value;
                        })
                      }
                    />
                  </Field>
                </div>
              ))}
            </div>
          </details>
        ) : null}
        {id === "contact" ? (
          <details className="editor-section" open>
            <summary>
              <span>Contact details</span>
              <Icon name="plus" />
            </summary>
            <div className="editor-section-body">
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
            </div>
          </details>
        ) : null}
        {id === "board" || id === "staff"
          ? ([id] as const).map((directory) => (
              <details className="editor-section" open key={directory}>
                <summary>
                  <span>
                    {directory === "board"
                      ? "Board of directors"
                      : "Staff and loan team"}
                  </span>
                  <Icon name="plus" />
                </summary>
                <div className="editor-section-body">
                  <p className="quiet">
                    These are the public website’s people listings, separate
                    from portal accounts.
                  </p>
                  {content[directory].map(([name, role, photo], index) => (
                    <div className="repeat-item" key={index}>
                      <div className="two-fields">
                        <Field label="Name">
                          <input
                            value={name}
                            onChange={(event) =>
                              update((next) => {
                                next[directory][index]![0] = event.target.value;
                              })
                            }
                          />
                        </Field>
                        <Field label="Role">
                          <input
                            value={role}
                            onChange={(event) =>
                              update((next) => {
                                next[directory][index]![1] = event.target.value;
                              })
                            }
                          />
                        </Field>
                      </div>
                      <ImageField
                        label="Photo"
                        value={photo}
                        onChange={(value) =>
                          update((next) => {
                            next[directory][index]![2] = value;
                          })
                        }
                      />
                      <button
                        className="text-button danger-text"
                        type="button"
                        onClick={() =>
                          update((next) => {
                            next[directory].splice(index, 1);
                          })
                        }
                      >
                        Remove person
                      </button>
                    </div>
                  ))}
                  <button
                    className="btn btn-secondary"
                    type="button"
                    onClick={() =>
                      update((next) => {
                        next[directory].push(["", "", "/images/board-modou-lamin-badjie.jpg"]);
                      })
                    }
                  >
                    <Icon name="plus" />
                    Add person
                  </button>
                </div>
              </details>
            ))
          : null}
        {id === "faq" ? (
          <details className="editor-section" open>
            <summary>
              <span>Frequently asked questions</span>
              <Icon name="plus" />
            </summary>
            <div className="editor-section-body">
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
            </div>
          </details>
        ) : null}
      </fieldset>
    </>
  );
}
