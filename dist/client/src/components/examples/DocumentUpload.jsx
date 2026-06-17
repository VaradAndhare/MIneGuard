import DocumentUpload from '../DocumentUpload';
export default function DocumentUploadExample() {
    const handleFileUpload = (file) => {
        console.log('File uploaded in example:', file);
    };
    const handleAnalyzeClick = (file) => {
        console.log('Analyze clicked for:', file.name);
    };
    return (<div className="max-w-2xl mx-auto p-6">
      <DocumentUpload onFileUpload={handleFileUpload} onAnalyzeClick={handleAnalyzeClick}/>
    </div>);
}
