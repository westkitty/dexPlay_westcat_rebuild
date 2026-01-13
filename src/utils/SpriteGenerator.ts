import { COWICHAN_CSS } from '../constants/Colors';

/**
 * Enhanced Sprite Generator
 * Creates high-quality pixel art sprites procedurally
 */

export class SpriteGenerator {
    /**
     * Generate enhanced West Cat player sprite
     * 48×48 pixels, 8 frames with smooth animations
     */
    static generatePlayer(scene: Phaser.Scene): void {
        const frameWidth = 48;
        const frameHeight = 48;
        const frames = 8;

        const canvas = scene.textures.createCanvas('player', frameWidth * frames, frameHeight);
        const ctx = canvas!.context;

        for (let i = 0; i < frames; i++) {
            const x = i * frameWidth;

            // Determine animation frame type
            const isIdle = i < 2;
            const isRunning = i >= 2 && i < 6;
            const isJumping = i === 6;
            const isWallSlide = i === 7;

            // Body position varies by animation
            const bodyBounce = isRunning ? Math.sin(i * Math.PI) * 2 : 0;

            // === Draw Cat Body ===
            ctx.fillStyle = COWICHAN_CSS.CAT_ORANGE;

            // Main body (rounded rectangle)
            this.roundRect(ctx, x + 12, 18 + bodyBounce, 24, 18, 4);

            // Head
            this.roundRect(ctx, x + 14, 8 + bodyBounce, 20, 16, 6);

            // Ears (triangular)
            ctx.fillStyle = COWICHAN_CSS.CAT_DARK;
            ctx.beginPath();
            ctx.moveTo(x + 16, 8 + bodyBounce);
            ctx.lineTo(x + 14, 4 + bodyBounce);
            ctx.lineTo(x + 20, 8 + bodyBounce);
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(x + 28, 8 + bodyBounce);
            ctx.lineTo(x + 34, 4 + bodyBounce);
            ctx.lineTo(x + 30, 8 + bodyBounce);
            ctx.fill();

            // Inner ear pink
            ctx.fillStyle = '#FFB6C1';
            ctx.fillRect(x + 17, 6 + bodyBounce, 2, 2);
            ctx.fillRect(x + 29, 6 + bodyBounce, 2, 2);

            // Eyes (green, expressive)
            ctx.fillStyle = COWICHAN_CSS.CAT_EYE_GREEN;
            if (isWallSlide) {
                // Worried eyes
                ctx.fillRect(x + 18, 14 + bodyBounce, 3, 4);
                ctx.fillRect(x + 27, 14 + bodyBounce, 3, 4);
            } else {
                // Normal eyes
                ctx.fillRect(x + 18, 14 + bodyBounce, 4, 4);
                ctx.fillRect(x + 26, 14 + bodyBounce, 4, 4);
            }

            // Eye shine
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(x + 19, 15 + bodyBounce, 1, 1);
            ctx.fillRect(x + 27, 15 + bodyBounce, 1, 1);

            // Nose
            ctx.fillStyle = '#FF69B4';
            ctx.fillRect(x + 23, 20 + bodyBounce, 2, 2);

            // Whiskers
            ctx.fillStyle = COWICHAN_CSS.CAT_DARK;
            ctx.fillRect(x + 10, 19 + bodyBounce, 4, 1);
            ctx.fillRect(x + 10, 21 + bodyBounce, 4, 1);
            ctx.fillRect(x + 34, 19 + bodyBounce, 4, 1);
            ctx.fillRect(x + 34, 21 + bodyBounce, 4, 1);

            // Stripes (tabby pattern)
            ctx.fillStyle = COWICHAN_CSS.CAT_DARK;
            ctx.fillRect(x + 16, 10 + bodyBounce, 1, 3);
            ctx.fillRect(x + 20, 10 + bodyBounce, 1, 3);
            ctx.fillRect(x + 28, 10 + bodyBounce, 1, 3);
            ctx.fillRect(x + 32, 10 + bodyBounce, 1, 3);

            // Body stripes
            ctx.fillRect(x + 16, 22 + bodyBounce, 16, 1);
            ctx.fillRect(x + 18, 26 + bodyBounce, 12, 1);
            ctx.fillRect(x + 20, 30 + bodyBounce, 8, 1);

            // === Legs (animated) ===
            ctx.fillStyle = COWICHAN_CSS.CAT_ORANGE;

            if (isRunning) {
                // Running animation - alternating legs
                const phase = i % 2;
                const frontLegY = phase === 0 ? 0 : 2;
                const backLegY = phase === 0 ? 2 : 0;

                // Front leg
                this.roundRect(ctx, x + 26, 34 + frontLegY + bodyBounce, 5, 10, 2);
                // Back leg
                this.roundRect(ctx, x + 17, 34 + backLegY + bodyBounce, 5, 10, 2);

                // Paws
                ctx.fillStyle = COWICHAN_CSS.CAT_LIGHT;
                ctx.fillRect(x + 26, 42 + frontLegY + bodyBounce, 5, 2);
                ctx.fillRect(x + 17, 42 + backLegY + bodyBounce, 5, 2);
            } else if (isJumping) {
                // Jumping - legs tucked
                this.roundRect(ctx, x + 18, 36, 5, 6, 2);
                this.roundRect(ctx, x + 25, 36, 5, 6, 2);
            } else if (isWallSlide) {
                // Wall slide - legs extended
                this.roundRect(ctx, x + 18, 32, 4, 12, 2);
                this.roundRect(ctx, x + 26, 32, 4, 12, 2);
            } else {
                // Idle - standing
                this.roundRect(ctx, x + 18, 34 + bodyBounce, 5, 10, 2);
                this.roundRect(ctx, x + 25, 34 + bodyBounce, 5, 10, 2);

                ctx.fillStyle = COWICHAN_CSS.CAT_LIGHT;
                ctx.fillRect(x + 18, 42 + bodyBounce, 5, 2);
                ctx.fillRect(x + 25, 42 + bodyBounce, 5, 2);
            }

            // === Tail ===
            ctx.fillStyle = COWICHAN_CSS.CAT_ORANGE;
            if (isRunning) {
                const tailSwish = Math.sin(i * Math.PI / 2) * 3;
                this.drawCurvedTail(ctx, x + 10, 24 + bodyBounce, tailSwish);
            } else if (isJumping || isWallSlide) {
                this.drawCurvedTail(ctx, x + 10, 24, -4);
            } else {
                this.drawCurvedTail(ctx, x + 10, 26 + bodyBounce, 0);
            }

            // Tail stripes
            ctx.fillStyle = COWICHAN_CSS.CAT_DARK;
            ctx.fillRect(x + 8, 26 + bodyBounce, 2, 1);
            ctx.fillRect(x + 6, 28 + bodyBounce, 2, 1);
        }

        canvas!.refresh();
    }

