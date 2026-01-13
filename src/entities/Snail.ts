import Phaser from 'phaser';
import { SNAIL_SPEED } from '../constants/Physics';

/**
 * Snail Enemy
 * 
 * Ground-based enemy that patrols horizontally.
 * Can be stomped by player jumping on top.
 */
export class Snail extends Phaser.Physics.Arcade.Sprite {
    private moveDirection: number = 1;
    private patrolDistance: number = 64; // pixels
    private startX: number;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'snail');

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.startX = x;

        // Configure physics
        this.setCollideWorldBounds(true);
        this.setBounce(0);

        // Set hitbox
        this.body!.setSize(14, 12);
        this.body!.setOffset(1, 4);

        // Set display size (16x16)
        this.setDisplaySize(16, 16);

        // Start moving
        this.setVelocityX(SNAIL_SPEED * this.moveDirection);
    }

    update(time: number, delta: number): void {
        if (!this.body) return;

        // Patrol behavior - reverse direction at patrol limits
        if (this.x > this.startX + this.patrolDistance) {
            this.moveDirection = -1;
            this.setFlipX(true);
        } else if (this.x < this.startX - this.patrolDistance) {
            this.moveDirection = 1;
            this.setFlipX(false);
        }

        // Reverse if hitting a wall
        if (this.body.blocked.left || this.body.blocked.right) {
            this.moveDirection *= -1;
            this.setFlipX(this.moveDirection < 0);
        }

        this.setVelocityX(SNAIL_SPEED * this.moveDirection);
    }
}
