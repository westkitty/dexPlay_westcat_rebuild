/**
 * Audio Channel Manager
 * 
 * Per agent_rules_snes_chiptune_audio.md:
 * - Max 8 simultaneous voices
 * - Priority order: Player SFX > Enemy SFX > Environment > Music
 * - Drop lowest priority sound when limit exceeded
 */

export const AudioPriority = {
    MUSIC: 0,        // Lowest priority
    ENVIRONMENT: 1,
    ENEMY: 2,
    PLAYER: 3,       // Highest priority
} as const;

export type AudioPriorityType = typeof AudioPriority[keyof typeof AudioPriority];

interface ActiveChannel {
    id: string;
    priority: AudioPriorityType;
    sound: Phaser.Sound.BaseSound | null;
    startTime: number;
}

export class AudioChannelManager {
    private static instance: AudioChannelManager;
    private channels: ActiveChannel[] = [];
    private readonly MAX_CHANNELS = 8;
    private scene: Phaser.Scene | null = null;

    private constructor() { }

    static getInstance(): AudioChannelManager {
        if (!AudioChannelManager.instance) {
            AudioChannelManager.instance = new AudioChannelManager();
        }
        return AudioChannelManager.instance;
    }

    setScene(scene: Phaser.Scene): void {
        this.scene = scene;
    }

    /**
     * Request to play a sound. Returns true if the sound was played,
     * false if it was dropped due to channel limits.
     */
    play(
        key: string,
        priority: AudioPriorityType,
        config?: Phaser.Types.Sound.SoundConfig
    ): Phaser.Sound.BaseSound | null {
        if (!this.scene) {
            console.warn('[AudioChannelManager] No scene set');
            return null;
        }

        // Clean up completed sounds
        this.cleanup();

        // Check if we have room
        if (this.channels.length >= this.MAX_CHANNELS) {
            // Find lowest priority sound
            const lowestPriority = Math.min(...this.channels.map(c => c.priority));

            if (priority <= lowestPriority) {
                // New sound is lower or equal priority, drop it
                console.log(`[AudioChannelManager] Dropped sound ${key} (priority ${priority})`);
                return null;
            }

            // Remove lowest priority sound
            const indexToRemove = this.channels.findIndex(c => c.priority === lowestPriority);
            if (indexToRemove >= 0) {
                const removed = this.channels[indexToRemove];
                removed.sound?.stop();
                this.channels.splice(indexToRemove, 1);
                console.log(`[AudioChannelManager] Evicted ${removed.id} for ${key}`);
            }
        }

        // Play the new sound
        try {
            const sound = this.scene.sound.add(key, config);
            sound.play();

            const channel: ActiveChannel = {
                id: `${key}_${Date.now()}`,
                priority,
                sound,
                startTime: Date.now(),
            };

            this.channels.push(channel);

            // Auto-remove when sound ends
            sound.once('complete', () => {
                this.removeChannel(channel.id);
            });

            return sound;
        } catch (e) {
            console.error(`[AudioChannelManager] Failed to play ${key}:`, e);
            return null;
        }
    }

    /**
     * Play a looping sound (typically for music)
     */
    playLoop(
        key: string,
        priority: AudioPriorityType,
        config?: Phaser.Types.Sound.SoundConfig
    ): Phaser.Sound.BaseSound | null {
        return this.play(key, priority, { ...config, loop: true });
    }

    /**
     * Stop a specific sound by key
     */
    stop(key: string): void {
        const channel = this.channels.find(c => c.id.startsWith(key));
        if (channel) {
            channel.sound?.stop();
            this.removeChannel(channel.id);
        }
    }

    /**
     * Stop all sounds
     */
    stopAll(): void {
        this.channels.forEach(c => c.sound?.stop());
        this.channels = [];
    }

    /**
     * Get current channel count
     */
    getActiveCount(): number {
        this.cleanup();
        return this.channels.length;
    }

    private removeChannel(id: string): void {
        const index = this.channels.findIndex(c => c.id === id);
        if (index >= 0) {
            this.channels.splice(index, 1);
        }
    }

    private cleanup(): void {
        // Remove channels where the sound has stopped
        this.channels = this.channels.filter(c => {
            if (!c.sound) return false;
            return c.sound.isPlaying;
        });
    }
}

// Convenience export
export const audioManager = AudioChannelManager.getInstance();
