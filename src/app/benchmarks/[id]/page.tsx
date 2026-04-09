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

import {
  useBenchmark,
  useBenchmarkActions,
} from '@/hooks/useBenchmarks';

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

const TAB_COLORS = [
  { bg: 'bg-orange-400', ring: 'ring-orange-400', text: 'text-orange-600', light: 'bg-orange-50', border: 'border-orange-400' },
  { bg: 'bg-blue-400', ring: 'ring-blue-400', text: 'text-blue-600', light: 'bg-blue-50', border: 'border-blue-400' },
  { bg: 'bg-green-400', ring: 'ring-green-400', text: 'text-green-600', light: 'bg-green-50', border: 'border-green-400' },
  { bg: 'bg-yellow-400', ring: 'ring-yellow-400', text: 'text-yellow-600', light: 'bg-yellow-50', border: 'border-yellow-400' },
  { bg: 'bg-purple-400', ring: 'ring-purple-400', text: 'text-purple-600', light: 'bg-purple-50', border: 'border-purple-400' },
  { bg: 'bg-red-400', ring: 'ring-red-400', text: 'text-red-600', light: 'bg-red-50', border: 'border-red-400' },
  { bg: 'bg-teal-400', ring: 'ring-teal-400', text: 'text-teal-600', light: 'bg-teal-50', border: 'border-teal-400' },
  { bg: 'bg-pink-400', ring: 'ring-pink-400', text: 'text-pink-600', light: 'bg-pink-50', border: 'border-pink-400' },
];

/** Parse competitor notes into structured sections */
function parseNotes(notes: string) {
  const lines = notes.split('\n').filter((l) => l.trim());

  let subtitle = '';
  const steps: { title: string; description: string }[] = [];
  let featureKey = '';
  let preAccess = '';
  let extraParagraphs: string[] = [];

  let i = 0;

  // First line is usually the subtitle/tagline
  if (lines.length > 0 && !lines[0].match(/^\d+\./)) {
    subtitle = lines[0];
    i = 1;
  }

  // Skip "Flujo de onboarding:" header if present
  if (i < lines.length && lines[i].toLowerCase().includes('flujo de onboarding')) {
    i++;
  }

  // Parse numbered steps
  while (i < lines.length) {
    const line = lines[i];
    const stepMatch = line.match(/^(\d+)\.\s+(.+)/);
    if (stepMatch) {
      steps.push({ title: '', description: stepMatch[2] });
      i++;
      continue;
    }
    break;
  }

  // Parse remaining lines
  while (i < lines.length) {
    const line = lines[i];
    if (line.toLowerCase().startsWith('feature clave:') || line.toLowerCase().startsWith('features clave:')) {
      featureKey = line.replace(/^features? clave:\s*/i, '');
    } else if (line.toLowerCase().startsWith('acceso pre-inicio:')) {
      preAccess = line.replace(/^acceso pre-inicio:\s*/i, '');
    } else if (line.trim()) {
      extraParagraphs.push(line);
    }
    i++;
  }

  return { subtitle, steps, featureKey, preAccess, extraParagraphs };
}