    /**
     * Generate enhanced tileset with Duncan BC themes
     */
    static generateTileset(scene: Phaser.Scene): void {
        const tileSize = 32;
        const canvas = scene.textures.createCanvas('tileset', tileSize * 5, tileSize);
        const ctx = canvas!.context;

        // Tile 0: Wet Asphalt (Duncan pavement)
        ctx.fillStyle = COWICHAN_CSS.WET_ASPHALT;
        ctx.fillRect(0, 0, tileSize, tileSize);
        // Pavement cracks
        ctx.fillStyle = '#3A3E42';
        ctx.fillRect(8, 0, 1, tileSize);
        ctx.fillRect(20, 0, 1, tileSize);
        ctx.fillRect(0, 12, tileSize, 1);

        // Tile 1: Cedar platform
        ctx.fillStyle = COWICHAN_CSS.CEDAR_RED;
        ctx.fillRect(tileSize, 0, tileSize, tileSize);
        // Wood grain
        ctx.fillStyle = '#6B3500';
        for (let i = 0; i < 8; i++) {
            ctx.fillRect(tileSize + i * 4, 0, 2, tileSize);
        }
        // Kinsol Trestle X-bracing
        ctx.strokeStyle = '#5A2D00';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(tileSize, 0);
        ctx.lineTo(tileSize + tileSize, tileSize);
        ctx.moveTo(tileSize + tileSize, 0);
        ctx.lineTo(tileSize, tileSize);
        ctx.stroke();

        // Tile 2: Grass (Salal green)
        ctx.fillStyle = COWICHAN_CSS.SALAL_GREEN;
        this.roundRect(ctx, tileSize * 2, 0, tileSize, tileSize, 4);
        // Grass blades
        ctx.fillStyle = COWICHAN_CSS.GRASS_GREEN;
        for (let i = 0; i < 6; i++) {
            ctx.fillRect(tileSize * 2 + 2 + i * 5, 2, 2, 6);
            ctx.fillRect(tileSize * 2 + 3 + i * 5, 8, 1, 4);
        }

        // Tile 3: Concrete with yellow footprints
        ctx.fillStyle = COWICHAN_CSS.WET_ASPHALT;
        ctx.fillRect(tileSize * 3, 0, tileSize, tileSize);
        // Yellow footprint (Duncan signature)
        ctx.fillStyle = COWICHAN_CSS.YELLOW_FOOTPRINT;
        // Left foot
        ctx.fillRect(tileSize * 3 + 8, 10, 6, 8);
        ctx.fillRect(tileSize * 3 + 7, 7, 2, 3);
        ctx.fillRect(tileSize * 3 + 9, 6, 2, 3);
        ctx.fillRect(tileSize * 3 + 11, 7, 2, 3);

        // Tile 4: River stone (Cowichan River)
        ctx.fillStyle = COWICHAN_CSS.RIVER_TEAL;
        ctx.fillRect(tileSize * 4, 0, tileSize, tileSize);
        // Stones
        ctx.fillStyle = '#1F4E48';
        this.roundRect(ctx, tileSize * 4 + 4, 4, 10, 10, 4);
        this.roundRect(ctx, tileSize * 4 + 16, 14, 8, 8, 3);
        this.roundRect(ctx, tileSize * 4 + 8, 20, 12, 8, 4);

        canvas!.refresh();
    }

