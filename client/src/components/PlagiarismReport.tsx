import { AlertTriangle, CheckCircle, FileText, Globe, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface PlagiarismMatch {
  id: string;
  source: string;
  similarity: number;
  matchedText: string;
  sourceType: 'web' | 'database' | 'submission';
}

interface PlagiarismReportProps {
  fileName: string;
  overallSimilarity: number;
  wordCount: number;
  uniqueWords: number;
  matches: PlagiarismMatch[];
  onViewDetails?: (matchId: string) => void;
  processingTime?: number;
}

export default function PlagiarismReport({ 
  fileName, 
  overallSimilarity, 
  wordCount, 
  uniqueWords,
  matches,
  onViewDetails,
  processingTime = 2.3
}: PlagiarismReportProps) {
  const getSimilarityColor = (similarity: number) => {
    if (similarity < 15) return 'text-green-600';
    if (similarity < 30) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSimilarityBadgeColor = (similarity: number) => {
    if (similarity < 15) return 'bg-green-100 text-green-800 border-green-200';
    if (similarity < 30) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'web': return <Globe className="h-4 w-4" />;
      case 'database': return <FileText className="h-4 w-4" />;
      case 'submission': return <Users className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const originalityPercentage = 100 - overallSimilarity;

  return (
    <div className="space-y-6">
      {/* Header Card with Overall Results */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <span data-testid="text-report-filename">{fileName}</span>
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Analysis completed in {processingTime}s
              </p>
            </div>
            <div className="text-right">
              <div className={`text-3xl font-bold ${getSimilarityColor(overallSimilarity)}`} data-testid="text-similarity-percentage">
                {overallSimilarity}%
              </div>
              <p className="text-sm text-muted-foreground">Similarity Found</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-semibold text-green-600" data-testid="text-originality-percentage">
                {originalityPercentage}%
              </div>
              <p className="text-sm text-muted-foreground">Original Content</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-semibold" data-testid="text-word-count">
                {wordCount.toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">Total Words</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-semibold" data-testid="text-sources-found">
                {matches.length}
              </div>
              <p className="text-sm text-muted-foreground">Sources Found</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Originality Score</span>
              <span className="font-medium">{originalityPercentage}%</span>
            </div>
            <Progress value={originalityPercentage} className="h-3" data-testid="progress-originality" />
          </div>
        </CardContent>
      </Card>

      {/* Matches List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {overallSimilarity > 0 ? (
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
            ) : (
              <CheckCircle className="h-5 w-5 text-green-500" />
            )}
            Similarity Matches ({matches.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {matches.length > 0 ? (
            matches.map((match) => (
              <div key={match.id} className="border rounded-lg p-4 space-y-3" data-testid={`match-${match.id}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getSourceIcon(match.sourceType)}
                    <div>
                      <p className="font-medium text-sm" data-testid={`text-source-${match.id}`}>
                        {match.source}
                      </p>
                      <Badge 
                        className={`${getSimilarityBadgeColor(match.similarity)} text-xs`}
                        data-testid={`badge-similarity-${match.id}`}
                      >
                        {match.similarity}% Match
                      </Badge>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onViewDetails?.(match.id)}
                    data-testid={`button-view-details-${match.id}`}
                  >
                    View Details
                  </Button>
                </div>
                <div className="bg-muted/50 rounded p-3">
                  <p className="text-sm text-muted-foreground mb-1">Matched Text:</p>
                  <p className="text-sm" data-testid={`text-matched-content-${match.id}`}>
                    "{match.matchedText}"
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Plagiarism Detected</h3>
              <p className="text-muted-foreground">
                This document appears to be original content with no significant matches found.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}