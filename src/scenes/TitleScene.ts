/**
 * Title Scene - Attract Mode (High Res)
 * 
 * 3-layer parallax background with bobbing logo.
 * Canvas-only UI (no HTML overlays).
 */

import { Engine } from '../engine/Engine';
import type { Scene } from '../engine/Engine';
import { COWICHAN_PALETTE, COWICHAN_CSS } from '../constants/Colors';

export class TitleScene implements Scene {
    private engine: Engine;
    private time: number = 0;

    // Parallax textures (generated)
    private mountainsCanvas!: HTMLCanvasElement;
    private treesCanvas!: HTMLCanvasElement;
    private foregroundCanvas!: HTMLCanvasElement;

    // Demo player for attract mode
    private demoX: number = 100;
    private demoY: number = 400;
    private demoVx: number = 80;

    constructor(engine: Engine) {
        this.engine = engine;
    }

    enter(): void {
        console.log('🎬 Entering Title Scene');
        this.generateParallaxLayers();
    }

    exit(): void {
        console.log('🎬 Exiting Title Scene');
    }

    private generateParallaxLayers(): void {
        const { ctx, WIDTH, HEIGHT } = this.engine;

        // Mountains (back layer)
        this.mountainsCanvas = document.createElement('canvas');
        this.mountainsCanvas.width = WIDTH * 2;
        this.mountainsCanvas.height = HEIGHT;
        const mCtx = this.mountainsCanvas.getContext('2d')!;

        mCtx.fillStyle = '#6B7280'; // Mountain gray
        const peaks = [
            { x: 0, h: 180 },
            { x: 150, h: 220 },
            { x: 350, h: 160 },
            { x: 500, h: 200 },
            { x: 700, h: 180 },
            { x: 900, h: 240 },
            { x: 1100, h: 170 },
            { x: 1300, h: 210 },
        ];
        peaks.forEach(p => {
            mCtx.beginPath();
            mCtx.moveTo(p.x, HEIGHT);
            mCtx.lineTo(p.x + 100, HEIGHT - p.h);
            mCtx.lineTo(p.x + 200, HEIGHT);
            mCtx.fill();
        });

        // Snow caps
        mCtx.fillStyle = '#E8E8E8';
        peaks.filter(p => p.h > 180).forEach(p => {
            mCtx.beginPath();
            mCtx.moveTo(p.x + 80, HEIGHT - p.h + 30);
            mCtx.lineTo(p.x + 100, HEIGHT - p.h);
            mCtx.lineTo(p.x + 120, HEIGHT - p.h + 30);
            mCtx.fill();
        });

        // Trees (mid layer)
        this.treesCanvas = document.createElement('canvas');
        this.treesCanvas.width = WIDTH * 2;
        this.treesCanvas.height = HEIGHT;
        const tCtx = this.treesCanvas.getContext('2d')!;

        for (let i = 0; i < 40; i++) {
            const x = i * 80;
            const h = 60 + Math.random() * 50;
            const y = HEIGHT - 100;

            // Tree
            tCtx.fillStyle = COWICHAN_CSS.SALAL_GREEN;
            tCtx.beginPath();
            tCtx.moveTo(x, y);
            tCtx.lineTo(x + 15, y - h);
            tCtx.lineTo(x + 30, y);
            tCtx.fill();

            // Trunk
            tCtx.fillStyle = COWICHAN_CSS.CEDAR_RED;
            tCtx.fillRect(x + 12, y, 6, 20);
        }

        // Foreground elements
        this.foregroundCanvas = document.createElement('canvas');
        this.foregroundCanvas.width = WIDTH * 2;
        this.foregroundCanvas.height = HEIGHT;
        const fCtx = this.foregroundCanvas.getContext('2d')!;

        // Ground
        fCtx.fillStyle = COWICHAN_CSS.SALAL_GREEN;
        fCtx.fillRect(0, HEIGHT - 80, WIDTH * 2, 80);

        // Grass tufts
        fCtx.fillStyle = COWICHAN_CSS.GRASS_GREEN;
        for (let i = 0; i < 100; i++) {
            const x = i * 32;
            fCtx.fillRect(x, HEIGHT - 82, 4, 8);
            fCtx.fillRect(x + 10, HEIGHT - 84, 3, 10);
            fCtx.fillRect(x + 20, HEIGHT - 80, 4, 6);
        }
    }

