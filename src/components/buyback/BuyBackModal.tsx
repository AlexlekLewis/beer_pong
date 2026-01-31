// Party Lions - Buy-Back Modal Component

import { motion } from 'framer-motion';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useTournamentStore } from '../../lib/store';
import { formatPrice } from '../../lib/buyback';

interface BuyBackModalProps {
    isOpen: boolean;
    onDismiss?: () => void;
}

export function BuyBackModal({ isOpen, onDismiss }: BuyBackModalProps) {
    const {
        pendingBuyBackTeamId,
        getTeamById,
        processBuyBackDecision,
        getCurrentBuyBackPrice
    } = useTournamentStore();

    const team = pendingBuyBackTeamId ? getTeamById(pendingBuyBackTeamId) : null;
    const price = getCurrentBuyBackPrice();

    if (!team) return null;

    const handleBuyBack = () => {
        processBuyBackDecision(team.id, true);
    };

    const handleDecline = () => {
        processBuyBackDecision(team.id, false);
    };

    return (
        <Modal isOpen={isOpen} onClose={onDismiss} showClose={true} size="md">
            <div className="text-center">
                {/* Header */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 10, delay: 0.1 }}
                    className="text-6xl mb-4"
                >
                    💀
                </motion.div>

                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-2xl font-bold text-[var(--danger)] mb-2 tracking-wider"
                >
                    ELIMINATED!
                </motion.h2>

                {/* Team Name */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-[var(--bg-elevated)] rounded-xl p-6 mb-6"
                >
                    <div className="text-4xl mb-2">🦁😵</div>
                    <h3 className="text-2xl font-bold text-white tracking-wide">
                        {team.name}
                    </h3>
                    <p className="text-[var(--text-muted)]">
                        {team.player1 && team.player2
                            ? `${team.player1} & ${team.player2}`
                            : 'has been eliminated!'
                        }
                    </p>
                </motion.div>

                {/* Buy Back Option */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    <p className="text-[var(--text-muted)] mb-4">
                        But wait... there's hope! 🍺
                    </p>

                    <div className="space-y-3">
                        <Button
                            variant="buyback"
                            fullWidth
                            size="lg"
                            onClick={handleBuyBack}
                            icon="💰"
                        >
                            BUY BACK FOR {formatPrice(price)}
                        </Button>

                        <p className="text-xs text-[var(--text-dim)]">
                            Stay in the game! (Cash collected by moderator)
                        </p>

                        <div className="pt-2">
                            <Button
                                variant="ghost"
                                fullWidth
                                onClick={handleDecline}
                                icon="☠️"
                            >
                                Accept Defeat
                            </Button>
                            <p className="text-xs text-[var(--text-dim)] mt-1">
                                Walk of shame...
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </Modal>
    );
}

// Price Display Component
interface PriceDisplayProps {
    round: number;
    basePrice?: number;
    increment?: number;
}

export function PriceDisplay({ round, basePrice = 10, increment = 10 }: PriceDisplayProps) {
    const price = basePrice + (round - 1) * increment;

    return (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[var(--purple-main)]/20 border border-[var(--purple-main)] rounded-lg">
            <span className="text-lg">💰</span>
            <span className="text-white font-bold">{formatPrice(price)}</span>
            <span className="text-[var(--text-muted)] text-sm">Buy-Back</span>
        </div>
    );
}
