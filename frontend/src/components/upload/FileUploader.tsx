'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileText, Image, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useNexusStore } from '@/lib/store';
import { SUPPORTED_FILE_TYPES, MAX_FILE_SIZE, MAX_TOTAL_SIZE } from '@/types';
import { toast } from 'sonner';

interface FileUploaderProps {
  onUploadComplete?: () => void;
  disabled?: boolean;
}

const getFileIcon = (type: string) => {
  if (type.includes('image')) return Image;
  if (type.includes('spreadsheet') || type.includes('excel')) return FileSpreadsheet;
  return FileText;
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const FileUploader: React.FC<FileUploaderProps> = ({
  onUploadComplete,
  disabled = false
}) => {
  const {
    uploadedFiles,
    totalUploadSize,
    addFiles,
    removeFile,
    updateFileStatus,
    currentSession
  } = useNexusStore();

  const [dragActive, setDragActive] = useState(false);

  const validateFile = (file: File): string | null => {
    // Check file type or extension
    const allowedMimes = Object.keys(SUPPORTED_FILE_TYPES);
    const allowedExts = Object.values(SUPPORTED_FILE_TYPES);
    const nameLower = file.name.toLowerCase();
    const hasAllowedExt = allowedExts.some((ext) => nameLower.endsWith(ext));
    const hasAllowedMime = allowedMimes.includes(file.type);
    if (!hasAllowedMime && !hasAllowedExt) {
      return `Unsupported file: ${file.name}`;
    }

    // Check individual file size
    if (file.size > MAX_FILE_SIZE) {
      return `File too large: ${formatFileSize(file.size)} (max ${formatFileSize(MAX_FILE_SIZE)})`;
    }

    // Check total size
    if (totalUploadSize + file.size > MAX_TOTAL_SIZE) {
      return `Total upload size would exceed ${formatFileSize(MAX_TOTAL_SIZE)}`;
    }

    return null;
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (disabled) return;

    const validFiles: File[] = [];
    const errors: string[] = [];

    acceptedFiles.forEach(file => {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
    }

    if (validFiles.length > 0) {
      const created = addFiles(validFiles);
      // Drive simulated upload progress using returned ids to avoid stale indices
      created.forEach((createdFile) => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += Math.random() * 30;
          if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            updateFileStatus(createdFile.id, 'uploaded', 100);
          } else {
            updateFileStatus(createdFile.id, 'uploading', progress);
          }
        }, 200);
      });

      toast.success(`${validFiles.length} file(s) added`);
      onUploadComplete?.();
    }
  }, [disabled, totalUploadSize, uploadedFiles.length, addFiles, updateFileStatus, onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled,
    multiple: true,
    accept: Object.keys(SUPPORTED_FILE_TYPES).reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {} as Record<string, string[]>)
  });

  const handleRemoveFile = (fileId: string) => {
    removeFile(fileId);
    toast.success('File removed');
  };

  const remainingSpace = MAX_TOTAL_SIZE - totalUploadSize;
  const usagePercentage = (totalUploadSize / MAX_TOTAL_SIZE) * 100;

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card className={cn(
        "border-2 border-dashed transition-colors",
        isDragActive && "border-blue-500 bg-blue-50",
        disabled && "opacity-50 cursor-not-allowed"
      )}>
        <CardContent className="p-8">
          <div
            {...getRootProps()}
            className={cn(
              "flex flex-col items-center justify-center text-center space-y-4 cursor-pointer",
              disabled && "cursor-not-allowed"
            )}
          >
            <input {...getInputProps()} />
            <div className="p-4 rounded-full bg-muted">
              <Upload className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">
                {isDragActive ? 'Drop files here' : 'Upload your sustainability documents'}
              </h3>
              <p className="text-sm text-muted-foreground">
                Drag and drop files here, or click to browse
              </p>
              <p className="text-xs text-muted-foreground">
                Supported: Excel, PDF, Word, Images • Max 200MB total
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Progress */}
      {totalUploadSize > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Storage used</span>
                <span>{formatFileSize(totalUploadSize)} / {formatFileSize(MAX_TOTAL_SIZE)}</span>
              </div>
              <Progress value={usagePercentage} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{uploadedFiles.length} files</span>
                <span>{formatFileSize(remainingSpace)} remaining</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* File List */}
      {uploadedFiles.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              <h4 className="font-medium">Uploaded Files</h4>
              <div className="space-y-2">
                {uploadedFiles.map((file) => {
                  const FileIcon = getFileIcon(file.type);
                  return (
                    <div
                      key={file.id}
                      className="flex items-center space-x-3 p-3 rounded-lg border bg-card"
                    >
                      <FileIcon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium truncate">{file.name}</p>
                          <div className="flex items-center space-x-2">
                            {file.status === 'error' && (
                              <AlertCircle className="h-4 w-4 text-red-500" />
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRemoveFile(file.id)}
                              disabled={disabled}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(file.size)}
                          </p>
                          <div className="flex items-center space-x-2">
                            {file.status === 'uploading' && (
                              <div className="flex items-center space-x-2">
                                <Progress value={file.progress} className="h-1 w-16" />
                                <span className="text-xs text-gray-500">
                                  {Math.round(file.progress)}%
                                </span>
                              </div>
                            )}
                            {file.status === 'uploaded' && (
                              <span className="text-xs text-green-600">Uploaded</span>
                            )}
                            {file.status === 'error' && (
                              <span className="text-xs text-red-600">Error</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};