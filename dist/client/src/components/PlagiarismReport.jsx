import { CheckCircle, FileText, Globe, Users, Image as ImageIcon, FileType, } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
export default function PlagiarismReport({ fileName, overallSimilarity, wordCount = 0, matches = [], onViewDetails, processingTime = 2.3, }) {
    const getSimilarityColor = (similarity) => {
        if (similarity < 15)
            return "text-green-600";
        if (similarity < 30)
            return "text-yellow-600";
        return "text-red-600";
    };
    const getSimilarityBadgeColor = (similarity) => {
        if (similarity < 15)
            return "bg-green-100 text-green-800 border-green-200";
        if (similarity < 30)
            return "bg-yellow-100 text-yellow-800 border-yellow-200";
        return "bg-red-100 text-red-800 border-red-200";
    };
    const getSourceIcon = (type) => {
        switch (type) {
            case "web":
                return <Globe className="h-4 w-4"/>;
            case "database":
                return <FileText className="h-4 w-4"/>;
            case "submission":
                return <Users className="h-4 w-4"/>;
            default:
                return <FileText className="h-4 w-4"/>;
        }
    };
    const getFileTypeBadge = () => {
        if (!fileName)
            return null;
        const name = fileName.toLowerCase();
        if (name.endsWith(".png") ||
            name.endsWith(".jpg") ||
            name.endsWith(".jpeg")) {
            return (<Badge className="bg-purple-100 text-purple-800 border-purple-200 flex items-center gap-1">
          <ImageIcon className="h-3 w-3"/>
          Image Analysis
        </Badge>);
        }
        if (name.endsWith(".pdf")) {
            return (<Badge className="bg-blue-100 text-blue-800 border-blue-200 flex items-center gap-1">
          <FileText className="h-3 w-3"/>
          PDF Analysis
        </Badge>);
        }
        return (<Badge className="bg-green-100 text-green-800 border-green-200 flex items-center gap-1">
        <FileType className="h-3 w-3"/>
        Text Analysis
      </Badge>);
    };
    const originalityPercentage = 100 - overallSimilarity;
    return (<div className="space-y-6">
      {/* HEADER CARD */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary"/>
                {fileName}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Analysis completed in {processingTime}s
              </p>
            </div>

            <div className="text-right">
              <div className={`text-3xl font-bold ${getSimilarityColor(overallSimilarity)}`}>
                {overallSimilarity}%
              </div>
              <p className="text-sm text-muted-foreground">Similarity Found</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-semibold text-green-600">
                {originalityPercentage}%
              </div>
              <p className="text-sm text-muted-foreground">Original Content</p>
            </div>

            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-semibold">
                {(wordCount ?? 0).toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">Total Words</p>
            </div>

            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-semibold">
                {matches?.length || 0}
              </div>
              <p className="text-sm text-muted-foreground">Sources Found</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Originality Score</span>
              <span className="font-medium">{originalityPercentage}%</span>
            </div>
            <Progress value={originalityPercentage} className="h-3"/>
          </div>
        </CardContent>
      </Card>

      {/* MATCHES LIST */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-primary"/>
            {fileName}
            {getFileTypeBadge()}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {matches && matches.length > 0 ? (matches.map((match, index) => {
            const id = match?.id ?? String(index);
            const source = match?.source ?? "Image Source";
            const similarity = match?.similarity ?? 0;
            const sourceType = match?.sourceType ?? "web";
            const matchedText = match?.matchedText ?? "";
            return (<div key={id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getSourceIcon(sourceType)}
                      <div>
                        <p className="text-xs text-muted-foreground capitalize">
                          {sourceType}
                        </p>

                        <Badge className={`${getSimilarityBadgeColor(similarity)} text-xs`}>
                          {similarity}% Match
                        </Badge>
                      </div>
                    </div>

                    <Button variant="outline" size="sm" disabled={!match?.id} onClick={() => onViewDetails?.(id)}>
                      View Details
                    </Button>
                  </div>

                  {matchedText && (<div className="bg-muted/50 rounded p-3">
                      <p className="text-sm text-muted-foreground mb-1">
                        Matched Text:
                      </p>
                      <p className="text-sm">"{matchedText}"</p>
                    </div>)}
                </div>);
        })) : (<div className="text-center py-8">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4"/>
              <h3 className="text-lg font-semibold mb-2">
                No Plagiarism Detected
              </h3>
              <p className="text-muted-foreground">
                This document appears to be original content with no significant
                matches found.
              </p>
            </div>)}
        </CardContent>
      </Card>
    </div>);
}
