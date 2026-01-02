import Phaser from "phaser";
import CONFIG from '../config.ts';
import Nakama from '../nakama.ts';
import { generateFramesFromPixeloramaData } from "../phaserDataLoader.ts";

export default class OriginCave extends Phaser.Scene {


  private distanceText: Phaser.GameObjects.Text | null = null;
  private player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody | null = null;
  private target: Phaser.Types.Physics.Arcade.SpriteWithStaticBody | null = null;
  private faraway: Phaser.Math.Vector2 = new Phaser.Math.Vector2(-2000, -2000);
  private isWalking: boolean;

  constructor() {
    super('origin-cave');
    this.isWalking = false;
  }


  preload() {
    this.load.spritesheet('helix', '/assets/helix.png', { frameWidth: 48, frameHeight: 36 });
    this.load.json('helixSpriteData', '/assets/helix.png.json');
    this.load.spritesheet('groundArrows', 'assets/ground_arrows.png', { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet('tiles', 'assets/tiles.png', { frameWidth: 32, frameHeight: 32 });
    this.load.json('tilesData', '/assets/tiles.png.json');
  }

  async create() {
    await Nakama.authenticate();

    this.target = this.physics.add.staticSprite(100, 100, 'groundArrows').setAlpha(0).setScale(2);
    this.target.play({ key: 'activate' });


    // this.source = this.physics.add.image(100, 300, 'groundArrows');
    this.distanceText = this.add.text(10, 10, 'Click to set target', { color: 'lime' });
    this.anims.create({
      key: 'activate',
      frames: this.anims.generateFrameNumbers('groundArrows', { start: 0, end: 19 }),
      repeat: 0,
      frameRate: 32,
    });

    this.add
      .text(CONFIG.WIDTH / 2, 70, 'The adventures of', {
        fontFamily: 'Arial',
        fontSize: '24px',
      })
      .setOrigin(0.5);

    this.add
      .text(CONFIG.WIDTH / 2, 123, 'Grimnâk', {
        fontFamily: 'Arial',
        fontSize: '64px',
      })
      .setOrigin(0.5);

    

    const townSquareBtn = this.add
      .rectangle(CONFIG.WIDTH / 2, 300, 250, 70, 0xffca27)
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




    let helixSpriteData = this.cache.json.get('helixSpriteData');
    let tilesData = this.cache.json.get('tilesData');
    let portal = this.physics.add.sprite(540, 100, 'tiles').setScale(4).setFrame(1);
    let stairs = this.physics.add.sprite(540, 400, 'tiles').setScale(4).setFrame(12);
    
    


    this.anims.create({
      key: 'attack2',
      frames: generateFramesFromPixeloramaData('helix', 'attack2', helixSpriteData),
      repeat: 0,
      frameRate: 8,
    });


    this.anims.create({
      key: 'idle1',
      frames: generateFramesFromPixeloramaData('helix', 'idle1', helixSpriteData),
      frameRate: 8,
      repeat: 2,
    });

    this.anims.create({
      key: 'run',
      frames: generateFramesFromPixeloramaData('helix', 'run', helixSpriteData),
      frameRate: 8,
      repeat: 1,
    });




    this.anims.create({
      key: 'attack1',
      frames: generateFramesFromPixeloramaData('helix', 'attack1', helixSpriteData),
      frameRate: 8,
      repeat: 2
    });

    this.player = this.physics.add.sprite(100, 100, 'helix').setScale(4);


    this.player.play({ key: 'idle1' });



    this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      this.setTarget(pointer.x, pointer.y);
    });




  }

  update(): void {
    if (!this.player) {
      return; // Exit early if either is not defined
    }

    if (!this.target) {
      console.warn('there is no target');
      return;
    }

    if (!this.player.body) {
      console.warn('there is no player body');
      return;
    }

    if (!this.distanceText) {
      console.warn('there is no distanceText');
      return;
    }


    const body = this.player.body as Phaser.Physics.Arcade.Body;


    const halfWidth = body.width / 2;
    const halfHeight = body.height / 2;
    const sourceBodyCenter = new Phaser.Math.Vector2(
      this.player.body.position.x + halfWidth,
      this.player.body.position.y + halfHeight
    );

    // const sourceBodyCenter = new Phaser.Math.Vector2(this.player.body.position.x, this.player.body.position.y);
    if (!sourceBodyCenter) {
      console.warn('there is no sourceBodyCenter');
      return; // Exit if source body center is not available
    }


    const distance = Phaser.Math.Distance.BetweenPoints(sourceBodyCenter, this.target);
    this.distanceText.setText(`Distance: ${distance.toFixed(3)} Speed: ${body.speed.toFixed(3)}`);



    if (body.speed > 0) {
      // Set a maximum velocity toward the target
      this.physics.moveToObject(this.player, this.target, 200);

      const velocity = this.player.body.velocity as Phaser.Math.Vector2;
      // Interpolate velocity toward (0, 0), starting at 10px away
      velocity.lerp(
        Phaser.Math.Vector2.ZERO,
        Phaser.Math.Clamp(1 - distance / 10, 0, 1)
      );
    }


    // face the player sprite left or right based on movement direction

    // Determine direction and flip sprite if necessary
    if (this.isWalking) {
      if (body.velocity.x < 0) {
        // Moving left
        this.player.flipX = true;

      } else if (body.velocity.x > 0) {
        // Moving right
        this.player.flipX = false;
      }

      if (distance < 0.01 && body.speed < 0.1) {
        this.isWalking = false;
        this.player.play({ key: 'idle1', repeat: -1 });
      }
    }

  }


  private onCollision(
    object1: Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody | Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile,
    object2: Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody | Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile,
  ): void {
    console.log("Motherfucker! collision detect.");

    if (!object2) throw new Error('obj2 is undef');
    console.log(object2)
    // return;

    // Type guard to ensure we're working with GameObjects that have bodies
    const player = this.isPlayer(object1) ? object1 : this.isPlayer(object2) ? object2 : null;
    const target = object2 as Phaser.GameObjects.Sprite;

    if (player) {
      // target.position // we want to move the target to like -2000, -2000 somewhere far away
      
      const targetBodyPosition = target.body?.position as Phaser.Math.Vector2;
      targetBodyPosition.copy(this.faraway);
      

      // console.log(object2);
      player.play('idle1', true); // Play idle animation on collision
    }
  }


  private isPlayer(obj: any): obj is Phaser.Types.Physics.Arcade.SpriteWithDynamicBody {
    return obj && obj.body && (obj as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody).play; // Ensure it's a player sprite with a body and play method
  }


  private isSpriteWithBody(obj: any): obj is Phaser.Types.Physics.Arcade.SpriteWithDynamicBody {
    return obj && obj.body; // Check if it has a body, indicating it’s a physics-enabled sprite
  }




  private setTarget(x: number, y: number): void {
    if (!this.target || !this.distanceText || !this.player) return;
    this.target.setPosition(x, y);
    this.target.body.position.set(x, y);
    this.isWalking = true;
    this.player.play({ key: 'run', repeat: -1 });

    this.target.play({ key: 'activate' });
    this.target.setAlpha(1);
    this.distanceText.setText(`Target set: (${x}, ${y})`);
    this.physics.moveToObject(this.player, this.target, 200);
  }



}