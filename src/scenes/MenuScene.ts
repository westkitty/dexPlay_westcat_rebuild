import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/GameConfig';
import { audioSynth } from '../utils/AudioSynth';
import { COWICHAN_PALETTE, COWICHAN_CSS } from '../constants/Colors';

/**
 * Menu Scene - Duncan BC themed title screen
 */
export class MenuScene extends Phaser.Scene {
    private blinkTimer: number = 0;
    private pressStartText!: Phaser.GameObjects.Text;

    constructor() {
        super({ key: 'MenuScene' });
    }

    create(): void {
        const centerX = GAME_WIDTH / 2;
        const centerY = GAME_HEIGHT / 2;

        // Cowichan Valley gradient sky
        this.cameras.main.setBackgroundColor(COWICHAN_PALETTE.SKY_BLUE);

        // Draw simple mountains in background
        const mountains = this.add.graphics();
        mountains.fillStyle(COWICHAN_PALETTE.MOUNTAIN_GRAY, 0.3);
        mountains.beginPath();
        mountains.moveTo(0, GAME_HEIGHT);
        mountains.lineTo(200, GAME_HEIGHT - 150);
        mountains.lineTo(400, GAME_HEIGHT);
        mountains.closePath();
        mountains.fill();

        mountains.beginPath();
        mountains.moveTo(300, GAME_HEIGHT);
        mountains.lineTo(500, GAME_HEIGHT - 180);
        mountains.lineTo(700, GAME_HEIGHT);
        mountains.closePath();
        mountains.fill();

        // Title with Duncan BC styling
        this.add.text(centerX, 100, '🐱 WEST CAT', {
            fontFamily: 'Arial Black, sans-serif',
            fontSize: '56px',
            color: COWICHAN_CSS.CAT_ORANGE,
            stroke: '#000000',
            strokeThickness: 4,
        }).setOrigin(0.5);

        this.add.text(centerX, 160, 'GOES EAST', {
            fontFamily: 'Arial Black, sans-serif',
            fontSize: '40px',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 3,
        }).setOrigin(0.5);

        // Duncan BC subtitle
        this.add.text(centerX, 200, 'Duncan, BC Edition', {
            fontFamily: 'Georgia, serif',
            fontSize: '20px',
            color: COWICHAN_CSS.YELLOW_FOOTPRINT,
            fontStyle: 'italic',
        }).setOrigin(0.5);

        this.add.text(centerX, 225, '🏔️ Cowichan Valley Adventure 🌲', {
            fontFamily: 'Georgia, serif',
            fontSize: '14px',
            color: COWICHAN_CSS.SALAL_GREEN,
        }).setOrigin(0.5);

        // Preview cat
        const catPreview = this.add.sprite(centerX, centerY + 40, 'player');
        catPreview.setDisplaySize(96, 96);

        // Press Start (blinking)
        this.pressStartText = this.add.text(centerX, centerY + 120, 'PRESS ENTER TO START', {
            fontFamily: 'monospace',
            fontSize: '24px',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 2,
        }).setOrigin(0.5);

        // Controls box with Duncan theme
        const controlsY = GAME_HEIGHT - 160;
        const controlsBox = this.add.rectangle(centerX, controlsY, 500, 120, COWICHAN_PALETTE.WET_ASPHALT, 0.8);
        controlsBox.setStrokeStyle(3, COWICHAN_PALETTE.CEDAR_RED);

        this.add.text(centerX, controlsY - 45, 'CONTROLS', {
            fontFamily: 'Arial Black',
            fontSize: '16px',
            color: COWICHAN_CSS.YELLOW_FOOTPRINT,
        }).setOrigin(0.5);

        this.add.text(centerX, controlsY - 20, 'ARROWS / WASD - Move    SPACE / W / UP - Jump', {
            fontFamily: 'monospace',
            fontSize: '13px',
            color: '#FFFFFF',
        }).setOrigin(0.5);

        this.add.text(centerX, controlsY + 5, '🧗 Wall Slide & Wall Jump Available!', {
            fontFamily: 'monospace',
            fontSize: '13px',
            color: COWICHAN_CSS.SALAL_GREEN,
        }).setOrigin(0.5);

        this.add.text(centerX, controlsY + 30, 'ESC - Pause   M - Mute   R - AutoRun   T - Assist', {
            fontFamily: 'monospace',
            fontSize: '11px',
            color: '#AAAAAA',
        }).setOrigin(0.5);

        // Duncan BC features teaser
        this.add.text(centerX, GAME_HEIGHT - 25, '🎭 Featuring Totem Poles, Hockey Stick & Yellow Footprints!', {
            fontFamily: 'Arial',
            fontSize: '12px',
            color: COWICHAN_CSS.TOTEM_TURQUOISE,
        }).setOrigin(0.5);

        // Input handlers
        this.input.keyboard!.on('keydown-ENTER', this.startGame, this);
        this.input.keyboard!.on('keydown-SPACE', this.startGame, this);
        this.input.on('pointerdown', this.startGame, this);
    }

    update(time: number, delta: number): void {
        this.blinkTimer += delta;
        if (this.blinkTimer >= 500) {
            this.blinkTimer = 0;
            this.pressStartText.setVisible(!this.pressStartText.visible);
        }
    }

    private startGame(): void {
        audioSynth.unlock();
        this.scene.start('GameScene');
    }
}
