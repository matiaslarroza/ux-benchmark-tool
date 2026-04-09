'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase';

const ALLOWED_DOMAIN = 'humand.co';

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const supabase = createClient();

  function validateDomain(email: string): boolean {
    const domain = email.split('@')[1]?.toLowerCase();
    return domain === ALLOWED_DOMAIN;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    if (!validateDomain(email)) {
      setError(`Solo se permiten emails @${ALLOWED_DOMAIN}`);
      setLoading(false);
      return;
    }

    if (mode === 'register') {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: { full_name: name },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
      } else {
        setMessage('Revisá tu email para confirmar tu cuenta.');
      }
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(
          signInError.message === 'Invalid login credentials'
            ? 'Email o contraseña incorrectos'
            : signInError.message
        );
      } else {
        window.location.href = '/';
      }
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-layout)' }}>
      <div className="w-full max-w-sm space-y-6 p-8">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg" style={{ backgroundColor: 'var(--brand-600)' }}>
            <span className="text-white font-semibold text-lg">UX</span>
          </div>
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-default)' }}>
            UX Benchmark Tool
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-lighter)' }}>
            {mode === 'login' ? 'Iniciá sesión con tu cuenta' : 'Creá tu cuenta'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-sm font-medium" style={{ color: 'var(--text-lighter)' }}>
                Nombre
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-md border px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-1"
                style={{ borderColor: 'var(--border-strong)', color: 'var(--text-default)' }}
                placeholder="Tu nombre"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium" style={{ color: 'var(--text-lighter)' }}>
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-1"
              style={{ borderColor: 'var(--border-strong)', color: 'var(--text-default)' }}
              placeholder={`tu@${ALLOWED_DOMAIN}`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium" style={{ color: 'var(--text-lighter)' }}>
              Contraseña
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              className="mt-1 block w-full rounded-md border px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-1"
              style={{ borderColor: 'var(--border-strong)', color: 'var(--text-default)' }}
              placeholder={mode === 'register' ? 'Mínimo 6 caracteres' : '••••••••'}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md px-4 py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 hover:opacity-90"
            style={{ backgroundColor: 'var(--brand-600)' }}
          >
            {loading
              ? (mode === 'login' ? 'Ingresando...' : 'Registrando...')
              : (mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta')
            }
          </button>
        </form>

        {error && (
          <p className="text-center text-sm" style={{ color: 'var(--error-600)' }}>{error}</p>
        )}
        {message && (
          <p className="text-center text-sm" style={{ color: 'var(--success-600)' }}>{message}</p>
        )}

        <p className="text-center text-sm" style={{ color: 'var(--text-lighter)' }}>
          {mode === 'login' ? (
            <>
              No tenés cuenta?{' '}
              <button
                type="button"
                onClick={() => { setMode('register'); setError(''); setMessage(''); }}
                className="font-medium hover:opacity-80"
                style={{ color: 'var(--brand-600)' }}
              >
                Registrate
              </button>
            </>
          ) : (
            <>
              Ya tenés cuenta?{' '}
              <button
                type="button"
                onClick={() => { setMode('login'); setError(''); setMessage(''); }}
                className="font-medium hover:opacity-80"
                style={{ color: 'var(--brand-600)' }}
              >
                Iniciá sesión
              </button>
            </>
          )}
        </p>

        <p className="text-center text-xs" style={{ color: 'var(--neutral-400)' }}>
          Solo disponible para emails @{ALLOWED_DOMAIN}
        </p>
      </div>
    </div>
  );
}
