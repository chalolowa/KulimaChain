import { CheckCircle2, FileDigit, FileText, UploadCloud, File as FileIcon, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number; // in MB
  label?: string;
  description?: string;
}

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getFileIcon = (type: string) => {
  if (type.startsWith("image/")) return <FileText className="h-5 w-5 text-blue-500" />;
  if (type === "application/pdf") return <FileText className="h-5 w-5 text-red-500" />;
  if (type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") 
    return <FileText className="h-5 w-5 text-blue-600" />;
  if (type.includes("spreadsheet")) return <FileDigit className="h-5 w-5 text-green-500" />;
  return <FileIcon className="h-5 w-5 text-gray-500" />;
};

export function FileUpload({
  onFilesSelected,
  accept = "image/*,.pdf,.doc,.docx,.xls,.xlsx",
  multiple = true,
  maxFiles = 5,
  maxSize = 10, // 10MB
  label = "Upload files",
  description = "Drag & drop files here, or click to browse"
}: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onDrop = useCallback((acceptedFiles: File[], fileRejections: any[]) => {
    setErrors([]);
    
    // Handle rejected files
    if (fileRejections.length > 0) {
      const newErrors = fileRejections.map(({ file, errors }) => {
        const errorMessages = errors.map((e: { code: string; message: string }) => {
          if (e.code === "file-too-large") 
            return `File too large (max ${maxSize}MB)`;
          if (e.code === "file-invalid-type") 
            return "Invalid file type";
          return e.message;
        });
        return `${file.name}: ${errorMessages.join(", ")}`;
      });
      setErrors(newErrors);
    }
    
    // Filter out duplicates
    const existingNames = files.map(f => f.name);
    const uniqueFiles = acceptedFiles.filter(
      file => !existingNames.includes(file.name)
    );
    
    // Apply maxFiles limit
    const combined = [...files, ...uniqueFiles];
    const finalFiles = multiple ? combined.slice(0, maxFiles) : [acceptedFiles[0]];
    
    setFiles(finalFiles);
    onFilesSelected(finalFiles);
    
    // Simulate upload progress for demo
    if (acceptedFiles.length > 0) {
      setUploadProgress(0);
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev === null) return 0;
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 200);
    }
  }, [files, maxFiles, maxSize, multiple, onFilesSelected]);

  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
    onFilesSelected(newFiles);
    setUploadProgress(null);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept ? { [accept.split(',')[0]]: accept.split(',').map(ext => ext.trim()) } : undefined,
    maxSize: maxSize * 1024 * 1024,
    multiple,
  });

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
        {description && <p className="text-sm text-gray-500">{description}</p>}
      </div>
      
      <div 
        {...getRootProps()} 
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
          ${isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"}
          transition-colors duration-200
        `}
      >
        <input {...getInputProps()} ref={fileInputRef} />
        <div className="flex flex-col items-center justify-center space-y-3">
          <UploadCloud className="h-10 w-10 text-gray-400" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-700">
              {isDragActive ? "Drop files here" : "Click to upload or drag and drop"}
            </p>
            <p className="text-xs text-gray-500">
              {accept} (max {maxSize}MB each)
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            type="button"
            onClick={handleButtonClick}
            className="mt-2"
          >
            Browse Files
          </Button>
        </div>
      </div>

      {/* Upload Progress */}
      {uploadProgress !== null && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Uploading files...</span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}

      {/* File Previews */}
      {files.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700">Selected Files</h3>
          <div className="space-y-2">
            {files.map((file, index) => (
              <div 
                key={`${file.name}-${index}`} 
                className="flex items-center justify-between border rounded-lg p-3"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    {getFileIcon(file.type)}
                  </div>
                  <div>
                    <p className="text-sm font-medium truncate max-w-[150px] sm:max-w-xs">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                
                {uploadProgress === 100 ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <button 
                    type="button" 
                    onClick={() => removeFile(index)}
                    className="p-1 text-gray-500 hover:text-red-500"
                    aria-label="Remove file"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="mt-4 text-sm text-red-600 space-y-1">
          {errors.map((error, index) => (
            <p key={index} className="flex items-start">
              <svg 
                className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </p>
          ))}
        </div>
      )}

      {/* File Limit Warning */}
      {files.length >= maxFiles && multiple && (
        <div className="text-sm text-yellow-600 flex items-start">
          <svg 
            className="h-5 w-5 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>Maximum of {maxFiles} files reached</span>
        </div>
      )}
    </div>
  );
}