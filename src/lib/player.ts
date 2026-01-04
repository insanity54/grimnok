import type { Scene } from "phaser";

export function createPlayer(scene: Scene, x: number, y: number) {

    const player = scene.physics.add
        .sprite(100, 100, 'helix')
        .setScale(4)
        .play({ key: 'idle1' });


    return player;
}

