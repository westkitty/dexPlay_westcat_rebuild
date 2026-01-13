/**
 * Global type definitions for Electron bridge
 */

export interface ElectronAPI {
    saveGame: (slot: number, data: any) => Promise<boolean>;
    loadGame: (slot: number) => Promise<any | null>;
    hasSave: (slot: number) => Promise<boolean>;
    deleteSave: (slot: number) => Promise<boolean>;
}

declare global {
    interface Window {
        electronAPI: ElectronAPI;
    }
}
