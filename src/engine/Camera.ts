/**
 * Camera System
 * 
 * Smooth follow with lerp, look-ahead, and screen shake.
 * This camera is NOT locked to the player.
 */

export class Camera {
    // Position (world space)
    public x: number = 0;
    public y: number = 0;

    // Target position
    private targetX: number = 0;
    private targetY: number = 0;

    // Viewport dimensions
    private width: number;
    private height: number;

    // Lerp settings
    private lagFactor: number = 0.08; // Lower = smoother/laggier
    private lookAheadDistance: number = 100;
    private lookAheadSmooth: number = 0.05;
    private currentLookAhead: number = 0;

    // Shake settings
    private shakeMagnitude: number = 0;
    private shakeTimer: number = 0;
    private shakeOffsetX: number = 0;
    private shakeOffsetY: number = 0;

    // Peeking settings
    private peekY: number = 0;
    private peekTarget: number = 0;
    private peekTimer: number = 0;
    private readonly PEEK_THRESHOLD: number = 500; // ms
    private readonly PEEK_DISTANCE: number = 150;

    // Bounds (optional level bounds)
    private boundsEnabled: boolean = false;
    private minX: number = 0;
    private minY: number = 0;
    private maxX: number = Infinity;
    private maxY: number = Infinity;

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
    }

    /**
     * Set the target to follow
     */
    follow(x: number, y: number, velocityX: number = 0): void {
        // Calculate look-ahead based on velocity direction
        let targetLookAhead = 0;
        if (velocityX > 10) {
            targetLookAhead = this.lookAheadDistance;
        } else if (velocityX < -10) {
            targetLookAhead = -this.lookAheadDistance;
        }

        // Smooth look-ahead transition
        this.currentLookAhead += (targetLookAhead - this.currentLookAhead) * this.lookAheadSmooth;

        // Set target (centered on player with look-ahead and peek)
        this.targetX = x + this.currentLookAhead - this.width / 2;
        this.targetY = y + this.peekY - this.height / 2;
    }

    /**
     * Handle vertical peeking logic (look up/down)
     */
    updatePeeking(dt: number, upHeld: boolean, downHeld: boolean): void {
        if (upHeld) {
            this.peekTimer += dt;
            if (this.peekTimer > this.PEEK_THRESHOLD) this.peekTarget = -this.PEEK_DISTANCE;
        } else if (downHeld) {
            this.peekTimer += dt;
            if (this.peekTimer > this.PEEK_THRESHOLD) this.peekTarget = this.PEEK_DISTANCE;
        } else {
            this.peekTimer = 0;
            this.peekTarget = 0;
        }

        // Smoothly lerp peek offset
        this.peekY += (this.peekTarget - this.peekY) * 0.1;
    }

    /**
     * Trigger screen shake
     */
    shake(magnitude: number, duration: number): void {
        this.shakeMagnitude = magnitude;
        this.shakeTimer = duration;
    }

    /**
     * Set camera bounds (for level limits)
     */
    setBounds(minX: number, minY: number, maxX: number, maxY: number): void {
        this.boundsEnabled = true;
        this.minX = minX;
        this.minY = minY;
        this.maxX = maxX - this.width;
        this.maxY = maxY - this.height;
    }

    /**
     * Update camera position with lerp
     */
    update(dt: number): void {
        // Lerp towards target (smooth follow)
        this.x += (this.targetX - this.x) * this.lagFactor;
        this.y += (this.targetY - this.y) * this.lagFactor;

        // Apply bounds
        if (this.boundsEnabled) {
            this.x = Math.max(this.minX, Math.min(this.x, this.maxX));
            this.y = Math.max(this.minY, Math.min(this.y, this.maxY));
        }

        // Update shake
        if (this.shakeTimer > 0) {
            this.shakeTimer -= dt;

            // Random shake offset (decreasing over time)
            const intensity = this.shakeTimer > 0 ? this.shakeMagnitude : 0;
            this.shakeOffsetX = (Math.random() - 0.5) * 2 * intensity;
            this.shakeOffsetY = (Math.random() - 0.5) * 2 * intensity;
        } else {
            this.shakeOffsetX = 0;
            this.shakeOffsetY = 0;
        }
    }

    /**
     * Apply camera transform to canvas context
     */
    applyTransform(ctx: CanvasRenderingContext2D): void {
        // Translate to camera position (negative to move world opposite to camera)
        ctx.translate(
            -Math.round(this.x + this.shakeOffsetX),
            -Math.round(this.y + this.shakeOffsetY)
        );
    }

    /**
     * Convert screen coordinates to world coordinates
     */
    screenToWorld(screenX: number, screenY: number): { x: number; y: number } {
        return {
            x: screenX + this.x,
            y: screenY + this.y,
        };
    }

    /**
     * Convert world coordinates to screen coordinates
     */
    worldToScreen(worldX: number, worldY: number): { x: number; y: number } {
        return {
            x: worldX - this.x,
            y: worldY - this.y,
        };
    }

    /**
     * Check if a rectangle is visible on screen
     */
    isVisible(x: number, y: number, width: number, height: number): boolean {
        return (
            x + width > this.x &&
            x < this.x + this.width &&
            y + height > this.y &&
            y < this.y + this.height
        );
    }

    /**
     * Snap camera immediately to target (no lerp)
     */
    snapTo(x: number, y: number): void {
        this.x = x - this.width / 2;
        this.y = y - this.height / 2;
        this.targetX = this.x;
        this.targetY = this.y;
    }
}
