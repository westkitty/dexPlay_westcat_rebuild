import Phaser from 'phaser';
import { GAME_WIDTH } from '../config/GameConfig';

/**
 * HUD (Heads-Up Display)
 * 
 * Shows player health, coin count, and timer.
 * Fixed to camera, doesn't scroll with level.
 */
export class HUD {
    private container: Phaser.GameObjects.Container;

    private healthIcons: Phaser.GameObjects.Text[] = [];
    private coinText!: Phaser.GameObjects.Text;
    private coinIcon!: Phaser.GameObjects.Text;
    private timerText!: Phaser.GameObjects.Text;
    private scoreText!: Phaser.GameObjects.Text;

    constructor(scene: Phaser.Scene) {
        // Create container fixed to camera
        this.container = scene.add.container(0, 0);
        this.container.setScrollFactor(0);
        this.container.setDepth(100);

        // Health icons (hearts) - left side
        for (let i = 0; i < 3; i++) {
            const heart = scene.add.text(20 + i * 25, 15, '♥', {
                fontFamily: 'Arial',
                fontSize: '20px',
                color: '#ff0000',
            });
            this.healthIcons.push(heart);
            this.container.add(heart);
        }

        // Coin counter - center-left
        this.coinIcon = scene.add.text(120, 15, '●', {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#ffd700',
        });
        this.container.add(this.coinIcon);

        this.coinText = scene.add.text(140, 15, '×0', {
            fontFamily: 'monospace',
            fontSize: '18px',
            color: '#ffffff',
        });
        this.container.add(this.coinText);

        // Score - center
        this.scoreText = scene.add.text(GAME_WIDTH / 2, 15, 'SCORE: 0', {
            fontFamily: 'monospace',
            fontSize: '16px',
            color: '#ffffff',
        }).setOrigin(0.5, 0);
        this.container.add(this.scoreText);

        // Timer - right side
        this.timerText = scene.add.text(GAME_WIDTH - 20, 15, '0:00', {
            fontFamily: 'monospace',
            fontSize: '18px',
            color: '#00ffff',
        }).setOrigin(1, 0);
        this.container.add(this.timerText);
    }

    update(health: number, score: number, coins: number, timeMs: number = 0): void {
        // Update health display
        for (let i = 0; i < this.healthIcons.length; i++) {
            if (i < health) {
                this.healthIcons[i].setColor('#ff0000');
                this.healthIcons[i].setText('♥');
            } else {
                this.healthIcons[i].setColor('#333333');
                this.healthIcons[i].setText('♡');
            }
        }

        // Update coin count
        this.coinText.setText(`×${coins}`);

        // Update score
        this.scoreText.setText(`SCORE: ${score}`);

        // Update timer
        const totalSeconds = Math.floor(timeMs / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        this.timerText.setText(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    }

    destroy(): void {
        this.container.destroy();
    }
}
