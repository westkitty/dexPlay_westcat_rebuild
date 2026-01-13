import Phaser from 'phaser';
import {
    PLAYER_SPEED,
    PLAYER_DECELERATION,
    JUMP_FORCE,
    JUMP_HOLD_FORCE,
    JUMP_HOLD_DURATION,
    DOUBLE_JUMP_FORCE,
    COYOTE_TIME,
    JUMP_BUFFER_TIME,
    DAMAGE_KNOCKBACK_X,
    DAMAGE_KNOCKBACK_Y,
    INVINCIBILITY_DURATION,
    DAMAGE_FLASH_DURATION,
    WALL_SLIDE_SPEED,
    WALL_JUMP_X,
    WALL_JUMP_Y,
} from '../constants/Physics';
import { audioSynth } from '../utils/AudioSynth';

/**
 * Player Entity
 * 
 * SNES-style platformer player with:
 * - Tight, responsive movement
 * - Variable jump height (hold to jump higher)
 * - Double jump
 * - Wall slide and wall jump
 * - Coyote time and jump buffering (accessibility)
 * - Damage with knockback and invincibility frames
 */
export class Player extends Phaser.Physics.Arcade.Sprite {
    // State
    public health: number = 3;
    public coins: number = 0;

    // Jump state
    private canDoubleJump: boolean = false;
    private isJumping: boolean = false;
    private jumpHoldTime: number = 0;
    private coyoteTimer: number = 0;
    private jumpBufferTimer: number = 0;
    private wasOnGround: boolean = false;

    // Wall state
    private onWall: boolean = false;
    private wallSide: 'left' | 'right' | null = null;

    // Damage state
    private isInvincible: boolean = false;
    private invincibilityTimer: number = 0;
    private flashTimer: number = 0;
    private flashVisible: boolean = true;

    // Facing direction
    private facingRight: boolean = true;

    // Animation state
    public state: 'idle' | 'running' | 'jumping' | 'falling' | 'wallSlide' = 'idle';

