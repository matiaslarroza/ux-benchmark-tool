'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Plus, Search, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Nuevo Benchmark', href: '/benchmarks/new', icon: Plus },

  { name: 'Buscar', href: '/search', icon: Search },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  return (
    <aside className="fixed inset-y-0 left-0 z-10 flex w-64 flex-col border-r bg-white" style={{ borderColor: 'var(--border-default)' }}>
      <div className="flex h-16 items-center gap-2 border-b px-6" style={{ borderColor: 'var(--border-default)' }}>
        <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--brand-600)' }}>
          <span className="text-white font-semibold text-sm">UX</span>
        </div>
        <span className="font-semibold" style={{ color: 'var(--text-default)' }}>Benchmark Tool</span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = item.href === '/'
            ? pathname === '/'
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? ''
                  : 'hover:bg-[#f5f6f8]'
              }`}
              style={
                isActive
                  ? { backgroundColor: 'var(--brand-50)', color: 'var(--brand-800)' }
                  : { color: 'var(--text-lighter)' }
              }
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4" style={{ borderColor: 'var(--border-default)' }}>
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium" style={{ color: 'var(--text-default)' }}>
              {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuario'}
            </p>
            <p className="truncate text-xs" style={{ color: 'var(--text-lighter)' }}>{user?.email}</p>
          </div>
          <button
            onClick={signOut}
            className="rounded-md p-1.5 hover:bg-[#f5f6f8]"
            style={{ color: 'var(--neutral-400)' }}
            title="Cerrar sesión"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
