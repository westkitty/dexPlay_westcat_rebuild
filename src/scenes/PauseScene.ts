import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/GameConfig';

/**
 * Pause Scene - Overlay shown when game is paused
 */
export class PauseScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PauseScene' });
    }

    create(): void {
        // Semi-transparent overlay
        this.add.rectangle(
            GAME_WIDTH / 2,
            GAME_HEIGHT / 2,
            GAME_WIDTH,
            GAME_HEIGHT,
            0x000000,
            0.7
        );

        // Pause text
        this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40, 'PAUSED', {
            fontFamily: 'Arial Black',
            fontSize: '48px',
            color: '#ffffff',
        }).setOrigin(0.5);

        this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 20, 'Press ESC to resume', {
            fontFamily: 'monospace',
            fontSize: '18px',
            color: '#888888',
        }).setOrigin(0.5);

        this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 50, 'Press M for menu', {
            fontFamily: 'monospace',
            fontSize: '18px',
            color: '#888888',
        }).setOrigin(0.5);

        // Input handlers
        this.input.keyboard!.on('keydown-ESC', this.resumeGame, this);
        this.input.keyboard!.on('keydown-M', this.goToMenu, this);
    }

    private resumeGame(): void {
        this.scene.resume('GameScene');
        this.scene.stop();
    }

    private goToMenu(): void {
        this.scene.stop('GameScene');
        this.scene.start('MenuScene');
    }
}
