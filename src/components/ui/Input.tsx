'use client';

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, helperText, leftIcon, rightIcon, id, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={id}
            className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider pl-1"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-4 text-neutral-400 dark:text-neutral-500 pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={id}
            className={`w-full px-4 py-3 rounded-2xl glass-input text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 text-base
              ${leftIcon ? 'pl-11' : ''}
              ${rightIcon ? 'pr-11' : ''}
              ${error ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20' : ''}
              ${className}
            `}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-4 text-neutral-400 dark:text-neutral-500">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <span className="text-xs text-rose-500 pl-1 font-medium animate-pulse">
            {error}
          </span>
        )}
        {!error && helperText && (
          <span className="text-xs text-neutral-400 dark:text-neutral-500 pl-1">
            {helperText}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
