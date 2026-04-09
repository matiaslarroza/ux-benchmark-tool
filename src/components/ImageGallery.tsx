'use client';

import { useState } from 'react';
import { X, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Screenshot } from '@/lib/types';

interface ImageGalleryProps {
  screenshots: Screenshot[];
  onDelete?: (id: string) => void;
}

export default function ImageGallery({ screenshots, onDelete }: ImageGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (screenshots.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-gray-400">No hay screenshots todavía</p>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {screenshots.map((s, i) => (
          <div key={s.id} className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white">
            <button
              type="button"
              onClick={() => setLightboxIndex(i)}
              className="block aspect-video w-full"
            >
              <img
                src={s.image_url}
                alt={s.caption || s.section || 'Screenshot'}
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
              />
            </button>
            <div className="p-2">
              {s.section && (
                <span className="text-xs font-medium text-purple-600">{s.section}</span>
              )}
              {s.caption && (
                <p className="mt-0.5 text-xs text-gray-600 line-clamp-2">{s.caption}</p>
              )}
              {s.figma_url && (
                <a
                  href={s.figma_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700"
                >
                  <ExternalLink className="h-3 w-3" />
                  Ver en Figma
                </a>
              )}
            </div>
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(s.id)}
                className="absolute right-1 top-1 rounded-full bg-black/50 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            onClick={() => setLightboxIndex(null)}
          >
            <X className="h-6 w-6" />
          </button>

          {lightboxIndex > 0 && (
            <button
              className="absolute left-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex(lightboxIndex - 1);
              }}
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}

          {lightboxIndex < screenshots.length - 1 && (
            <button
              className="absolute right-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex(lightboxIndex + 1);
              }}
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}

          <img
            src={screenshots[lightboxIndex].image_url}
            alt={screenshots[lightboxIndex].caption || 'Screenshot'}
            className="max-h-[90vh] max-w-[90vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-lg bg-black/60 px-4 py-2 text-center text-white">
            <p className="text-sm">
              {screenshots[lightboxIndex].section && (
                <span className="font-medium">{screenshots[lightboxIndex].section}</span>
              )}
              {screenshots[lightboxIndex].section && screenshots[lightboxIndex].caption && ' — '}
              {screenshots[lightboxIndex].caption}
            </p>
            <p className="mt-1 text-xs text-white/60">
              {lightboxIndex + 1} / {screenshots.length}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
