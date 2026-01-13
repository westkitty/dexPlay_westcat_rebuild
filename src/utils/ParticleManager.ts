import Phaser from 'phaser';

/**
 * Particle Manager
 * Handles visual effects like coin sparkles, dust, and jump trails
 */
export class ParticleManager {
    private scene: Phaser.Scene;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    /**
     * Coin collect sparkle effect
     */
    coinCollect(x: number, y: number): void {
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 * i) / 8;
            const speed = 50 + Math.random() * 30;

            const particle = this.scene.add.rectangle(x, y, 3, 3, 0xFFD700);
            particle.setDepth(100);

            this.scene.tweens.add({
                targets: particle,
                x: x + Math.cos(angle) * speed,
                y: y + Math.sin(angle) * speed,
                alpha: 0,
                scale: 0,
                duration: 400,
                ease: 'Cubic.easeOut',
                onComplete: () => particle.destroy(),
            });
        }
    }

    /**
     * Landing dust puff
     */
    landingDust(x: number, y: number): void {
        for (let i = 0; i < 5; i++) {
            const offsetX = (Math.random() - 0.5) * 20;
            const particle = this.scene.add.rectangle(x + offsetX, y, 4, 4, 0x8B7355, 0.6);
            particle.setDepth(1);

            this.scene.tweens.add({
                targets: particle,
                y: y + 10,
                alpha: 0,
                scale: 1.5,
                duration: 300,
                ease: 'Quad.easeOut',
                onComplete: () => particle.destroy(),
            });
        }
    }

    /**
     * Jump trail particles
     */
    jumpTrail(x: number, y: number): void {
        const particle = this.scene.add.rectangle(x, y, 6, 6, 0xFFFFFF, 0.4);
        particle.setDepth(0);

        this.scene.tweens.add({
            targets: particle,
            alpha: 0,
            scale: 0.5,
            duration: 200,
            onComplete: () => particle.destroy(),
        });
    }

    /**
     * Enemy defeat poof
     */
    enemyDefeat(x: number, y: number): void {
        const colors = [0xFFFFFF, 0xCCCCCC, 0x999999];

        for (let i = 0; i < 12; i++) {
            const angle = (Math.PI * 2 * i) / 12;
            const speed = 40 + Math.random() * 40;
            const color = colors[Math.floor(Math.random() * colors.length)];

            const particle = this.scene.add.rectangle(x, y, 5, 5, color);
            particle.setDepth(50);

            this.scene.tweens.add({
                targets: particle,
                x: x + Math.cos(angle) * speed,
                y: y + Math.sin(angle) * speed - 20,
                alpha: 0,
                rotation: Math.random() * Math.PI * 2,
                duration: 500,
                ease: 'Cubic.easeOut',
                onComplete: () => particle.destroy(),
            });
        }
    }

    /**
     * Wall slide sparks
     */
    wallSlideSparks(x: number, y: number, facingRight: boolean): void {
        const offsetX = facingRight ? 15 : -15;
        const particle = this.scene.add.rectangle(x + offsetX, y, 3, 6, 0xFFAA00, 0.8);
        particle.setDepth(2);

        this.scene.tweens.add({
            targets: particle,
            y: y + 20,
            alpha: 0,
            duration: 300,
            ease: 'Linear',
            onComplete: () => particle.destroy(),
        });
    }
}