    /**
     * Generate Duncan wildlife enemies
     */
    static generateEnemies(scene: Phaser.Scene): void {
        // Raccoon (Duncan trash panda)
        const raccoonCanvas = scene.textures.createCanvas('raccoon', 64, 32);
        const raccoonCtx = raccoonCanvas!.context;

        for (let frame = 0; frame < 2; frame++) {
            const x = frame * 32;

            // Body
            raccoonCtx.fillStyle = COWICHAN_CSS.RACCOON_GRAY;
            this.roundRect(raccoonCtx, x + 8, 12, 16, 12, 4);

            // Head
            this.roundRect(raccoonCtx, x + 10, 6, 12, 10, 4);

            // Ears
            raccoonCtx.fillStyle = COWICHAN_CSS.RACCOON_BLACK;
            this.roundRect(raccoonCtx, x + 10, 4, 4, 4, 2);
            this.roundRect(raccoonCtx, x + 18, 4, 4, 4, 2);

            // Eye mask (distinctive raccoon feature)
            raccoonCtx.fillStyle = COWICHAN_CSS.RACCOON_BLACK;
            this.roundRect(raccoonCtx, x + 11, 10, 10, 4, 2);

            // Eyes
            raccoonCtx.fillStyle = '#FFFFFF';
            raccoonCtx.fillRect(x + 13, 11, 2, 2);
            raccoonCtx.fillRect(x + 17, 11, 2, 2);

            // Nose
            raccoonCtx.fillStyle = COWICHAN_CSS.RACCOON_BLACK;
            raccoonCtx.fillRect(x + 15, 14, 2, 2);

            // Striped tail
            raccoonCtx.fillStyle = COWICHAN_CSS.RACCOON_GRAY;
            for (let i = 0; i < 3; i++) {
                const stripe = i % 2 === 0;
                raccoonCtx.fillStyle = stripe ? COWICHAN_CSS.RACCOON_GRAY : COWICHAN_CSS.RACCOON_BLACK;
                raccoonCtx.fillRect(x + 2 + i * 2, 16, 2, 6);
            }

            // Legs (animated)
            const legOffset = frame === 0 ? 0 : 2;
            raccoonCtx.fillStyle = COWICHAN_CSS.RACCOON_GRAY;
            raccoonCtx.fillRect(x + 10 - legOffset, 22, 3, 6);
            raccoonCtx.fillRect(x + 18 + legOffset, 22, 3, 6);
        }
        raccoonCanvas!.refresh();

        // Seagull (coastal bird)
        const seagullCanvas = scene.textures.createCanvas('seagull', 64, 32);
        const seagullCtx = seagullCanvas!.context;

        for (let frame = 0; frame < 2; frame++) {
            const x = frame * 32;
            const wingFlap = frame === 0 ? -2 : 2;

            // Body
            seagullCtx.fillStyle = COWICHAN_CSS.SEAGULL_WHITE;
            this.roundRect(seagullCtx, x + 12, 14, 8, 8, 3);

            // Head
            this.roundRect(seagullCtx, x + 13, 9, 6, 6, 2);

            // Beak
            seagullCtx.fillStyle = '#FFA500';
            seagullCtx.fillRect(x + 19, 12, 3, 2);

            // Eye
            seagullCtx.fillStyle = '#000000';
            seagullCtx.fillRect(x + 15, 11, 2, 2);

            // Wings
            seagullCtx.fillStyle = COWICHAN_CSS.SEAGULL_GRAY;
            this.roundRect(seagullCtx, x + 6, 16 + wingFlap, 6, 4, 2);
            this.roundRect(seagullCtx, x + 20, 16 + wingFlap, 6, 4, 2);
        }
        seagullCanvas!.refresh();

        // Regular coin with sparkle
        const coinCanvas = scene.textures.createCanvas('coin', 64, 16);
        const coinCtx = coinCanvas!.context;

        for (let i = 0; i < 4; i++) {
            const x = i * 16;
            const width = [12, 8, 4, 8][i];
            const xOffset = (16 - width) / 2;

            // Gold coin
            coinCtx.fillStyle = COWICHAN_CSS.YELLOW_FOOTPRINT;
            this.roundRect(coinCtx, x + xOffset, 2, width, 12, width / 2);

            // Shine
            coinCtx.fillStyle = '#FFFFCC';
            if (width > 4) {
                coinCtx.fillRect(x + xOffset + 2, 4, width - 4, 2);
            }
        }
        coinCanvas!.refresh();
    }

    // Helper: draw rounded rectangle
    private static roundRect(
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

    // Helper: draw curved tail
    private static drawCurvedTail(
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        curve: number
    ): void {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.quadraticCurveTo(x - 4 + curve, y + 4, x - 6 + curve, y + 8);
        ctx.lineWidth = 4;
        ctx.strokeStyle = COWICHAN_CSS.CAT_ORANGE;
        ctx.stroke();
        ctx.lineWidth = 1;
    }
}