/** Render bold markers: **text** or text between existing bold markers */
function renderFormattedText(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold text-gray-900">{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}

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
          <div className="h-8 w-64 rounded bg-gray-200" />
          <div className="h-4 w-96 rounded bg-gray-200" />
          <div className="h-64 rounded-lg bg-gray-200" />
        </div>
      </AppShell>
    );
  }

  if (!benchmark) {
    return (
      <AppShell>
        <p className="text-gray-500">Benchmark no encontrado</p>
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
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Dashboard
        </Link>
        <div className="flex gap-2">
          <Link
            href={`/benchmarks/${id}/edit`}
            className="inline-flex items-center gap-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
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
          <h1 className="text-2xl font-bold text-gray-900">{benchmark.title}</h1>
          <span
            className={`mt-1 shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[benchmark.status]}`}
          >
            {statusLabels[benchmark.status]}
          </span>
        </div>
        {benchmark.description && (
          <p className="mt-2 text-gray-600">{benchmark.description}</p>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-gray-500">
          {benchmark.category && (
            <span className="rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-medium text-purple-700">
              {benchmark.category}
            </span>
          )}
          {benchmark.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700"
            >
              {tag}
            </span>
          ))}
          <span className="text-xs text-gray-400">
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
                    : 'border border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span className={`inline-block h-2.5 w-2.5 rounded-full ${color.bg}`} />
                {comp.name}
              </button>
            );
          })}
          <button
            onClick={() => setShowAddCompetitor(true)}
            className="inline-flex items-center gap-1 rounded-full border border-dashed border-gray-300 px-3 py-2 text-sm text-gray-400 hover:border-gray-400 hover:text-gray-600"
          >
            <Plus className="h-3.5 w-3.5" />
            Agregar
          </button>
        </div>

        {/* Add Competitor Form */}
        {showAddCompetitor && (
          <form onSubmit={handleAddCompetitor} className="mt-4 space-y-3 rounded-lg border border-gray-200 bg-white p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={newCompetitorName}
                onChange={(e) => setNewCompetitorName(e.target.value)}
                placeholder="Nombre del competidor"
                className="flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm"
                autoFocus
              />
              <input
                type="url"
                value={newCompetitorUrl}
                onChange={(e) => setNewCompetitorUrl(e.target.value)}
                placeholder="https://..."
                className="flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm"
              />
            </div>
            <textarea
              value={newCompetitorNotes}
              onChange={(e) => setNewCompetitorNotes(e.target.value)}
              placeholder="Descripción o notas..."
              rows={2}
              className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <div className="flex gap-2">
              <button type="submit" className="rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700">
                Agregar
              </button>
              <button type="button" onClick={() => setShowAddCompetitor(false)} className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50">
                Cancelar
              </button>
            </div>
          </form>
        )}

        {/* Active Competitor Content */}
        {activeComp && (
          <div className="mt-6 rounded-xl border border-gray-200 bg-white">
            {/* Competitor Header */}
            <div className="border-b border-gray-100 px-6 py-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className={`inline-block h-4 w-4 rounded-full ${activeColor.bg}`} />
                  <h2 className="text-xl font-bold text-gray-900">{activeComp.name}</h2>
                  {activeComp.url && (
                    <a
                      href={activeComp.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-blue-500"
                    >
                      <Globe className="h-4 w-4" />
                    </a>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setEditingNotes({ ...editingNotes, [activeComp.id]: activeComp.notes || '' })
                    }
                    className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    title="Editar notas"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCompetitor(activeComp.id)}
                    className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
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
                  <textarea
                    value={editingNotes[activeComp.id]}
                    onChange={(e) =>
                      setEditingNotes({ ...editingNotes, [activeComp.id]: e.target.value })
                    }
                    rows={12}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 font-mono focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={async () => {
                        await updateCompetitor(activeComp.id, { notes: editingNotes[activeComp.id] });
                        const updated = { ...editingNotes };
                        delete updated[activeComp.id];
                        setEditingNotes(updated);
                        refetch();
                      }}
                      className="rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
                    >
                      Guardar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = { ...editingNotes };
                        delete updated[activeComp.id];
                        setEditingNotes(updated);
                      }}
                      className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : activeComp.notes ? (
                (() => {
                  const parsed = parseNotes(activeComp.notes);
                  return (
                    <div className="space-y-6">
                      {/* Subtitle */}
                      {parsed.subtitle && (
                        <p className="text-sm text-gray-500 font-mono">{parsed.subtitle}</p>
                      )}

                      {/* Steps */}
                      {parsed.steps.length > 0 && (
                        <div className="space-y-4">
                          {parsed.steps.map((step, i) => (
                            <div key={i} className="flex gap-4">
                              <div className="flex-shrink-0">
                                <span className={`flex h-9 w-9 items-center justify-center rounded-full ${activeColor.light} ${activeColor.text} text-sm font-semibold`}>
                                  {i + 1}
                                </span>
                              </div>
                              <div className="flex-1 pt-1">
                                <p className="text-sm leading-relaxed text-gray-700">{step.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Feature Key */}
                      {parsed.featureKey && (
                        <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                          <p className="text-sm text-gray-700">
                            <span className="font-semibold">Feature clave: </span>
                            {parsed.featureKey}
                          </p>
                        </div>
                      )}

                      {/* Pre-access Callout */}
                      {parsed.preAccess && (
                        <div className={`rounded-lg px-4 py-3 ${
                          parsed.preAccess.includes('\u2705')
                            ? 'border border-green-200 bg-green-50'
                            : 'border border-yellow-200 bg-yellow-50'
                        }`}>
                          <p className={`text-sm font-medium ${
                            parsed.preAccess.includes('\u2705')
                              ? 'text-green-800'
                              : 'text-yellow-800'
                          }`}>
                            Acceso pre-inicio: {parsed.preAccess}
                          </p>
                        </div>
                      )}

                      {/* Extra paragraphs */}
                      {parsed.extraParagraphs.map((p, i) => (
                        <p key={i} className="text-sm leading-relaxed text-gray-600">{p}</p>
                      ))}
                    </div>
                  );
                })()
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    setEditingNotes({ ...editingNotes, [activeComp.id]: '' })
                  }
                  className="w-full rounded-md border border-dashed border-gray-200 px-4 py-8 text-center text-sm text-gray-400 transition-colors hover:border-gray-400 hover:bg-gray-50"
                >
                  + Agregar descripción o notas...
                </button>
              )}
            </div>

            {/* Screenshots Section */}
            <div className="border-t border-gray-100 px-6 py-5">
              <h3 className="mb-4 text-sm font-semibold text-gray-900 uppercase tracking-wide">Screenshots</h3>
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
          <div className="mt-6 rounded-lg border border-dashed border-gray-300 py-12 text-center">
            <p className="text-gray-500">No hay competidores todavía. Agregá el primero.</p>
          </div>
        )}
      </div>

    </AppShell>
  );
}
