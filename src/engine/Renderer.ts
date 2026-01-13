/**
 * Renderer
 * 
 * Canvas rendering utilities with depth sorting and camera integration.
 */

import { Camera } from './Camera';

export class Renderer {
    private ctx: CanvasRenderingContext2D;
    private camera: Camera;

    constructor(ctx: CanvasRenderingContext2D, camera: Camera) {
        this.ctx = ctx;
        this.camera = camera;
    }

    /**
     * Clear the screen with a color
     */
    clear(color: string = '#000000'): void {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }

    /**
     * Draw a gradient sky
     */
    drawSky(topColor: string, bottomColor: string): void {
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.ctx.canvas.height);
        gradient.addColorStop(0, topColor);
        gradient.addColorStop(1, bottomColor);

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }

    /**
     * Draw a sepia/warm overlay for atmosphere
     */
    drawAtmosphereOverlay(color: string = 'rgba(255, 230, 200, 0.15)'): void {
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'multiply';
        this.ctx.fillStyle = color;
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.restore();
    }

    /**
     * Draw a sprite with squash & stretch
     */
    drawSprite(
        image: HTMLImageElement | HTMLCanvasElement,
        x: number,
        y: number,
        width: number,
        height: number,
        scaleX: number = 1,
        scaleY: number = 1,
        flipX: boolean = false
    ): void {
        this.ctx.save();

        // Translate to center for scaling
        this.ctx.translate(x + width / 2, y + height);

        // Apply flip
        if (flipX) {
            this.ctx.scale(-1, 1);
        }

        // Apply squash & stretch (pivot at bottom center)
        this.ctx.scale(scaleX, scaleY);

        // Draw image centered
        this.ctx.drawImage(
            image,
            -width / 2,
            -height,
            width,
            height
        );

        this.ctx.restore();
    }

    /**
     * Draw text with outline
     */
    drawText(
        text: string,
        x: number,
        y: number,
        options: {
            font?: string;
            color?: string;
            outline?: string;
            outlineWidth?: number;
            align?: CanvasTextAlign;
            baseline?: CanvasTextBaseline;
        } = {}
    ): void {
        const {
            font = '16px monospace',
            color = '#FFFFFF',
            outline = '#000000',
            outlineWidth = 2,
            align = 'left',
            baseline = 'top',
        } = options;

        this.ctx.font = font;
        this.ctx.textAlign = align;
        this.ctx.textBaseline = baseline;

        // Draw outline
        if (outlineWidth > 0) {
            this.ctx.strokeStyle = outline;
            this.ctx.lineWidth = outlineWidth;
            this.ctx.strokeText(text, x, y);
        }

        // Draw fill
        this.ctx.fillStyle = color;
        this.ctx.fillText(text, x, y);
    }

    /**
     * Draw a parallax layer (repeating)
     */
    drawParallaxLayer(
        image: HTMLImageElement | HTMLCanvasElement,
        scrollFactor: number,
        yOffset: number = 0
    ): void {
        const cameraX = this.camera.x * scrollFactor;
        const width = image.width;
        const height = image.height;

        // Calculate start position (repeating)
        const startX = -(cameraX % width);

        // Draw enough tiles to cover screen
        for (let x = startX - width; x < this.ctx.canvas.width + width; x += width) {
            this.ctx.drawImage(image, x, yOffset);
        }
    }

    /**
     * Draw a rectangle
     */
    drawRect(
        x: number,
        y: number,
        width: number,
        height: number,
        color: string
    ): void {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, width, height);
    }

    /**
     * Draw a circle
     */
    drawCircle(x: number, y: number, radius: number, color: string): void {
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fillStyle = color;
        this.ctx.fill();
    }
}
