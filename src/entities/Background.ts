import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/GameConfig';
import { COWICHAN_PALETTE } from '../constants/Colors';

/**
 * Parallax Background Manager
 * Creates layered scrolling backgrounds with Cowichan Valley scenery
 */
export class ParallaxBackground {
    private scene: Phaser.Scene;
    private mountains!: Phaser.GameObjects.Graphics;
    private trees!: Phaser.GameObjects.Graphics;
    private clouds!: Phaser.GameObjects.Graphics;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.createLayers();
    }

    private createLayers(): void {
        // Layer 1: Distant mountains (slowest parallax)
        this.mountains = this.scene.add.graphics();
        this.mountains.setScrollFactor(0.1);
        this.mountains.setDepth(-10);
        this.drawMountains();

        // Layer 2: Tree line (medium parallax)
        this.trees = this.scene.add.graphics();
        this.trees.setScrollFactor(0.3);
        this.trees.setDepth(-5);
        this.drawTrees();

        // Layer 3: Clouds (very slow, creates depth)
        this.clouds = this.scene.add.graphics();
        this.clouds.setScrollFactor(0.05);
        this.clouds.setDepth(-15);
        this.drawClouds();
    }

    private drawMountains(): void {
        this.mountains.fillStyle(COWICHAN_PALETTE.MOUNTAIN_GRAY, 0.6);

        // Multiple mountain peaks
        const peaks = [
            { x: 0, height: 150 },
            { x: 200, height: 180 },
            { x: 400, height: 140 },
            { x: 600, height: 200 },
            { x: 800, height: 160 },
        ];

        peaks.forEach(peak => {
            this.mountains.beginPath();
            this.mountains.moveTo(peak.x, GAME_HEIGHT);
            this.mountains.lineTo(peak.x + 100, GAME_HEIGHT - peak.height);
            this.mountains.lineTo(peak.x + 200, GAME_HEIGHT);
            this.mountains.closePath();
            this.mountains.fill();
        });

        // Snow caps (lighter gray)
        this.mountains.fillStyle(0xE8E8E8, 0.8);
        peaks.forEach(peak => {
            if (peak.height > 150) {
                this.mountains.beginPath();
                this.mountains.moveTo(peak.x + 80, GAME_HEIGHT - peak.height + 30);
                this.mountains.lineTo(peak.x + 100, GAME_HEIGHT - peak.height);
                this.mountains.lineTo(peak.x + 120, GAME_HEIGHT - peak.height + 30);
                this.mountains.closePath();
                this.mountains.fill();
            }
        });
    }

    private drawTrees(): void {
        this.trees.fillStyle(COWICHAN_PALETTE.SALAL_GREEN, 0.7);

        // Pacific Northwest tree silhouettes
        for (let i = 0; i < 20; i++) {
            const x = i * 120;
            const baseY = GAME_HEIGHT - 80;
            const height = 60 + Math.random() * 40;

            // Coniferous tree shape (triangular)
            this.trees.beginPath();
            this.trees.moveTo(x, baseY);
            this.trees.lineTo(x + 15, baseY - height);
            this.trees.lineTo(x + 30, baseY);
            this.trees.closePath();
            this.trees.fill();

            // Trunk
            this.trees.fillStyle(COWICHAN_PALETTE.CEDAR_RED, 0.7);
            this.trees.fillRect(x + 12, baseY, 6, 20);
            this.trees.fillStyle(COWICHAN_PALETTE.SALAL_GREEN, 0.7);
        }
    }

    private drawClouds(): void {
        this.clouds.fillStyle(0xFFFFFF, 0.5);

        // Fluffy clouds scattered across sky
        const cloudPositions = [
            { x: 100, y: 80 },
            { x: 350, y: 120 },
            { x: 600, y: 60 },
            { x: 850, y: 100 },
            { x: 1100, y: 90 },
        ];

        cloudPositions.forEach(pos => {
            // Draw multiple circles to create puffy cloud
            for (let i = 0; i < 5; i++) {
                const radius = 15 + Math.random() * 10;
                this.clouds.fillCircle(pos.x + i * 20, pos.y, radius);
            }
        });
    }

    update(time: number): void {
        // Slowly drift clouds
        this.clouds.x = (time * 0.01) % GAME_WIDTH;
    }

    destroy(): void {
        this.mountains.destroy();
        this.trees.destroy();
        this.clouds.destroy();
    }
}
