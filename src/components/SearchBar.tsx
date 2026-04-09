'use client';

import { Search } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchBar({ value, onChange, placeholder = 'Buscar...' }: SearchBarProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--neutral-400)' }} />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border bg-white py-2 pl-10 pr-3 text-sm placeholder-gray-400 focus:outline-none focus:ring-1"
        style={{ borderColor: 'var(--border-strong)', color: 'var(--text-default)' }}
        onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--brand-400)'; e.currentTarget.style.boxShadow = '0 0 0 1px var(--brand-400)'; }}
        onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.boxShadow = 'none'; }}
      />
    </div>
  );
}
