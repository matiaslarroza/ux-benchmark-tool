'use client';

import Link from 'next/link';
import { Calendar, User, Image as ImageIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Benchmark } from '@/lib/types';

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
  completed: 'bg-green-100 text-green-700',
};

const statusLabels: Record<string, string> = {
  draft: 'Borrador',
  in_progress: 'En progreso',
  completed: 'Completado',
};

interface BenchmarkCardProps {
  benchmark: Benchmark;
  screenshotCount?: number;
  competitorCount?: number;
}

export default function BenchmarkCard({ benchmark, screenshotCount = 0, competitorCount = 0 }: BenchmarkCardProps) {
  return (
    <Link
      href={`/benchmarks/${benchmark.id}`}
      className="group block rounded-lg border border-gray-200 bg-white p-5 transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold text-gray-900 group-hover:text-blue-600">
            {benchmark.title}
          </h3>
          {benchmark.description && (
            <p className="mt-1 line-clamp-2 text-sm text-gray-500">{benchmark.description}</p>
          )}
        </div>
        <span className={`ml-3 shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[benchmark.status]}`}>
          {statusLabels[benchmark.status]}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {benchmark.category && (
          <span className="rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-medium text-purple-700">
            {benchmark.category}
          </span>
        )}
        {benchmark.tags.slice(0, 3).map((tag) => (
          <span key={tag} className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
            {tag}
          </span>
        ))}
        {benchmark.tags.length > 3 && (
          <span className="text-xs text-gray-400">+{benchmark.tags.length - 3}</span>
        )}
      </div>

      <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <User className="h-3.5 w-3.5" />
          {benchmark.user?.name || 'Sin asignar'}
        </span>
        <span className="flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5" />
          {formatDistanceToNow(new Date(benchmark.created_at), { addSuffix: true, locale: es })}
        </span>
        <span className="flex items-center gap-1">
          <ImageIcon className="h-3.5 w-3.5" />
          {screenshotCount} imgs / {competitorCount} comp.
        </span>
      </div>
    </Link>
  );
}
