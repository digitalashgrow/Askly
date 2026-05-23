'use client';

import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  maxLength?: number;
  showCharCount?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', label, error, maxLength = 300, showCharCount = true, value = '', onChange, id, ...props }, ref) => {
    const [charCount, setCharCount] = React.useState(String(value).length);

    React.useEffect(() => {
      setCharCount(String(value).length);
    }, [value]);

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCharCount(e.target.value.length);
      if (onChange) {
        onChange(e);
      }
    };

    return (
      <div className="w-full flex flex-col gap-1.5">
        <div className="flex justify-between items-center px-1">
          {label && (
            <label
              htmlFor={id}
              className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider"
            >
              {label}
            </label>
          )}
          {showCharCount && maxLength && (
            <span className={`text-xs font-medium tracking-wider ${charCount >= maxLength ? 'text-rose-500 font-bold' : charCount >= maxLength - 20 ? 'text-amber-500' : 'text-neutral-400'}`}>
              {charCount}/{maxLength}
            </span>
          )}
        </div>
        <div className="relative">
          <textarea
            ref={ref}
            id={id}
            maxLength={maxLength}
            onChange={handleTextChange}
            value={value}
            className={`w-full px-4 py-3 rounded-2xl glass-input text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 text-base min-h-[120px] resize-none
              ${error ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20' : ''}
              ${className}
            `}
            {...props}
          />
        </div>
        {error && (
          <span className="text-xs text-rose-500 pl-1 font-medium animate-pulse">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
export default Textarea;
