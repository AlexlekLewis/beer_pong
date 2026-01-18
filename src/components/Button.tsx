import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'success';
    size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    ...props
}) => {
    const baseStyles = "relative font-rajdhani font-bold uppercase tracking-wider transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed clip-path-chamfer";

    // Esport variants
    const variants = {
        primary: "bg-primary text-white hover:bg-white hover:text-bg-dark shadow-lg shadow-primary/20",
        secondary: "bg-secondary text-text-muted hover:bg-text hover:text-bg-dark border border-white/5",
        danger: "bg-danger text-white hover:bg-red-400",
        success: "bg-success text-white hover:bg-emerald-400"
    };

    const sizes = {
        sm: "px-3 py-1 text-xs",
        md: "px-6 py-2 text-sm",
        lg: "px-10 py-3 text-lg"
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};
