'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const supabase = createClient();

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage('Revisá tu email para el link de acceso.');
    }
    setLoading(false);
  }

  async function handleGoogleLogin() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-layout)' }}>
      <div className="w-full max-w-sm space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-default)' }}>UX Benchmark Tool</h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-lighter)' }}>
            Iniciá sesión para acceder a los benchmarks del equipo
          </p>
        </div>

        <form onSubmit={handleMagicLink} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium" style={{ color: 'var(--text-lighter)' }}>
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-1"
              style={{ borderColor: 'var(--border-strong)', color: 'var(--text-default)' }}
              placeholder="tu@email.com"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md px-4 py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 hover:opacity-90"
            style={{ backgroundColor: 'var(--brand-600)' }}
          >
            {loading ? 'Enviando...' : 'Enviar magic link'}
          </button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t" style={{ borderColor: 'var(--border-strong)' }} />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2" style={{ backgroundColor: 'var(--bg-layout)', color: 'var(--text-lighter)' }}>o</span>
          </div>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full rounded-md border bg-white px-4 py-2 text-sm font-medium hover:bg-[#f5f6f8] focus:outline-none focus:ring-2 focus:ring-offset-2"
          style={{ borderColor: 'var(--border-strong)', color: 'var(--text-lighter)' }}
        >
          Continuar con Google
        </button>

        {message && (
          <p className="text-center text-sm" style={{ color: 'var(--success-600)' }}>{message}</p>
        )}
      </div>
    </div>
  );
}
