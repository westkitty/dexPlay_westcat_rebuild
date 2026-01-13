/**
 * Web Audio Synthesizer
 * 
 * Per agent_rules_snes_chiptune_audio.md:
 * - Uses simple waveforms (square, triangle, sawtooth)
 * - macOS compatible with AudioContext unlocking
 * - SNES-style sound effects
 */
export class AudioSynth {
    private context: AudioContext | null = null;
    private masterGain: GainNode | null = null;
    private bgmGain: GainNode | null = null;
    private unlocked: boolean = false;
    private muted: boolean = false;
    private bgmTimeout: number | null = null;

    /**
     * Unlock audio context (required for macOS/iOS)
     * Must be called from a user interaction event
     */
    unlock(): void {
        if (this.unlocked) return;

        // Create context
        this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
        this.context.resume();

        // Master gain
        this.masterGain = this.context.createGain();
        this.masterGain.connect(this.context.destination);
        this.masterGain.gain.value = 0.3;

        // BGM gain (separate for control)
        this.bgmGain = this.context.createGain();
        this.bgmGain.connect(this.masterGain);
        this.bgmGain.gain.value = 0.15;

        this.unlocked = true;
        console.log('🔊 Audio unlocked!');

        // Start background music
        this.playBGM();
    }

    isUnlocked(): boolean {
        return this.unlocked;
    }

    /**
     * Play chiptune background music (C-E-G-C arpeggio)
     */
    playBGM(): void {
        if (!this.unlocked || this.muted || !this.context || !this.bgmGain) return;

        // C-E-G-C arpeggio frequencies
        const notes = [261.63, 329.63, 392.00, 523.25];
        const noteLength = 0.25;

        const playArpeggio = (startTime: number) => {
            notes.forEach((freq, i) => {
                const osc = this.context!.createOscillator();
                osc.type = 'square';
                osc.frequency.value = freq;

                const gain = this.context!.createGain();
                gain.gain.value = 0;
                gain.gain.setValueAtTime(0, startTime + i * noteLength);
                gain.gain.linearRampToValueAtTime(0.3, startTime + i * noteLength + 0.01);
                gain.gain.exponentialRampToValueAtTime(0.01, startTime + (i + 1) * noteLength);

                osc.connect(gain);
                gain.connect(this.bgmGain!);

                osc.start(startTime + i * noteLength);
                osc.stop(startTime + (i + 1) * noteLength);
            });
        };

        // Play 60 loops (60 seconds)
        let currentTime = this.context.currentTime;
        for (let i = 0; i < 60; i++) {
            playArpeggio(currentTime + i * 1);
        }

        // Schedule next batch
        this.bgmTimeout = window.setTimeout(() => this.playBGM(), 55000);
    }

    stopBGM(): void {
        if (this.bgmTimeout) {
            clearTimeout(this.bgmTimeout);
            this.bgmTimeout = null;
        }
    }

    /**
     * Jump sound effect - rising sawtooth
     */
    playJump(): void {
        if (!this.unlocked || this.muted || !this.context || !this.masterGain) return;

        const osc = this.context.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.value = 400;

        const gain = this.context.createGain();
        gain.gain.value = 0.2;
        gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.1);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc.stop(this.context.currentTime + 0.1);
        osc.frequency.exponentialRampToValueAtTime(200, this.context.currentTime + 0.1);
    }

    /**
     * Coin collect sound - high sine ping
     */
    playCoin(): void {
        if (!this.unlocked || this.muted || !this.context || !this.masterGain) return;

        const osc = this.context.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = 800;

        const gain = this.context.createGain();
        gain.gain.value = 0.3;
        gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.2);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc.stop(this.context.currentTime + 0.2);
    }

    /**
     * Damage/hit sound - white noise burst
     */
    playHit(): void {
        if (!this.unlocked || this.muted || !this.context || !this.masterGain) return;

        const bufferSize = this.context.sampleRate * 0.3;
        const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.context.createBufferSource();
        noise.buffer = buffer;

        const gain = this.context.createGain();
        gain.gain.value = 0.3;
        gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.3);

        noise.connect(gain);
        gain.connect(this.masterGain);

        noise.start();
    }

    /**
     * Enemy stomp sound - satisfying boing
     */
    playStomp(): void {
        if (!this.unlocked || this.muted || !this.context || !this.masterGain) return;

        const osc = this.context.createOscillator();
        osc.type = 'triangle';
        osc.frequency.value = 200;

        const gain = this.context.createGain();
        gain.gain.value = 0.25;
        gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.15);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc.stop(this.context.currentTime + 0.15);
        osc.frequency.exponentialRampToValueAtTime(400, this.context.currentTime + 0.05);
        osc.frequency.exponentialRampToValueAtTime(100, this.context.currentTime + 0.15);
    }

    /**
     * Victory fanfare - ascending notes
     */
    playVictory(): void {
        if (!this.unlocked || this.muted || !this.context || !this.masterGain) return;

        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5-E5-G5-C6

        notes.forEach((freq, i) => {
            const osc = this.context!.createOscillator();
            osc.type = 'square';
            osc.frequency.value = freq;

            const gain = this.context!.createGain();
            gain.gain.value = 0.25;
            const startTime = this.context!.currentTime + i * 0.15;
            gain.gain.setValueAtTime(0.25, startTime);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);

            osc.connect(gain);
            gain.connect(this.masterGain!);

            osc.start(startTime);
            osc.stop(startTime + 0.3);
        });
    }

    /**
     * Game over sound - descending sad tone
     */
    playGameOver(): void {
        if (!this.unlocked || this.muted || !this.context || !this.masterGain) return;

        const osc = this.context.createOscillator();
        osc.type = 'triangle';
        osc.frequency.value = 400;

        const gain = this.context.createGain();
        gain.gain.value = 0.3;
        gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 1);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc.stop(this.context.currentTime + 1);
        osc.frequency.exponentialRampToValueAtTime(100, this.context.currentTime + 1);
    }

    toggleMute(): boolean {
        this.muted = !this.muted;
        if (this.muted) {
            this.stopBGM();
        } else {
            this.playBGM();
        }
        return this.muted;
    }

    isMuted(): boolean {
        return this.muted;
    }
}

// Singleton instance
export const audioSynth = new AudioSynth();
