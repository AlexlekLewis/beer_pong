// Party Lions - Modal Component

import { motion, AnimatePresence } from 'framer-motion';
import { type ReactNode, useEffect } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose?: () => void;
    children: ReactNode;
    title?: string;
    showClose?: boolean;
    size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
}

const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
};

export function Modal({
    isOpen,
    onClose,
    children,
    title,
    showClose = true,
    size = 'md',
}: ModalProps) {
    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        className={`fixed inset-0 z-50 flex items-center justify-center p-4`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className={`glass-panel-strong w-full ${sizeClasses[size]} relative max-h-[90vh] flex flex-col`}
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            {(title || showClose) && (
                                <div className="flex items-center justify-between p-5 border-b border-[var(--border)]">
                                    {title && (
                                        <h2 className="text-xl font-bold text-gold-main tracking-wider">
                                            {title}
                                        </h2>
                                    )}
                                    {showClose && onClose && (
                                        <button
                                            onClick={onClose}
                                            className="text-[var(--text-muted)] hover:text-white transition-colors text-2xl leading-none"
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Content */}
                            <div className="p-5 overflow-auto flex-1">
                                {children}
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
