import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Globe, ArrowLeft } from "lucide-react";

interface HighlightedText {
  text: string;
  isHighlighted: boolean;
  similarityLevel: 'exact' | 'similar' | 'paraphrased';
}

interface TextComparisonProps {
  originalText: HighlightedText[];
  sourceText: HighlightedText[];
  sourceName: string;
  sourceType: 'web' | 'database' | 'submission';
  overallSimilarity: number;
  onBack?: () => void;
}

export default function TextComparison({ 
  originalText, 
  sourceText, 
  sourceName, 
  sourceType,
  overallSimilarity,
  onBack 
}: TextComparisonProps) {
  const [viewMode, setViewMode] = useState<'side-by-side' | 'inline'>('side-by-side');

  const getSimilarityColor = (level: string) => {
    switch (level) {
      case 'exact': return 'bg-red-200 text-red-900 border border-red-300';
      case 'similar': return 'bg-yellow-200 text-yellow-900 border border-yellow-300';
      case 'paraphrased': return 'bg-orange-200 text-orange-900 border border-orange-300';
      default: return '';
    }
  };

  const renderHighlightedText = (textArray: HighlightedText[], testId: string) => (
    <div className="space-y-2" data-testid={testId}>
      {textArray.map((segment, index) => (
        <span
          key={index}
          className={segment.isHighlighted ? getSimilarityColor(segment.similarityLevel) : ''}
        >
          {segment.text}
        </span>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onBack}
            data-testid="button-back-to-report"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Report
          </Button>
          <div>
            <h2 className="text-xl font-semibold">Text Comparison</h2>
            <p className="text-sm text-muted-foreground">
              Comparing with: <span data-testid="text-source-name">{sourceName}</span>
            </p>
          </div>
        </div>
        <Badge className="text-sm" data-testid="badge-comparison-similarity">
          {overallSimilarity}% Similar
        </Badge>
      </div>

      {/* Legend */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-200 border border-red-300 rounded"></div>
              <span className="text-sm">Exact Match</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-200 border border-yellow-300 rounded"></div>
              <span className="text-sm">Similar Text</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-200 border border-orange-300 rounded"></div>
              <span className="text-sm">Paraphrased Content</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* View Mode Toggle */}
      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="side-by-side" data-testid="tab-side-by-side">Side by Side</TabsTrigger>
          <TabsTrigger value="inline" data-testid="tab-inline">Inline View</TabsTrigger>
        </TabsList>

        <TabsContent value="side-by-side" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="h-4 w-4" />
                  Your Document
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none bg-background p-4 rounded border text-sm leading-relaxed">
                  {renderHighlightedText(originalText, 'text-original-document')}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  {sourceType === 'web' ? <Globe className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                  Source Document
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none bg-background p-4 rounded border text-sm leading-relaxed">
                  {renderHighlightedText(sourceText, 'text-source-document')}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="inline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Inline Comparison</CardTitle>
              <p className="text-sm text-muted-foreground">
                Highlighted sections show similarities between your document and the source.
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-2">Your Document:</h4>
                  <div className="prose prose-sm max-w-none bg-muted/50 p-4 rounded text-sm leading-relaxed">
                    {renderHighlightedText(originalText, 'text-inline-original')}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Source ({sourceName}):</h4>
                  <div className="prose prose-sm max-w-none bg-muted/50 p-4 rounded text-sm leading-relaxed">
                    {renderHighlightedText(sourceText, 'text-inline-source')}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}