// Party Lions - Sound Effects Manager

type SoundName =
    | 'roar'
    | 'cheer'
    | 'elimination'
    | 'wheelSpin'
    | 'wheelStop'
    | 'buyBack'
    | 'victory'
    | 'click';

// Sound URLs - using free sound effects (can be replaced with custom sounds)
const SOUND_URLS: Record<SoundName, string> = {
    roar: 'https://www.soundjay.com/nature/lion-roar-1.mp3',
    cheer: 'https://www.soundjay.com/human/crowd-cheer-1.mp3',
    elimination: 'https://www.soundjay.com/misc/fail-buzzer-01.mp3',
    wheelSpin: 'https://www.soundjay.com/mechanical/wheel-spin-1.mp3',
    wheelStop: 'https://www.soundjay.com/button/button-09.mp3',
    buyBack: 'https://www.soundjay.com/button/button-3.mp3',
    victory: 'https://www.soundjay.com/human/applause-01.mp3',
    click: 'https://www.soundjay.com/button/button-35.mp3'
};

class SoundManager {
    private audioCache: Map<SoundName, HTMLAudioElement> = new Map();
    private enabled: boolean = true;
    private volume: number = 0.5;

    /**
     * Preload all sounds for instant playback
     */
    preload(): void {
        Object.entries(SOUND_URLS).forEach(([key, url]) => {
            try {
                const audio = new Audio(url);
                audio.preload = 'auto';
                audio.volume = this.volume;
                this.audioCache.set(key as SoundName, audio);
            } catch (e) {
                console.warn(`Failed to preload sound: ${key}`);
            }
        });
    }

    /**
     * Play a sound effect
     */
    play(sound: SoundName): void {
        if (!this.enabled) return;

        const audio = this.audioCache.get(sound);
        if (audio) {
            audio.currentTime = 0;
            audio.volume = this.volume;
            audio.play().catch(() => {
                // Ignore autoplay restrictions
            });
        }
    }

    /**
     * Enable or disable sound effects
     */
    setEnabled(enabled: boolean): void {
        this.enabled = enabled;
    }

    /**
     * Check if sounds are enabled
     */
    isEnabled(): boolean {
        return this.enabled;
    }

    /**
     * Set volume (0-1)
     */
    setVolume(volume: number): void {
        this.volume = Math.max(0, Math.min(1, volume));
        this.audioCache.forEach(audio => {
            audio.volume = this.volume;
        });
    }

    /**
     * Get current volume
     */
    getVolume(): number {
        return this.volume;
    }
}

// Export singleton instance
export const soundManager = new SoundManager();

// Auto-preload on import
if (typeof window !== 'undefined') {
    soundManager.preload();
}
