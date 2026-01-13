/**
 * Physics Utilities
 * 
 * Collision detection and resolution for the game world.
 */

export interface AABB {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface CollisionResult {
    collided: boolean;
    overlapX: number;
    overlapY: number;
    side: 'top' | 'bottom' | 'left' | 'right' | null;
}

/**
 * Check AABB vs AABB collision
 */
export function checkAABB(a: AABB, b: AABB): boolean {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}

/**
 * Get detailed collision info
 */
export function getCollisionInfo(a: AABB, b: AABB): CollisionResult {
    const overlapX = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x);
    const overlapY = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y);

    if (overlapX <= 0 || overlapY <= 0) {
        return { collided: false, overlapX: 0, overlapY: 0, side: null };
    }

    // Determine collision side based on smallest overlap
    let side: 'top' | 'bottom' | 'left' | 'right';

    if (overlapX < overlapY) {
        // Horizontal collision
        side = (a.x + a.width / 2) < (b.x + b.width / 2) ? 'right' : 'left';
    } else {
        // Vertical collision
        side = (a.y + a.height / 2) < (b.y + b.height / 2) ? 'bottom' : 'top';
    }

    return { collided: true, overlapX, overlapY, side };
}

/**
 * Resolve collision by pushing A out of B
 */
export function resolveCollision(
    a: { x: number; y: number; width: number; height: number; vx: number; vy: number },
    b: AABB
): { grounded: boolean; hitCeiling: boolean; hitLeft: boolean; hitRight: boolean } {
    const result = { grounded: false, hitCeiling: false, hitLeft: false, hitRight: false };

    const collision = getCollisionInfo(a, b);
    if (!collision.collided) return result;

    if (collision.side === 'bottom') {
        // Player landed on top of platform
        a.y = b.y - a.height;
        a.vy = 0;
        result.grounded = true;
    } else if (collision.side === 'top') {
        // Player hit ceiling
        a.y = b.y + b.height;
        a.vy = 0;
        result.hitCeiling = true;
    } else if (collision.side === 'left') {
        // Player hit left side of platform (player on right)
        a.x = b.x + b.width;
        a.vx = 0;
        result.hitLeft = true;
    } else if (collision.side === 'right') {
        // Player hit right side of platform (player on left)
        a.x = b.x - a.width;
        a.vx = 0;
        result.hitRight = true;
    }

    return result;
}

/**
 * Check collision with a 45-degree slope
 */
export function checkSlope(
    player: { x: number; y: number; width: number; height: number; vy: number },
    slope: { x: number; y: number; width: number; height: number; type: 'slopeLeft' | 'slopeRight' }
): { collided: boolean; yOffset: number } {
    if (!checkAABB(player, slope)) return { collided: false, yOffset: 0 };

    const relX = player.x + player.width / 2 - slope.x;
    const progress = clamp(relX / slope.width, 0, 1);

    let targetY: number;
    if (slope.type === 'slopeLeft') {
        // High on left, low on right ( \ )
        targetY = slope.y + progress * slope.height;
    } else {
        // Low on left, high on right ( / )
        targetY = slope.y + (1 - progress) * slope.height;
    }

    const playerBottom = player.y + player.height;
    if (playerBottom >= targetY - 8 && player.vy >= 0) {
        return { collided: true, yOffset: targetY - playerBottom };
    }

    return { collided: false, yOffset: 0 };
}

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

/**
 * Linear interpolation
 */
export function lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
}
