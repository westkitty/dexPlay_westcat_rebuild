import Phaser from 'phaser';
import { SNES_WIDTH, SNES_HEIGHT } from '../config/GameConfig';
import { audioSynth } from '../utils/AudioSynth';

/**
 * Game Over Scene - Shown when player loses all lives
 */
export class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    init(data: { score: number; coins: number }) {
        this.data.set('score', data.score || 0);
        this.data.set('coins', data.coins || 0);
    }

    create(): void {
        // Play game over sound
        audioSynth.playGameOver();

        // Semi-transparent overlay
        this.add.rectangle(
            SNES_WIDTH / 2,
            SNES_HEIGHT / 2,
            SNES_WIDTH,
            SNES_HEIGHT,
            0x000000,
            0.9
        );

        // Game Over text
        this.add.text(SNES_WIDTH / 2, 50, 'GAME OVER', {
            fontFamily: 'monospace',
            fontSize: '16px',
            color: '#F80000',
        }).setOrigin(0.5);

        // Sad cat
        this.add.text(SNES_WIDTH / 2, 80, '😿', {
            fontSize: '24px',
        }).setOrigin(0.5);

        // Stats
        const coins = this.data.get('coins') || 0;
        const score = this.data.get('score') || 0;

        this.add.text(SNES_WIDTH / 2, 115, `Final Score: ${score}`, {
            fontFamily: 'monospace',
            fontSize: '8px',
            color: '#F8F8F8',
        }).setOrigin(0.5);

        this.add.text(SNES_WIDTH / 2, 130, `Coins: ${coins}`, {
            fontFamily: 'monospace',
            fontSize: '8px',
            color: '#F8F800',
        }).setOrigin(0.5);

        // Retry prompt
        this.add.text(SNES_WIDTH / 2, SNES_HEIGHT - 50, 'Press ENTER to try again', {
            fontFamily: 'monospace',
            fontSize: '8px',
            color: '#888888',
        }).setOrigin(0.5);

        this.add.text(SNES_WIDTH / 2, SNES_HEIGHT - 35, 'Press M for menu', {
            fontFamily: 'monospace',
            fontSize: '8px',
            color: '#888888',
        }).setOrigin(0.5);

        // Input
        this.input.keyboard!.on('keydown-ENTER', () => {
            this.scene.stop();
            this.scene.start('GameScene');
        });

        this.input.keyboard!.on('keydown-M', () => {
            this.scene.stop();
            this.scene.start('MenuScene');
        });
    }
}
