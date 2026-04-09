'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);

    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    if (updateError) {
      setError(updateError.message);
    } else {
      setMessage('Contraseña actualizada. Redirigiendo...');
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
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
            Nueva contraseña
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-lighter)' }}>
            Ingresá tu nueva contraseña
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium" style={{ color: 'var(--text-lighter)' }}>
              Nueva contraseña
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              className="mt-1 block w-full rounded-md border px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-1"
              style={{ borderColor: 'var(--border-strong)', color: 'var(--text-default)' }}
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          <div>
            <label className="block text-sm font-medium" style={{ color: 'var(--text-lighter)' }}>
              Confirmar contraseña
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={6}
              className="mt-1 block w-full rounded-md border px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-1"
              style={{ borderColor: 'var(--border-strong)', color: 'var(--text-default)' }}
              placeholder="Repetí la contraseña"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md px-4 py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 hover:opacity-90"
            style={{ backgroundColor: 'var(--brand-600)' }}
          >
            {loading ? 'Actualizando...' : 'Actualizar contraseña'}
          </button>
        </form>

        {error && (
          <p className="text-center text-sm" style={{ color: 'var(--error-600)' }}>{error}</p>
        )}
        {message && (
          <p className="text-center text-sm" style={{ color: 'var(--success-600)' }}>{message}</p>
        )}
      </div>
    </div>
  );
}
