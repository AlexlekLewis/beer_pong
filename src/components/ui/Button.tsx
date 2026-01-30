// Party Lions - Button Component

import { motion } from 'framer-motion';
import { ReactNode, ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'danger' | 'success' | 'buyback' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    variant?: ButtonVariant;
    size?: 'sm' | 'md' | 'lg';
    icon?: ReactNode;
    loading?: boolean;
    fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
    primary: 'btn-primary',
    danger: 'btn-danger',
    success: 'btn-success',
    buyback: 'btn-buyback',
    ghost: 'btn-ghost',
};

const sizeClasses = {
    sm: 'text-sm py-2 px-4',
    md: 'text-base py-3 px-6',
    lg: 'text-lg py-4 px-8',
};

export function Button({
    children,
    variant = 'primary',
    size = 'md',
    icon,
    loading = false,
    fullWidth = false,
    disabled,
    className = '',
    ...props
}: ButtonProps) {
    return (
        <motion.button
            className={`btn ${variantClasses[variant]} ${sizeClasses[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
            disabled={disabled || loading}
            whileHover={{ scale: disabled ? 1 : 1.02 }}
            whileTap={{ scale: disabled ? 1 : 0.98 }}
            {...props}
        >
            {loading ? (
                <span className="animate-spin">⏳</span>
            ) : icon ? (
                <span>{icon}</span>
            ) : null}
            {children}
        </motion.button>
    );
}
