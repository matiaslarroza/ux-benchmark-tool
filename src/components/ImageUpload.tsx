'use client';

import { useCallback, useState } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase';

interface ImageUploadProps {
  onUpload: (url: string) => void;
  competitorId: string;
}

export default function ImageUpload({ onUpload, competitorId }: ImageUploadProps) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const supabase = createClient();

  const uploadFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('image/')) return;
      setUploading(true);

      const ext = file.name.split('.').pop();
      const path = `${competitorId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { data, error } = await supabase.storage
        .from('screenshots')
        .upload(path, file);

      if (error) {
        console.error('Upload error:', error);
        setUploading(false);
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from('screenshots').getPublicUrl(data.path);

      onUpload(publicUrl);
      setUploading(false);
    },
    [competitorId, onUpload, supabase]
  );

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files);
    files.forEach(uploadFile);
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    files.forEach(uploadFile);
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors ${
        dragging
          ? 'border-blue-400 bg-blue-50'
          : 'border-gray-300 hover:border-gray-400'
      }`}
    >
      {uploading ? (
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      ) : (
        <>
          <Upload className="h-8 w-8 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">
            Arrastrá imágenes acá o{' '}
            <label className="cursor-pointer font-medium text-blue-600 hover:text-blue-500">
              elegí archivos
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileInput}
                className="sr-only"
              />
            </label>
          </p>
          <p className="mt-1 text-xs text-gray-400">PNG, JPG, WebP</p>
        </>
      )}
    </div>
  );
}
