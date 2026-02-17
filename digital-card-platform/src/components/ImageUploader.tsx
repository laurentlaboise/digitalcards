'use client';

import { useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';

interface ImageUploaderProps {
  label: string;
  currentUrl?: string | null;
  onUpload: (file: File) => Promise<void>;
  onClear: () => void;
  aspect?: 'square' | 'banner';
}

export default function ImageUploader({
  label,
  currentUrl,
  onUpload,
  onClear,
  aspect = 'square',
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

    setUploading(true);
    try {
      await onUpload(file);
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  const displayUrl = preview || currentUrl;

  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">
        {label}
      </label>
      <div
        className={`relative rounded-lg border-2 border-dashed border-gray-600 overflow-hidden cursor-pointer hover:border-gray-500 transition ${
          aspect === 'banner' ? 'h-32' : 'h-32 w-32'
        }`}
        onClick={() => inputRef.current?.click()}
      >
        {displayUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={displayUrl}
              alt={label}
              className="w-full h-full object-cover"
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                setPreview(null);
                onClear();
              }}
              className="absolute top-1 right-1 bg-black/60 rounded-full p-1 hover:bg-black/80"
            >
              <X size={14} className="text-white" />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Upload size={20} />
            <span className="text-xs mt-1">
              {uploading ? 'Uploading...' : 'Upload'}
            </span>
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
}
