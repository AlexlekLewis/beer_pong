// Party Lions - Settings Panel Component

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { useTournamentStore } from '../../lib/store';

export function SettingsPanel() {
    const { tournament, updateSettings } = useTournamentStore();

    const [localSettings, setLocalSettings] = useState({
        allowBuyBacks: tournament?.settings.allowBuyBacks ?? true,
        wildcardEnabled: tournament?.settings.wildcardEnabled ?? true,
        enableSoundEffects: tournament?.settings.enableSoundEffects ?? true,
        enableConfetti: tournament?.settings.enableConfetti ?? true,
    });

    if (!tournament) return null;

    const handleToggle = (key: keyof typeof localSettings) => {
        const newValue = !localSettings[key];
        setLocalSettings(prev => ({ ...prev, [key]: newValue }));
        updateSettings({ [key]: newValue });
    };

    const handleToggleTheme = (color: string) => {
        updateSettings({ themeColor: color });
    };

    return (
        <motion.div
            className="glass-panel p-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <span>⚙️</span> Tournament Settings
            </h3>

            <div className="space-y-4">
                {/* Buy-Backs Toggle */}
                <ToggleRow
                    label="Buy-Back System"
                    description="Allow eliminated teams to pay to re-enter"
                    icon="💰"
                    enabled={localSettings.allowBuyBacks}
                    onChange={() => handleToggle('allowBuyBacks')}
                />

                {/* Wildcard Toggle */}
                <ToggleRow
                    label="Wildcard Lottery"
                    description="Enable wheel spin for extra team when needed"
                    icon="🎰"
                    enabled={localSettings.wildcardEnabled}
                    onChange={() => handleToggle('wildcardEnabled')}
                />

                {/* Sound Effects Toggle */}
                <ToggleRow
                    label="Sound Effects"
                    description="Play sounds on match results and events"
                    icon="🔊"
                    enabled={localSettings.enableSoundEffects}
                    onChange={() => handleToggle('enableSoundEffects')}
                />

                {/* Confetti Toggle */}
                <ToggleRow
                    label="Confetti Effects"
                    description="Show celebration effects on key moments"
                    icon="🎉"
                    enabled={localSettings.enableConfetti}
                    onChange={() => handleToggle('enableConfetti')}
                />

                {/* Theme Color */}
                <div className="pt-4 border-t border-[var(--border)]">
                    <h4 className="text-sm font-medium text-[var(--text-muted)] mb-3">Theme Color</h4>
                    <div className="flex gap-3">
                        {['#ffa500', '#ec4899', '#8b5cf6', '#3b82f6', '#10b981'].map(color => (
                            <button
                                key={color}
                                onClick={() => handleToggleTheme(color)}
                                className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${(tournament.settings.themeColor || '#ffa500') === color
                                    ? 'border-white scale-110 shadow-lg shadow-white/20'
                                    : 'border-transparent opacity-80'
                                    }`}
                                style={{ backgroundColor: color }}
                                title={color}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Buy-Back Pricing Info */}
            <div className="mt-6 pt-6 border-t border-[var(--border)]">
                <h4 className="text-sm font-medium text-[var(--text-muted)] mb-3">Buy-Back Pricing</h4>
                <div className="bg-[var(--bg-elevated)] rounded-lg p-4">
                    <div className="flex justify-between items-center">
                        <span className="text-white">Base Price:</span>
                        <span className="text-[var(--gold-main)] font-bold">${tournament.buyBackBasePrice}</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                        <span className="text-white">Per Round Increase:</span>
                        <span className="text-[var(--gold-main)] font-bold">+${tournament.buyBackIncrement}</span>
                    </div>
                    <p className="text-xs text-[var(--text-dim)] mt-2">
                        Round 1: ${tournament.buyBackBasePrice} → Round 2: ${tournament.buyBackBasePrice + tournament.buyBackIncrement} → Round 3: ${tournament.buyBackBasePrice + tournament.buyBackIncrement * 2}...
                    </p>
                </div>
            </div>
        </motion.div>
    );
}

// Toggle Row Component
function ToggleRow({
    label,
    description,
    icon,
    enabled,
    onChange
}: {
    label: string;
    description: string;
    icon: string;
    enabled: boolean;
    onChange: () => void;
}) {
    return (
        <div className="flex items-center justify-between p-4 bg-[var(--bg-elevated)] rounded-lg">
            <div className="flex items-center gap-3">
                <span className="text-2xl">{icon}</span>
                <div>
                    <p className="font-medium text-white">{label}</p>
                    <p className="text-sm text-[var(--text-muted)]">{description}</p>
                </div>
            </div>
            <button
                onClick={onChange}
                className={`relative w-14 h-8 rounded-full transition-colors duration-200 ${enabled ? 'bg-[var(--success)]' : 'bg-[var(--bg-card)]'
                    }`}
            >
                <motion.div
                    className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-md"
                    animate={{ left: enabled ? '1.75rem' : '0.25rem' }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
            </button>
        </div>
    );
}
