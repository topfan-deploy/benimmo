'use client';

import { useState, useRef } from 'react';

interface DocumentUploaderProps {
  onUpload: (url: string) => void;
  label: string;
  accept?: string;
}

export default function DocumentUploader({
  onUpload,
  label,
  accept = '.pdf,.jpg,.jpeg,.png',
}: DocumentUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    setFileName(file.name);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Erreur lors du téléchargement');
      }

      const data = await res.json();
      onUpload(data.url);
    } catch {
      setError('Échec du téléchargement. Veuillez réessayer.');
      setFileName(null);
    } finally {
      setUploading(false);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemove = () => {
    setFileName(null);
    setError(null);
    onUpload('');
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>

      {!fileName ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/50 transition-colors"
        >
          <svg
            className="mx-auto h-10 w-10 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="mt-2 text-sm text-gray-600">
            <span className="font-medium text-emerald-600">
              Cliquez pour sélectionner
            </span>{' '}
            un document
          </p>
          <p className="mt-1 text-xs text-gray-500">
            PDF, JPG, PNG
          </p>
        </div>
      ) : (
        <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-lg p-3">
          <div className="flex items-center space-x-3">
            <svg
              className="w-8 h-8 text-emerald-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <div>
              <p className="text-sm font-medium text-gray-700 truncate max-w-xs">
                {fileName}
              </p>
              {uploading && (
                <p className="text-xs text-emerald-600">Téléchargement en cours...</p>
              )}
              {!uploading && !error && (
                <p className="text-xs text-emerald-600">Téléchargé avec succès</p>
              )}
            </div>
          </div>
          <button
            onClick={handleRemove}
            className="text-gray-400 hover:text-red-500 transition-colors"
            title="Supprimer"
          >
            <svg
              className="w-5 h-5"
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
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {uploading && (
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div className="bg-emerald-600 h-1.5 rounded-full animate-pulse w-2/3" />
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
