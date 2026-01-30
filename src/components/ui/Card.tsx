// Party Lions - Card Component

import { motion, HTMLMotionProps } from 'framer-motion';
import { ReactNode } from 'react';

interface CardProps extends HTMLMotionProps<'div'> {
    children: ReactNode;
    variant?: 'default' | 'elevated' | 'glass';
    hoverable?: boolean;
    neonBorder?: boolean;
    padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingClasses = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-8',
};

export function Card({
    children,
    variant = 'default',
    hoverable = true,
    neonBorder = false,
    padding = 'md',
    className = '',
    ...props
}: CardProps) {
    const baseClass = variant === 'glass'
        ? 'glass-panel'
        : variant === 'elevated'
            ? 'card card-elevated'
            : 'card';

    return (
        <motion.div
            className={`${baseClass} ${neonBorder ? 'neon-border' : ''} ${paddingClasses[padding]} ${className}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            whileHover={hoverable ? { scale: 1.01 } : undefined}
            {...props}
        >
            {children}
        </motion.div>
    );
}
