import Phaser from 'phaser';
import { BAT_SPEED, BAT_AMPLITUDE } from '../constants/Physics';

/**
 * Bat Enemy
 * 
 * Flying enemy that moves in a sine-wave pattern.
 * Can be stomped by player jumping on top.
 */
export class Bat extends Phaser.Physics.Arcade.Sprite {
    private moveDirection: number = 1;
    private floatTime: number = 0;
    private patrolDistance: number = 80;
    private startX: number;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'bat');

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.startX = x;

        // Configure physics - no gravity for flying
        (this.body as Phaser.Physics.Arcade.Body).allowGravity = false;
        this.setCollideWorldBounds(true);

        // Set hitbox
        this.body!.setSize(14, 10);
        this.body!.setOffset(1, 3);

        // Set display size
        this.setDisplaySize(16, 16);

        // Random starting direction
        this.moveDirection = Math.random() > 0.5 ? 1 : -1;
    }

    update(time: number, delta: number): void {
        if (!this.body) return;

        // Update float time for sine wave
        this.floatTime += delta * 0.003;

        // Horizontal patrol
        if (this.x > this.startX + this.patrolDistance) {
            this.moveDirection = -1;
            this.setFlipX(true);
        } else if (this.x < this.startX - this.patrolDistance) {
            this.moveDirection = 1;
            this.setFlipX(false);
        }

        // Set velocity with sine wave for Y movement
        this.setVelocityX(BAT_SPEED * this.moveDirection);
        this.setVelocityY(Math.sin(this.floatTime) * BAT_AMPLITUDE * 3);

        // Simple wing flap animation (scale pulsing)
        const wingPhase = Math.sin(this.floatTime * 4);
        this.setScale(1, 0.8 + wingPhase * 0.2);
    }
}
