/**
 * Game Scene - Main Gameplay (High Res 800x600)
 * 
 * Pure canvas rendering with proper game architecture.
 */

import { Engine } from '../engine/Engine';
import type { Scene } from '../engine/Engine';
import { Player } from '../player/PlayerFSM';
import type { AABB } from '../physics/Physics';
import { checkAABB, resolveCollision } from '../physics/Physics';
import { COWICHAN_PALETTE, COWICHAN_CSS } from '../constants/Colors';

interface Platform extends AABB {
    color: string;
}

interface Coin {
    x: number;
    y: number;
    collected: boolean;
}

interface Enemy {
    x: number;
    y: number;
    vx: number;
    width: number;
    height: number;
    alive: boolean;
}

export class GameScene implements Scene {
    private engine: Engine;
    private player!: Player;

    // Level data
    private platforms: Platform[] = [];
    private coins: Coin[] = [];
    private enemies: Enemy[] = [];
    private goal!: AABB;

    // HUD
    private score: number = 0;
    private health: number = 3;
    private gameTime: number = 0;

    // Level bounds
    private levelWidth: number = 3200;
    private levelHeight: number = 600;

    constructor(engine: Engine) {
        this.engine = engine;
    }

    enter(): void {
        console.log('🎮 Entering Game Scene');

        // Create player
        this.player = new Player(this.engine, 100, 400);

        // Generate level
        this.generateLevel();

        // Set camera bounds
        this.engine.camera.setBounds(0, 0, this.levelWidth, this.levelHeight);
        this.engine.camera.snapTo(this.player.x, this.player.y);

        // Reset state
        this.score = 0;
        this.health = 3;
        this.gameTime = 0;
    }

    exit(): void {
        console.log('🎮 Exiting Game Scene');
    }

    private generateLevel(): void {
        this.platforms = [];
        this.coins = [];
        this.enemies = [];

        // Ground
        for (let x = 0; x < this.levelWidth; x += 64) {
            // Gaps
            if ((x > 600 && x < 700) || (x > 1400 && x < 1500) || (x > 2200 && x < 2300)) continue;

            this.platforms.push({
                x: x,
                y: this.levelHeight - 64,
                width: 64,
                height: 64,
                color: COWICHAN_CSS.SALAL_GREEN,
            });
        }

        // Floating platforms
        const floatingPlatforms = [
            { x: 300, y: 400, w: 128 },
            { x: 500, y: 320, w: 96 },
            { x: 800, y: 380, w: 128 },
            { x: 1000, y: 280, w: 160 },
            { x: 1200, y: 360, w: 96 },
            { x: 1600, y: 320, w: 128 },
            { x: 1800, y: 240, w: 96 },
            { x: 2000, y: 300, w: 160 },
            { x: 2400, y: 360, w: 128 },
            { x: 2600, y: 280, w: 96 },
            { x: 2800, y: 200, w: 160 },
        ];

        floatingPlatforms.forEach(p => {
            this.platforms.push({
                x: p.x,
                y: p.y,
                width: p.w,
                height: 32,
                color: COWICHAN_CSS.CEDAR_RED,
            });
        });

        // Walls for wall-jumping
        const walls = [
            { x: 900, y: 200, h: 300 },
            { x: 1100, y: 200, h: 300 },
            { x: 1700, y: 150, h: 350 },
            { x: 1900, y: 150, h: 350 },
        ];

        walls.forEach(w => {
            this.platforms.push({
                x: w.x,
                y: w.y,
                width: 32,
                height: w.h,
                color: COWICHAN_CSS.WET_ASPHALT,
            });
        });

        // Coins
        const coinPositions = [
            { x: 350, y: 360 },
            { x: 550, y: 280 },
            { x: 850, y: 340 },
            { x: 1050, y: 240 },
            { x: 1000, y: 380 },
            { x: 1250, y: 320 },
            { x: 400, y: 480 },
            { x: 800, y: 480 },
            { x: 1200, y: 480 },
            { x: 1650, y: 280 },
            { x: 1850, y: 200 },
            { x: 2050, y: 260 },
            { x: 2450, y: 320 },
            { x: 2650, y: 240 },
            { x: 2850, y: 160 },
        ];

        coinPositions.forEach(c => {
            this.coins.push({ x: c.x, y: c.y, collected: false });
        });

        // Enemies
        const enemyPositions = [
            { x: 400, y: 480 },
            { x: 850, y: 480 },
            { x: 1250, y: 480 },
            { x: 1650, y: 480 },
            { x: 2100, y: 480 },
            { x: 2500, y: 480 },
        ];

        enemyPositions.forEach(e => {
            this.enemies.push({
                x: e.x,
                y: e.y,
                vx: 40 * (Math.random() > 0.5 ? 1 : -1),
                width: 32,
                height: 32,
                alive: true,
            });
        });

        // Goal
        this.goal = { x: 3000, y: this.levelHeight - 128, width: 64, height: 64 };
    }

