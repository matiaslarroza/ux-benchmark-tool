'use client';

import { useState, KeyboardEvent } from 'react';
import { X } from 'lucide-react';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  suggestions?: string[];
}

export default function TagInput({ tags, onChange, placeholder = 'Agregar tag...', suggestions = [] }: TagInputProps) {
  const [input, setInput] = useState('');

  function addTag(tag: string) {
    const trimmed = tag.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInput('');
  }

  function removeTag(index: number) {
    onChange(tags.filter((_, i) => i !== index));
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(input);
    } else if (e.key === 'Backspace' && !input && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  }

  const filteredSuggestions = suggestions.filter(
    (s) => s.toLowerCase().includes(input.toLowerCase()) && !tags.includes(s.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-wrap items-center gap-1.5 rounded-md border bg-white px-2 py-1.5 focus-within:ring-1" style={{ borderColor: 'var(--border-strong)' }} onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--brand-400)'; }} onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-strong)'; }}>
        {tags.map((tag, i) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium"
            style={{ backgroundColor: 'var(--brand-50)', color: 'var(--brand-800)' }}
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(i)}
              className="hover:opacity-70"
              style={{ color: 'var(--brand-600)' }}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? placeholder : ''}
          className="min-w-[120px] flex-1 border-0 bg-transparent py-0.5 text-sm placeholder-gray-400 focus:outline-none"
          style={{ color: 'var(--text-default)' }}
        />
      </div>
      {input && filteredSuggestions.length > 0 && (
        <div className="mt-1 rounded-md border bg-white" style={{ borderColor: 'var(--border-default)', boxShadow: 'var(--shadow-4dp)' }}>
          {filteredSuggestions.slice(0, 5).map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => addTag(suggestion)}
              className="block w-full px-3 py-1.5 text-left text-sm hover:bg-[#f5f6f8]"
              style={{ color: 'var(--text-lighter)' }}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
