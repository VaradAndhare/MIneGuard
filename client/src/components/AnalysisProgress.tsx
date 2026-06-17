import { useState, useEffect } from "react";
import { FileSearch, Zap, Database, Globe } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AnalysisStep {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
  progress: number;
}

interface AnalysisProgressProps {
  fileName: string;
  onComplete?: () => void;
  isAnalyzing?: boolean;
}

export default function AnalysisProgress({ fileName, onComplete, isAnalyzing = false }: AnalysisProgressProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [overallProgress, setOverallProgress] = useState(0);
  const [steps, setSteps] = useState<AnalysisStep[]>([
    {
      id: 'preprocessing',
      label: 'Text Preprocessing',
      description: 'Removing stopwords, punctuation, and normalizing text',
      icon: <FileSearch className="h-4 w-4" />,
      completed: false,
      progress: 0
    },
    {
      id: 'extraction',
      label: 'Feature Extraction', 
      description: 'Generating TF-IDF vectors and n-grams',
      icon: <Zap className="h-4 w-4" />,
      completed: false,
      progress: 0
    },
    {
      id: 'database',
      label: 'Database Comparison',
      description: 'Comparing against submitted documents',
      icon: <Database className="h-4 w-4" />,
      completed: false,
      progress: 0
    },
    {
      id: 'similarity',
      label: 'Similarity Analysis',
      description: 'Computing cosine similarity and final results',
      icon: <Globe className="h-4 w-4" />,
      completed: false,
      progress: 0
    }
  ]);

  useEffect(() => {
    if (!isAnalyzing) return;

    const interval = setInterval(() => {
      setSteps(prevSteps => {
        const newSteps = [...prevSteps];
        const current = newSteps[currentStep];
        
        if (current && !current.completed) {
          current.progress = Math.min(current.progress + 15, 100);
          
          if (current.progress === 100) {
            current.completed = true;
            console.log(`Completed step: ${current.label}`);
            
            if (currentStep < newSteps.length - 1) {
              setCurrentStep(prev => prev + 1);
            } else {
              // Analysis complete
              setTimeout(() => {
                onComplete?.();
              }, 1000);
            }
          }
        }
        
        return newSteps;
      });
      
      // Update overall progress
      const completedSteps = steps.filter(step => step.completed).length;
      const currentProgress = steps[currentStep]?.progress || 0;
      const newOverallProgress = ((completedSteps * 100) + currentProgress) / (steps.length);
      setOverallProgress(Math.min(newOverallProgress, 100));
      
    }, 300);

    return () => clearInterval(interval);
  }, [isAnalyzing, currentStep, steps, onComplete]);

  if (!isAnalyzing) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSearch className="h-5 w-5 text-primary" />
          Analyzing Document
        </CardTitle>
        <p className="text-sm text-muted-foreground" data-testid="text-analyzing-filename">
          {fileName}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="relative overflow-hidden rounded-lg border p-6 bg-muted/30">

  {/* 🤖 AI SCANNING LIGHT */}
  <div className="absolute inset-0 pointer-events-none">
    <div className="scan-line"></div>
  </div>

  <div className="space-y-4 relative z-10">
    <h3 className="text-lg font-semibold text-center">
      🤖 AI is analyzing your file...
    </h3>

    <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
      <div
        className="h-full bg-primary transition-all duration-500"
        style={{ width: `${overallProgress}%` }}
      />
    </div>

    <p className="text-sm text-muted-foreground text-center animate-pulse">
      Running TF-IDF • Cosine Similarity • Image Intelligence
    </p>
  </div>

</div>

        
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div 
              key={step.id}
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                index === currentStep ? 'bg-primary/5 border border-primary/20' : 
                step.completed ? 'bg-green-50 border border-green-200' : 
                'bg-muted/30'
              }`}
              data-testid={`step-${step.id}`}
            >
              <div className={`
                flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
                ${step.completed ? 'bg-green-500 text-white' : 
                  index === currentStep ? 'bg-primary text-primary-foreground' : 
                  'bg-muted text-muted-foreground'}
              `}>
                {step.icon}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className={`font-medium ${
                    step.completed ? 'text-green-700' : 
                    index === currentStep ? 'text-primary' : 
                    'text-muted-foreground'
                  }`}>
                    {step.label}
                  </h4>
                  {(index === currentStep || step.completed) && (
                    <span className="text-sm font-medium" data-testid={`progress-${step.id}`}>
                      {step.progress}%
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>
                {index === currentStep && !step.completed && (
                  <Progress value={step.progress} className="h-1 mt-2" />
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}