    update(dt: number): void {
        this.gameTime += dt;
        const dtSec = dt / 1000;

        // Update player
        this.player.update(dt);

        // Platform collisions
        this.handlePlatformCollisions();

        // Update enemies
        this.updateEnemies(dtSec);

        // Coin collection
        this.checkCoinCollection();

        // Enemy collision
        this.checkEnemyCollision();

        // Check goal
        this.checkGoal();

        // Death (fell off)
        if (this.player.y > this.levelHeight + 100) {
            this.respawnPlayer();
        }

        // Pause
        if (this.engine.input.pause) {
            console.log('⏸️ Paused');
        }
    }

    private handlePlatformCollisions(): void {
        this.player.grounded = false;
        this.player.onLeftWall = false;
        this.player.onRightWall = false;

        const playerBounds = this.player.getBounds();

        for (const platform of this.platforms) {
            if (checkAABB(playerBounds, platform)) {
                const result = resolveCollision(this.player, platform);

                if (result.grounded) {
                    this.player.grounded = true;
                }
                if (result.hitLeft) {
                    this.player.onRightWall = true;
                }
                if (result.hitRight) {
                    this.player.onLeftWall = true;
                }
            }
        }
    }

    private updateEnemies(dtSec: number): void {
        for (const enemy of this.enemies) {
            if (!enemy.alive) continue;

            enemy.x += enemy.vx * dtSec;

            // Simple patrol - reverse at edges
            const onPlatform = this.platforms.some(p =>
                enemy.x >= p.x - 10 &&
                enemy.x + enemy.width <= p.x + p.width + 10 &&
                Math.abs((enemy.y + enemy.height) - p.y) < 10
            );

            // Reverse direction at platform edges
            if (!onPlatform || enemy.x < 50 || enemy.x > this.levelWidth - 50) {
                enemy.vx *= -1;
            }
        }
    }

    private checkCoinCollection(): void {
        const playerBounds = this.player.getBounds();

        for (const coin of this.coins) {
            if (coin.collected) continue;

            const coinBounds = { x: coin.x, y: coin.y, width: 20, height: 20 };
            if (checkAABB(playerBounds, coinBounds)) {
                coin.collected = true;
                this.score += 100;
                this.engine.particles.emitGlitter(coin.x + 10, coin.y + 10);
                this.engine.camera.shake(2, 50);
            }
        }
    }

