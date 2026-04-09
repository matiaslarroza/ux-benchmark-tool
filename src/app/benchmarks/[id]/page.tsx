'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Plus,
  Globe,
  Pencil,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import AppShell from '@/components/AppShell';
import ImageGallery from '@/components/ImageGallery';
import ImageUpload from '@/components/ImageUpload';
import RichTextEditor from '@/components/RichTextEditor';

import {
  useBenchmark,
  useBenchmarkActions,
} from '@/hooks/useBenchmarks';

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-[#636271]',
  in_progress: 'bg-yellow-100 text-yellow-700',
  completed: 'bg-green-100 text-green-700',
};

const statusLabels: Record<string, string> = {
  draft: 'Borrador',
  in_progress: 'En progreso',
  completed: 'Completado',
};

const TAB_COLORS = [
  { bg: 'bg-orange-400', ring: 'ring-orange-400', text: 'text-orange-600', light: 'bg-orange-50', border: 'border-orange-400' },
  { bg: 'bg-blue-400', ring: 'ring-blue-400', text: 'text-blue-600', light: 'bg-[#eff2ff]', border: 'border-blue-400' },
  { bg: 'bg-green-400', ring: 'ring-green-400', text: 'text-green-600', light: 'bg-green-50', border: 'border-green-400' },
  { bg: 'bg-yellow-400', ring: 'ring-yellow-400', text: 'text-yellow-600', light: 'bg-yellow-50', border: 'border-yellow-400' },
  { bg: 'bg-purple-400', ring: 'ring-purple-400', text: 'text-purple-600', light: 'bg-purple-50', border: 'border-purple-400' },
  { bg: 'bg-red-400', ring: 'ring-red-400', text: 'text-red-600', light: 'bg-red-50', border: 'border-red-400' },
  { bg: 'bg-teal-400', ring: 'ring-teal-400', text: 'text-teal-600', light: 'bg-teal-50', border: 'border-teal-400' },
  { bg: 'bg-pink-400', ring: 'ring-pink-400', text: 'text-pink-600', light: 'bg-pink-50', border: 'border-pink-400' },
];

