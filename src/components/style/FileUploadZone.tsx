'use client';

import React, { useRef, useState } from 'react';

interface FileUploadZoneProps {
  onFileUpload: (file: File) => Promise<void>;
  isUploading: boolean;
  acceptedTypes: string[];
  maxSize: number; // in bytes
  className?: string;
}

export default function FileUploadZone({ 
  onFileUpload, 
  isUploading, 
  acceptedTypes, 
  maxSize,
  className = '' 
}: FileUploadZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    // Validate file type
    const isValidType = acceptedTypes.some(type => 
      file.type.includes(type) || file.name.toLowerCase().endsWith(type)
    );
    
    if (!isValidType) {
      throw new Error(`Please upload a file with one of these extensions: ${acceptedTypes.join(', ')}`);
    }

    // Validate file size
    if (file.size > maxSize) {
      const maxSizeMB = Math.round(maxSize / (1024 * 1024));
      throw new Error(`File size must be less than ${maxSizeMB}MB`);
    }

    await onFileUpload(file);
  };

  const handleInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        await handleFileSelect(file);
      } catch (err) {
        console.error('File upload error:', err);
        // Reset input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = async (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);

    const files = Array.from(event.dataTransfer.files);
    if (files.length > 0) {
      try {
        await handleFileSelect(files[0]);
      } catch (err) {
        console.error('File drop error:', err);
      }
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
    <div
      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
        isDragOver
          ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
          : 'border-gray-300 dark:border-gray-600'
      } ${className}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <svg 
        className="mx-auto h-12 w-12 text-gray-400" 
        stroke="currentColor" 
        fill="none" 
        viewBox="0 0 48 48"
      >
        <path 
          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
      </svg>
      
      <div className="mt-4">
        <label htmlFor="file-upload" className="cursor-pointer">
          <span className="mt-2 block text-sm font-medium text-gray-900 dark:text-white">
            {isDragOver ? 'Drop file here' : 'Upload a file or drag and drop'}
          </span>
          <span className="mt-1 block text-xs text-gray-500 dark:text-gray-400">
            {acceptedTypes.join(', ')} files up to {formatFileSize(maxSize)}
          </span>
        </label>
        <input
          ref={fileInputRef}
          id="file-upload"
          name="file-upload"
          type="file"
          accept={acceptedTypes.join(',')}
          onChange={handleInputChange}
          disabled={isUploading}
          className="sr-only"
        />
      </div>
      
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="mt-4 px-4 py-2 bg-gray-600 text-white font-medium rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isUploading ? (
          <div className="flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Uploading...
          </div>
        ) : (
          'Choose File'
        )}
      </button>
    </div>
  );
}