    private checkEnemyCollision(): void {
        const playerBounds = this.player.getBounds();

        for (const enemy of this.enemies) {
            if (!enemy.alive) continue;

            const enemyBounds = { x: enemy.x, y: enemy.y, width: enemy.width, height: enemy.height };
            if (checkAABB(playerBounds, enemyBounds)) {
                // Stomp from above
                if (this.player.vy > 0 && this.player.y + this.player.height < enemy.y + enemy.height / 2) {
                    enemy.alive = false;
                    this.player.vy = -250;
                    this.score += 200;
                    this.engine.particles.emitExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
                    this.engine.camera.shake(5, 100);
                } else {
                    // Take damage
                    this.takeDamage();
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
            this.respawnPlayer();
        }
    }

    private respawnPlayer(): void {
        this.player.x = 100;
        this.player.y = 400;
        this.player.vx = 0;
        this.player.vy = 0;
        this.engine.camera.snapTo(this.player.x, this.player.y);
    }

    private checkGoal(): void {
        const playerBounds = this.player.getBounds();
        if (checkAABB(playerBounds, this.goal)) {
            console.log('🎉 VICTORY!');
            this.engine.switchScene('title');
        }
    }

    draw(ctx: CanvasRenderingContext2D, alpha: number): void {
        const { WIDTH, HEIGHT } = this.engine;

        // === SKY (screen space - before camera) ===
        ctx.save();
        ctx.resetTransform();

        // Progress-based gradient (dawn -> day based on X position)
        const progress = this.player.x / this.levelWidth;
        const topColor = this.lerpColor('#FF6B35', '#4A90D9', progress);
        const bottomColor = this.lerpColor('#FFB347', '#87CEEB', progress);

        const gradient = ctx.createLinearGradient(0, 0, 0, HEIGHT);
        gradient.addColorStop(0, topColor);
        gradient.addColorStop(1, bottomColor);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
        ctx.restore();

        // === WORLD SPACE (camera applied by engine) ===

        // Draw platforms
        for (const platform of this.platforms) {
            ctx.fillStyle = platform.color;
            ctx.fillRect(platform.x, platform.y, platform.width, platform.height);

            // X-bracing for cedar platforms
            if (platform.color === COWICHAN_CSS.CEDAR_RED && platform.height === 32) {
                ctx.strokeStyle = '#5A2D00';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(platform.x, platform.y);
                ctx.lineTo(platform.x + platform.width, platform.y + platform.height);
                ctx.moveTo(platform.x + platform.width, platform.y);
                ctx.lineTo(platform.x, platform.y + platform.height);
                ctx.stroke();
            }
        }

        // Draw coins
        for (const coin of this.coins) {
            if (coin.collected) continue;

            const bob = Math.sin(this.gameTime / 150 + coin.x) * 3;
            ctx.fillStyle = COWICHAN_CSS.YELLOW_FOOTPRINT;
            ctx.beginPath();
            ctx.arc(coin.x + 10, coin.y + 10 + bob, 10, 0, Math.PI * 2);
            ctx.fill();

            // Shine
            ctx.fillStyle = '#FFFFCC';
            ctx.beginPath();
            ctx.arc(coin.x + 7, coin.y + 7 + bob, 3, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw enemies
        for (const enemy of this.enemies) {
            if (!enemy.alive) continue;

            // Raccoon (simple)
            ctx.fillStyle = COWICHAN_CSS.RACCOON_GRAY;
            ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);

            // Eye mask
            ctx.fillStyle = COWICHAN_CSS.RACCOON_BLACK;
            ctx.fillRect(enemy.x + 4, enemy.y + 8, 24, 8);

            // Eyes
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(enemy.x + 8, enemy.y + 10, 4, 4);
            ctx.fillRect(enemy.x + 20, enemy.y + 10, 4, 4);
        }

        // Draw goal
        ctx.fillStyle = COWICHAN_CSS.YELLOW_FOOTPRINT;
        ctx.globalAlpha = 0.5 + Math.sin(this.gameTime / 200) * 0.3;
        ctx.fillRect(this.goal.x, this.goal.y, this.goal.width, this.goal.height);
        ctx.globalAlpha = 1;

        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🏁', this.goal.x + 32, this.goal.y + 40);

        // Draw player (with squash & stretch)
        ctx.save();
        ctx.translate(
            this.player.x + this.player.width / 2,
            this.player.y + this.player.height
        );
        ctx.scale(
            (this.player.facingRight ? 1 : -1) * this.player.scaleX,
            this.player.scaleY
        );

        // Body
        ctx.fillStyle = COWICHAN_CSS.CAT_ORANGE;
        ctx.fillRect(-this.player.width / 2, -this.player.height, this.player.width, this.player.height);

        // Eyes
        ctx.fillStyle = '#00FF00';
        ctx.fillRect(-8, -this.player.height + 10, 6, 6);
        ctx.fillRect(2, -this.player.height + 10, 6, 6);

        // State debug
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '8px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(this.player.state.toUpperCase(), 0, -this.player.height - 5);

        ctx.restore();

        // === HUD (screen space) ===
        ctx.save();
        ctx.resetTransform();

        // Health
        for (let i = 0; i < 3; i++) {
            ctx.fillStyle = i < this.health ? '#FF0000' : '#333333';
            ctx.font = '24px Arial';
            ctx.fillText(i < this.health ? '♥' : '♡', 20 + i * 30, 35);
        }

        // Score
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 18px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`SCORE: ${this.score}`, WIDTH / 2, 30);

        // Timer
        const seconds = Math.floor(this.gameTime / 1000);
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        ctx.textAlign = 'right';
        ctx.fillText(`${minutes}:${secs.toString().padStart(2, '0')}`, WIDTH - 20, 30);

        ctx.restore();
    }

    private lerpColor(a: string, b: string, t: number): string {
        const parse = (c: string) => [
            parseInt(c.slice(1, 3), 16),
            parseInt(c.slice(3, 5), 16),
            parseInt(c.slice(5, 7), 16),
        ];
        const [ar, ag, ab] = parse(a);
        const [br, bg, bb] = parse(b);
        const r = Math.round(ar + (br - ar) * t);
        const g = Math.round(ag + (bg - ag) * t);
        const bl = Math.round(ab + (bb - ab) * t);
        return `rgb(${r},${g},${bl})`;
    }
}
