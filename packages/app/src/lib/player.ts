import type { Scene } from "phaser";


/**
 * 
 * @deprecated  use game-object/player instead
 */
export function spawnPlayer(scene: Scene, x: number = 0, y: number = 0, scaleFactor: number = 1) {

    const player = scene.physics.add
        .sprite(x, y, 'helix')
        .setName('player')
        .setScale(scaleFactor)
        .setDepth(100)
        .play({ key: 'idle1' });

    return player;
}

