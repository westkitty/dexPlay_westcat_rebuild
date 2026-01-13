/**
 * West Cat Goes East - Pure Canvas Game Engine Entry Point
 * 
 * No Phaser. No frameworks. Just requestAnimationFrame and game dev code.
 */

import { Engine } from './engine/Engine';
import { TitleScene } from './scenes/TitleScene';
import { GameScene } from './scenes/GameScene';

// Wait for DOM
window.addEventListener('DOMContentLoaded', () => {
    console.log('🎮 West Cat Goes East - Game Engine Build');

    // Create engine
    const engine = new Engine('game-canvas');

    // Register scenes
    engine.addScene('title', new TitleScene(engine));
    engine.addScene('game', new GameScene(engine));

    // Start with title
    engine.switchScene('title', true);

    // Start game loop
    engine.start();

    // Expose for debugging
    (window as any).engine = engine;
});
