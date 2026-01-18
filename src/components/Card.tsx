import React, { type ReactNode } from 'react';

interface CardProps {
    children: ReactNode;
    title?: ReactNode;
    className?: string;
    neonColor?: string; // e.g., 'var(--primary)'
}

export const Card: React.FC<CardProps> = ({ children, title, className = '' }) => {
    return (
        <div className={`bg-bg-elevated/50 backdrop-blur-sm border border-white/5 rounded-xl shadow-xl overflow-hidden ${className}`}>
            {title && (
                <div className="px-6 py-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
                    <h3 className="text-lg font-bold font-rajdhani uppercase tracking-wide text-white">
                        {title}
                    </h3>
                    <div className="h-1 w-12 bg-primary rounded-full"></div>
                </div>
            )}

            <div className="p-6">
                {children}
            </div>
        </div>
    );
};
