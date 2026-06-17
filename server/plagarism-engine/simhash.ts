/**
 * SIMHASH + LSH (Locality Sensitive Hashing)
 * -------------------------------------------
 * SimHash compresses an entire document into a single 64-bit fingerprint.
 * Documents that are similar will have fingerprints that differ in only a
 * few bits (low Hamming distance).
 * 
 * LSH groups documents into "buckets" by their top N bits, so you only
 * run full comparisons within the same bucket — cutting O(n²) down to O(n).
 * 
 * Pipeline role:
 *   SimHash → screen thousands of docs in <1ms → shortlist candidates
 *   Winnowing → deep comparison on candidates only → exact matched passages
 */

// We simulate 64-bit using two 32-bit numbers (JS has no native BigInt64 hash)
export interface SimHashValue {
  high: number; // top 32 bits
  low: number;  // bottom 32 bits
}

export interface StoredDocument {
  id: string;
  fileName: string;
  simhash: SimHashValue;
  fingerprintHashes: number[];  // from winnowing, stored for deep compare
  text: string;                 // full text for passage highlighting
  wordCount: number;
  submittedAt: Date;
  userId?: string;
}

/**
 * FNV-1a 32-bit hash of a string token.
 */
function fnv32(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

/**
 * Tokenize text into words (simple whitespace + punctuation split).
 */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * Compute SimHash of a document.
 * 
 * Algorithm:
 *  1. Tokenize document into words
 *  2. For each word, compute its 64-bit hash
 *  3. For each bit position, add +1 if the word's hash bit is 1, -1 if 0
 *  4. Final fingerprint: bit i = 1 if column sum > 0, else 0
 * 
 * Similar documents share most words → similar column sums → similar bits.
 */
export function computeSimHash(text: string): SimHashValue {
  const tokens = tokenize(text);
  const BITS = 64;
  const v = new Array(BITS).fill(0);

  for (const token of tokens) {
    const h = fnv32(token);
    // Use FNV hash for low 32 bits, a second hash for high 32 bits
    const h2 = fnv32(token + "_h");

    for (let b = 0; b < 32; b++) {
      v[b]     += (h  >>> b) & 1 ? 1 : -1;
      v[b + 32] += (h2 >>> b) & 1 ? 1 : -1;
    }
  }

  let high = 0, low = 0;
  for (let b = 0; b < 32; b++) {
    if (v[b] > 0)      low  |= (1 << b);
    if (v[b + 32] > 0) high |= (1 << b);
  }

  return { high: high >>> 0, low: low >>> 0 };
}

/**
 * Hamming distance between two SimHash values (number of differing bits).
 * Lower = more similar. Threshold of 10 is a good default.
 */
export function hammingDistance(a: SimHashValue, b: SimHashValue): number {
  // XOR gives 1 in every bit that differs, then count set bits
  let xorHigh = (a.high ^ b.high) >>> 0;
  let xorLow  = (a.low  ^ b.low)  >>> 0;

  let count = 0;
  while (xorHigh) { count += xorHigh & 1; xorHigh >>>= 1; }
  while (xorLow)  { count += xorLow  & 1; xorLow  >>>= 1; }
  return count;
}

/**
 * Convert SimHash similarity to a 0–100 percentage.
 * Hamming distance of 0 = 100%, distance of 64 = 0%.
 */
export function simHashSimilarity(a: SimHashValue, b: SimHashValue): number {
  const dist = hammingDistance(a, b);
  return Math.round(((64 - dist) / 64) * 100);
}

/**
 * LSH Bucket key — the top N bits of the SimHash high word.
 * Documents landing in the same bucket are prioritized for Winnowing.
 * 
 * N=8 gives 256 buckets → good balance between bucket size and recall.
 */
export function lshBucketKey(hash: SimHashValue, prefixBits = 8): string {
  const prefix = (hash.high >>> (32 - prefixBits)) & ((1 << prefixBits) - 1);
  return prefix.toString(16).padStart(2, "0");
}

/**
 * Serialize SimHash to a storable string (for DB column).
 */
export function serializeSimHash(h: SimHashValue): string {
  return `${h.high.toString(16).padStart(8,"0")}${h.low.toString(16).padStart(8,"0")}`;
}

/**
 * Deserialize SimHash from stored string.
 */
export function deserializeSimHash(s: string): SimHashValue {
  return {
    high: parseInt(s.slice(0, 8), 16) >>> 0,
    low:  parseInt(s.slice(8, 16), 16) >>> 0,
  };
}

// ============================================================
// IN-MEMORY DOCUMENT STORE
// Replace this with PostgreSQL queries in production.
// The interface is kept identical so swapping is a one-liner.
// ============================================================

class DocumentStore {
  private docs: Map<string, StoredDocument> = new Map();

  /** Save a document after analysis. */
  save(doc: StoredDocument): void {
    this.docs.set(doc.id, doc);
  }

  /** Get all documents (for LSH screening). */
  getAll(): StoredDocument[] {
    return Array.from(this.docs.values());
  }

  getById(id: string): StoredDocument | undefined {
    return this.docs.get(id);
  }

  count(): number {
    return this.docs.size;
  }

  /**
   * LSH screen: return documents in the same bucket OR within
   * Hamming distance threshold of the query hash.
   * 
   * This is the key performance win — for large databases,
   * you'd query: WHERE lsh_bucket = ? OR hamming(simhash, ?) < threshold
   */
  findCandidates(
    queryHash: SimHashValue,
    hammingThreshold = 12
  ): Array<{ doc: StoredDocument; distance: number; simSimilarity: number }> {
    const queryBucket = lshBucketKey(queryHash);
    const candidates: Array<{ doc: StoredDocument; distance: number; simSimilarity: number }> = [];

    for (const doc of this.docs.values()) {
      const bucket = lshBucketKey(doc.simhash);
      const distance = hammingDistance(queryHash, doc.simhash);

      // Include if same bucket OR within threshold
      if (bucket === queryBucket || distance <= hammingThreshold) {
        candidates.push({
          doc,
          distance,
          simSimilarity: simHashSimilarity(queryHash, doc.simhash),
        });
      }
    }

    // Sort by similarity descending
    return candidates.sort((a, b) => a.distance - b.distance);
  }
}

export const documentStore = new DocumentStore();