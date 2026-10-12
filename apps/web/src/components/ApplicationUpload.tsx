import { useMutation } from "convex/react";
import { useState } from "react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { useWebsite } from "../data/WebsiteContent";
import { Icon } from "./Icon";

const accept = "image/png,image/jpeg,image/webp,application/pdf";
const maxBytes = 5 * 1024 * 1024;

export type ApplicationUploadRole = "id" | "photo";

export function ApplicationUpload({
  label,
  hint,
  requestId,
  role,
  storageId,
  onChange,
  disabled,
}: {
  label: string;
  hint: string;
  requestId: string;
  role: ApplicationUploadRole;
  storageId: Id<"_storage"> | "";
  onChange: (storageId: Id<"_storage"> | "") => void;
  disabled?: boolean;
}) {
  const { copy: c } = useWebsite();
  const uploadUrl = useMutation(api.applications.uploadUrl);
  const registerUpload = useMutation(api.applications.registerUpload);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState("");

  async function upload(file?: File) {
    if (!file || disabled) return;
    setError("");
    if (!accept.split(",").includes(file.type) || file.size > maxBytes) {
      setError(c["shared.forms-upload-invalid"]);
      return;
    }
    setUploading(true);
    try {
      const url = await uploadUrl({ requestId, role });
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!response.ok) throw new Error(c["shared.forms-upload-failed"]);
      const { storageId: uploaded } = (await response.json()) as { storageId: Id<"_storage"> };
      await registerUpload({ requestId, role, storageId: uploaded });
      onChange(uploaded);
      setPreview(file.type === "application/pdf" ? "" : URL.createObjectURL(file));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : c["shared.forms-upload-failed"]);
      onChange("");
    } finally {
      setUploading(false);
    }
  }

  function clear() {
    onChange("");
    setPreview("");
    setError("");
  }

  const done = !!storageId;
  const inactive = disabled || uploading;

  return (
    <div className={`application-upload${done ? " application-upload-done" : ""}${inactive ? " application-upload-inactive" : ""}`}>
      <label className="application-upload-hit">
        <input
          type="file"
          accept={accept}
          disabled={inactive}
          onChange={(event) => {
            void upload(event.target.files?.[0]);
            event.target.value = "";
          }}
        />
        <p className="application-upload-label">{label}</p>
        <p className="application-upload-hint">{hint}</p>
        {uploading ? <p className="application-upload-status">{c["shared.forms-uploading"]}</p> : null}
        {!uploading && done && preview ? (
          <img className="application-upload-preview" src={preview} alt="" />
        ) : null}
        {!uploading && done && !preview ? (
          <p className="application-upload-file">
            <Icon name="check" />
            {c["shared.forms-uploaded"]}
          </p>
        ) : null}
      </label>
      {done ? (
        <button type="button" className="text-button application-upload-clear" disabled={inactive} onClick={clear}>
          {c["shared.forms-upload-remove"]}
        </button>
      ) : null}
      {error ? (
        <p className="field-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
