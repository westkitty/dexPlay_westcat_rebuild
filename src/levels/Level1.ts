/**
 * Level 1: Grassland
 * 
 * Modern resolution (800x600) with tile size 32x32
 * Level dimensions: 80 tiles wide x 19 tiles tall (2560x608)
 * 
 * Legend:
 * 0 = Air (empty)
 * 1 = Ground (solid)
 * 2 = Grass top (solid, decorative)
 * 3 = Platform (one-way)
 * 4 = Spike (hazard)
 */

export interface LevelData {
    name: string;
    width: number;   // in tiles
    height: number;  // in tiles
    tileSize: number;
    tiles: number[][];
    spawns: {
        player: { x: number; y: number };
        enemies: Array<{ x: number; y: number; type: 'snail' | 'bat' }>;
        coins: Array<{ x: number; y: number }>;
    };
}

// Generate a procedural level
function generateLevel1(): LevelData {
    const width = 80;
    const height = 19;
    const tiles: number[][] = [];

    // Initialize with air
    for (let y = 0; y < height; y++) {
        tiles[y] = [];
        for (let x = 0; x < width; x++) {
            tiles[y][x] = 0;
        }
    }

    // Ground layer (bottom 2 rows)
    for (let x = 0; x < width; x++) {
        tiles[height - 1][x] = 1; // Underground
        tiles[height - 2][x] = 2; // Grass top
    }

    // Add some gaps in ground
    for (let x = 25; x < 28; x++) {
        tiles[height - 1][x] = 0;
        tiles[height - 2][x] = 0;
    }
    for (let x = 45; x < 48; x++) {
        tiles[height - 1][x] = 0;
        tiles[height - 2][x] = 0;
    }

    // Add spikes in some gaps
    tiles[height - 2][26] = 4; // Spike in first gap

    // Floating platforms
    // Section 1: Simple platforms
    for (let x = 10; x < 13; x++) tiles[height - 5][x] = 3;
    for (let x = 16; x < 19; x++) tiles[height - 7][x] = 3;
    for (let x = 22; x < 25; x++) tiles[height - 5][x] = 3;

    // Section 2: Hill
    for (let x = 30; x < 40; x++) {
        tiles[height - 3][x] = 2;
        tiles[height - 2][x] = 1;
    }

    // Section 3: Staircase platforms
    for (let x = 50; x < 53; x++) tiles[height - 4][x] = 3;
    for (let x = 55; x < 58; x++) tiles[height - 6][x] = 3;
    for (let x = 60; x < 63; x++) tiles[height - 8][x] = 3;
    for (let x = 65; x < 68; x++) tiles[height - 6][x] = 3;
    for (let x = 70; x < 73; x++) tiles[height - 4][x] = 3;

    // Wall for wall-jumping
    for (let y = height - 10; y < height - 2; y++) {
        tiles[y][55] = 1;
        tiles[y][63] = 1;
    }

    // Enemies
    const enemies: Array<{ x: number; y: number; type: 'snail' | 'bat' }> = [
        { x: 8, y: height - 3, type: 'snail' },
        { x: 20, y: height - 3, type: 'snail' },
        { x: 35, y: height - 4, type: 'snail' },
        { x: 14, y: height - 9, type: 'bat' },
        { x: 40, y: height - 6, type: 'bat' },
        { x: 57, y: height - 10, type: 'bat' },
        { x: 68, y: height - 3, type: 'snail' },
    ];

    // Coins
    const coins: Array<{ x: number; y: number }> = [
        // Early coins
        { x: 5, y: height - 3 },
        { x: 6, y: height - 3 },
        // Platform coins
        { x: 11, y: height - 6 },
        { x: 17, y: height - 8 },
        { x: 23, y: height - 6 },
        // Hill coins
        { x: 33, y: height - 4 },
        { x: 35, y: height - 4 },
        { x: 37, y: height - 4 },
        // Staircase coins
        { x: 51, y: height - 5 },
        { x: 56, y: height - 7 },
        { x: 61, y: height - 9 },
        { x: 66, y: height - 7 },
        { x: 71, y: height - 5 },
        // End bonus
        { x: 76, y: height - 3 },
        { x: 77, y: height - 3 },
    ];

    return {
        name: 'Grassland',
        width,
        height,
        tileSize: 32,
        tiles,
        spawns: {
            player: { x: 2, y: height - 3 },
            enemies,
            coins,
        },
    };
}

export const LEVEL_1: LevelData = generateLevel1();
