'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';

interface ImageUploaderProps {
  onUpload: (urls: string[]) => void;
  maxFiles?: number;
}

interface PreviewFile {
  file: File;
  preview: string;
  uploading: boolean;
  uploaded: boolean;
  url?: string;
  error?: string;
}

export default function ImageUploader({ onUpload, maxFiles = 10 }: ImageUploaderProps) {
  const [files, setFiles] = useState<PreviewFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (previewFile: PreviewFile): Promise<string | null> => {
    const formData = new FormData();
    formData.append('file', previewFile.file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Erreur lors du téléchargement');
      }

      const data = await res.json();
      return data.url;
    } catch {
      return null;
    }
  };

  const processFiles = useCallback(
    async (newFiles: File[]) => {
      const remaining = maxFiles - files.length;
      const toAdd = newFiles.slice(0, remaining);

      if (toAdd.length === 0) return;

      const previews: PreviewFile[] = toAdd.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        uploading: true,
        uploaded: false,
      }));

      setFiles((prev) => [...prev, ...previews]);

      const uploadedUrls: string[] = [];

      for (let i = 0; i < previews.length; i++) {
        const url = await uploadFile(previews[i]);

        setFiles((prev) =>
          prev.map((f) =>
            f.preview === previews[i].preview
              ? {
                  ...f,
                  uploading: false,
                  uploaded: url !== null,
                  url: url || undefined,
                  error: url ? undefined : 'Échec du téléchargement',
                }
              : f
          )
        );

        if (url) {
          uploadedUrls.push(url);
        }
      }

      if (uploadedUrls.length > 0) {
        const allUrls = [
          ...files.filter((f) => f.url).map((f) => f.url!),
          ...uploadedUrls,
        ];
        onUpload(allUrls);
      }
    },
    [files, maxFiles, onUpload]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(Array.from(e.target.files));
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      const imageFiles = Array.from(e.dataTransfer.files).filter((f) =>
        f.type.startsWith('image/')
      );
      processFiles(imageFiles);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const removeFile = (preview: string) => {
    setFiles((prev) => {
      const updated = prev.filter((f) => f.preview !== preview);
      const urls = updated.filter((f) => f.url).map((f) => f.url!);
      onUpload(urls);
      return updated;
    });
    URL.revokeObjectURL(preview);
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          isDragging
            ? 'border-emerald-500 bg-emerald-50'
            : 'border-gray-300 hover:border-emerald-400 hover:bg-emerald-50/50'
        }`}
      >
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <p className="mt-2 text-sm text-gray-600">
          <span className="font-medium text-emerald-600">
            Cliquez pour sélectionner
          </span>{' '}
          ou glissez-déposez vos images
        </p>
        <p className="mt-1 text-xs text-gray-500">
          PNG, JPG, WEBP jusqu&apos;à 5 Mo ({files.length}/{maxFiles} images)
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Preview Grid */}
      {files.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {files.map((file) => (
            <div
              key={file.preview}
              className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200"
            >
              <Image
                src={file.preview}
                alt="Aperçu"
                fill
                className="object-cover"
                sizes="150px"
              />

              {/* Upload Status Overlay */}
              {file.uploading && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              {file.error && (
                <div className="absolute inset-0 bg-red-500/40 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              )}

              {/* Remove Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(file.preview);
                }}
                className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              {/* Uploaded Checkmark */}
              {file.uploaded && (
                <div className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 text-white rounded-full flex items-center justify-center">
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
