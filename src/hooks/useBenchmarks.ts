'use client';

import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import type { Benchmark, Competitor, Screenshot } from '@/lib/types';

export function useBenchmarks() {
  const [benchmarks, setBenchmarks] = useState<Benchmark[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchBenchmarks = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('benchmarks')
      .select('*, user:users(*), competitors(*, screenshots(id))')
      .order('updated_at', { ascending: false });
    setBenchmarks(data || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchBenchmarks();
  }, [fetchBenchmarks]);

  return { benchmarks, loading, refetch: fetchBenchmarks };
}

export function useBenchmark(id: string) {
  const [benchmark, setBenchmark] = useState<Benchmark | null>(null);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchBenchmark = useCallback(async () => {
    setLoading(true);

    const [{ data: benchmarkData }, { data: competitorsData }] = await Promise.all([
      supabase
        .from('benchmarks')
        .select('*, user:users(*)')
        .eq('id', id)
        .single(),
      supabase
        .from('competitors')
        .select('*, screenshots(*)')
        .eq('benchmark_id', id)
        .order('created_at', { ascending: true }),
    ]);

    setBenchmark(benchmarkData);
    setCompetitors(competitorsData || []);
    setLoading(false);
  }, [id, supabase]);

  useEffect(() => {
    fetchBenchmark();
  }, [fetchBenchmark]);

  return { benchmark, competitors, loading, refetch: fetchBenchmark };
}

export function useBenchmarkActions() {
  const supabase = createClient();

  async function createBenchmark(data: {
    title: string;
    description: string;
    category: string;
    tags: string[];
    status: string;
    template_id: string | null;
  }) {
    const { data: { user } } = await supabase.auth.getUser();
    const { data: benchmark, error } = await supabase
      .from('benchmarks')
      .insert({ ...data, created_by: user?.id })
      .select()
      .single();
    if (error) throw error;
    return benchmark;
  }

  async function updateBenchmark(id: string, data: Partial<Benchmark>) {
    const { error } = await supabase
      .from('benchmarks')
      .update(data)
      .eq('id', id);
    if (error) throw error;
  }

  async function deleteBenchmark(id: string) {
    const { error } = await supabase
      .from('benchmarks')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }

  async function addCompetitor(benchmarkId: string, data: { name: string; url: string; notes: string }) {
    const { data: competitor, error } = await supabase
      .from('competitors')
      .insert({ ...data, benchmark_id: benchmarkId })
      .select()
      .single();
    if (error) throw error;
    return competitor;
  }

  async function updateCompetitor(id: string, data: Partial<Competitor>) {
    const { error } = await supabase
      .from('competitors')
      .update(data)
      .eq('id', id);
    if (error) throw error;
  }

  async function deleteCompetitor(id: string) {
    const { error } = await supabase
      .from('competitors')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }

  async function addScreenshot(competitorId: string, data: {
    image_url: string;
    caption: string;
    section: string;
    tags: string[];
    figma_node_id?: string;
    figma_file_key?: string;
    figma_url?: string;
  }) {
    const { data: screenshot, error } = await supabase
      .from('screenshots')
      .insert({ ...data, competitor_id: competitorId })
      .select()
      .single();
    if (error) throw error;
    return screenshot;
  }

  async function deleteScreenshot(id: string) {
    const { error } = await supabase
      .from('screenshots')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }

  return {
    createBenchmark,
    updateBenchmark,
    deleteBenchmark,
    addCompetitor,
    updateCompetitor,
    deleteCompetitor,
    addScreenshot,
    deleteScreenshot,
  };
}
