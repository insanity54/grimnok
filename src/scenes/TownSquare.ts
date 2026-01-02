import CONFIG from "../config";

export default class TownSquare extends Phaser.Scene {
    constructor() {
        super('town-square');
    }

    async create() {

        this.add
            .text(CONFIG.WIDTH / 2, 70, 'Town Square', {
                fontFamily: 'Arial',
                fontSize: '24px',
            })
            .setOrigin(0.5);



        const originCaveBtn = this.add
            .rectangle(CONFIG.WIDTH / 2, 300, 250, 70, 0xffca27)
            .setInteractive({ useHandCursor: true });

        const originCaveBtnText = this.add
            .text(CONFIG.WIDTH / 2, 300, 'Origin Cave', {
                fontFamily: 'Arial',
                fontSize: '36px',
            })
            .setOrigin(0.5);

        originCaveBtn.on('pointerdown', async () => {
            this.scene.start('origin-cave');
        });

        originCaveBtn.on('pointerover', () => {
            originCaveBtn.setScale(1.1);
            originCaveBtnText.setScale(1.1);
        });

        originCaveBtn.on('pointerout', () => {
            originCaveBtn.setScale(1);
            originCaveBtnText.setScale(1);
        });
    }
}