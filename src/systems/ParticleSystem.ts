/**
 * Particle System with Object Pooling
 * 
 * Pre-allocates particles to avoid GC stutters.
 * Supports various particle types: dust, debris, glitter, sparks.
 */

export interface ParticleConfig {
    x: number;
    y: number;
    vx?: number;
    vy?: number;
    ax?: number;      // Acceleration X
    ay?: number;      // Acceleration Y (gravity)
    life?: number;    // Milliseconds
    size?: number;
    color?: string;
    fadeOut?: boolean;
    shrink?: boolean;
    rotation?: number;
    rotationSpeed?: number;
}

interface Particle {
    active: boolean;
    x: number;
    y: number;
    vx: number;
    vy: number;
    ax: number;
    ay: number;
    life: number;
    maxLife: number;
    size: number;
    color: string;
    fadeOut: boolean;
    shrink: boolean;
    rotation: number;
    rotationSpeed: number;
    alpha: number;
}

export class ParticleSystem {
    private pool: Particle[] = [];
    public activeCount: number = 0;

    constructor(poolSize: number) {
        // Pre-allocate particle pool
        for (let i = 0; i < poolSize; i++) {
            this.pool.push(this.createParticle());
        }
    }

    private createParticle(): Particle {
        return {
            active: false,
            x: 0,
            y: 0,
            vx: 0,
            vy: 0,
            ax: 0,
            ay: 0,
            life: 0,
            maxLife: 0,
            size: 4,
            color: '#FFFFFF',
            fadeOut: true,
            shrink: false,
            rotation: 0,
            rotationSpeed: 0,
            alpha: 1,
        };
    }

    /**
     * Spawn a single particle
     */
    spawn(config: ParticleConfig): void {
        // Find inactive particle in pool
        for (const p of this.pool) {
            if (!p.active) {
                // Reset particle
                p.active = true;
                p.x = config.x;
                p.y = config.y;
                p.vx = config.vx ?? 0;
                p.vy = config.vy ?? 0;
                p.ax = config.ax ?? 0;
                p.ay = config.ay ?? 300; // Default gravity
                p.life = config.life ?? 500;
                p.maxLife = p.life;
                p.size = config.size ?? 4;
                p.color = config.color ?? '#FFFFFF';
                p.fadeOut = config.fadeOut ?? true;
                p.shrink = config.shrink ?? false;
                p.rotation = config.rotation ?? 0;
                p.rotationSpeed = config.rotationSpeed ?? 0;
                p.alpha = 1;

                this.activeCount++;
                return;
            }
        }
        // Pool exhausted - particle dropped
    }

    // === Preset particle emitters ===

    /**
     * Dust puff (running/landing)
     */
    emitDust(x: number, y: number, count: number = 5): void {
        for (let i = 0; i < count; i++) {
            this.spawn({
                x: x + (Math.random() - 0.5) * 20,
                y: y,
                vx: (Math.random() - 0.5) * 30,
                vy: -Math.random() * 40 - 20,
                ay: 50,
                life: 300 + Math.random() * 200,
                size: 3 + Math.random() * 3,
                color: '#8B7355',
                fadeOut: true,
            });
        }
    }

    /**
     * Landing impact debris
     */
    emitImpact(x: number, y: number): void {
        // Burst left
        for (let i = 0; i < 4; i++) {
            this.spawn({
                x: x - 10,
                y: y,
                vx: -50 - Math.random() * 50,
                vy: -30 - Math.random() * 30,
                ay: 400,
                life: 200 + Math.random() * 100,
                size: 2 + Math.random() * 2,
                color: '#654321',
            });
        }
        // Burst right
        for (let i = 0; i < 4; i++) {
            this.spawn({
                x: x + 10,
                y: y,
                vx: 50 + Math.random() * 50,
                vy: -30 - Math.random() * 30,
                ay: 400,
                life: 200 + Math.random() * 100,
                size: 2 + Math.random() * 2,
                color: '#654321',
            });
        }
    }

    /**
     * Jump smoke
     */
    emitJump(x: number, y: number): void {
        for (let i = 0; i < 6; i++) {
            this.spawn({
                x: x + (Math.random() - 0.5) * 16,
                y: y,
                vx: (Math.random() - 0.5) * 20,
                vy: -10 - Math.random() * 20,
                ay: -20, // Float up
                life: 250 + Math.random() * 150,
                size: 4 + Math.random() * 4,
                color: '#CCCCCC',
                fadeOut: true,
                shrink: true,
            });
        }
    }

    /**
     * Coin glitter (defies gravity!)
     */
    emitGlitter(x: number, y: number): void {
        const colors = ['#FFD700', '#FFFF00', '#FFA500', '#FFFFFF'];
        for (let i = 0; i < 12; i++) {
            const angle = (Math.PI * 2 * i) / 12;
            const speed = 40 + Math.random() * 40;
            this.spawn({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 30,
                ax: 0,
                ay: -50, // Float UP (defies gravity!)
                life: 400 + Math.random() * 200,
                size: 2 + Math.random() * 3,
                color: colors[Math.floor(Math.random() * colors.length)],
                fadeOut: true,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 10,
            });
        }
    }

    /**
     * Wall slide sparks
     */
    emitSparks(x: number, y: number): void {
        for (let i = 0; i < 3; i++) {
            this.spawn({
                x: x,
                y: y + Math.random() * 20,
                vx: (Math.random() - 0.5) * 20,
                vy: 30 + Math.random() * 30,
                ay: 100,
                life: 150 + Math.random() * 100,
                size: 2 + Math.random() * 2,
                color: '#FFA500',
                fadeOut: true,
            });
        }
    }

    /**
     * Enemy defeat explosion
     */
    emitExplosion(x: number, y: number): void {
        const colors = ['#FFFFFF', '#DDDDDD', '#AAAAAA', '#888888'];
        for (let i = 0; i < 16; i++) {
            const angle = (Math.PI * 2 * i) / 16;
            const speed = 60 + Math.random() * 60;
            this.spawn({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                ay: 200,
                life: 400 + Math.random() * 200,
                size: 4 + Math.random() * 4,
                color: colors[Math.floor(Math.random() * colors.length)],
                fadeOut: true,
                shrink: true,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 8,
            });
        }
    }

    /**
     * Update all active particles
     */
    update(dt: number): void {
        const dtSec = dt / 1000;

        for (const p of this.pool) {
            if (!p.active) continue;

            // Apply acceleration
            p.vx += p.ax * dtSec;
            p.vy += p.ay * dtSec;

            // Apply velocity
            p.x += p.vx * dtSec;
            p.y += p.vy * dtSec;

            // Apply rotation
            p.rotation += p.rotationSpeed * dtSec;

            // Decrease life
            p.life -= dt;

            // Calculate life ratio
            const lifeRatio = p.life / p.maxLife;

            // Fade out
            if (p.fadeOut) {
                p.alpha = Math.max(0, lifeRatio);
            }

            // Shrink
            if (p.shrink) {
                p.size *= 0.98;
            }

            // Deactivate dead particles
            if (p.life <= 0) {
                p.active = false;
                this.activeCount--;
            }
        }
    }

    /**
     * Draw all active particles
     */
    draw(ctx: CanvasRenderingContext2D): void {
        for (const p of this.pool) {
            if (!p.active) continue;

            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
            ctx.restore();
        }
    }
}
