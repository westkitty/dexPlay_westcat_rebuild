/**
 * Game Configuration
 * 
 * Centralized configuration for game constants and settings.
 */

export const GameConfig = {
    // Display
    SCREEN_WIDTH: 800,
    SCREEN_HEIGHT: 600,

    // Physics
    GRAVITY: 1200,
    MAX_FALL_SPEED: 600,

    // Player
    PLAYER: {
        WIDTH: 32,
        HEIGHT: 40,
        ACCELERATION: 1200,
        FRICTION: 0.85,
        MAX_SPEED: 250,
        JUMP_FORCE: 380,
        JUMP_CUT: 0.5,
        WALL_SLIDE_SPEED: 80,
        WALL_JUMP_FORCE_X: 280,
        WALL_JUMP_FORCE_Y: 340,
    },

    // Timing (ms)
    TIMING: {
        COYOTE_TIME: 100,
        JUMP_BUFFER: 80,
        CLAW_DURATION: 300,
    },

    // Camera
    CAMERA: {
        PEEK_DISTANCE: 100,
        PEEK_SPEED: 5,
    },

    // Particles
    PARTICLES: {
        POOL_SIZE: 500,
    },

    // Scene Transitions
    TRANSITIONS: {
        DURATION: 600, // ms
        MOSAIC_MAX: 16,
    },
} as const;

export type GameConfigType = typeof GameConfig;
