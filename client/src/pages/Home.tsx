import { useState } from "react";
import DocumentUpload from "@/components/DocumentUpload";
import PlagiarismReport from "@/components/PlagiarismReport";
import AnalysisProgress from "@/components/AnalysisProgress";
import TextComparison from "@/components/TextComparison";

type AppState = 'upload' | 'analyzing' | 'results' | 'comparison';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  content?: string;
}

export default function Home() {
  const [currentState, setCurrentState] = useState<AppState>('upload');
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);

  // TODO: remove mock functionality
  const mockMatches = [
    {
      id: '1',
      source: 'wikipedia.org/wiki/Academic_integrity',
      similarity: 87,
      matchedText: 'Academic integrity is the pursuit of scholarly activity in an open, honest and responsible manner. It encompasses honesty, fairness, respect, and responsibility.',
      sourceType: 'web' as const
    },
    {
      id: '2', 
      source: 'Previous submission - Sarah Johnson (2023)',
      similarity: 45,
      matchedText: 'The importance of original research cannot be overstated in academic environments. Students must demonstrate critical thinking skills.',
      sourceType: 'submission' as const
    },
    {
      id: '3',
      source: 'Journal of Educational Ethics, Vol. 15',
      similarity: 23,
      matchedText: 'Students must demonstrate original thinking and proper citation practices to maintain academic standards.',
      sourceType: 'database' as const
    }
  ];

  const mockOriginalText = [
    { text: 'Academic integrity is the pursuit of scholarly activity in an open, honest and responsible manner. ', isHighlighted: true, similarityLevel: 'exact' as const },
    { text: 'It encompasses honesty, fairness, respect, and responsibility in all academic work. ', isHighlighted: true, similarityLevel: 'exact' as const },
    { text: 'Students must demonstrate original thinking ', isHighlighted: false, similarityLevel: 'exact' as const },
    { text: 'and proper citation practices ', isHighlighted: true, similarityLevel: 'similar' as const },
    { text: 'in their research work. Original contributions are essential ', isHighlighted: false, similarityLevel: 'exact' as const },
    { text: 'for advancing academic discourse and knowledge creation. ', isHighlighted: true, similarityLevel: 'paraphrased' as const }
  ];

  const mockSourceText = [
    { text: 'Academic integrity is the pursuit of scholarly activity in an open, honest and responsible manner. ', isHighlighted: true, similarityLevel: 'exact' as const },
    { text: 'It encompasses honesty, fairness, respect, and responsibility in educational settings. ', isHighlighted: true, similarityLevel: 'exact' as const },
    { text: 'Researchers must show creative thinking ', isHighlighted: false, similarityLevel: 'exact' as const },
    { text: 'and appropriate referencing methods ', isHighlighted: true, similarityLevel: 'similar' as const },
    { text: 'throughout their scholarly activities. Novel ideas are crucial ', isHighlighted: false, similarityLevel: 'exact' as const },
    { text: 'for the progression of academic conversation and research development. ', isHighlighted: true, similarityLevel: 'paraphrased' as const }
  ];

  const handleFileUpload = (file: UploadedFile) => {
    setUploadedFile(file);
    console.log('File uploaded:', file.name);
  };

  const handleAnalyzeClick = (file: UploadedFile) => {
    console.log('Starting analysis for:', file.name);
    setCurrentState('analyzing');
  };

  const handleAnalysisComplete = () => {
    console.log('Analysis completed');
    setCurrentState('results');
  };

  const handleViewDetails = (matchId: string) => {
    console.log('View details for match:', matchId);
    setSelectedMatchId(matchId);
    setCurrentState('comparison');
  };

  const handleBackToReport = () => {
    console.log('Back to report');
    setCurrentState('results');
    setSelectedMatchId(null);
  };

  const handleNewUpload = () => {
    console.log('Starting new upload');
    setCurrentState('upload');
    setUploadedFile(null);
    setSelectedMatchId(null);
  };

  const getCurrentMatch = () => {
    return mockMatches.find(match => match.id === selectedMatchId);
  };

  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl">
      {currentState === 'upload' && (
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">
              Advanced Plagiarism Detection
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Upload your document and get comprehensive plagiarism analysis using 
              advanced data mining techniques including cosine similarity and TF-IDF vectorization.
            </p>
          </div>
          <DocumentUpload 
            onFileUpload={handleFileUpload}
            onAnalyzeClick={handleAnalyzeClick}
          />
        </div>
      )}

      {currentState === 'analyzing' && uploadedFile && (
        <div className="max-w-2xl mx-auto">
          <AnalysisProgress 
            fileName={uploadedFile.name}
            isAnalyzing={true}
            onComplete={handleAnalysisComplete}
          />
        </div>
      )}

      {currentState === 'results' && uploadedFile && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Plagiarism Analysis Results</h2>
            <button 
              onClick={handleNewUpload}
              className="text-primary hover:underline"
              data-testid="link-new-analysis"
            >
              New Analysis
            </button>
          </div>
          <PlagiarismReport
            fileName={uploadedFile.name}
            overallSimilarity={32}
            wordCount={2847}
            uniqueWords={1923}
            matches={mockMatches}
            onViewDetails={handleViewDetails}
            processingTime={3.7}
          />
        </div>
      )}

      {currentState === 'comparison' && selectedMatchId && (
        <TextComparison
          originalText={mockOriginalText}
          sourceText={mockSourceText}
          sourceName={getCurrentMatch()?.source || ''}
          sourceType={getCurrentMatch()?.sourceType || 'web'}
          overallSimilarity={getCurrentMatch()?.similarity || 0}
          onBack={handleBackToReport}
        />
      )}
    </main>
  );
}