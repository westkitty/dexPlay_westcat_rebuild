import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/GameConfig';
import { Player } from '../entities/Player';
import { Snail } from '../entities/Snail';
import { Bat } from '../entities/Bat';
import { TILE_SIZE } from '../constants/Physics';
import { LEVEL_1 } from '../levels/Level1';
import { HUD } from '../ui/HUD';
import { audioSynth } from '../utils/AudioSynth';
import { ParallaxBackground } from '../entities/Background';
import { TotemPole, HockeyStick } from '../entities/Decorations';
import { ParticleManager } from '../utils/ParticleManager';
import { COWICHAN_PALETTE } from '../constants/Colors';

/**
 * Game Scene - Main gameplay with Duncan BC theme
 */
export class GameScene extends Phaser.Scene {
    // Entities
    private player!: Player;
    private enemies!: Phaser.GameObjects.Group;
    private coins!: Phaser.GameObjects.Group;
    private goal!: Phaser.GameObjects.Rectangle;

    // Level
    private platforms!: Phaser.Physics.Arcade.StaticGroup;
    private spikes!: Phaser.Physics.Arcade.StaticGroup;

    // Duncan BC Elements
    private background!: ParallaxBackground;
    private particles!: ParticleManager;
    private totemPoles: TotemPole[] = [];

    // UI
    private hud!: HUD;

    // Game state
    private score: number = 0;
    private isPaused: boolean = false;
    private gameTime: number = 0;
    private levelComplete: boolean = false;

    // Accessibility toggles
    private autoRun: boolean = false;
    private assistMode: boolean = false;
    private highContrast: boolean = false;

    constructor() {
        super({ key: 'GameScene' });
    }

    create(): void {
        // Reset state
        this.score = 0;
        this.gameTime = 0;
        this.levelComplete = false;
        this.isPaused = false;

        // Unlock audio
        if (!audioSynth.isUnlocked()) {
            audioSynth.unlock();
        }

        // Create Cowichan Valley sky
        this.cameras.main.setBackgroundColor(COWICHAN_PALETTE.SKY_BLUE);

        // Create parallax background (mountains, trees, clouds)
        this.background = new ParallaxBackground(this);

        // Create particle effect manager
        this.particles = new ParticleManager(this);

        // Create level from data
        this.createLevel();

        // Add Duncan BC decorations
        this.addDuncanDecorations();

        // Create goal zone
        this.createGoal();

        // Create player at spawn point
        const spawn = LEVEL_1.spawns.player;
        this.player = new Player(this, spawn.x * TILE_SIZE, spawn.y * TILE_SIZE);

        // Create enemies group
        this.enemies = this.add.group();
        this.createEnemies();

        // Create coins group
        this.coins = this.add.group();
        this.createCoins();

        // Set up collisions
        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.enemies, this.platforms);

        // Player-enemy overlap (damage or stomp)
        this.physics.add.overlap(
            this.player,
            this.enemies,
            this.handlePlayerEnemyCollision as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
            undefined,
            this
        );

        // Player-coin overlap (collect)
        this.physics.add.overlap(
            this.player,
            this.coins,
            this.collectCoin as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
            undefined,
            this
        );

        // Player-spike overlap (damage)
        this.physics.add.overlap(
            this.player,
            this.spikes,
            this.handleSpikeHit as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
            undefined,
            this
        );

        // Set up camera to follow player
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        this.cameras.main.setBounds(0, 0, LEVEL_1.width * TILE_SIZE, LEVEL_1.height * TILE_SIZE);

        // Create HUD
        this.hud = new HUD(this);

        // Set up input
        this.setupInput();

