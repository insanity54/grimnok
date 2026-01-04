import CONFIG from "../config";
import { createPlayer } from "$lib/player";

export default class TownSquare extends Phaser.Scene {

    private isChangingScenes: boolean = false;
    private player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody | null = null;

    constructor() {
        super('town-square');
    }

    async create() {
        this.isChangingScenes = false;



        this.add
            .text(10, 10, 'Town Square', {
                fontFamily: 'Arial',
                fontSize: '24px',
            });

        let stairs = this.physics.add.sprite(540, 400, 'tiles')
            .setScale(4)
            .setFrame(0);

        this.player = createPlayer(this, 100, 100)


        // const originCaveBtn = this.add
        //     .rectangle(CONFIG.WIDTH / 2, 100, 250, 70, 0xffca27)
        //     .setInteractive({ useHandCursor: true });

        // const originCaveBtnText = this.add
        //     .text(CONFIG.WIDTH / 2, 100, 'Origin Cave', {
        //         fontFamily: 'Arial',
        //         fontSize: '36px',
        //     })
        //     .setOrigin(0.5);

        // originCaveBtn.on('pointerdown', async () => {
        //     this.scene.start('origin-cave');
        // });

        // originCaveBtn.on('pointerover', () => {
        //     originCaveBtn.setScale(1.1);
        //     originCaveBtnText.setScale(1.1);
        // });

        // originCaveBtn.on('pointerout', () => {
        //     originCaveBtn.setScale(1);
        //     originCaveBtnText.setScale(1);
        // });



    }


    private overlapCallback(
        obj1: Phaser.Physics.Arcade.Body | Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile | Phaser.Physics.Arcade.StaticBody,
        obj2: Phaser.Physics.Arcade.Body | Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile | Phaser.Physics.Arcade.StaticBody
    ): void {
        if (!this.isChangingScenes) {
            console.log('overlap!');
            this.isChangingScenes = true;

            const fx = this.cameras.main.postFX.addWipe();
            this.scene.transition({
                target: 'origin-cave',
                duration: 500,
                onUpdate: (progress: any) => {
                    fx.progress = progress;
                }
            });
        }
    }
}