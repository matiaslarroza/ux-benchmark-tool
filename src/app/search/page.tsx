'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Image as ImageIcon } from 'lucide-react';
import AppShell from '@/components/AppShell';
import { createClient } from '@/lib/supabase';
import type { Benchmark, Competitor, Screenshot } from '@/lib/types';

interface SearchResult {
  type: 'benchmark' | 'competitor' | 'screenshot';
  benchmark: Benchmark;
  competitor?: Competitor;
  screenshot?: Screenshot;
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      const q = query.toLowerCase();

      // Search benchmarks
      const { data: benchmarks } = await supabase
        .from('benchmarks')
        .select('*, user:users(*)')
        .or(`title.ilike.%${q}%,description.ilike.%${q}%,category.ilike.%${q}%`)
        .limit(20);

      // Search competitors
      const { data: competitors } = await supabase
        .from('competitors')
        .select('*, benchmark:benchmarks(*, user:users(*))')
        .or(`name.ilike.%${q}%,notes.ilike.%${q}%`)
        .limit(20);

      const combined: SearchResult[] = [];

      (benchmarks || []).forEach((b) =>
        combined.push({ type: 'benchmark', benchmark: b })
      );

      (competitors || []).forEach((c) => {
        const benchmark = (c as unknown as { benchmark: Benchmark }).benchmark;
        if (benchmark) {
          combined.push({
            type: 'competitor',
            benchmark,
            competitor: c,
          });
        }
      });

      setResults(combined);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, supabase]);

  return (
    <AppShell>
      <h1 className="text-2xl font-semibold text-[#303036]">Búsqueda global</h1>
      <p className="mt-1 text-sm text-[#636271]">
        Buscá benchmarks, competidores y screenshots en todo el equipo
      </p>

      <div className="relative mt-6">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#9ca3af]" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nombre de competidor, tag, categoría..."
          autoFocus
          className="w-full rounded-lg border border-[#d1d2d9] bg-white py-3 pl-12 pr-4 text-base text-[#303036] placeholder-gray-400 focus:border-[#6f93eb] focus:outline-none focus:ring-2 focus:ring-[#6f93eb]"
        />
      </div>

      <div className="mt-6">
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-lg bg-[#f5f6f8]" />
            ))}
          </div>
        )}

        {!loading && query && results.length === 0 && (
          <p className="py-12 text-center text-[#636271]">
            No se encontraron resultados para &quot;{query}&quot;
          </p>
        )}

        {!loading && results.length > 0 && (
          <div className="space-y-2">
            {results.map((r, i) => (
              <Link
                key={`${r.type}-${i}`}
                href={`/benchmarks/${r.benchmark.id}`}
                className="block rounded-lg border border-[#e8e9ed] bg-white p-4 transition-shadow"
                style={{ boxShadow: 'var(--shadow-4dp)' }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-8dp)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-4dp)'; }}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    {r.type === 'benchmark' && (
                      <>
                        <span className="text-xs font-medium text-purple-600">Benchmark</span>
                        <p className="mt-0.5 font-semibold text-[#303036]">{r.benchmark.title}</p>
                        {r.benchmark.description && (
                          <p className="mt-0.5 text-sm text-[#636271] line-clamp-1">
                            {r.benchmark.description}
                          </p>
                        )}
                      </>
                    )}
                    {r.type === 'competitor' && r.competitor && (
                      <>
                        <span className="text-xs font-medium text-green-600">Competidor</span>
                        <p className="mt-0.5 font-semibold text-[#303036]">{r.competitor.name}</p>
                        <p className="mt-0.5 text-sm text-[#636271]">
                          En: {r.benchmark.title}
                        </p>
                      </>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {r.benchmark.tags.slice(0, 2).map((t) => (
                      <span key={t} className="rounded-full bg-[#eff2ff] px-2 py-0.5 text-xs text-[#213478]">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {!query && (
          <div className="py-16 text-center text-[#9ca3af]">
            <Search className="mx-auto h-12 w-12" />
            <p className="mt-4">Escribí algo para buscar en los benchmarks del equipo</p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
