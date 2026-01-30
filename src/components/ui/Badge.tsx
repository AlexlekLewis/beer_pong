// Party Lions - Badge Component

import { motion } from 'framer-motion';
import type { TeamStatus } from '../../types';

type BadgeVariant = 'eliminated' | 'bought_back' | 'wildcard' | 'winner' | 'active' | 'default';

interface BadgeProps {
    variant?: BadgeVariant;
    children: React.ReactNode;
    animated?: boolean;
    className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
    eliminated: 'badge-eliminated',
    bought_back: 'badge-bought-back',
    wildcard: 'badge-wildcard',
    winner: 'badge-winner',
    active: 'badge-active',
    default: 'bg-[var(--bg-elevated)] text-[var(--text-muted)]',
};

const variantEmojis: Record<BadgeVariant, string> = {
    eliminated: '💀',
    bought_back: '💰',
    wildcard: '🎰',
    winner: '🏆',
    active: '🦁',
    default: '',
};

export function Badge({
    variant = 'default',
    children,
    animated = false,
    className = ''
}: BadgeProps) {
    const Component = animated ? motion.span : 'span';
    const animationProps = animated ? {
        initial: { scale: 0 },
        animate: { scale: 1 },
        transition: { type: 'spring', damping: 10, stiffness: 200 }
    } : {};

    return (
        <Component
            className={`badge ${variantClasses[variant]} ${className}`}
            {...animationProps}
        >
            {variantEmojis[variant] && <span>{variantEmojis[variant]}</span>}
            {children}
        </Component>
    );
}

// Helper to get badge variant from team status
export function getStatusBadgeVariant(status: TeamStatus): BadgeVariant {
    switch (status) {
        case 'eliminated':
            return 'eliminated';
        case 'bought_back':
            return 'bought_back';
        case 'wildcarded':
            return 'wildcard';
        case 'active':
            return 'active';
        default:
            return 'default';
    }
}

// Status badge helper component
interface StatusBadgeProps {
    status: TeamStatus;
    animated?: boolean;
}

export function StatusBadge({ status, animated = false }: StatusBadgeProps) {
    const labels: Record<TeamStatus, string> = {
        active: 'Active',
        eliminated: 'Eliminated',
        bought_back: 'Bought Back',
        wildcarded: 'Wildcard',
    };

    return (
        <Badge variant={getStatusBadgeVariant(status)} animated={animated}>
            {labels[status]}
        </Badge>
    );
}
