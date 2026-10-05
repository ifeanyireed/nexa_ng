'use client';

import React, { useState, KeyboardEvent } from 'react';
import { X } from 'lucide-react';

interface TagsInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function TagsInput({ value, onChange }: TagsInputProps) {
  const [inputValue, setInputValue] = useState('');
  
  const tags = value ? value.split(',').map(t => t.trim()).filter(Boolean) : [];

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ',' || e.key === 'Enter') {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };
  
  const handleBlur = () => {
    addTag();
  };

  const addTag = () => {
    const newTag = inputValue.trim().replace(/,/g, '');
    if (newTag && !tags.includes(newTag)) {
      onChange([...tags, newTag].join(', '));
    }
    setInputValue('');
  };

  const removeTag = (indexToRemove: number) => {
    onChange(tags.filter((_, index) => index !== indexToRemove).join(', '));
  };

  return (
    <div className="w-full p-2 rounded-xl border border-slate-200 bg-slate-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500 transition-all flex flex-wrap gap-2 items-center min-h-[50px]">
      {tags.map((tag, index) => (
        <span key={index} className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2.5 py-1.5 rounded-md text-xs font-semibold">
          {tag}
          <button type="button" onClick={() => removeTag(index)} className="hover:text-blue-900 transition-colors">
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder={tags.length === 0 ? "Type and press comma..." : ""}
        className="flex-1 min-w-[120px] bg-transparent focus:outline-none text-sm font-medium text-slate-700 px-2 py-1"
      />
    </div>
  );
}
