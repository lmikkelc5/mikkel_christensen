import crypto from "node:crypto";

import type { PhotoRecord } from "./photo-types";

/**
 * Signature describing an incoming upload, used to compare against the library.
 * Additional fields (e.g. a perceptual hash) can be added later without
 * changing the strategy interface.
 */
export type UploadSignature = {
  name: string;
  size: number;
  hash: string;
};

export type DuplicateMatchType = "exact" | "perceptual" | "near";

export type DuplicateMatch = {
  /** Category of match, so the UI can render exact vs. near duplicates differently. */
  type: DuplicateMatchType;
  /** Which strategy produced the match, useful for debugging and future tuning. */
  strategy: string;
  /** The id of the existing library photo that the upload matched. */
  existingId: string;
};

/**
 * A duplicate detection strategy. To add a new method later (perceptual hash,
 * near-duplicate, burst detection, etc.) implement this interface and register
 * it in `duplicateStrategies`. The upload workflow does not need to change.
 */
export interface DuplicateStrategy {
  name: string;
  type: DuplicateMatchType;
  findMatch(signature: UploadSignature, existing: PhotoRecord[]): string | null;
}

/** Compute a SHA-256 hex digest for a file buffer. */
export function hashBuffer(buffer: Buffer): string {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

const exactHashStrategy: DuplicateStrategy = {
  name: "sha256-exact",
  type: "exact",
  findMatch(signature, existing) {
    if (!signature.hash) return null;
    const match = existing.find((record) => record.hash && record.hash === signature.hash);
    return match ? match.id : null;
  }
};

/**
 * Ordered list of active strategies. Earlier strategies win. For now only
 * exact SHA-256 matching is enabled; append additional strategies here to
 * extend detection.
 */
export const duplicateStrategies: DuplicateStrategy[] = [exactHashStrategy];

/** Run all registered strategies and return the first match, if any. */
export function findDuplicate(
  signature: UploadSignature,
  existing: PhotoRecord[]
): DuplicateMatch | null {
  for (const strategy of duplicateStrategies) {
    const existingId = strategy.findMatch(signature, existing);
    if (existingId) {
      return { type: strategy.type, strategy: strategy.name, existingId };
    }
  }
  return null;
}
