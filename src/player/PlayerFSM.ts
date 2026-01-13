/**
 * Player Finite State Machine
 * 
 * No boolean flags! Pure state-based player controller.
 * Each state has enter(), update(), exit() methods.
 */

import { Engine } from '../engine/Engine';
import { InputSystem } from '../engine/InputSystem';

// Physics constants (acceleration-based movement)
const ACCELERATION = 1200;
const FRICTION = 0.85;
const MAX_SPEED = 250;
const GRAVITY = 1200;
const MAX_FALL_SPEED = 600;

const JUMP_FORCE = 380;
const JUMP_CUT = 0.5;
const COYOTE_TIME = 100;
const JUMP_BUFFER = 80;

const WALL_SLIDE_SPEED = 80;
const WALL_JUMP_FORCE_X = 280;
const WALL_JUMP_FORCE_Y = 340;

// Squash & Stretch values
const SQUASH = { x: 1.3, y: 0.7 };
const STRETCH = { x: 0.85, y: 1.15 };
const LAND_SQUASH = { x: 1.4, y: 0.6 };

export type PlayerState = 'idle' | 'run' | 'jump' | 'fall' | 'skid' | 'wallSlide';

export class Player {
    // Position and velocity
    public x: number;
    public y: number;
    public vx: number = 0;
    public vy: number = 0;
    public ax: number = 0;

    // Dimensions
    public width: number = 32;
    public height: number = 40;

    // State machine
    public state: PlayerState = 'idle';
    private prevState: PlayerState = 'idle';

    // Facing direction
    public facingRight: boolean = true;

    // Grounding
    public grounded: boolean = false;
    private wasGrounded: boolean = false;

    // Wall contact
    public onLeftWall: boolean = false;
    public onRightWall: boolean = false;

    // Timers
    private coyoteTimer: number = 0;
    private jumpBufferTimer: number = 0;
    private canDoubleJump: boolean = false;

    // Squash & Stretch
    public scaleX: number = 1;
    public scaleY: number = 1;
    private targetScaleX: number = 1;
    private targetScaleY: number = 1;

    // Reference to engine
    private engine: Engine;
    private input: InputSystem;

    // Run particle timer
    private runParticleTimer: number = 0;

    constructor(engine: Engine, x: number, y: number) {
        this.engine = engine;
        this.input = engine.input;
        this.x = x;
        this.y = y;
    }

    /**
     * Main update - delegates to current state
     */
    update(dt: number): void {
        // Save previous state for transitions
        this.prevState = this.state;
        this.wasGrounded = this.grounded;

        // Update state-specific logic
        switch (this.state) {
            case 'idle':
                this.updateIdle(dt);
                break;
            case 'run':
                this.updateRun(dt);
                break;
            case 'jump':
                this.updateJump(dt);
                break;
            case 'fall':
                this.updateFall(dt);
                break;
            case 'skid':
                this.updateSkid(dt);
                break;
            case 'wallSlide':
                this.updateWallSlide(dt);
                break;
        }

        // Apply physics
        this.applyPhysics(dt);

        // Update squash & stretch lerp
        this.updateSquashStretch(dt);

        // Update camera to follow player
        this.engine.camera.follow(this.x + this.width / 2, this.y + this.height / 2, this.vx);
    }

    // === STATE UPDATES ===

    private updateIdle(dt: number): void {
        // Transitions
        if (!this.grounded) {
            this.enterState('fall');
            return;
        }

        if (this.wantsToJump()) {
            this.doJump();
            return;
        }

        if (this.input.left || this.input.right) {
            this.enterState('run');
            return;
        }

        // Idle friction
        this.vx *= FRICTION;
    }

    private updateRun(dt: number): void {
        // Transitions
        if (!this.grounded) {
            this.enterState('fall');
            return;
        }

        if (this.wantsToJump()) {
            this.doJump();
            return;
        }

        if (!this.input.left && !this.input.right) {
            this.enterState('idle');
            return;
        }

        // Check for skid (direction change)
        if ((this.input.left && this.vx > 50) || (this.input.right && this.vx < -50)) {
            this.enterState('skid');
            return;
        }

        // Apply acceleration
        if (this.input.right) {
            this.ax = ACCELERATION;
            this.facingRight = true;
        } else if (this.input.left) {
            this.ax = -ACCELERATION;
            this.facingRight = false;
        }

        // Run particles
        this.runParticleTimer += dt;
        if (this.runParticleTimer > 100) {
            this.runParticleTimer = 0;
            this.engine.particles.emitDust(
                this.x + this.width / 2,
                this.y + this.height,
                2
            );
        }
    }

    private updateJump(dt: number): void {
        // Transitions
        if (this.vy > 0) {
            this.enterState('fall');
            return;
        }

        // Check for wall contact -> wall slide
        if ((this.onLeftWall || this.onRightWall) && this.vy > 0) {
            this.enterState('wallSlide');
            return;
        }

        // Variable jump height (release early = lower jump)
        if (!this.input.jump && this.vy < 0) {
            this.vy *= JUMP_CUT;
        }

        // Air control
        this.applyAirControl();

        // Stretch at peak
        if (Math.abs(this.vy) < 50) {
            this.targetScaleX = 0.9;
            this.targetScaleY = 1.1;
        }
    }

    private updateFall(dt: number): void {
        // Transitions
        if (this.grounded) {
            this.doLand();
            return;
        }

        // Wall slide check
        if ((this.onLeftWall && this.input.left) || (this.onRightWall && this.input.right)) {
            this.enterState('wallSlide');
            return;
        }

        // Double jump
        if (this.wantsToJump() && this.canDoubleJump) {
            this.canDoubleJump = false;
            this.vy = -JUMP_FORCE * 0.85;
            this.engine.particles.emitJump(this.x + this.width / 2, this.y + this.height);
            this.enterState('jump');
            return;
        }

        // Air control
        this.applyAirControl();

        // Coyote time jump
        if (this.wantsToJump() && this.coyoteTimer > 0) {
            this.doJump();
            return;
        }
    }

