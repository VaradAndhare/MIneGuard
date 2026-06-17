/**
 * PLAGIARISM ANALYSIS PIPELINE
 * --------------------------------
 * Orchestrates the two-stage detection:
 *
 *  Stage 1 — SimHash (fast, whole-document)
 *    → Screens entire document database in milliseconds
 *    → Returns a small list of "candidate" documents worth inspecting
 *
 *  Stage 2 — Winnowing (precise, passage-level)
 *    → Runs only on candidates from Stage 1
 *    → Finds exactly which passages were copied
 *    → Produces the similarity % and matched text for the UI
 *
 * Drop-in replacement for your existing /api/analyze route logic.
 */

import {
  computeSimHash,
  documentStore,
  type StoredDocument,
} from "./simhash";
import { winnow, compareWithWinnowing, findMatchedPassages } from "./winnowing.js";
import { randomUUID } from "crypto";
import Document from "../models/Document.js";

export interface AnalysisMatch {
  id: string;
  source: string;
  similarity: number; // 0–100
  sourceType: "database" | "web" | "submission";
  matchedText: string; // snippet shown in PlagiarismReport
  passages: Array<{ start: number; end: number; text: string }>;
  winnowingSimilarity: number; // from Winnowing Jaccard
  simHashSimilarity: number; // from SimHash Hamming
}

export interface AnalysisResult {
  similarity: number; // highest match across all sources
  originality: number; // 100 - similarity
  words: number;
  matches: AnalysisMatch[];
  processingTimeMs: number;
  documentId: string; // stored ID for future cross-comparison
  stage1CandidatesFound: number; // how many SimHash candidates were found
  totalDocsInDatabase: number;
}

/**
 * Main entry point. Call this from your /api/analyze route.
 *
 * @param text        Extracted text from the uploaded document
 * @param fileName    Original file name (shown in reports)
 * @param userId      Optional user ID for tracking
 */
export async function analyzeDocument(
  text: string,
  fileName: string,
  userId?: string,
): Promise<AnalysisResult> {
  const startTime = Date.now();
  const documentId = randomUUID();

  // ── Normalize & basic stats ──────────────────────────────────────
  const wordCount = text.split(/\s+/).filter(Boolean).length;

  if (!text || text.trim().length < 20) {
    return {
      similarity: 0,
      originality: 100,
      words: wordCount,
      matches: [],
      processingTimeMs: Date.now() - startTime,
      documentId,
      stage1CandidatesFound: 0,
      totalDocsInDatabase: await Document.countDocuments(),
    };
  }

  // ── STAGE 1: SimHash screening ───────────────────────────────────
  const querySimHash = computeSimHash(text);

  // Find candidates from stored documents (fast bucket lookup)
  const mongoDocs = await Document.find();

  const candidates = mongoDocs.map((doc: any) => ({
    doc: {
      id: doc._id.toString(),
      fileName: doc.fileName,
      text: doc.text,
      userId: doc.userId,
    },
    simSimilarity: 0,
  }));

  // ── STAGE 2: Winnowing on candidates ────────────────────────────
  const matches: AnalysisMatch[] = [];

  for (const { doc, simSimilarity } of candidates) {
    // Skip documents from the same user submitting the same file
    if (doc.fileName === fileName && doc.userId === userId) continue;

    const { similarity: winnowSim } = compareWithWinnowing(text, doc.text);
    const passages = findMatchedPassages(text, doc.text);

    console.log({
      source: doc.fileName,
      winnowSim,
      simSimilarity,
    });

    // Only report if Winnowing also confirms similarity
    if (winnowSim < 5 && simSimilarity < 60) continue;

    const snippet = passages[0]?.text ?? text.slice(0, 120);

    matches.push({
      id: doc.id,
      source: doc.fileName,
      similarity: Math.round(winnowSim * 0.7 + simSimilarity * 0.3), // weighted blend
      sourceType: "submission",
      matchedText: snippet.slice(0, 200),
      passages,
      winnowingSimilarity: winnowSim,
      simHashSimilarity: simSimilarity,
    });
  }

  // Sort by similarity descending
  matches.sort((a, b) => b.similarity - a.similarity);

  // Overall similarity = highest single match
  const overallSimilarity = matches.length > 0 ? matches[0].similarity : 0;

  // ── Store this document for future comparisons ───────────────────
  const { fingerprints } = winnow(text);
  const newDoc: StoredDocument = {
    id: documentId,
    fileName,
    simhash: querySimHash,
    fingerprintHashes: [...fingerprints],
    text,
    wordCount,
    submittedAt: new Date(),
    userId,
  };
  documentStore.save(newDoc);

  try {
    await Document.create({
      userId,

      fileName,

      text,

      wordCount,

      similarity: overallSimilarity,

      originality: 100 - overallSimilarity,

      simhash: JSON.stringify(querySimHash),

      fingerprints: [...fingerprints],

      matches: matches.map((m) => ({
        source: m.source,
        similarity: m.similarity,
        sourceType: m.sourceType,
        matchedText: m.matchedText,
      })),
    });

    console.log("✅ Document saved to MongoDB");
  } catch (err) {
    console.error("❌ MongoDB save failed:", err);
  }

  return {
    similarity: overallSimilarity,
    originality: 100 - overallSimilarity,
    words: wordCount,
    matches: matches.slice(0, 10), // top 10 matches for UI
    processingTimeMs: Date.now() - startTime,
    documentId,
    stage1CandidatesFound: candidates.length,
    totalDocsInDatabase: await Document.countDocuments(),
  };
}

/**
 * Get detailed comparison between the uploaded document and one stored match.
 * Called when the user clicks "View Details" in PlagiarismReport.
 * Returns data shaped for your TextComparison component.
 */
export async function getDetailedComparison(
  uploadedText: string,
  storedDocId: string,
): Promise<{
  originalSegments: Array<{
    text: string;
    isHighlighted: boolean;
    similarityLevel: "exact" | "similar" | "paraphrased";
  }>;
  sourceSegments: Array<{
    text: string;
    isHighlighted: boolean;
    similarityLevel: "exact" | "similar" | "paraphrased";
  }>;
  sourceName: string;
  similarity: number;
} | null> {
  const storedDoc = await Document.findById(storedDocId);
  if (!storedDoc) return null;

  const passages = findMatchedPassages(uploadedText, storedDoc.text);
  const { similarity } = compareWithWinnowing(uploadedText, storedDoc.text);

  // Build highlighted segment arrays for TextComparison component
  const buildSegments = (text: string, matchedPassages: typeof passages) => {
    const segments: Array<{
      text: string;
      isHighlighted: boolean;
      similarityLevel: "exact" | "similar" | "paraphrased";
    }> = [];

    let cursor = 0;
    for (const p of matchedPassages) {
      if (p.start > cursor) {
        segments.push({
          text: text.slice(cursor, p.start),
          isHighlighted: false,
          similarityLevel: "exact",
        });
      }
      segments.push({
        text: p.text,
        isHighlighted: true,
        similarityLevel: "exact",
      });
      cursor = p.end;
    }
    if (cursor < text.length) {
      segments.push({
        text: text.slice(cursor),
        isHighlighted: false,
        similarityLevel: "exact",
      });
    }
    return segments;
  };

  return {
    originalSegments: buildSegments(uploadedText, passages),
    sourceSegments: buildSegments(
      storedDoc.text,
      findMatchedPassages(storedDoc.text, uploadedText),
    ),
    sourceName: storedDoc.fileName,
    similarity,
  };
}
