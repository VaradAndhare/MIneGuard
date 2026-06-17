import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { FileText, Upload, X, CheckCircle, FileSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
export default function DocumentUpload({ onFileUpload, onAnalyzeClick }) {
    const [uploadedFile, setUploadedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    // ==============================
    // DROPZONE HANDLER
    // ==============================
    const onDrop = useCallback(async (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (!file)
            return;
        setIsUploading(true);
        setUploadProgress(0);
        // Fake upload animation
        const progressInterval = setInterval(() => {
            setUploadProgress(prev => {
                if (prev >= 100) {
                    clearInterval(progressInterval);
                    return 100;
                }
                return prev + 10;
            });
        }, 200);
        setTimeout(() => {
            const newFile = {
                id: Date.now().toString(),
                name: file.name,
                size: file.size,
                type: file.type,
                content: file // ✅ REAL FILE OBJECT (MAIN FIX)
            };
            setUploadedFile(newFile);
            setIsUploading(false);
            setUploadProgress(0);
            onFileUpload?.(newFile);
            console.log("✅ File uploaded:", file.name);
        }, 2000);
    }, [onFileUpload]);
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'text/plain': ['.txt'],
            'application/pdf': ['.pdf'],
            'application/msword': ['.doc'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            // ⭐ ADD THESE TWO LINES BELOW
            'image/png': ['.png'],
            'image/jpeg': ['.jpg', '.jpeg']
        },
        multiple: false
    });
    const handleRemoveFile = () => {
        setUploadedFile(null);
    };
    const handleAnalyze = () => {
        if (!uploadedFile)
            return;
        console.log("🚀 Sending file to backend:", uploadedFile.name);
        console.log("📂 File Type:", uploadedFile.type);
        // EXTRA SAFETY CHECK
        if (!uploadedFile.content) {
            console.error("❌ File content missing!");
            return;
        }
        onAnalyzeClick?.(uploadedFile);
    };
    const formatFileSize = (bytes) => {
        if (bytes === 0)
            return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };
    return (<div className="space-y-6">

      {!uploadedFile ? (<div {...getRootProps()} className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/50 hover:bg-primary/2"}
          `}>
          <input {...getInputProps()}/>

          <Upload className="mx-auto h-12 w-12 mb-4 text-muted-foreground"/>

          <h3 className="text-lg font-semibold mb-2">
            {isDragActive ? "Drop your file here" : "Upload Your Document"}
          </h3>

          <p className="text-muted-foreground mb-2">
            Drag and drop your file here, or click to browse
          </p>

          <p className="text-sm text-muted-foreground">
            Supported formats: TXT, PDF, DOC, DOCX, PNG, JPG (Max 10MB)
          </p>
        </div>) : (<Card>
          <CardContent className="p-6 flex items-center justify-between">

            <div className="flex items-center space-x-3">
              {uploadedFile.type.startsWith("image") ? (<Upload className="h-8 w-8 text-pink-500"/>) : (<FileText className="h-8 w-8 text-primary"/>)}

              <div>
                <p className="font-medium">{uploadedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatFileSize(uploadedFile.size)}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500"/>
              <Button variant="ghost" size="sm" onClick={handleRemoveFile}>
                <X className="h-4 w-4"/>
              </Button>
            </div>

          </CardContent>
        </Card>)}

      {isUploading && (<Card>
          <CardContent className="p-6">
            <div className="flex justify-between text-sm mb-2">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2"/>
          </CardContent>
        </Card>)}

      {uploadedFile && !isUploading && (<div className="flex justify-center">
          <Button onClick={handleAnalyze} size="lg" className="px-8">
            <FileSearch className="mr-2 h-5 w-5"/>
            Check for Plagiarism
          </Button>
        </div>)}

    </div>);
}