    private updateSkid(dt: number): void {
        // Skid friction (strong)
        this.vx *= 0.9;

        // Particles during skid
        this.engine.particles.emitDust(
            this.x + this.width / 2,
            this.y + this.height,
            1
        );

        // Transitions
        if (!this.grounded) {
            this.enterState('fall');
            return;
        }

        if (this.wantsToJump()) {
            this.doJump();
            return;
        }

        // Exit skid when slow enough or same direction
        if (Math.abs(this.vx) < 30) {
            if (this.input.left || this.input.right) {
                this.enterState('run');
            } else {
                this.enterState('idle');
            }
            return;
        }
    }

    private updateWallSlide(dt: number): void {
        // Slow fall
        this.vy = Math.min(this.vy, WALL_SLIDE_SPEED);

        // Sparks
        if (Math.random() < 0.3) {
            const sparkX = this.onLeftWall ? this.x : this.x + this.width;
            this.engine.particles.emitSparks(sparkX, this.y + this.height * 0.7);
        }

        // Transitions
        if (this.grounded) {
            this.enterState('idle');
            return;
        }

        // Wall jump
        if (this.wantsToJump()) {
            this.vx = this.onLeftWall ? WALL_JUMP_FORCE_X : -WALL_JUMP_FORCE_X;
            this.vy = -WALL_JUMP_FORCE_Y;
            this.facingRight = this.onLeftWall;
            this.engine.particles.emitJump(
                this.onLeftWall ? this.x : this.x + this.width,
                this.y + this.height / 2
            );
            this.enterState('jump');
            return;
        }

        // Release wall
        if ((this.onLeftWall && !this.input.left) || (this.onRightWall && !this.input.right)) {
            this.enterState('fall');
            return;
        }

        // No longer on wall
        if (!this.onLeftWall && !this.onRightWall) {
            this.enterState('fall');
            return;
        }
    }

    // === HELPERS ===

    private enterState(newState: PlayerState): void {
        // Exit current state
        this.onStateExit(this.state);

        this.state = newState;

        // Enter new state
        this.onStateEnter(newState);
    }

    private onStateEnter(state: PlayerState): void {
        switch (state) {
            case 'idle':
                this.ax = 0;
                break;
            case 'jump':
                this.canDoubleJump = true;
                break;
            case 'wallSlide':
                this.canDoubleJump = true;
                break;
        }
    }

    private onStateExit(state: PlayerState): void {
        // Cleanup for exiting states
    }

    private wantsToJump(): boolean {
        return this.input.jumpJustPressed || this.jumpBufferTimer > 0;
    }

    private doJump(): void {
        this.vy = -JUMP_FORCE;
        this.coyoteTimer = 0;
        this.jumpBufferTimer = 0;

        // Squash on jump startup
        this.targetScaleX = SQUASH.x;
        this.targetScaleY = SQUASH.y;

        // Particles
        this.engine.particles.emitJump(this.x + this.width / 2, this.y + this.height);

        this.enterState('jump');
    }

    private doLand(): void {
        // Screen shake on hard landing
        if (this.vy > 300) {
            this.engine.camera.shake(4, 100);
            this.engine.particles.emitImpact(this.x + this.width / 2, this.y + this.height);
        }

        // Landing squash
        this.targetScaleX = LAND_SQUASH.x;
        this.targetScaleY = LAND_SQUASH.y;

        // Dust on land
        this.engine.particles.emitDust(this.x + this.width / 2, this.y + this.height, 4);

        this.enterState('idle');
    }

    private applyAirControl(): void {
        if (this.input.right) {
            this.ax = ACCELERATION * 0.8;
            this.facingRight = true;
        } else if (this.input.left) {
            this.ax = -ACCELERATION * 0.8;
            this.facingRight = false;
        } else {
            this.ax = 0;
        }
    }

    private applyPhysics(dt: number): void {
        const dtSec = dt / 1000;

        // Apply acceleration to velocity
        this.vx += this.ax * dtSec;

        // Apply friction
        if (this.grounded && this.ax === 0) {
            this.vx *= FRICTION;
        }

        // Clamp horizontal speed
        this.vx = Math.max(-MAX_SPEED, Math.min(MAX_SPEED, this.vx));

        // Apply gravity
        if (!this.grounded) {
            this.vy += GRAVITY * dtSec;
            this.vy = Math.min(this.vy, MAX_FALL_SPEED);
        }

        // Apply velocity to position
        this.x += this.vx * dtSec;
        this.y += this.vy * dtSec;

        // Update timers
        if (this.grounded) {
            this.coyoteTimer = COYOTE_TIME;
        } else {
            this.coyoteTimer -= dt;
        }

        if (this.input.jumpJustPressed) {
            this.jumpBufferTimer = JUMP_BUFFER;
        } else {
            this.jumpBufferTimer -= dt;
        }

        // Reset acceleration (applied each frame)
        this.ax = 0;
    }

    private updateSquashStretch(dt: number): void {
        // Lerp towards target scale
        const lerpSpeed = 0.2;
        this.scaleX += (this.targetScaleX - this.scaleX) * lerpSpeed;
        this.scaleY += (this.targetScaleY - this.scaleY) * lerpSpeed;

        // Return to normal
        this.targetScaleX += (1 - this.targetScaleX) * 0.15;
        this.targetScaleY += (1 - this.targetScaleY) * 0.15;
    }

    /**
     * Get collision box
     */
    getBounds(): { x: number; y: number; width: number; height: number } {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
        };
    }
}
