import Phaser from 'phaser';
import { BootScene } from '../scenes/BootScene';
import { MenuScene } from '../scenes/MenuScene';
import { GameScene } from '../scenes/GameScene';
import { PauseScene } from '../scenes/PauseScene';
import { VictoryScene } from '../scenes/VictoryScene';
import { GameOverScene } from '../scenes/GameOverScene';

/**
 * Modern Game Configuration
 * 
 * Resolution: 800x600 (modern, fully visible)
 * Rendering: Pixel-art style with crisp edges
 */

// Modern resolution - fully visible on most screens
export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;

// Legacy exports for compatibility
export const SNES_WIDTH = GAME_WIDTH;
export const SNES_HEIGHT = GAME_HEIGHT;

export const GAME_CONFIG: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: '#000000',

    // Pixel-perfect rendering for crisp sprites
    pixelArt: true,
    antialias: false,
    roundPixels: true,

    // Responsive scaling
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },

    // Arcade physics for platforming
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 800 },
            debug: false,
        },
    },

    // All scenes
    scene: [BootScene, MenuScene, GameScene, PauseScene, VictoryScene, GameOverScene],

    // Input configuration
    input: {
        keyboard: true,
        gamepad: true,
    },
};
