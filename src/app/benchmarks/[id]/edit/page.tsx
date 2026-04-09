'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import AppShell from '@/components/AppShell';
import TagInput from '@/components/TagInput';
import { useBenchmark, useBenchmarkActions } from '@/hooks/useBenchmarks';
import type { BenchmarkStatus } from '@/lib/types';

const categories = [
  'Muro', 'Grupos', 'Noticias', 'Chats', 'Librerías de conocimiento',
  'Eventos', 'Portal de servicios', 'Reconocimientos', 'Formularios y Trámites',
  'Control horario', 'Vacaciones y permisos', 'Desempeño', 'Objetivos',
  'Personas', 'Organigrama', 'Archivos', 'Aprendizaje', 'Onboarding',
  'Tareas', 'People Experience', 'Encuestas', 'Mis documentos',
  'Marketplace', 'Accesos rápidos',
];

export default function EditBenchmarkPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { benchmark, loading } = useBenchmark(id);
  const { updateBenchmark } = useBenchmarkActions();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [status, setStatus] = useState<BenchmarkStatus>('draft');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (benchmark) {
      setTitle(benchmark.title);
      setDescription(benchmark.description);
      setCategory(benchmark.category);
      setTags(benchmark.tags);
      setStatus(benchmark.status);
    }
  }, [benchmark]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await updateBenchmark(id, { title, description, category, tags, status });
    router.push(`/benchmarks/${id}`);
  }

  if (loading) {
    return (
      <AppShell>
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded bg-[#e8e9ed]" />
          <div className="h-64 rounded-lg bg-[#e8e9ed]" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mb-6">
        <Link
          href={`/benchmarks/${id}`}
          className="inline-flex items-center gap-1 text-sm text-[#636271] hover:text-[#636271]"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Link>
      </div>

      <h1 className="text-2xl font-semibold text-[#303036]">Editar Benchmark</h1>

      <form onSubmit={handleSubmit} className="mt-6 max-w-2xl space-y-6">
        <div>
          <label className="block text-sm font-medium text-[#636271]">Título *</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full rounded-md border border-[#d1d2d9] px-3 py-2 text-sm text-[#303036] focus:border-[#6f93eb] focus:outline-none focus:ring-1 focus:ring-[#6f93eb]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#636271]">Descripción</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="mt-1 block w-full rounded-md border border-[#d1d2d9] px-3 py-2 text-sm text-[#303036] focus:border-[#6f93eb] focus:outline-none focus:ring-1 focus:ring-[#6f93eb]"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#636271]">Categoría</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 block w-full rounded-md border border-[#d1d2d9] bg-white px-3 py-2 text-sm text-[#636271] focus:border-[#6f93eb] focus:outline-none focus:ring-1 focus:ring-[#6f93eb]"
            >
              <option value="">Seleccionar...</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#636271]">Estado</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as BenchmarkStatus)}
              className="mt-1 block w-full rounded-md border border-[#d1d2d9] bg-white px-3 py-2 text-sm text-[#636271] focus:border-[#6f93eb] focus:outline-none focus:ring-1 focus:ring-[#6f93eb]"
            >
              <option value="draft">Borrador</option>
              <option value="in_progress">En progreso</option>
              <option value="completed">Completado</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#636271] mb-1">Tags</label>
          <TagInput tags={tags} onChange={setTags} />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-[#3b5fc2] px-6 py-2 text-sm font-medium text-white hover:bg-[#213478] disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
          <Link
            href={`/benchmarks/${id}`}
            className="rounded-md border border-[#d1d2d9] px-6 py-2 text-sm font-medium text-[#636271] hover:bg-[#f5f6f8]"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </AppShell>
  );
}
