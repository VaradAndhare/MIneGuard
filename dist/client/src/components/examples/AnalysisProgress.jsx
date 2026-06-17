import { useState } from 'react';
import AnalysisProgress from '../AnalysisProgress';
import { Button } from '@/components/ui/button';
export default function AnalysisProgressExample() {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const handleStartAnalysis = () => {
        setIsAnalyzing(true);
        console.log('Analysis started');
    };
    const handleComplete = () => {
        console.log('Analysis completed');
        setIsAnalyzing(false);
    };
    return (<div className="max-w-2xl mx-auto p-6 space-y-4">
      {!isAnalyzing && (<Button onClick={handleStartAnalysis} data-testid="button-start-demo">
          Start Demo Analysis
        </Button>)}
      <AnalysisProgress fileName="Sample_Document.docx" isAnalyzing={isAnalyzing} onComplete={handleComplete}/>
    </div>);
}
