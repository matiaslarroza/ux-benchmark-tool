'use client';

export const dynamic = 'force-dynamic';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import AppShell from '@/components/AppShell';
import BenchmarkCard from '@/components/BenchmarkCard';
import SearchBar from '@/components/SearchBar';
import { useBenchmarks } from '@/hooks/useBenchmarks';

const categories = [
  'Muro', 'Grupos', 'Noticias', 'Chats', 'Librerías de conocimiento',
  'Eventos', 'Portal de servicios', 'Reconocimientos', 'Formularios y Trámites',
  'Control horario', 'Vacaciones y permisos', 'Desempeño', 'Objetivos',
  'Personas', 'Organigrama', 'Archivos', 'Aprendizaje', 'Onboarding',
  'Tareas', 'People Experience', 'Encuestas', 'Mis documentos',
  'Marketplace', 'Accesos rápidos',
];
const statuses = ['', 'draft', 'in_progress', 'completed'];
const statusLabels: Record<string, string> = {
  '': 'Todos',
  draft: 'Borrador',
  in_progress: 'En progreso',
  completed: 'Completado',
};

export default function DashboardPage() {
  const { benchmarks, loading } = useBenchmarks();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');

  const filtered = useMemo(() => {
    return benchmarks.filter((b) => {
      const matchesSearch =
        !search ||
        b.title.toLowerCase().includes(search.toLowerCase()) ||
        b.description.toLowerCase().includes(search.toLowerCase()) ||
        b.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
      const matchesCategory = !category || b.category === category;
      const matchesStatus = !status || b.status === status;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [benchmarks, search, category, status]);

  return (
    <AppShell>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-default)' }}>Benchmarks</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-lighter)' }}>
            {benchmarks.length} benchmark{benchmarks.length !== 1 ? 's' : ''} del equipo
          </p>
        </div>
        <Link
          href="/benchmarks/new"
          className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          style={{ backgroundColor: 'var(--brand-600)' }}
        >
          <Plus className="h-4 w-4" />
          Nuevo Benchmark
        </Link>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Buscar por título, descripción o tags..."
          />
        </div>
        <div className="flex gap-2">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-md border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1"
            style={{ borderColor: 'var(--border-strong)', color: 'var(--text-lighter)' }}
          >
            <option value="">Todas las categorías</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-md border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1"
            style={{ borderColor: 'var(--border-strong)', color: 'var(--text-lighter)' }}
          >
            {statuses.map((s) => (
              <option key={s} value={s}>
                {statusLabels[s]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 animate-pulse rounded-lg border" style={{ borderColor: 'var(--border-default)', backgroundColor: 'var(--bg-layout)' }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-lg border border-dashed py-16 text-center" style={{ borderColor: 'var(--border-strong)' }}>
            <p style={{ color: 'var(--text-lighter)' }}>
              {benchmarks.length === 0
                ? 'No hay benchmarks todavía. Creá el primero!'
                : 'No se encontraron benchmarks con esos filtros'}
            </p>
            {benchmarks.length === 0 && (
              <Link
                href="/benchmarks/new"
                className="mt-4 inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white hover:opacity-90"
                style={{ backgroundColor: 'var(--brand-600)' }}
              >
                <Plus className="h-4 w-4" />
                Crear Benchmark
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((b) => (
              <BenchmarkCard
                key={b.id}
                benchmark={b}
                competitorCount={b.competitors?.length || 0}
                screenshotCount={
                  b.competitors?.reduce((acc, c) => acc + (c.screenshots?.length || 0), 0) || 0
                }
              />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