        // World bounds
        this.physics.world.setBounds(0, 0, LEVEL_1.width * TILE_SIZE, LEVEL_1.height * TILE_SIZE);
    }

    update(time: number, delta: number): void {
        if (this.isPaused || this.levelComplete) return;

        // Update game time
        this.gameTime += delta;

        // Update parallax background
        this.background.update(time);

        // Update player
        this.player.update(time, delta, this.autoRun, this.assistMode);

        // Wall slide particle effect
        if (this.player.state === 'wallSlide') {
            if (Math.random() < 0.3) {
                this.particles.wallSlideSparks(this.player.x, this.player.y + 10, this.player.visible);
            }
        }

        // Update enemies
        this.enemies.getChildren().forEach((enemy: any) => {
            if (enemy.update) {
                enemy.update(time, delta);
            }
        });

        // Update HUD
        this.hud.update(this.player.health, this.score, this.player.coins, this.gameTime);

        // Check for death (fell off level)
        if (this.player.y > LEVEL_1.height * TILE_SIZE + 50) {
            this.player.takeDamage();
            this.handlePlayerDeath();
        }

        // Check for game over
        if (this.player.isDead()) {
            this.handleGameOver();
        }

        // Check for goal reached
        this.checkGoal();
    }

    private addDuncanDecorations(): void {
        // Add totem poles at strategic locations (City of Totems!)
        const totemLocations = [
            { x: 15, y: LEVEL_1.height - 2 },
            { x: 30, y: LEVEL_1.height - 2 },
            { x: 50, y: LEVEL_1.height - 2 },
            { x: 70, y: LEVEL_1.height - 2 },
        ];

        totemLocations.forEach(pos => {
            const totem = new TotemPole(this, pos.x * TILE_SIZE, pos.y * TILE_SIZE, 128);
            this.totemPoles.push(totem);
        });

        // Add World's Largest Hockey Stick in background
        new HockeyStick(this, 400, 100);
        new HockeyStick(this, 1200, 120);
    }

    private createLevel(): void {
        this.platforms = this.physics.add.staticGroup();
        this.spikes = this.physics.add.staticGroup();

        const tileMap = LEVEL_1.tiles;

        for (let y = 0; y < tileMap.length; y++) {
            for (let x = 0; x < tileMap[y].length; x++) {
                const tileType = tileMap[y][x];
                const posX = x * TILE_SIZE + TILE_SIZE / 2;
                const posY = y * TILE_SIZE + TILE_SIZE / 2;

                if (tileType === 1 || tileType === 2) {
                    // Ground or grass-top (using Duncan themed tiles)
                    const platform = this.platforms.create(posX, posY, 'tileset');
                    platform.setDisplaySize(TILE_SIZE, TILE_SIZE);

                    // Use specific tile from enhanced tileset
                    const tileIndex = tileType === 2 ? 2 : 1; // Cedar or grass
                    platform.setFrame(0);
                    platform.setTint(tileType === 2 ? COWICHAN_PALETTE.SALAL_GREEN : COWICHAN_PALETTE.CEDAR_RED);

                    platform.refreshBody();
                } else if (tileType === 3) {
                    // Platform (yellow footprints on concrete!)
                    const platform = this.platforms.create(posX, posY, 'tileset');
                    platform.setDisplaySize(TILE_SIZE, TILE_SIZE / 2);
                    platform.setTint(COWICHAN_PALETTE.WET_ASPHALT);
                    platform.refreshBody();
                } else if (tileType === 4) {
                    // Spike
                    const spike = this.spikes.create(posX, posY, 'tileset');
                    spike.setDisplaySize(TILE_SIZE, TILE_SIZE);
                    spike.setTint(0xdc143c);
                    spike.refreshBody();
                }
            }
        }
    }

    private createGoal(): void {
        const goalX = (LEVEL_1.width - 3) * TILE_SIZE;
        const goalY = (LEVEL_1.height - 5) * TILE_SIZE;

        this.goal = this.add.rectangle(goalX, goalY, TILE_SIZE * 2, TILE_SIZE * 4, COWICHAN_PALETTE.YELLOW_FOOTPRINT, 0.5);
        this.physics.add.existing(this.goal, true);

        this.add.text(goalX, goalY - 30, '🏁', { fontSize: '32px' }).setOrigin(0.5);
        this.add.text(goalX, goalY + 70, 'DUNCAN\nFINISH', {
            fontFamily: 'Arial Black',
            fontSize: '14px',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 3,
            align: 'center',
        }).setOrigin(0.5);
    }

    private createEnemies(): void {
        for (const enemyData of LEVEL_1.spawns.enemies) {
            const x = enemyData.x * TILE_SIZE;
            const y = enemyData.y * TILE_SIZE;

            if (enemyData.type === 'snail') {
                // Use raccoon instead (Duncan wildlife!)
                const raccoon = this.add.sprite(x, y, 'raccoon');
                raccoon.setDisplaySize(32, 32);
                this.physics.add.existing(raccoon);
                (raccoon.body as Phaser.Physics.Arcade.Body).setVelocityX(25);
                this.enemies.add(raccoon);
            } else if (enemyData.type === 'bat') {
                // Use seagull (coastal bird!)
                const seagull = this.add.sprite(x, y, 'seagull');
                seagull.setDisplaySize(32, 32);
                this.physics.add.existing(seagull);
                (seagull.body as Phaser.Physics.Arcade.Body).allowGravity = false;
                (seagull.body as Phaser.Physics.Arcade.Body).setVelocityX(50);
                this.enemies.add(seagull);
            }
        }
    }

    private createCoins(): void {
        for (const coinPos of LEVEL_1.spawns.coins) {
            const x = coinPos.x * TILE_SIZE;
            const y = coinPos.y * TILE_SIZE;

            const coin = this.physics.add.sprite(x, y, 'coin');
            coin.setDisplaySize(24, 24);
            (coin.body as Phaser.Physics.Arcade.Body).allowGravity = false;

            // Spin animation
            this.tweens.add({
                targets: coin,
                scaleX: { from: 1, to: 0.2 },
                duration: 300,
                yoyo: true,
                repeat: -1,
            });

            this.coins.add(coin);
        }
    }

    private handlePlayerEnemyCollision(player: any, enemy: any): void {
        if (player.body.velocity.y > 0 && player.y < enemy.y - 8) {
            // Stomp!
            this.particles.enemyDefeat(enemy.x, enemy.y);
            enemy.destroy();
            this.score += 100;
            audioSynth.playStomp();
            player.body.setVelocityY(-200);
        } else {
            (player as Player).takeDamage();
        }
    }

    private collectCoin(player: any, coin: any): void {
        this.particles.coinCollect(coin.x, coin.y);
        coin.destroy();
        this.score += 10;
        (player as Player).coins++;
        audioSynth.playCoin();
    }

    private handleSpikeHit(player: any, spike: any): void {
        (player as Player).takeDamage();
    }

    private handlePlayerDeath(): void {
        const spawn = LEVEL_1.spawns.player;
        this.player.setPosition(spawn.x * TILE_SIZE, spawn.y * TILE_SIZE);
        this.player.setVelocity(0, 0);
    }

    private handleGameOver(): void {
        this.levelComplete = true;
        this.scene.start('GameOverScene', {
            score: this.score,
            coins: this.player.coins,
        });
    }

    private checkGoal(): void {
        const playerBounds = this.player.getBounds();
        const goalBounds = this.goal.getBounds();

        if (Phaser.Geom.Intersects.RectangleToRectangle(playerBounds, goalBounds)) {
            this.levelComplete = true;
            this.scene.start('VictoryScene', {
                score: this.score,
                coins: this.player.coins,
                time: this.gameTime,
            });
        }
    }

    private setupInput(): void {
        this.input.keyboard!.on('keydown-ESC', () => {
            this.scene.launch('PauseScene');
            this.scene.pause();
            this.isPaused = true;
        });

        this.events.on('resume', () => {
            this.isPaused = false;
        });

        this.input.keyboard!.on('keydown-R', () => {
            this.autoRun = !this.autoRun;
            console.log(`Auto-run: ${this.autoRun ? 'ON' : 'OFF'}`);
        });

        this.input.keyboard!.on('keydown-T', () => {
            this.assistMode = !this.assistMode;
            console.log(`Assist mode: ${this.assistMode ? 'ON' : 'OFF'}`);
        });

        this.input.keyboard!.on('keydown-C', () => {
            this.highContrast = !this.highContrast;
            this.cameras.main.setBackgroundColor(this.highContrast ? 0x000000 : COWICHAN_PALETTE.SKY_BLUE);
            console.log(`High contrast: ${this.highContrast ? 'ON' : 'OFF'}`);
        });

        this.input.keyboard!.on('keydown-M', () => {
            const muted = audioSynth.toggleMute();
            console.log(`Audio: ${muted ? 'MUTED' : 'ON'}`);
        });
    }
}
