import Phaser from "phaser";
import CONFIG from '../config.ts';
import Nakama from '../nakama.ts';

export default class SettingsMenu extends Phaser.Scene {
  constructor() {
    super('settings-menu');
  }

  async create() {
    await Nakama.authenticate();

    this.add
      .text(CONFIG.WIDTH / 2, 70, 'AAAA', {
        fontFamily: 'Arial',
        fontSize: '24px',
      })
      .setOrigin(0.5);

    this.add
      .text(CONFIG.WIDTH / 2, 123, 'Settings', {
        fontFamily: 'Arial',
        fontSize: '64px',
      })
      .setOrigin(0.5);


    const townSquareBtn = this.add
      .rectangle(CONFIG.WIDTH / 2, 300, 100, 70, 0xffca27)
      .setInteractive({ useHandCursor: true });

    const townSquareBtnText = this.add
      .text(CONFIG.WIDTH / 2, 300, 'Town Square', {
        fontFamily: 'Arial',
        fontSize: '36px',
      })
      .setOrigin(0.5);

    townSquareBtn.on('pointerdown', async () => {
      Nakama.findMatch();
      this.scene.start('town-square');
    });

    townSquareBtn.on('pointerover', () => {
      townSquareBtn.setScale(1.1);
      townSquareBtnText.setScale(1.1);
    });

    townSquareBtn.on('pointerout', () => {
      townSquareBtn.setScale(1);
      townSquareBtnText.setScale(1);
    });


  }
}