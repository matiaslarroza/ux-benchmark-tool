import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase env vars not configured');
  return createClient(url, key);
}

export async function POST(request: Request) {
  try {
    // Validate API key
    const apiKey = process.env.BENCHMARK_API_KEY || '';
    const authHeader = request.headers.get('authorization');
    const providedKey = authHeader?.replace('Bearer ', '');

    if (!apiKey || providedKey !== apiKey) {
      return NextResponse.json({ error: 'API key inválida' }, { status: 401 });
    }

    const supabase = getSupabase();
    const body = await request.json();
    const { title, description, category, tags, status, competitors, email } = body;

    if (!title || !competitors || !Array.isArray(competitors)) {
      return NextResponse.json(
        { error: 'Se requiere title y competitors[]' },
        { status: 400 }
      );
    }

    if (!email) {
      return NextResponse.json(
        { error: 'Se requiere email. Proporcioná tu email de UX Benchmark Tool.' },
        { status: 400 }
      );
    }

    // Find user by email
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, email, name')
      .ilike('email', email.trim());

    if (userError) {
      return NextResponse.json(
        { error: `Error buscando usuario: ${userError.message}` },
        { status: 500 }
      );
    }

    if (!users || users.length === 0) {
      return NextResponse.json(
        {
          error: `No se encontró una cuenta con el email "${email}" en UX Benchmark Tool. Registrate primero en https://ux-benchmark-tool.vercel.app/login y después volvé a intentar.`,
        },
        { status: 403 }
      );
    }

    const userId = users[0].id;

    // Create benchmark
    const { data: benchmark, error: bErr } = await supabase
      .from('benchmarks')
      .insert({
        title,
        description: description || '',
        category: category || '',
        tags: tags || [],
        status: status || 'completed',
        created_by: userId,
      })
      .select()
      .single();

    if (bErr) {
      return NextResponse.json({ error: bErr.message }, { status: 500 });
    }

    // Create competitors
    if (competitors.length > 0) {
      const competitorRows = competitors.map((c: { name: string; url?: string; notes?: string; figma_url?: string }) => ({
        benchmark_id: benchmark.id,
        name: c.name,
        url: c.url || '',
        notes: c.notes || '',
        figma_url: c.figma_url || null,
      }));

      const { error: cErr } = await supabase
        .from('competitors')
        .insert(competitorRows);

      if (cErr) {
        return NextResponse.json({ error: cErr.message }, { status: 500 });
      }
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ux-benchmark-tool.vercel.app';

    return NextResponse.json({
      success: true,
      benchmark: {
        id: benchmark.id,
        title: benchmark.title,
        url: `${appUrl}/benchmarks/${benchmark.id}`,
      },
      published_by: {
        name: users[0].name,
        email: users[0].email,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error desconocido' },
      { status: 500 }
    );
  }
}
