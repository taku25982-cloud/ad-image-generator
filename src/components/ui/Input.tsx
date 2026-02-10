// ========================================
// Input コンポーネント
// ========================================

'use client';

import { forwardRef, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, helperText, className = '', id, ...props }, ref) => {
        const inputId = id || label?.toLowerCase().replace(/\s/g, '-');

        return (
            <div className="w-full">
                {label && (
                    <label htmlFor={inputId} className="label">
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    id={inputId}
                    className={`input ${error ? 'border-[var(--error-500)] focus:border-[var(--error-500)] focus:shadow-[0_0_0_3px_var(--error-50)]' : ''} ${className}`}
                    {...props}
                />
                {error && (
                    <p className="mt-1.5 text-sm text-[var(--error-500)]">{error}</p>
                )}
                {helperText && !error && (
                    <p className="mt-1.5 text-sm text-[var(--text-tertiary)]">{helperText}</p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';
