import Phaser from 'phaser';
import { SNES_WIDTH, SNES_HEIGHT } from '../config/GameConfig';
import { audioSynth } from '../utils/AudioSynth';

/**
 * Victory Scene - Shown when player reaches the goal
 */
export class VictoryScene extends Phaser.Scene {
    constructor() {
        super({ key: 'VictoryScene' });
    }

    init(data: { score: number; coins: number; time: number }) {
        this.data.set('score', data.score || 0);
        this.data.set('coins', data.coins || 0);
        this.data.set('time', data.time || 0);
    }

    create(): void {
        // Play victory sound
        audioSynth.playVictory();

        // Semi-transparent overlay
        this.add.rectangle(
            SNES_WIDTH / 2,
            SNES_HEIGHT / 2,
            SNES_WIDTH,
            SNES_HEIGHT,
            0x000000,
            0.8
        );

        // Victory text
        this.add.text(SNES_WIDTH / 2, 40, '🎉 VICTORY! 🎉', {
            fontFamily: 'monospace',
            fontSize: '14px',
            color: '#F8F800',
        }).setOrigin(0.5);

        this.add.text(SNES_WIDTH / 2, 70, 'West Cat made it East!', {
            fontFamily: 'monospace',
            fontSize: '8px',
            color: '#F8F8F8',
        }).setOrigin(0.5);

        // Stats
        const coins = this.data.get('coins') || 0;
        const score = this.data.get('score') || 0;
        const timeMs = this.data.get('time') || 0;
        const timeSec = Math.floor(timeMs / 1000);

        this.add.text(SNES_WIDTH / 2, 100, `Coins: ${coins}`, {
            fontFamily: 'monospace',
            fontSize: '8px',
            color: '#F8F800',
        }).setOrigin(0.5);

        this.add.text(SNES_WIDTH / 2, 115, `Score: ${score}`, {
            fontFamily: 'monospace',
            fontSize: '8px',
            color: '#00F800',
        }).setOrigin(0.5);

        this.add.text(SNES_WIDTH / 2, 130, `Time: ${timeSec}s`, {
            fontFamily: 'monospace',
            fontSize: '8px',
            color: '#00F8F8',
        }).setOrigin(0.5);

        // Replay prompt
        this.add.text(SNES_WIDTH / 2, SNES_HEIGHT - 50, 'Press ENTER to play again', {
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
