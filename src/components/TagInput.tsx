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
      <div className="flex flex-wrap items-center gap-1.5 rounded-md border border-gray-300 bg-white px-2 py-1.5 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
        {tags.map((tag, i) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(i)}
              className="text-blue-500 hover:text-blue-700"
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
          className="min-w-[120px] flex-1 border-0 bg-transparent py-0.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
        />
      </div>
      {input && filteredSuggestions.length > 0 && (
        <div className="mt-1 rounded-md border border-gray-200 bg-white shadow-sm">
          {filteredSuggestions.slice(0, 5).map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => addTag(suggestion)}
              className="block w-full px-3 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-50"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
