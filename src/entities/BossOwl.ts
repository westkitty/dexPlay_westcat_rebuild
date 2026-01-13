/**
 * BOSS: Sooty the Great Horned Owl
 * 
 * Multi-stage flight boss for the PNW session.
 */

import { Engine } from '../engine/Engine';
import { COWICHAN_CSS } from '../constants/Colors';
import { Player } from '../player/PlayerFSM';

export type BossState = 'hover' | 'swoop' | 'stagger' | 'feather_rain';

export class BossOwl {
    public x: number;
    public y: number;
    public width: number = 96;
    public height: number = 96;
    public health: number = 10;
    public maxHealth: number = 10;

    private engine: Engine;
    private state: BossState = 'hover';
    private timer: number = 0;
    private vx: number = 0;
    private vy: number = 0;
    private targetY: number = 100;
    private floatTimer: number = 0;

    constructor(engine: Engine, x: number, y: number) {
        this.engine = engine;
        this.x = x;
        this.y = y;
    }

    update(dt: number, player: Player): void {
        this.timer += dt;
        this.floatTimer += dt * 0.005;

        switch (this.state) {
            case 'hover':
                this.updateHover(dt);
                break;
            case 'swoop':
                this.updateSwoop(dt, player);
                break;
            case 'stagger':
                this.updateStagger(dt);
                break;
            case 'feather_rain':
                this.updateFeatherRain(dt);
                break;
        }
    }

    private updateHover(dt: number): void {
        // Gentle bobbing
        this.y = this.targetY + Math.sin(this.floatTimer) * 30;

        if (this.timer > 3000) {
            this.enterState('swoop');
        }
    }

    private updateSwoop(dt: number, player: Player): void {
        if (!player) return;

        // Move towards player
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        this.vx += (dx / dist) * 0.5;
        this.vy += (dy / dist) * 0.5;

        this.x += this.vx;
        this.y += this.vy;

        if (this.timer > 2000) {
            this.vx = 0;
            this.vy = 0;
            this.enterState('hover');
        }
    }

    private updateStagger(dt: number): void {
        this.y += 2;
        if (this.timer > 1000) {
            this.enterState('feather_rain');
        }
    }

    private updateFeatherRain(dt: number): void {
        if (this.timer % 200 < 20) {
            // Emit "feathers" (particles)
            this.engine.particles.emitDust(this.x + Math.random() * this.width, this.y, 1);
        }
        if (this.timer > 4000) {
            this.enterState('hover');
        }
    }

    private enterState(newState: BossState): void {
        this.state = newState;
        this.timer = 0;
    }

    takeDamage(): void {
        this.health--;
        this.engine.camera.shake(15, 200);
        this.enterState('stagger');
        if (this.health <= 0) {
            console.log('🏆 BOSS DEFEATED!');
            this.engine.particles.emitExplosion(this.x + 48, this.y + 48);
        }
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = COWICHAN_CSS.CEDAR_RED;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Eyes
        ctx.fillStyle = '#FFFF00';
        ctx.fillRect(this.x + 20, this.y + 30, 10, 10);
        ctx.fillRect(this.x + 66, this.y + 30, 10, 10);

        // Health Bar
        const barWidth = 200;
        const healthPercent = this.health / this.maxHealth;
        ctx.fillStyle = '#333';
        ctx.fillRect(400 - barWidth / 2, 20, barWidth, 10);
        ctx.fillStyle = '#F00';
        ctx.fillRect(400 - barWidth / 2, 20, barWidth * healthPercent, 10);
    }
}
