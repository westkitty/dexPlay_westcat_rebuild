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
    static async save(slot: number, data: GameSave): Promise<void> {
        await window.electronAPI.saveGame(slot, {
            ...data,
            lastSaved: new Date().toISOString()
        });
        console.log(`💾 Saved to native file (slot ${slot})`);
    }

    static async load(slot: number): Promise<GameSave | null> {
        return await window.electronAPI.loadGame(slot);
    }

    static async delete(slot: number): Promise<void> {
        await window.electronAPI.deleteSave(slot);
    }

    static async hasSave(slot: number): Promise<boolean> {
        return await window.electronAPI.hasSave(slot);
    }
}
