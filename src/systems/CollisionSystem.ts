/**
 * Collision System
 * 
 * Handles collision detection and resolution for game entities.
 */

import { Player } from '../game/player/PlayerFSM';
import { checkAABB, resolveCollision, checkSlope } from '../physics/Physics';
import type { LevelData } from '../data/LevelLoader';

export class CollisionSystem {
    handlePlayerCollisions(player: Player, levelData: LevelData): void {
        player.grounded = false;
        player.onLeftWall = false;
        player.onRightWall = false;
        player.isInWater = false;

        const playerBounds = player.getBounds();

        for (const platform of levelData.platforms) {
            if (platform.type === 'ground' || platform.type === 'platform') {
                if (checkAABB(playerBounds, platform)) {
                    const result = resolveCollision(player, platform);
                    if (result.grounded) player.grounded = true;
                    if (result.hitLeft) player.onRightWall = true;
                    if (result.hitRight) player.onLeftWall = true;
                }
            } else if (platform.type.startsWith('slope')) {
                const sType = platform.type as 'slopeLeft' | 'slopeRight';
                const sResult = checkSlope(player, { ...platform, type: sType });
                if (sResult.collided) {
                    player.y += sResult.yOffset;
                    player.vy = 0;
                    player.grounded = true;
                }
            } else if (platform.type === 'water') {
                if (checkAABB(playerBounds, platform)) {
                    player.isInWater = true;
                }
            }
        }
    }
}
