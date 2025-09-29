import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { FileText, Upload, X, CheckCircle, FileSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  content?: string;
}

interface DocumentUploadProps {
  onFileUpload?: (file: UploadedFile) => void;
  onAnalyzeClick?: (file: UploadedFile) => void;
}

export default function DocumentUpload({ onFileUpload, onAnalyzeClick }: DocumentUploadProps) {
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    // Simulate file processing
    setTimeout(() => {
      const uploadedFile: UploadedFile = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        type: file.type,
        content: "Sample document content for demonstration..." // TODO: remove mock functionality
      };
      
      setUploadedFile(uploadedFile);
      setIsUploading(false);
      setUploadProgress(0);
      onFileUpload?.(uploadedFile);
      console.log('File uploaded:', file.name);
    }, 2000);
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    multiple: false
  });

  const handleRemoveFile = () => {
    setUploadedFile(null);
    console.log('File removed');
  };

  const handleAnalyze = () => {
    if (uploadedFile) {
      onAnalyzeClick?.(uploadedFile);
      console.log('Analyzing file:', uploadedFile.name);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {!uploadedFile ? (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive 
              ? 'border-primary bg-primary/5' 
              : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-primary/2'
            }
          `}
          data-testid="drop-zone-upload"
        >
          <input {...getInputProps()} />
          <div className="mx-auto max-w-md">
            <Upload className={`mx-auto h-12 w-12 mb-4 ${isDragActive ? 'text-primary' : 'text-muted-foreground'}`} />
            <h3 className="text-lg font-semibold mb-2">
              {isDragActive ? 'Drop your file here' : 'Upload Your Document'}
            </h3>
            <p className="text-muted-foreground mb-4">
              Drag and drop your file here, or click to browse
            </p>
            <p className="text-sm text-muted-foreground">
              Supported formats: TXT, PDF, DOC, DOCX (Max 10MB)
            </p>
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileText className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium" data-testid="text-filename">{uploadedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(uploadedFile.size)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveFile}
                  data-testid="button-remove-file"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isUploading && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" data-testid="progress-upload" />
            </div>
          </CardContent>
        </Card>
      )}

      {uploadedFile && !isUploading && (
        <div className="flex justify-center">
          <Button 
            onClick={handleAnalyze} 
            size="lg" 
            className="px-8"
            data-testid="button-analyze-plagiarism"
          >
            <FileSearch className="mr-2 h-5 w-5" />
            Check for Plagiarism
          </Button>
        </div>
      )}
    </div>
  );
}