    // Input
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private wasd!: {
        W: Phaser.Input.Keyboard.Key;
        A: Phaser.Input.Keyboard.Key;
        S: Phaser.Input.Keyboard.Key;
        D: Phaser.Input.Keyboard.Key;
    };
    private spaceKey!: Phaser.Input.Keyboard.Key;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'player');

        // Add to scene and physics
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Configure physics body
        this.setCollideWorldBounds(true);
        this.setBounce(0);
        this.setDrag(PLAYER_DECELERATION, 0);

        // Set hitbox (slightly smaller than sprite for forgiving collisions)
        this.body!.setSize(24, 28);
        this.body!.setOffset(4, 4);

        // Set up input
        this.cursors = scene.input.keyboard!.createCursorKeys();
        this.wasd = {
            W: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            A: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            S: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            D: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
        };
        this.spaceKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // Set display size
        this.setDisplaySize(32, 32);
    }

    update(time: number, delta: number, autoRun: boolean = false, assistMode: boolean = false): void {
        if (!this.body) return;

        const body = this.body as Phaser.Physics.Arcade.Body;
        const onGround = body.blocked.down || body.touching.down;

        // === Detect wall contact ===
        this.onWall = false;
        this.wallSide = null;
        if (body.blocked.left || body.touching.left) {
            this.onWall = true;
            this.wallSide = 'left';
        } else if (body.blocked.right || body.touching.right) {
            this.onWall = true;
            this.wallSide = 'right';
        }

        // === Handle invincibility flashing ===
        if (this.isInvincible) {
            this.invincibilityTimer -= delta;
            this.flashTimer += delta;

            if (this.flashTimer >= DAMAGE_FLASH_DURATION) {
                this.flashTimer = 0;
                this.flashVisible = !this.flashVisible;
                this.setAlpha(this.flashVisible ? 1 : 0.3);
            }

            if (this.invincibilityTimer <= 0) {
                this.isInvincible = false;
                this.setAlpha(1);
            }
        }

        // === Coyote time (grace period after leaving platform) ===
        if (onGround) {
            this.coyoteTimer = COYOTE_TIME;
            this.canDoubleJump = true;
            this.wasOnGround = true;
        } else {
            if (this.wasOnGround) {
                this.coyoteTimer -= delta;
                if (this.coyoteTimer <= 0) {
                    this.wasOnGround = false;
                }
            }
        }

        // === Wall slide (slow fall when on wall and falling) ===
        if (this.onWall && !onGround && body.velocity.y > 0) {
            body.velocity.y = Math.min(body.velocity.y, WALL_SLIDE_SPEED);
            this.canDoubleJump = true; // Reset double jump on wall
        }

        // === Horizontal movement ===
        const moveLeft = this.cursors.left.isDown || this.wasd.A.isDown;
        const moveRight = this.cursors.right.isDown || this.wasd.D.isDown || autoRun;

        if (moveLeft && !autoRun) {
            this.setVelocityX(-PLAYER_SPEED);
            this.facingRight = false;
            this.setFlipX(true);
        } else if (moveRight) {
            this.setVelocityX(PLAYER_SPEED);
            this.facingRight = true;
            this.setFlipX(false);
        }

        // === Jump input ===
        const jumpPressed = Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
            Phaser.Input.Keyboard.JustDown(this.wasd.W) ||
            Phaser.Input.Keyboard.JustDown(this.spaceKey);

        const jumpHeld = this.cursors.up.isDown || this.wasd.W.isDown || this.spaceKey.isDown;

        // Jump buffering
        if (jumpPressed) {
            this.jumpBufferTimer = JUMP_BUFFER_TIME;
        } else {
            this.jumpBufferTimer -= delta;
        }

        // === Jump execution ===
        const canCoyoteJump = onGround || this.coyoteTimer > 0 || (assistMode && this.wasOnGround);
        const canWallJump = this.onWall && !onGround;
        const wantsToJump = jumpPressed || this.jumpBufferTimer > 0;

        if (wantsToJump) {
            if (canCoyoteJump && !this.isJumping) {
                // Normal jump from ground
                this.setVelocityY(-JUMP_FORCE);
                this.isJumping = true;
                this.jumpHoldTime = 0;
                this.coyoteTimer = 0;
                this.jumpBufferTimer = 0;
                this.wasOnGround = false;
                audioSynth.playJump();
            } else if (canWallJump && jumpPressed) {
                // Wall jump - kick off wall
                this.setVelocityY(-WALL_JUMP_Y);
                this.setVelocityX(this.wallSide === 'left' ? WALL_JUMP_X : -WALL_JUMP_X);
                this.facingRight = this.wallSide === 'left';
                this.setFlipX(!this.facingRight);
                this.onWall = false;
                this.isJumping = true;
                this.jumpHoldTime = 0;
                audioSynth.playJump();
            } else if (this.canDoubleJump && !onGround && !canWallJump && jumpPressed) {
                // Double jump in air
                this.setVelocityY(-DOUBLE_JUMP_FORCE);
                this.canDoubleJump = false;
                this.isJumping = true;
                this.jumpHoldTime = 0;
                audioSynth.playJump();
            }
        }

        // Variable jump height (hold jump for higher)
        if (this.isJumping && jumpHeld && this.jumpHoldTime < JUMP_HOLD_DURATION) {
            this.jumpHoldTime += delta;
            body.velocity.y -= (JUMP_HOLD_FORCE * delta) / 16;
        }

        // Reset jump state when landing
        if (onGround && body.velocity.y >= 0) {
            this.isJumping = false;
            this.jumpHoldTime = 0;
        }

        // === Update animation state ===
        this.updateState(onGround);
    }

    private updateState(onGround: boolean): void {
        const body = this.body as Phaser.Physics.Arcade.Body;

        if (this.onWall && !onGround) {
            this.state = 'wallSlide';
        } else if (!onGround) {
            this.state = body.velocity.y < 0 ? 'jumping' : 'falling';
        } else if (Math.abs(body.velocity.x) > 50) {
            this.state = 'running';
        } else {
            this.state = 'idle';
        }
    }

    takeDamage(): void {
        if (this.isInvincible) return;

        this.health--;
        audioSynth.playHit();

        if (this.health <= 0) {
            this.health = 0;
        }

        // Apply knockback
        const knockbackDir = this.facingRight ? -1 : 1;
        this.setVelocity(DAMAGE_KNOCKBACK_X * knockbackDir, DAMAGE_KNOCKBACK_Y);

        // Start invincibility
        this.isInvincible = true;
        this.invincibilityTimer = INVINCIBILITY_DURATION;
        this.flashTimer = 0;

        // Flash red briefly
        this.setTint(0xf80000);
        this.scene.time.delayedCall(DAMAGE_FLASH_DURATION, () => {
            this.clearTint();
        });
    }

    resetHealth(): void {
        this.health = 3;
        this.isInvincible = false;
        this.setAlpha(1);
        this.clearTint();
    }

    isDead(): boolean {
        return this.health <= 0;
    }
}
