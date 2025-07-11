import React, { useCallback, useRef } from 'react';
import { Upload, FileText, Lock, X } from 'lucide-react';

interface FileUploadProps {
  title: string;
  description: string;
  requiredFields: string;
  onFileUpload: (file: File) => void;
  onFileReset?: () => void; // Optional callback for reset
  uploadedFile?: File;
  color: 'blue' | 'green';
  disabled?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({
  title,
  description,
  requiredFields,
  onFileUpload,
  onFileReset,
  uploadedFile,
  color,
  disabled = false
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      onFileUpload(files[0]);
    }
  }, [onFileUpload, disabled]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;

    const files = e.target.files;
    if (files && files.length > 0) {
      onFileUpload(files[0]);
    }
  }, [onFileUpload, disabled]);

  const handleReset = () => {
    if (inputRef.current) {
      inputRef.current.value = ''; // clear file input value
    }
    if (onFileReset) {
      onFileReset(); // let parent component clear the file state
    }
  };

  const colorClasses = {
    blue: disabled 
      ? 'border-gray-200 bg-gray-50 text-gray-400' 
      : 'border-blue-300 bg-blue-50 text-blue-600 hover:bg-blue-100',
    green: disabled 
      ? 'border-gray-200 bg-gray-50 text-gray-400' 
      : 'border-green-300 bg-green-50 text-green-600 hover:bg-green-100'
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center space-x-2 mb-4">
        <FileText className={`h-5 w-5 ${disabled ? 'text-gray-400' : (color === 'blue' ? 'text-blue-600' : 'text-green-600')}`} />
        <h3 className={`text-lg font-semibold ${disabled ? 'text-gray-400' : 'text-gray-900'}`}>
          {title}
        </h3>
        {disabled && (
          <div className="flex items-center space-x-1 text-amber-600">
            <Lock className="h-4 w-4" />
            <span className="text-sm">Event ID required</span>
          </div>
        )}
      </div>

      {disabled && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
          <p className="text-sm text-amber-800">
            Please enter an Event ID in Customer Information to enable file uploads.
          </p>
        </div>
      )}

      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${colorClasses[color]} ${
          disabled ? 'cursor-not-allowed' : 'cursor-pointer'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <Upload className={`h-12 w-12 mx-auto mb-4 ${disabled ? 'text-gray-300' : ''}`} />
        <p className={`text-lg font-medium mb-2 ${disabled ? 'text-gray-400' : ''}`}>
          {disabled ? 'File upload disabled' : description}
        </p>
        <p className={`text-sm mb-4 ${disabled ? 'text-gray-400' : ''}`}>
          {disabled ? 'Enter Event ID first' : 'Or click to browse'}
        </p>

        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileSelect}
          disabled={disabled}
          className="hidden"
          id={`file-${title.replace(/\s+/g, '-').toLowerCase()}`}
        />
        <label
          htmlFor={`file-${title.replace(/\s+/g, '-').toLowerCase()}`}
          className={`inline-block border rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            disabled
              ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer'
          }`}
        >
          Choose File
        </label>

        {uploadedFile && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md flex items-center justify-between">
            <p className="text-sm font-medium text-green-800">
              ✓ Uploaded: {uploadedFile.name}
            </p>
            <button
              onClick={handleReset}
              className="ml-4 text-red-600 hover:underline text-sm flex items-center"
            >
              <X className="h-4 w-4 mr-1" /> Reset
            </button>
          </div>
        )}
      </div>

      <p className={`text-sm mt-4 ${disabled ? 'text-gray-400' : 'text-gray-600'}`}>
        <strong>Required Fields:</strong> {requiredFields}
      </p>
    </div>
  );
};

export default FileUpload;
