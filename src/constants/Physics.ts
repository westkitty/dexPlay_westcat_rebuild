/**
 * Physics Constants - Tuned for SNES-style platforming feel
 * 
 * Per agent_workflows_tune_jump_physics.md:
 * - Target jump height: ~48px (3 tiles)
 * - Air time: ~400ms for tight, responsive feel
 * - Formula reference: H ≈ v² / (2g)
 */

// Gravity (applied per frame)
export const GRAVITY = 800;

// Player movement
export const PLAYER_SPEED = 120;
export const PLAYER_ACCELERATION = 600;
export const PLAYER_DECELERATION = 800;

// Jump physics (tuned for SNES feel)
export const JUMP_FORCE = 280;           // Initial upward velocity
export const JUMP_HOLD_FORCE = 50;       // Additional force while holding jump
export const JUMP_HOLD_DURATION = 150;   // ms to allow variable jump height
export const DOUBLE_JUMP_FORCE = 240;    // Slightly weaker second jump

// Assist features (accessibility)
export const COYOTE_TIME = 80;           // ms after leaving platform to still jump
export const JUMP_BUFFER_TIME = 100;     // ms before landing to buffer jump input

// Damage and invincibility
export const DAMAGE_KNOCKBACK_X = 150;
export const DAMAGE_KNOCKBACK_Y = -200;
export const INVINCIBILITY_DURATION = 1500; // ms
export const DAMAGE_FLASH_DURATION = 100;   // ms per flash

// Enemy defaults
export const ENEMY_SPEED = 40;
export const SNAIL_SPEED = 25;
export const BAT_SPEED = 50;
export const BAT_AMPLITUDE = 20;         // Sine wave amplitude for bat hover

// Wall mechanics
export const WALL_SLIDE_SPEED = 60;      // Max fall speed when sliding
export const WALL_JUMP_X = 200;          // Horizontal velocity from wall jump
export const WALL_JUMP_Y = 260;          // Vertical velocity from wall jump

// Tile size (modern - larger for visibility)
export const TILE_SIZE = 32;

