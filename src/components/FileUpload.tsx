import { Upload, File, X } from 'lucide-react';

interface FileUploadProps {
  onFileUpload: (files: File[]) => void;
  files: File[];
}

export function FileUpload({ onFileUpload, files }: FileUploadProps) {
  const isValidFile = (file: File): boolean => {
    return (
      file.type === 'text/plain' || 
      file.name.endsWith('.md') || 
      file.name.endsWith('.txt') ||
      file.type === 'application/pdf' ||
      file.name.endsWith('.pdf')
    );
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files).filter(isValidFile);
    if (droppedFiles.length > 0) {
      onFileUpload(droppedFiles);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []).filter(isValidFile);
    if (selectedFiles.length > 0) {
      onFileUpload(selectedFiles);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    onFileUpload(newFiles);
  };

  const removeAllFiles = () => {
    onFileUpload([]);
  };

  return (
    <div>
      {files.length === 0 ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-indigo-400 transition-colors cursor-pointer"
        >
          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept=".txt,.md,.pdf"
            multiple
            onChange={handleFileInput}
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-700 mb-2">
              Drop your study guides here or <span className="text-indigo-600 font-medium">browse</span>
            </p>
            <p className="text-sm text-gray-500">Supports .txt, .md, and .pdf files (multiple files allowed)</p>
          </label>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-700">
              {files.length} file{files.length > 1 ? 's' : ''} selected
            </p>
            <button
              onClick={removeAllFiles}
              className="text-sm text-indigo-600 hover:text-indigo-700 hover:underline"
            >
              Remove all
            </button>
          </div>
          {files.map((file, index) => (
            <div key={index} className="border-2 border-indigo-200 bg-indigo-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <File className="w-6 h-6 text-indigo-600" />
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="p-2 hover:bg-indigo-100 rounded-lg transition-colors"
                  aria-label="Remove file"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}