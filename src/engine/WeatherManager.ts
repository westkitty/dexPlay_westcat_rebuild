/**
 * Weather Manager
 * 
 * Handles PNW rain and fog effects.
 */

import { Renderer } from './Renderer';

export class WeatherManager {
    private rainParticles: { x: number; y: number; speed: number; length: number }[] = [];
    private fogOffset: number = 0;
    private isRaining: boolean = true;
    private fogIntensity: number = 0.3;

    constructor() {
        // Init rain
        for (let i = 0; i < 100; i++) {
            this.rainParticles.push({
                x: Math.random() * 800,
                y: Math.random() * 600,
                speed: 10 + Math.random() * 10,
                length: 5 + Math.random() * 10
            });
        }
    }

    update(dt: number): void {
        if (this.isRaining) {
            for (const p of this.rainParticles) {
                p.y += p.speed;
                p.x -= p.speed * 0.2; // Slanted rain
                if (p.y > 600) {
                    p.y = -10;
                    p.x = Math.random() * 800;
                }
            }
        }
        this.fogOffset += 0.05;
    }

    draw(renderer: Renderer, ctx: CanvasRenderingContext2D): void {
        if (this.isRaining) {
            ctx.strokeStyle = 'rgba(150, 150, 200, 0.4)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            for (const p of this.rainParticles) {
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p.x - 2, p.y + p.length);
            }
            ctx.stroke();
        }

        // Fog overlay
        ctx.fillStyle = `rgba(200, 200, 220, ${this.fogIntensity * 0.2})`;
        ctx.fillRect(0, 0, 800, 600);
    }
}
