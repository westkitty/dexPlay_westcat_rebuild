import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/GameConfig';
import { COWICHAN_PALETTE } from '../constants/Colors';
import { SpriteGenerator } from '../utils/SpriteGenerator';

/**
 * Boot Scene - Initial asset loading
 * Shows a loading bar and preloads all game assets
 */
export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload(): void {
        // Create loading bar
        const width = GAME_WIDTH;
        const height = GAME_HEIGHT;

        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x333333, 0.8);
        progressBox.fillRect(width / 4, height / 2 - 10, width / 2, 20);

        const loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading West Cat Goes East...', {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#ffffff',
        });
        loadingText.setOrigin(0.5);

        const subText = this.add.text(width / 2, height / 2 - 28, 'Duncan, BC Edition', {
            fontFamily: 'Georgia',
            fontSize: '14px',
            color: '#FFD700',
        });
        subText.setOrigin(0.5);

        // Update progress bar
        this.load.on('progress', (value: number) => {
            progressBar.clear();
            progressBar.fillStyle(COWICHAN_PALETTE.SALAL_GREEN, 1);
            progressBar.fillRect(width / 4 + 2, height / 2 - 8, (width / 2 - 4) * value, 16);
        });

        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
            subText.destroy();
        });
    }

    create(): void {
        // Generate enhanced sprites with Duncan BC themes
        console.log('🎨 Generating enhanced Duncan BC sprites...');

        SpriteGenerator.generatePlayer(this);
        SpriteGenerator.generateTileset(this);
        SpriteGenerator.generateEnemies(this);

        console.log('✅ All sprites generated!');

        // Transition to menu
        this.scene.start('MenuScene');
    }
}
