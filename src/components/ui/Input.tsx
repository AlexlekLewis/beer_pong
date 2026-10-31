// Party Lions - Input Component

import { type InputHTMLAttributes, forwardRef, useId } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, icon, className = '', ...props }, ref) => {
        const generatedId = useId();
        const id = props.id ?? generatedId;
        return (
            <div className="w-full">
                {label && (
                    <label htmlFor={id} className="block text-sm font-medium text-[var(--text-muted)] mb-2">
                        {label}
                    </label>
                )}
                <div className="relative">
                    {icon && (
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-dim)]">
                            {icon}
                        </span>
                    )}
                    <input
                        id={id}
                        aria-invalid={!!error}
                        aria-describedby={error ? `${id}-error` : undefined}
                        ref={ref}
                        className={`input ${icon ? 'pl-10' : ''} ${error ? 'border-[var(--danger)]' : ''} ${className}`}
                        {...props}
                    />
                </div>
                {error && (
                    <p id={`${id}-error`} role="alert" className="mt-1 text-sm text-[var(--danger)]">{error}</p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

// Textarea variant
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ label, error, className = '', ...props }, ref) => {
        const generatedId = useId();
        const id = props.id ?? generatedId;
        return (
            <div className="w-full">
                {label && (
                    <label htmlFor={id} className="block text-sm font-medium text-[var(--text-muted)] mb-2">
                        {label}
                    </label>
                )}
                <textarea
                    ref={ref}
                    className={`input min-h-[100px] resize-y ${error ? 'border-[var(--danger)]' : ''} ${className}`}
                    {...props}
                />
                {error && (
                    <p id={`${id}-error`} role="alert" className="mt-1 text-sm text-[var(--danger)]">{error}</p>
                )}
            </div>
        );
    }
);

Textarea.displayName = 'Textarea';
