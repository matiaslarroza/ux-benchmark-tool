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
    <aside className="fixed inset-y-0 left-0 z-10 flex w-64 flex-col border-r border-gray-200 bg-white">
      <div className="flex h-16 items-center gap-2 border-b border-gray-200 px-6">
        <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
          <span className="text-white font-bold text-sm">UX</span>
        </div>
        <span className="font-semibold text-gray-900">Benchmark Tool</span>
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
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-gray-900">
              {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuario'}
            </p>
            <p className="truncate text-xs text-gray-500">{user?.email}</p>
          </div>
          <button
            onClick={signOut}
            className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            title="Cerrar sesión"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