    update(dt: number): void {
        this.time += dt;

        // Demo player movement (attract mode)
        this.demoX += this.demoVx * (dt / 1000);
        if (this.demoX > this.engine.WIDTH + 50) {
            this.demoX = -50;
        }

        // Check for start input
        if (this.engine.input.confirm) {
            this.engine.switchScene('game', true);
        }
    }

    draw(ctx: CanvasRenderingContext2D, alpha: number): void {
        const { WIDTH, HEIGHT } = this.engine;
        const scroll = this.time * 0.02;

        // === GRADIENT SKY ===
        const gradient = ctx.createLinearGradient(0, 0, 0, HEIGHT);
        gradient.addColorStop(0, '#FF6B35'); // Dawn orange
        gradient.addColorStop(0.4, '#FF8C42');
        gradient.addColorStop(0.7, '#87CEEB'); // Sky blue
        gradient.addColorStop(1, '#68A9D0');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, WIDTH, HEIGHT);

        // === PARALLAX LAYERS ===
        // Mountains (0.2x speed)
        const mOffset = -(scroll * 0.2) % this.mountainsCanvas.width;
        ctx.drawImage(this.mountainsCanvas, mOffset, 0);
        ctx.drawImage(this.mountainsCanvas, mOffset + this.mountainsCanvas.width, 0);

        // Mode 7 Floor (Demo) - Draw over the lower half
        this.engine.renderer.drawMode7Floor(this.foregroundCanvas, HEIGHT - 120, 150);

        // Trees (0.5x speed)
        const tOffset = -(scroll * 0.5) % this.treesCanvas.width;
        ctx.drawImage(this.treesCanvas, tOffset, 0);
        ctx.drawImage(this.treesCanvas, tOffset + this.treesCanvas.width, 0);

        // Foreground (1x speed)
        const fOffset = -(scroll) % this.foregroundCanvas.width;
        ctx.drawImage(this.foregroundCanvas, fOffset, 0);
        ctx.drawImage(this.foregroundCanvas, fOffset + this.foregroundCanvas.width, 0);

        // === DEMO PLAYER (attract mode) ===
        ctx.fillStyle = COWICHAN_CSS.CAT_ORANGE;
        ctx.fillRect(this.demoX, this.demoY, 32, 40);

        // === SEPIA OVERLAY ===
        ctx.save();
        ctx.globalCompositeOperation = 'multiply';
        ctx.fillStyle = 'rgba(255, 230, 200, 0.2)';
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
        ctx.globalCompositeOperation = 'source-over';
        ctx.restore();

        // === TITLE (bobbing on sine wave) ===
        const titleY = 100 + Math.sin(this.time / 300) * 8;

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.font = 'bold 56px Arial Black';
        ctx.textAlign = 'center';
        ctx.fillText('WEST CAT', WIDTH / 2 + 4, titleY + 4);
        ctx.font = 'bold 40px Arial Black';
        ctx.fillText('GOES EAST', WIDTH / 2 + 3, titleY + 50 + 3);

        // Main title
        ctx.fillStyle = COWICHAN_CSS.CAT_ORANGE;
        ctx.font = 'bold 56px Arial Black';
        ctx.fillText('WEST CAT', WIDTH / 2, titleY);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 40px Arial Black';
        ctx.fillText('GOES EAST', WIDTH / 2, titleY + 50);

        // Subtitle
        ctx.fillStyle = COWICHAN_CSS.YELLOW_FOOTPRINT;
        ctx.font = 'italic 18px Georgia';
        ctx.fillText('Duncan, BC Edition', WIDTH / 2, titleY + 85);

        // === PRESS START (blinking) ===
        if (Math.floor(this.time / 500) % 2 === 0) {
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 20px monospace';
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 3;
            ctx.strokeText('PRESS ENTER TO START', WIDTH / 2, HEIGHT - 120);
            ctx.fillText('PRESS ENTER TO START', WIDTH / 2, HEIGHT - 120);
        }

        // Controls info
        ctx.fillStyle = '#CCCCCC';
        ctx.font = '14px monospace';
        ctx.fillText('ARROWS/WASD - Move  |  SPACE - Jump  |  Wall Jump Available!', WIDTH / 2, HEIGHT - 50);
    }
}
