import Phaser from 'phaser';
import { COWICHAN_PALETTE } from '../constants/Colors';

/**
 * Totem Pole Decoration
 * Represents Duncan BC's "City of Totems" heritage
 */
export class TotemPole extends Phaser.GameObjects.Container {
    constructor(scene: Phaser.Scene, x: number, y: number, height: number = 128) {
        super(scene, x, y);

        // Create totem pole sprite
        const canvas = scene.textures.createCanvas(`totem_${x}_${y}`, 32, height);
        const ctx = canvas!.context;

        // Base pole
        ctx.fillStyle = '#8B4513'; // Cedar brown
        ctx.fillRect(12, 0, 8, height);

        // Wood grain
        ctx.fillStyle = '#6B3500';
        for (let i = 0; i < height; i += 4) {
            ctx.fillRect(12, i, 8, 1);
        }

        // Traditional Northwest Coast design elements
        const sections = Math.floor(height / 40);

        for (let i = 0; i < sections; i++) {
            const sectionY = i * 40 + 5;

            // Face section
            ctx.fillStyle = '#C41E3A'; // Totem red
            this.roundRect(ctx, 8, sectionY, 16, 30, 4);

            // White/cream details
            ctx.fillStyle = '#F0E6D2';
            // Eyes
            ctx.fillRect(10, sectionY + 8, 4, 6);
            ctx.fillRect(18, sectionY + 8, 4, 6);

            // Black pupils
            ctx.fillStyle = '#1C1C1C';
            ctx.fillRect(11, sectionY + 10, 2, 3);
            ctx.fillRect(19, sectionY + 10, 2, 3);

            // Mouth/beak
            ctx.fillStyle = '#F0E6D2';
            this.roundRect(ctx, 14, sectionY + 18, 4, 8, 2);

            // Turquoise accents
            ctx.fillStyle = '#40E0D0';
            ctx.fillRect(9, sectionY + 4, 14, 2);
            ctx.fillRect(9, sectionY + 28, 14, 2);

            // Wing/arm design
            ctx.fillStyle = '#1C1C1C';
            ctx.fillRect(6, sectionY + 14, 3, 8);
            ctx.fillRect(23, sectionY + 14, 3, 8);
        }

        canvas!.refresh();

        // Add sprite to container
        const sprite = scene.add.sprite(0, 0, `totem_${x}_${y}`);
        sprite.setOrigin(0.5, 1);
        this.add(sprite);

        // Add to scene
        scene.add.existing(this);
        this.setDepth(-2); // Behind gameplay elements
    }

    private roundRect(
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        width: number,
        height: number,
        radius: number
    ): void {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        ctx.fill();
    }
}

/**
 * World's Largest Hockey Stick
 * Background decoration representing Duncan's famous landmark
 */
export class HockeyStick extends Phaser.GameObjects.Container {
    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y);

        const canvas = scene.textures.createCanvas(`hockey_stick_${x}`, 60, 200);
        const ctx = canvas!.context;

        // Stick handle (brown wood)
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(24, 0, 12, 160);

        // Wood grain
        ctx.fillStyle = '#6B3500';
        for (let i = 0; i < 160; i += 8) {
            ctx.fillRect(24, i, 12, 2);
        }

        // Blade (black)
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 160, 50, 40);

        // Blade detail
        ctx.fillStyle = '#1C1C1C';
        ctx.fillRect(5, 165, 40, 5);
        ctx.fillRect(5, 190, 40, 5);

        // Grip tape
        ctx.fillStyle = '#333333';
        ctx.fillRect(22, 30, 16, 40);

        canvas!.refresh();

        const sprite = scene.add.sprite(0, 0, `hockey_stick_${x}`);
        sprite.setOrigin(0.5, 0);
        sprite.setAlpha(0.3); // Semi-transparent background element
        this.add(sprite);

        scene.add.existing(this);
        this.setDepth(-3); // Far in background
    }
}
