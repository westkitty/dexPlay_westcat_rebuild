import Phaser from 'phaser';
import { GAME_CONFIG } from './config/GameConfig';

// Create the Phaser game instance
const game = new Phaser.Game(GAME_CONFIG);

// Expose for debugging and browser agent verification
(window as any).game = game;
