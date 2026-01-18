import React, { type InputHTMLAttributes } from 'react';

export const Input: React.FC<InputHTMLAttributes<HTMLInputElement>> = ({ className = '', ...props }) => {
    return (
        <input
            className={`
                bg-bg-dark/50 
                border-2 border-transparent focus:border-primary
                text-white placeholder-text-dim
                px-4 py-3 w-full rounded-lg
                font-rajdhani text-lg font-medium tracking-wide
                focus:outline-none focus:shadow-lg focus:shadow-primary/10
                transition-all duration-200
                ${className}
            `}
            {...props}
        />
    );
};
