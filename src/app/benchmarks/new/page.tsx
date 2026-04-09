'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import TagInput from '@/components/TagInput';
import { useBenchmarkActions } from '@/hooks/useBenchmarks';
import type { BenchmarkStatus } from '@/lib/types';

const categories = [
  'Muro', 'Grupos', 'Noticias', 'Chats', 'Librerías de conocimiento',
  'Eventos', 'Portal de servicios', 'Reconocimientos', 'Formularios y Trámites',
  'Control horario', 'Vacaciones y permisos', 'Desempeño', 'Objetivos',
  'Personas', 'Organigrama', 'Archivos', 'Aprendizaje', 'Onboarding',
  'Tareas', 'People Experience', 'Encuestas', 'Mis documentos',
  'Marketplace', 'Accesos rápidos',
];

export default function NewBenchmarkPage() {
  const router = useRouter();
  const { createBenchmark, addCompetitor } = useBenchmarkActions();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [status, setStatus] = useState<BenchmarkStatus>('draft');
  const [competitors, setCompetitors] = useState<{ name: string; url: string }[]>([{ name: '', url: '' }]);
  const [saving, setSaving] = useState(false);

  function addCompetitorRow() {
    setCompetitors([...competitors, { name: '', url: '' }]);
  }

  function updateCompetitor(index: number, field: 'name' | 'url', value: string) {
    const updated = [...competitors];
    updated[index][field] = value;
    setCompetitors(updated);
  }

  function removeCompetitorRow(index: number) {
    setCompetitors(competitors.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const benchmark = await createBenchmark({
        title,
        description,
        category,
        tags,
        status,
        template_id: null,
      });

      const validCompetitors = competitors.filter((c) => c.name.trim());
      await Promise.all(
        validCompetitors.map((c) =>
          addCompetitor(benchmark.id, { name: c.name, url: c.url, notes: '' })
        )
      );

      router.push(`/benchmarks/${benchmark.id}`);
    } catch (err) {
      console.error(err);
      setSaving(false);
    }
  }

  return (
    <AppShell>
      <div className="mb-6">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-4 w-4" />
          Volver al dashboard
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-gray-900">Nuevo Benchmark</h1>

      <form onSubmit={handleSubmit} className="mt-6 max-w-2xl space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Título *</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Benchmark Checkout Flow Q1 2026"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Descripción</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Objetivo y alcance del benchmark..."
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Categoría</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Seleccionar...</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Estado</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as BenchmarkStatus)}
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="draft">Borrador</option>
              <option value="in_progress">En progreso</option>
              <option value="completed">Completado</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
          <TagInput
            tags={tags}
            onChange={setTags}
            suggestions={[]}
            placeholder="Agregar tag y presionar Enter..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Competidores</label>
          <div className="space-y-2">
            {competitors.map((c, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text"
                  value={c.name}
                  onChange={(e) => updateCompetitor(i, 'name', e.target.value)}
                  placeholder="Nombre del competidor"
                  className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <input
                  type="url"
                  value={c.url}
                  onChange={(e) => updateCompetitor(i, 'url', e.target.value)}
                  placeholder="https://..."
                  className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                {competitors.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeCompetitorRow(i)}
                    className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-500 hover:bg-gray-50"
                  >
                    &times;
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addCompetitorRow}
            className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            + Agregar competidor
          </button>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Creando...' : 'Crear Benchmark'}
          </button>
          <Link
            href="/"
            className="rounded-md border border-gray-300 px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </AppShell>
  );
}