export default function BenchmarkDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { benchmark, competitors, loading, refetch } = useBenchmark(id);
  const {
    deleteBenchmark,
    addCompetitor,
    updateCompetitor,
    deleteCompetitor,
    addScreenshot,
    deleteScreenshot,
  } = useBenchmarkActions();

  const [activeTab, setActiveTab] = useState(0);
  const [showAddCompetitor, setShowAddCompetitor] = useState(false);
  const [newCompetitorName, setNewCompetitorName] = useState('');
  const [newCompetitorUrl, setNewCompetitorUrl] = useState('');
  const [newCompetitorNotes, setNewCompetitorNotes] = useState('');
  const [editingNotes, setEditingNotes] = useState<Record<string, string>>({});
  const [editingFigmaUrl, setEditingFigmaUrl] = useState<Record<string, string>>({});


  async function handleDeleteBenchmark() {
    if (!confirm('Seguro que querés eliminar este benchmark?')) return;
    await deleteBenchmark(id);
    router.push('/');
  }

  async function handleAddCompetitor(e: React.FormEvent) {
    e.preventDefault();
    if (!newCompetitorName.trim()) return;
    await addCompetitor(id, {
      name: newCompetitorName,
      url: newCompetitorUrl,
      notes: newCompetitorNotes,
    });
    setNewCompetitorName('');
    setNewCompetitorUrl('');
    setNewCompetitorNotes('');
    setShowAddCompetitor(false);
    refetch();
  }

  async function handleDeleteCompetitor(cId: string) {
    if (!confirm('Eliminar este competidor y todas sus screenshots?')) return;
    await deleteCompetitor(cId);
    if (activeTab >= competitors.length - 1 && activeTab > 0) {
      setActiveTab(activeTab - 1);
    }
    refetch();
  }

  async function handleUpload(competitorId: string, url: string) {
    await addScreenshot(competitorId, {
      image_url: url,
      caption: '',
      section: '',
      tags: [],
    });
    refetch();
  }

  async function handleDeleteScreenshot(screenshotId: string) {
    await deleteScreenshot(screenshotId);
    refetch();
  }

  if (loading) {
    return (
      <AppShell>
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 rounded bg-[#e8e9ed]" />
          <div className="h-4 w-96 rounded bg-[#e8e9ed]" />
          <div className="h-64 rounded-lg bg-[#e8e9ed]" />
        </div>
      </AppShell>
    );
  }

  if (!benchmark) {
    return (
      <AppShell>
        <p className="text-[#636271]">Benchmark no encontrado</p>
      </AppShell>
    );
  }

  const totalScreenshots = competitors.reduce(
    (acc, c) => acc + (c.screenshots?.length || 0),
    0
  );

  const activeComp = competitors[activeTab];
  const activeColor = TAB_COLORS[activeTab % TAB_COLORS.length];

  return (
    <AppShell>
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-[#636271] hover:text-[#636271]"
        >
          <ArrowLeft className="h-4 w-4" />
          Dashboard
        </Link>
        <div className="flex gap-2">
          <Link
            href={`/benchmarks/${id}/edit`}
            className="inline-flex items-center gap-1 rounded-md border border-[#d1d2d9] px-3 py-1.5 text-sm text-[#636271] hover:bg-[#f5f6f8]"
          >
            <Edit className="h-4 w-4" />
            Editar
          </Link>
          <button
            onClick={handleDeleteBenchmark}
            className="inline-flex items-center gap-1 rounded-md border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
            Eliminar
          </button>
        </div>
      </div>

      {/* Header */}
      <div>
        <div className="flex items-start gap-3">
          <h1 className="text-2xl font-semibold text-[#303036]">{benchmark.title}</h1>
          <span
            className={`mt-1 shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[benchmark.status]}`}
          >
            {statusLabels[benchmark.status]}
          </span>
        </div>
        {benchmark.description && (
          <p className="mt-2 text-[#636271]">{benchmark.description}</p>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-[#636271]">
          {benchmark.category && (
            <span className="rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-medium text-purple-700">
              {benchmark.category}
            </span>
          )}
          {benchmark.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-[#eff2ff] px-2.5 py-0.5 text-xs font-medium text-[#213478]"
            >
              {tag}
            </span>
          ))}
          <span className="text-xs text-[#9ca3af]">
            por {benchmark.user?.name || 'Desconocido'} &middot;{' '}
            {formatDistanceToNow(new Date(benchmark.created_at), {
              addSuffix: true,
              locale: es,
            })}{' '}
            &middot; {competitors.length} competidores &middot; {totalScreenshots} screenshots
          </span>
        </div>
      </div>

      {/* Competitors Tabs */}
      <div className="mt-8">
        <div className="flex items-center gap-2 flex-wrap">
          {competitors.map((comp, i) => {
            const color = TAB_COLORS[i % TAB_COLORS.length];
            const isActive = i === activeTab;
            return (
              <button
                key={comp.id}
                onClick={() => setActiveTab(i)}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  isActive
                    ? `bg-gray-900 text-white shadow-sm`
                    : 'border border-[#e8e9ed] bg-white text-[#636271] hover:border-[#d1d2d9] hover:bg-[#f5f6f8]'
                }`}
              >
                <span className={`inline-block h-2.5 w-2.5 rounded-full ${color.bg}`} />
                {comp.name}
              </button>
            );
          })}
          <button
            onClick={() => setShowAddCompetitor(true)}
            className="inline-flex items-center gap-1 rounded-full border border-dashed border-[#d1d2d9] px-3 py-2 text-sm text-[#9ca3af] hover:border-[#d1d2d9] hover:text-[#636271]"
          >
            <Plus className="h-3.5 w-3.5" />
            Agregar
          </button>
        </div>

        {/* Add Competitor Form */}
        {showAddCompetitor && (
          <form onSubmit={handleAddCompetitor} className="mt-4 space-y-3 rounded-lg border border-[#e8e9ed] bg-white p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={newCompetitorName}
                onChange={(e) => setNewCompetitorName(e.target.value)}
                placeholder="Nombre del competidor"
                className="flex-1 rounded-md border border-[#d1d2d9] px-3 py-1.5 text-sm"
                autoFocus
              />
              <input
                type="url"
                value={newCompetitorUrl}
                onChange={(e) => setNewCompetitorUrl(e.target.value)}
                placeholder="https://..."
                className="flex-1 rounded-md border border-[#d1d2d9] px-3 py-1.5 text-sm"
              />
            </div>
            <textarea
              value={newCompetitorNotes}
              onChange={(e) => setNewCompetitorNotes(e.target.value)}
              placeholder="Descripción o notas..."
              rows={2}
              className="w-full rounded-md border border-[#d1d2d9] px-3 py-1.5 text-sm text-[#303036] placeholder-gray-400 focus:border-[#6f93eb] focus:outline-none focus:ring-1 focus:ring-[#6f93eb]"
            />
            <div className="flex gap-2">
              <button type="submit" className="rounded-md bg-[#3b5fc2] px-4 py-1.5 text-sm font-medium text-white hover:bg-[#213478]">
                Agregar
              </button>
              <button type="button" onClick={() => setShowAddCompetitor(false)} className="rounded-md border border-[#d1d2d9] px-3 py-1.5 text-sm text-[#636271] hover:bg-[#f5f6f8]">
                Cancelar
              </button>
            </div>
          </form>
        )}

        {/* Active Competitor Content */}
        {activeComp && (
          <div className="mt-6 rounded-xl border border-[#e8e9ed] bg-white">
            {/* Competitor Header */}
            <div className="border-b border-[#e8e9ed] px-6 py-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className={`inline-block h-4 w-4 rounded-full ${activeColor.bg}`} />
                  <h2 className="text-xl font-semibold text-[#303036]">{activeComp.name}</h2>
                  {activeComp.url && (
                    <a
                      href={activeComp.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#9ca3af] hover:text-[#3b5fc2]"
                      title="Sitio web"
                    >
                      <Globe className="h-4 w-4" />
                    </a>
                  )}
                  {activeComp.figma_url && (
                    <a
                      href={activeComp.figma_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#9ca3af] hover:text-purple-500"
                      title="Ver en Figma"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 38 57" fill="currentColor"><path d="M19 28.5a9.5 9.5 0 1 1 19 0 9.5 9.5 0 0 1-19 0z"/><path d="M0 47.5A9.5 9.5 0 0 1 9.5 38H19v9.5a9.5 9.5 0 1 1-19 0z"/><path d="M19 0v19h9.5a9.5 9.5 0 1 0 0-19H19z"/><path d="M0 9.5A9.5 9.5 0 0 0 9.5 19H19V0H9.5A9.5 9.5 0 0 0 0 9.5z"/><path d="M0 28.5A9.5 9.5 0 0 0 9.5 38H19V19H9.5A9.5 9.5 0 0 0 0 28.5z"/></svg>
                    </a>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingNotes({ ...editingNotes, [activeComp.id]: activeComp.notes || '' });
                      setEditingFigmaUrl({ ...editingFigmaUrl, [activeComp.id]: activeComp.figma_url || '' });
                    }}
                    className="rounded-md p-1.5 text-[#9ca3af] hover:bg-[#f5f6f8] hover:text-[#636271]"
                    title="Editar notas y link de Figma"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCompetitor(activeComp.id)}
                    className="rounded-md p-1.5 text-[#9ca3af] hover:bg-red-50 hover:text-red-500"
                    title="Eliminar competidor"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Notes Content */}
            <div className="px-6 py-5">
              {editingNotes[activeComp.id] !== undefined ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-[#636271] mb-1">Link de Figma / FigJam (opcional)</label>
                    <input
                      type="url"
                      value={editingFigmaUrl[activeComp.id] || ''}
                      onChange={(e) =>
                        setEditingFigmaUrl({ ...editingFigmaUrl, [activeComp.id]: e.target.value })
                      }
                      placeholder="https://www.figma.com/design/... o https://www.figma.com/board/..."
                      className="w-full rounded-md border border-[#d1d2d9] px-3 py-2 text-sm text-[#303036] placeholder-gray-400 focus:border-[#6f93eb] focus:outline-none focus:ring-1 focus:ring-[#6f93eb]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#636271] mb-1">Descripción / Notas</label>
                    <RichTextEditor
                      content={editingNotes[activeComp.id]}
                      onChange={(html) =>
                        setEditingNotes({ ...editingNotes, [activeComp.id]: html })
                      }
                      placeholder="Escribí la descripción del competidor..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={async () => {
                        await updateCompetitor(activeComp.id, {
                          notes: editingNotes[activeComp.id],
                          figma_url: editingFigmaUrl[activeComp.id] || null,
                        });
                        const updatedNotes = { ...editingNotes };
                        delete updatedNotes[activeComp.id];
                        setEditingNotes(updatedNotes);
                        const updatedFigma = { ...editingFigmaUrl };
                        delete updatedFigma[activeComp.id];
                        setEditingFigmaUrl(updatedFigma);
                        refetch();
                      }}
                      className="rounded-md bg-[#3b5fc2] px-4 py-1.5 text-sm font-medium text-white hover:bg-[#213478]"
                    >
                      Guardar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const updatedNotes = { ...editingNotes };
                        delete updatedNotes[activeComp.id];
                        setEditingNotes(updatedNotes);
                        const updatedFigma = { ...editingFigmaUrl };
                        delete updatedFigma[activeComp.id];
                        setEditingFigmaUrl(updatedFigma);
                      }}
                      className="rounded-md border border-[#d1d2d9] px-3 py-1.5 text-sm text-[#636271] hover:bg-[#f5f6f8]"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : activeComp.notes ? (
                <div
                  className="rich-content text-sm"
                  dangerouslySetInnerHTML={{ __html: activeComp.notes }}
                />
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setEditingNotes({ ...editingNotes, [activeComp.id]: '' });
                    setEditingFigmaUrl({ ...editingFigmaUrl, [activeComp.id]: '' });
                  }}
                  className="w-full rounded-md border border-dashed border-[#e8e9ed] px-4 py-8 text-center text-sm text-[#9ca3af] transition-colors hover:border-[#d1d2d9] hover:bg-[#f5f6f8]"
                >
                  + Agregar descripción, notas o link de Figma...
                </button>
              )}
            </div>

            {/* Screenshots Section */}
            <div className="border-t border-[#e8e9ed] px-6 py-5">
              <h3 className="mb-4 text-sm font-semibold text-[#303036] uppercase tracking-wide">Screenshots</h3>
              <ImageGallery
                screenshots={activeComp.screenshots || []}
                onDelete={handleDeleteScreenshot}
              />

              <div className="mt-4">
                <ImageUpload
                  competitorId={activeComp.id}
                  onUpload={(url) => handleUpload(activeComp.id, url)}
                />
              </div>
            </div>
          </div>
        )}

        {competitors.length === 0 && !showAddCompetitor && (
          <div className="mt-6 rounded-lg border border-dashed border-[#d1d2d9] py-12 text-center">
            <p className="text-[#636271]">No hay competidores todavía. Agregá el primero.</p>
          </div>
        )}
      </div>

    </AppShell>
  );
}
