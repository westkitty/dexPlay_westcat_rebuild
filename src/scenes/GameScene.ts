/**
 * Game Scene - Main Gameplay (Data-Driven)
 */

import { Engine } from '../engine/Engine';
import type { Scene } from '../engine/Engine';
import { Player } from '../player/PlayerFSM';
import { LevelLoader, LevelData } from '../engine/LevelLoader';
import { checkAABB, resolveCollision } from '../physics/Physics';
import { COWICHAN_CSS } from '../constants/Colors';

export class GameScene implements Scene {
    private engine: Engine;
    private player!: Player;
    private levelData: LevelData | null = null;

    // Runtime state
    private score: number = 0;
    private health: number = 3;
    private gameTime: number = 0;

    constructor(engine: Engine) {
        this.engine = engine;
    }

    async enter(): Promise<void> {
        console.log('🎮 Entering Game Scene (Data-Driven)');

        // Load level
        this.levelData = await LevelLoader.loadLevel('Level1.json');

        // Reset player
        this.player = new Player(this.engine, 100, 400);

        // Set camera bounds
        this.engine.camera.setBounds(0, 0, this.levelData.width, this.levelData.height);
        this.engine.camera.snapTo(this.player.x, this.player.y);

        // Reset game state
        this.score = 0;
        this.health = 3;
        this.gameTime = 0;
    }

    exit(): void {
        console.log('🎮 Exiting Game Scene');
    }

    update(dt: number): void {
        if (!this.levelData) return;

        this.gameTime += dt;
        this.player.update(dt);

        // Collisions
        this.handleCollisions();
        this.handleEntities();

        // Death check
        if (this.player.y > this.levelData.height + 100) {
            this.takeDamage();
        }
    }

    private handleCollisions(): void {
        if (!this.levelData) return;

        this.player.grounded = false;
        this.player.onLeftWall = false;
        this.player.onRightWall = false;

        const playerBounds = this.player.getBounds();

        for (const platform of this.levelData.platforms) {
            if (checkAABB(playerBounds, platform)) {
                const result = resolveCollision(this.player, platform);
                if (result.grounded) this.player.grounded = true;
                if (result.hitLeft) this.player.onRightWall = true;
                if (result.hitRight) this.player.onLeftWall = true;
            }
        }
    }

    private handleEntities(): void {
        if (!this.levelData) return;

        const playerBounds = this.player.getBounds();

        for (let i = this.levelData.entities.length - 1; i >= 0; i--) {
            const entity = this.levelData.entities[i];
            const entityBounds = { x: entity.x, y: entity.y, width: 20, height: 20 };

            if (checkAABB(playerBounds, entityBounds)) {
                if (entity.type === 'coin') {
                    this.score += 100;
                    this.engine.particles.emitGlitter(entity.x + 10, entity.y + 10);
                    this.levelData.entities.splice(i, 1);
                } else if (entity.type === 'enemy') {
                    // Stomp check
                    if (this.player.vy > 0 && this.player.y + this.player.height < entity.y + 10) {
                        this.player.vy = -250;
                        this.score += 200;
                        this.engine.particles.emitExplosion(entity.x + 10, entity.y + 10);
                        this.levelData.entities.splice(i, 1);
                    } else {
                        this.takeDamage();
                    }
                } else if (entity.type === 'goal') {
                    this.engine.switchScene('title');
                }
            }
        }
    }

    private takeDamage(): void {
        this.health--;
        this.engine.camera.shake(8, 150);
        if (this.health <= 0) {
            this.engine.switchScene('title');
        } else {
            this.player.x = 100;
            this.player.y = 400;
            this.player.vx = 0;
            this.player.vy = 0;
        }
    }

    draw(ctx: CanvasRenderingContext2D, alpha: number): void {
        if (!this.levelData) return;

        const { WIDTH, HEIGHT } = this.engine;

        // Background (Sky)
        ctx.save();
        ctx.resetTransform();
        const grad = ctx.createLinearGradient(0, 0, 0, HEIGHT);
        grad.addColorStop(0, '#FF6B35');
        grad.addColorStop(1, '#87CEEB');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
        ctx.restore();

        // Level Platforms
        for (const p of this.levelData.platforms) {
            ctx.fillStyle = p.type === 'ground' ? COWICHAN_CSS.SALAL_GREEN : COWICHAN_CSS.CEDAR_RED;
            ctx.fillRect(p.x, p.y, p.width, p.height);
        }

        // Entities
        for (const e of this.levelData.entities) {
            if (e.type === 'coin') {
                ctx.fillStyle = COWICHAN_CSS.YELLOW_FOOTPRINT;
                ctx.beginPath();
                ctx.arc(e.x + 10, e.y + 10, 8, 0, Math.PI * 2);
                ctx.fill();
            } else if (e.type === 'enemy') {
                ctx.fillStyle = COWICHAN_CSS.RACCOON_GRAY;
                ctx.fillRect(e.x, e.y, 24, 24);
            } else if (e.type === 'goal') {
                ctx.fillStyle = COWICHAN_CSS.YELLOW_FOOTPRINT;
                ctx.fillRect(e.x, e.y, 32, 64);
            }
        }

        // Player
        ctx.save();
        ctx.translate(this.player.x + this.player.width / 2, this.player.y + this.player.height);
        ctx.scale(this.player.scaleX * (this.player.facingRight ? 1 : -1), this.player.scaleY);
        ctx.fillStyle = COWICHAN_CSS.CAT_ORANGE;
        ctx.fillRect(-this.player.width / 2, -this.player.height, this.player.width, this.player.height);
        ctx.restore();

        // HUD
        ctx.save();
        ctx.resetTransform();
        ctx.fillStyle = '#FFF';
        ctx.font = '20px monospace';
        ctx.fillText(`SCORE: ${this.score}`, 20, 30);
        ctx.restore();
    }
}
