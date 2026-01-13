/**
 * Level Loader - Data-driven world creation
 */

export interface LevelData {
    name: string;
    width: number;
    height: number;
    platforms: Array<{
        x: number;
        y: number;
        width: number;
        height: number;
        type: 'ground' | 'platform' | 'hazard';
    }>;
    entities: Array<{
        x: number;
        y: number;
        type: 'coin' | 'enemy' | 'goal';
    }>;
}

export class LevelLoader {
    static async loadLevel(path: string): Promise<LevelData> {
        // In a real build, we'd fetch JSON. 
        // For now, we'll return a hardcoded object to jumpstart the refactor.
        return {
            name: "Duncan Forest",
            width: 3200,
            height: 600,
            platforms: [
                { x: 0, y: 536, width: 600, height: 64, type: 'ground' },
                { x: 700, y: 536, width: 700, height: 64, type: 'ground' },
                { x: 1500, y: 536, width: 800, height: 64, type: 'ground' },
                { x: 2400, y: 536, width: 800, height: 64, type: 'ground' },
                // Floating
                { x: 300, y: 400, width: 128, height: 32, type: 'platform' },
                { x: 500, y: 320, width: 96, height: 32, type: 'platform' },
                { x: 800, y: 380, width: 128, height: 32, type: 'platform' },
                { x: 1000, y: 280, width: 160, height: 32, type: 'platform' },
            ],
            entities: [
                { x: 350, y: 360, type: 'coin' },
                { x: 550, y: 280, type: 'coin' },
                { x: 1000, y: 240, type: 'enemy' },
                { x: 3000, y: 472, type: 'goal' }
            ]
        };
    }
}
