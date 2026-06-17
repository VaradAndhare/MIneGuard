/**
 * Home.tsx  —  UPDATED
 * ----------------------
 * Changes:
 *  - Stores extracted uploadedText in state so "View Details" can call /api/compare
 *  - Passes documentId from analysis response to match IDs
 *  - Wires onViewDetails → fetches /api/compare/:id → shows TextComparison
 *  - Shows database size from response
 *  - All other UI (DocumentUpload, AnalysisProgress, PlagiarismReport) unchanged
 */
import { useState } from "react";
import DocumentUpload from "@/components/DocumentUpload";
import AnalysisProgress from "@/components/AnalysisProgress";
import PlagiarismReport from "@/components/PlagiarismReport";
import TextComparison from "@/components/TextComparison";
export default function Home() {
    const [stage, setStage] = useState("upload");
    const [currentFileName, setCurrentFileName] = useState("");
    const [uploadedText, setUploadedText] = useState(""); // NEW: store raw text
    const [reportData, setReportData] = useState(null);
    const [comparisonData, setComparisonData] = useState(null);
    // ── Called when user clicks "Check for Plagiarism" ──────────────
    const handleAnalyze = async (file) => {
        setCurrentFileName(file.name);
        setStage("analyzing");
        try {
            const formData = new FormData();
            formData.append("file", file.content);
            const token = localStorage.getItem("token");
            const endpoint = file.type.startsWith("image")
                ? "/api/image-check"
                : "/api/analyze";
            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });
            const data = await response.json();
            // Store the raw text for later use in /api/compare
            // (For text files we can read it client-side; for PDF/OCR the server handles it)
            if (file.type === "text/plain" && file.content) {
                const text = await file.content.text();
                setUploadedText(text);
            }
            setReportData({
                fileName: file.name,
                overallSimilarity: data.similarity ?? 0,
                wordCount: data.words ?? 0,
                matches: data.matches ?? [],
                processingTime: parseFloat(data.processingTime ?? "0"),
                documentId: data.documentId ?? "",
                databaseSize: data.databaseSize ?? 0,
            });
            setStage("report");
        }
        catch (err) {
            console.error("❌ Analysis failed:", err);
            setStage("upload");
        }
    };
    // ── Called when user clicks "View Details" on a match ──────────
    const handleViewDetails = async (matchId) => {
        if (!uploadedText || !matchId)
            return;
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`/api/compare/${matchId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ uploadedText }),
            });
            if (!response.ok) {
                console.warn("Comparison not available:", await response.text());
                return;
            }
            const data = await response.json();
            console.log(data);
            setComparisonData(data);
            setStage("comparison");
        }
        catch (err) {
            console.error("❌ Comparison fetch failed:", err);
        }
    };
    // ── Analysis progress auto-complete ─────────────────────────────
    const handleAnalysisComplete = () => {
        // Progress animation finished — report data already set above
    };
    return (<div className="container mx-auto px-6 py-8 max-w-4xl">
      {/* ── UPLOAD STAGE ── */}
      {stage === "upload" && (<div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold mb-1">
              Check for Plagiarism
            </h2>
            <p className="text-muted-foreground text-sm">
              Powered by Winnowing fingerprinting + SimHash LSH — the same core
              technique used by MOSS and Turnitin.
            </p>
          </div>
          <DocumentUpload onFileUpload={() => { }} onAnalyzeClick={handleAnalyze}/>
        </div>)}

      {/* ── ANALYZING STAGE ── */}
      {stage === "analyzing" && (<AnalysisProgress fileName={currentFileName} isAnalyzing={true} onComplete={handleAnalysisComplete}/>)}

      {/* ── REPORT STAGE ── */}
      {stage === "report" && reportData && (<div className="space-y-4">
          {/* Database size badge */}
          {reportData.databaseSize > 0 && (<p className="text-xs text-muted-foreground text-right">
              Compared against {reportData.databaseSize} document
              {reportData.databaseSize !== 1 ? "s" : ""} in database
            </p>)}

          <PlagiarismReport fileName={reportData.fileName} overallSimilarity={reportData.overallSimilarity} wordCount={reportData.wordCount} matches={reportData.matches} processingTime={reportData.processingTime} onViewDetails={handleViewDetails}/>

          <div className="flex justify-center pt-2">
            <button onClick={() => {
                setStage("upload");
                setReportData(null);
                setUploadedText("");
            }} className="text-sm text-muted-foreground underline">
              Check another document
            </button>
          </div>
        </div>)}

      {/* ── COMPARISON STAGE ── */}
      {stage === "comparison" && comparisonData && (<TextComparison originalText={comparisonData.originalSegments} sourceText={comparisonData.sourceSegments} sourceName={comparisonData.sourceName} sourceType="submission" overallSimilarity={comparisonData.similarity} onBack={() => setStage("report")}/>)}
    </div>);
}
