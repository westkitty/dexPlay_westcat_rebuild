/**
 * Save System - SRAM style persistence
 */

export interface GameSave {
    coins: number;
    score: number;
    level: number;
    lastSaved: string;
}

export class SaveSystem {
    private static readonly KEY_PREFIX = 'westcat_save_';

    static save(slot: number, data: GameSave): void {
        const key = `${this.KEY_PREFIX}${slot}`;
        localStorage.setItem(key, JSON.stringify({
            ...data,
            lastSaved: new Date().toISOString()
        }));
        console.log(`💾 Saved to slot ${slot}`);
    }

    static load(slot: number): GameSave | null {
        const key = `${this.KEY_PREFIX}${slot}`;
        const data = localStorage.getItem(key);
        if (!data) return null;
        try {
            return JSON.parse(data) as GameSave;
        } catch (e) {
            console.error(`❌ Failed to load save slot ${slot}`, e);
            return null;
        }
    }

    static delete(slot: number): void {
        const key = `${this.KEY_PREFIX}${slot}`;
        localStorage.removeItem(key);
    }

    static hasSave(slot: number): boolean {
        return localStorage.getItem(`${this.KEY_PREFIX}${slot}`) !== null;
    }
}
