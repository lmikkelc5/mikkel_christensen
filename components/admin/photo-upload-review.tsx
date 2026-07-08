"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

export type StagedAction = "skip" | "replace" | "import";

export type StagedDuplicate = {
  existingId: string;
  existingFile: string;
  existingTitle?: string;
  existingThumb: string;
  existingAddedAt: string;
  existingSize?: number;
  strategy: string;
};

export type StagedFile = {
  id: string;
  file: File;
  name: string;
  size: number;
  hash: string;
  status: "new" | "duplicate";
  duplicate?: StagedDuplicate;
  action: StagedAction;
  previewUrl: string;
};

type Progress = { active: boolean; done: number; total: number };

export function formatBytes(bytes?: number) {
  if (!bytes && bytes !== 0) return "Unknown";
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(1)} ${units[unitIndex]}`;
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

export function PhotoUploadReview({
  files,
  hashing,
  committing,
  onSetAction,
  onBatchDuplicateAction,
  onConfirm,
  onCancel
}: {
  files: StagedFile[];
  hashing: Progress;
  committing: Progress;
  onSetAction: (id: string, action: StagedAction) => void;
  onBatchDuplicateAction: (action: StagedAction) => void;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const [compareId, setCompareId] = useState<string>("");

  const duplicates = files.filter((file) => file.status === "duplicate");
  const newCount = files.length - duplicates.length;

  const willImport = files.filter(
    (file) => file.status === "new" || file.action === "import"
  ).length;
  const willReplace = files.filter((file) => file.action === "replace").length;
  const willSkip = duplicates.filter((file) => file.action === "skip").length;

  const compareFile = files.find((file) => file.id === compareId);
  const busy = hashing.active || committing.active;

  if (hashing.active) {
    return (
      <div className="surface space-y-3 p-5">
        <h2 className="text-lg font-semibold">Hashing photos…</h2>
        <ProgressBar done={hashing.done} total={hashing.total} />
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Computing SHA-256 fingerprints for {hashing.total} file{hashing.total === 1 ? "" : "s"} to detect duplicates.
        </p>
      </div>
    );
  }

  return (
    <div className="surface space-y-6 p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Upload summary</h2>
          <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
            <span className="font-medium text-[var(--color-foreground)]">{newCount}</span> new
            photo{newCount === 1 ? "" : "s"}
            {"  ·  "}
            <span className="font-medium text-[var(--color-foreground)]">{duplicates.length}</span>{" "}
            exact duplicate{duplicates.length === 1 ? "" : "s"}
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          className="text-sm text-[var(--color-muted-foreground)] underline disabled:opacity-50"
        >
          Cancel
        </button>
      </div>

      {duplicates.length > 0 ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium">Apply to all duplicates:</span>
            <Button type="button" variant="secondary" onClick={() => onBatchDuplicateAction("skip")} disabled={busy}>
              Skip all
            </Button>
            <Button type="button" variant="secondary" onClick={() => onBatchDuplicateAction("import")} disabled={busy}>
              Import all anyway
            </Button>
            <Button type="button" variant="secondary" onClick={() => onBatchDuplicateAction("replace")} disabled={busy}>
              Replace all
            </Button>
          </div>

          <div className="space-y-3">
            {duplicates.map((file) => (
              <div key={file.id} className="rounded-2xl border p-4">
                <div className="flex flex-wrap gap-4">
                  <div className="flex gap-3">
                    <Thumb src={file.duplicate?.existingThumb} label="Existing" />
                    <Thumb src={file.previewUrl} label="Uploaded" />
                  </div>

                  <div className="min-w-[220px] flex-1 space-y-1 text-sm">
                    <p>
                      <span className="text-[var(--color-muted-foreground)]">Existing: </span>
                      {file.duplicate?.existingTitle || file.duplicate?.existingFile}
                    </p>
                    <p className="text-[var(--color-muted-foreground)]">
                      {file.duplicate?.existingFile} · added {file.duplicate ? formatDate(file.duplicate.existingAddedAt) : ""} ·{" "}
                      {formatBytes(file.duplicate?.existingSize)}
                    </p>
                    <p className="pt-1">
                      <span className="text-[var(--color-muted-foreground)]">Uploaded: </span>
                      {file.name}
                    </p>
                    <p className="text-[var(--color-muted-foreground)]">{formatBytes(file.size)}</p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <ActionRadio
                      name={`action-${file.id}`}
                      value={file.action}
                      onChange={(action) => onSetAction(file.id, action)}
                      disabled={busy}
                    />
                    <button
                      type="button"
                      onClick={() => setCompareId(file.id)}
                      className="text-left text-sm text-[var(--color-accent)] underline"
                    >
                      Compare side-by-side
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {committing.active ? (
        <div className="space-y-2">
          <ProgressBar done={committing.done} total={committing.total} />
          <p className="text-sm text-[var(--color-muted-foreground)]">
            Uploading {committing.done} of {committing.total}…
          </p>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3 border-t pt-4">
        <Button type="button" onClick={onConfirm} disabled={busy || willImport + willReplace === 0}>
          {committing.active
            ? "Importing…"
            : `Import ${willImport} · Replace ${willReplace} · Skip ${willSkip}`}
        </Button>
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          className="text-sm text-[var(--color-muted-foreground)] underline disabled:opacity-50"
        >
          Discard upload
        </button>
      </div>

      {compareFile ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setCompareId("")}
        >
          <div
            className="surface max-h-[90vh] w-full max-w-4xl overflow-auto p-5"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Compare</h3>
              <button type="button" onClick={() => setCompareId("")} className="text-sm underline">
                Close
              </button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <figure className="space-y-2">
                <img
                  src={compareFile.duplicate?.existingThumb}
                  alt="Existing"
                  className="max-h-[70vh] w-full rounded-2xl object-contain"
                />
                <figcaption className="text-sm text-[var(--color-muted-foreground)]">
                  Existing · {compareFile.duplicate?.existingFile} · {formatBytes(compareFile.duplicate?.existingSize)}
                </figcaption>
              </figure>
              <figure className="space-y-2">
                <img
                  src={compareFile.previewUrl}
                  alt="Uploaded"
                  className="max-h-[70vh] w-full rounded-2xl object-contain"
                />
                <figcaption className="text-sm text-[var(--color-muted-foreground)]">
                  Uploaded · {compareFile.name} · {formatBytes(compareFile.size)}
                </figcaption>
              </figure>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Thumb({ src, label }: { src?: string; label: string }) {
  return (
    <div className="space-y-1 text-center">
      <img
        src={src}
        alt={label}
        className="h-20 w-20 rounded-xl border object-cover"
      />
      <p className="text-xs text-[var(--color-muted-foreground)]">{label}</p>
    </div>
  );
}

function ActionRadio({
  name,
  value,
  onChange,
  disabled
}: {
  name: string;
  value: StagedAction;
  onChange: (action: StagedAction) => void;
  disabled: boolean;
}) {
  const options: { value: StagedAction; label: string }[] = [
    { value: "skip", label: "Skip this photo" },
    { value: "replace", label: "Replace existing" },
    { value: "import", label: "Import anyway" }
  ];

  return (
    <div className="space-y-1">
      {options.map((option) => (
        <label key={option.value} className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            name={name}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            disabled={disabled}
          />
          {option.label}
        </label>
      ))}
    </div>
  );
}

function ProgressBar({ done, total }: { done: number; total: number }) {
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--color-accent-soft)]">
      <div
        className="h-full rounded-full bg-[var(--color-accent)] transition-[width]"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
