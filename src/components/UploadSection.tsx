"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { apiFetch } from "@/lib/api-client";

type UploadSectionProps = {
  onUploadComplete?: () => void;
  variant?: "page" | "modal";
};

const allowedExtensions = ["wav", "mp3", "aac", "m4a", "ogg"];
const allowedMimeTypes = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/x-wav", "audio/aac", "audio/mp4", "audio/ogg"];

export default function UploadSection({ onUploadComplete, variant = "page" }: UploadSectionProps) {
  const { user, signInWithGoogle } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [tags, setTags] = useState("");
  const [privacy, setPrivacy] = useState("link_only");
  const [status, setStatus] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [durationSeconds, setDurationSeconds] = useState<number | null>(null);

  const isAuthed = Boolean(user?.id);

  const fileExtension = file?.name.split(".").pop()?.toLowerCase() ?? "";
  const formatValid = file
    ? allowedExtensions.includes(fileExtension) ||
      allowedMimeTypes.includes(file.type) ||
      file.type.startsWith("audio/")
    : null;

  const lengthStatus = durationSeconds == null ? "Pending" : durationSeconds <= 60 ? "Ready" : "Too long";
  const formatStatus = formatValid == null ? "Pending" : formatValid ? "Ready" : "Unsupported";
  const tagsList = useMemo(
    () => tags.split(",").map((tag) => tag.trim()).filter(Boolean),
    [tags]
  );
  const tagsStatus = tagsList.length > 0 ? "Ready" : "Pending";
  const levelsStatus = uploading ? "Processing" : "Auto-level on upload";

  useEffect(() => {
    if (!file) {
      setDurationSeconds(null);
      return;
    }
    const url = URL.createObjectURL(file);
    const audio = new Audio(url);
    const onLoaded = () => {
      setDurationSeconds(Number.isFinite(audio.duration) ? audio.duration : null);
      URL.revokeObjectURL(url);
    };
    const onError = () => {
      setDurationSeconds(null);
      URL.revokeObjectURL(url);
    };
    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("error", onError);
    return () => {
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("error", onError);
      URL.revokeObjectURL(url);
    };
  }, [file]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus(null);

    if (!isAuthed) {
      setStatus("Sign in to upload.");
      return;
    }

    if (!file) {
      setStatus("Please choose an audio file.");
      return;
    }

    if (formatValid === false) {
      setStatus("Unsupported format. Use WAV/MP3/AAC.");
      return;
    }

    if (durationSeconds && durationSeconds > 60) {
      setStatus("Sound must be 60 seconds or less.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", name.trim() || file.name);
    formData.append("tags", tags);
    formData.append("privacy", privacy);

    setUploading(true);
    try {
      const response = await apiFetch("/sounds", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        setStatus(error.error ?? "Upload failed.");
        setUploading(false);
        return;
      }

      setFile(null);
      setName("");
      setTags("");
      setPrivacy("link_only");
      setStatus("Upload complete.");
      setUploading(false);
      if (onUploadComplete) {
        onUploadComplete();
      }
    } catch (error) {
      console.error("Upload failed", error);
      setStatus("Upload failed.");
      setUploading(false);
    }
  };

  const statusClass = (value: string) => {
    if (value === "Ready") {
      return "text-status-success";
    }
    if (value === "Unsupported" || value === "Too long") {
      return "text-status-error";
    }
    return "text-brand-warm";
  };

  const shellClass = variant === "modal" ? "space-y-4 sm:space-y-6" : "glass-card rounded-3xl p-8";
  const dropzoneClass =
    variant === "modal"
      ? "rounded-2xl border border-dashed border-brand-primary/50 bg-black/25 p-6 shadow-panel sm:p-8"
      : "rounded-2xl border border-dashed border-brand-primary/50 bg-black/25 p-8 shadow-panel";

  const body = (
    <div className={shellClass}>
      {variant === "modal" ? (
        <div className="flex justify-center sm:justify-end">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-accent/40 bg-brand-accent/10 px-4 py-2 text-xs font-semibold text-brand-accent shadow-soft">
            Max 60s - WAV / MP3 / AAC
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl space-y-2">
            <p className="text-sm uppercase tracking-[0.18em] text-brand-accent">Upload lab</p>
            <h2 className="text-3xl font-semibold text-white">Drop, tag, done.</h2>
            <p className="text-sm text-fg-muted">
              Drag-and-drop uploads with validation, fast tagging, and privacy defaults baked in.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-accent/40 bg-brand-accent/10 px-4 py-2 text-sm font-semibold text-brand-accent shadow-soft">
            Max 60s - WAV / MP3 / AAC
          </div>
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr,0.8fr]">
        <form onSubmit={handleSubmit} className={dropzoneClass}>
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-primary/15 text-brand-primary shadow-glow">
              UP
            </div>
            <div>
              <p className="text-lg font-semibold text-white">
                <span className="sm:hidden">Choose a file</span>
                <span className="hidden sm:inline">Drop files here</span>
              </p>
              <p className="text-sm text-fg-muted">
                <span className="sm:hidden">Tap to browse. We validate and level-match on upload.</span>
                <span className="hidden sm:inline">Drag your sounds or click to browse. We validate and level-match on upload.</span>
              </p>
            </div>
            <input
              type="file"
              accept="audio/*"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              className="text-xs text-fg-muted"
            />
            {file ? (
              <div className="text-xs text-fg-muted">
                <p>Selected: {file.name}</p>
                <p>
                  {file.type || "unknown"} - {(file.size / (1024 * 1024)).toFixed(2)} MB
                  {durationSeconds ? ` - ${durationSeconds.toFixed(1)}s` : ""}
                </p>
              </div>
            ) : null}
            <div className="grid w-full gap-3">
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Sound name"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-fg-muted focus-ring focus-visible:outline-none"
              />
              <input
                value={tags}
                onChange={(event) => setTags(event.target.value)}
                placeholder="Tags (comma-separated)"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-fg-muted focus-ring focus-visible:outline-none"
              />
              <div className="flex flex-wrap items-center gap-2">
                {["public", "link_only", "private"].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setPrivacy(value)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      privacy === value
                        ? "bg-brand-primary/20 text-brand-primary border border-brand-primary/40"
                        : "border border-white/10 bg-white/5 text-fg-muted"
                    }`}
                  >
                    {value.replace("_", "-")}
                  </button>
                ))}
              </div>
              {status ? <p className="text-xs text-brand-primary">{status}</p> : null}
              {isAuthed ? (
                <button
                  type="submit"
                  disabled={uploading}
                  className="rounded-full bg-gradient-to-r from-brand-primary via-brand-accent to-brand-warm px-5 py-2 text-sm font-semibold text-bg-base shadow-glow transition-transform duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {uploading ? "Uploading..." : "Upload sound"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => signInWithGoogle()}
                  className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5"
                >
                  Sign in to upload
                </button>
              )}
            </div>
          </div>
        </form>

        <div className="space-y-3 rounded-2xl border border-white/5 bg-bg-card/80 p-4 shadow-panel">
          <h4 className="text-lg font-semibold text-white">Validation checklist</h4>
          <div className="space-y-2">
            {[
              { label: "Length under 60s", status: lengthStatus },
              { label: "Format WAV/MP3/AAC", status: formatStatus },
              { label: "Levels normalized", status: levelsStatus },
              { label: "Tags and mood added", status: tagsStatus },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-3 py-2"
              >
                <span className="text-sm text-white">{item.label}</span>
                <span className={`text-xs ${statusClass(item.status)}`}>{item.status}</span>
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-white/5 bg-bg-surface/80 p-3">
            <p className="text-xs text-fg-muted">Tags</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {tagsList.length > 0 ? (
                tagsList.map((tag) => (
                  <span key={tag} className="rounded-full bg-brand-primary/10 px-3 py-1 text-xs text-brand-primary">
                    {tag}
                  </span>
                ))
              ) : (
                <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-fg-muted">No tags yet</span>
              )}
            </div>
          </div>
          <div className="rounded-xl border border-white/5 bg-bg-surface/80 p-3">
            <p className="text-xs text-fg-muted">Privacy</p>
            <div className="mt-2 flex gap-2 text-xs text-white">
              {["public", "link_only", "private"].map((value) => (
                <span
                  key={value}
                  className={`rounded-md px-3 py-1 ${
                    privacy === value
                      ? "bg-brand-primary/15 text-brand-primary"
                      : "bg-white/5 text-fg-muted"
                  }`}
                >
                  {value.replace("_", "-")}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (variant === "modal") {
    return <div>{body}</div>;
  }

  return (
    <section id="upload" className="container mx-auto px-6 pb-14">
      {body}
    </section>
  );
}
