/**
 * WINNOWING ALGORITHM
 * -------------------
 * The same core technique used by MOSS and Turnitin.
 * 
 * How it works:
 *  1. Normalize text (lowercase, strip punctuation/spaces)
 *  2. Slice into overlapping k-grams (character substrings of length k)
 *  3. Hash each k-gram
 *  4. Slide a window of size w across the hashes
 *  5. In each window, keep the MINIMUM hash (the "fingerprint")
 *  6. The set of all selected minimums = the document's fingerprint
 * 
 * Two documents sharing copied passages will share fingerprints.
 */

export interface WinnowResult {
  fingerprints: Set<number>;       // unique hashes selected
  fingerprintPositions: Map<number, number[]>; // hash → char positions in original
}

/**
 * Fast polynomial rolling hash (Rabin-Karp style).
 * Returns a positive 32-bit integer.
 */
function hashKGram(s: string): number {
  let h = 0x811c9dc5; // FNV offset basis
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = (Math.imul(h, 0x01000193) >>> 0); // FNV prime, keep unsigned
  }
  return h >>> 0;
}

/**
 * Normalize text before fingerprinting.
 * Strips punctuation, whitespace, lowercases — so
 * "Hello, World!" and "hello world" produce the same k-grams.
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ""); // keep only alphanumeric
}

/**
 * Core winnowing function.
 * 
 * @param text    Raw document text
 * @param k       K-gram size (recommended: 5–7 for prose, 4 for code)
 * @param w       Window size (recommended: 4–8)
 */
export function winnow(text: string, k = 5, w = 4): WinnowResult {
  const normalized = normalizeText(text);
  const fingerprints = new Set<number>();
  const fingerprintPositions = new Map<number, number[]>();

  if (normalized.length < k) {
    return { fingerprints, fingerprintPositions };
  }

  // Step 1: compute hashes for all k-grams
  const kgramHashes: number[] = [];
  for (let i = 0; i <= normalized.length - k; i++) {
    kgramHashes.push(hashKGram(normalized.slice(i, i + k)));
  }

  // Step 2: slide window, pick minimum in each position
  let prevMin = -1;
  let prevMinIdx = -1;

  for (let i = 0; i <= kgramHashes.length - w; i++) {
    const window = kgramHashes.slice(i, i + w);
    const minVal = Math.min(...window);
    // pick rightmost occurrence of minimum in window
    const localIdx = window.lastIndexOf(minVal);
    const globalIdx = i + localIdx;

    if (globalIdx !== prevMinIdx) {
      prevMin = minVal;
      prevMinIdx = globalIdx;
      fingerprints.add(minVal);

      if (!fingerprintPositions.has(minVal)) {
        fingerprintPositions.set(minVal, []);
      }
      fingerprintPositions.get(minVal)!.push(globalIdx);
    }
  }

  return { fingerprints, fingerprintPositions };
}

/**
 * Compare two documents using Winnowing.
 * Returns similarity 0–100 and the matched fingerprints.
 * 
 * Uses Jaccard similarity on fingerprint sets:
 *   similarity = |A ∩ B| / |A ∪ B|
 */
export function compareWithWinnowing(
  textA: string,
  textB: string,
  k = 5,
  w = 4
): {
  similarity: number;        // 0–100
  matchedFingerprints: number[];
  totalA: number;
  totalB: number;
  shared: number;
} {
  const { fingerprints: fpA } = winnow(textA, k, w);
  const { fingerprints: fpB } = winnow(textB, k, w);

  const intersection: number[] = [];
  for (const h of fpA) {
    if (fpB.has(h)) intersection.push(h);
  }

  const unionSize = fpA.size + fpB.size - intersection.length;
  const jaccard = unionSize === 0 ? 0 : intersection.length / unionSize;

  return {
    similarity: Math.round(jaccard * 100),
    matchedFingerprints: intersection,
    totalA: fpA.size,
    totalB: fpB.size,
    shared: intersection.length,
  };
}

/**
 * Find approximate positions of matched text in the original document.
 * Used to highlight matched passages in the UI (TextComparison component).
 * 
 * Returns character ranges [start, end] where matches were found.
 */
export function findMatchedPassages(
  textA: string,
  textB: string,
  k = 5,
  w = 4
): Array<{ start: number; end: number; text: string }> {
  const normalized = normalizeText(textA);
  const { fingerprints: fpA, fingerprintPositions: posA } = winnow(textA, k, w);
  const { fingerprints: fpB } = winnow(textB, k, w);

  const passages: Array<{ start: number; end: number; text: string }> = [];

  for (const [hash, positions] of posA.entries()) {
    if (fpB.has(hash)) {
      for (const pos of positions) {
        // Map normalized position back to approximate original position
        const approxStart = Math.min(pos, textA.length - k);
        const approxEnd = Math.min(approxStart + k * 6, textA.length);
        const snippet = textA.slice(approxStart, approxEnd);
        passages.push({ start: approxStart, end: approxEnd, text: snippet });
      }
    }
  }

  // Merge overlapping ranges to avoid duplicate highlights
  passages.sort((a, b) => a.start - b.start);
  const merged: typeof passages = [];
  for (const p of passages) {
    if (merged.length && p.start <= merged[merged.length - 1].end) {
      merged[merged.length - 1].end = Math.max(merged[merged.length - 1].end, p.end);
      merged[merged.length - 1].text = textA.slice(
        merged[merged.length - 1].start,
        merged[merged.length - 1].end
      );
    } else {
      merged.push({ ...p });
    }
  }

  return merged.slice(0, 20); // cap at 20 passages for UI performance
}