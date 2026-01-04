import Phaser from "phaser";
import CONFIG from '../config.ts';
import Nakama from '../nakama.ts';
import { generateFramesFromPixeloramaData } from "../phaserDataLoader.ts";
import { createPlayer } from "$lib/player";
import { getRandomElement } from "$lib/random";

interface MapThing {
  groundLayer: Phaser.Tilemaps.TilemapLayer | null,
  itemsLayer: Phaser.Tilemaps.ObjectLayer | null,
  poiLayer: Phaser.Tilemaps.TilemapLayer | null,
  portalsLayer: Phaser.Tilemaps.ObjectLayer | null
}

type WorldTileMap = {
  fileName: string;
  height: number;
  width: number;
  x: number;
  y: number;
};

type WorldConfiguration = {
  maps: WorldTileMap[];
  onlyShowAdjacentMaps: boolean;
  type: string;
};




const playerSpeed = 250;
const tileSize = 32;
const scaleFactor = 4;
const halfTileSize = (tileSize * scaleFactor) / 2;

export default class World extends Phaser.Scene {


  private distanceText: Phaser.GameObjects.Text | null = null;
  private player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody | null = null;
  private target: Phaser.Types.Physics.Arcade.SpriteWithStaticBody | null = null;
  private faraway: Phaser.Math.Vector2 = new Phaser.Math.Vector2(-2000, -2000);
  private isWalking: boolean;
  private isChangingScenes: boolean = false;
  private portals: Phaser.Types.Physics.Arcade.SpriteWithStaticBody[] = [];
  private map: Phaser.Tilemaps.Tilemap | null = null;


  constructor() {
    super('world');
    this.isWalking = false;
  }


  preload() {
    this.load.spritesheet('helix', '/assets/helix.png', { frameWidth: 48, frameHeight: 36 });
    this.load.json('helixSpriteData', '/assets/helix.png.json');
    this.load.spritesheet('groundArrows', 'assets/ground_arrows.png', { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet('tiles4', 'assets/tiles4.png', { frameWidth: 32, frameHeight: 32 });
    this.load.json('tilesData', '/assets/tiles.png.json');
    this.load.json('world1', '/assets/world1.world');

    this.load.tilemapTiledJSON('originCave', '/assets/originCave.tmj');
    this.load.tilemapTiledJSON('sharstoneville', '/assets/sharstoneville.tmj');

  }

  async create() {

    this.isChangingScenes = false;



    // await Nakama.authenticate();




    // this.source = this.physics.add.image(100, 300, 'groundArrows');
    // this.distanceText = this.add.text(10, 10, 'Click to set target', { color: 'lime' });
    this.anims.create({
      key: 'activate',
      frames: this.anims.generateFrameNumbers('groundArrows', { start: 0, end: 19 }),
      repeat: 0,
      frameRate: 32,
    });

    this.anims.create({
      key: 'fireStar',
      frames: this.anims.generateFrameNumbers('tiles4', { start: 83, end: 88 }),
      repeat: -1,
      frameRate: 8,
    })

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




    let helixSpriteData = this.cache.json.get('helixSpriteData');
    // let tilesData = this.cache.json.get('tilesData');
    // let portal = this.physics.add.sprite(540, 100, 'tiles').setScale(4).setFrame(1);
    // let stairs = this.physics.add.sprite(540, 400, 'tiles4')
    //   .setScale(scaleFactor)
    //   .setFrame(28);



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




    const { groundLayer, itemsLayer, poiLayer, portalsLayer } = this.loadMap('sharstoneville');


    // spawn portals
    portalsLayer?.objects.forEach((obj) => {

      const x = (obj.x || 0) * scaleFactor + halfTileSize;
      const y = (obj.y || 0) * scaleFactor - halfTileSize;

      console.log(obj);
      this.portals.push(this.physics.add.staticSprite(x, y, 'tiles4', Number(obj.gid) - 1).setScale(scaleFactor));




    })

    // spawn items    
    itemsLayer?.objects.forEach((obj) => {
      // console.log(obj)

      const x = (obj.x || 0) * scaleFactor + halfTileSize;
      const y = (obj.y || 0) * scaleFactor - halfTileSize;

      if (obj.name === 'gol') {
        // choose the gol sprite that matches the gol count
        const count = obj.properties.find((prop: any) => prop.name === 'count').value;
        // console.log(`spawning gol with count=${count}`)
        this.spawnGol(x, y, count);

      } else if (obj.name === 'mystery') {
        // randomly choose an item to spawn
        this.spawnRandomItem(x, y);

      } else if (obj.name === 'map') {
        this.physics.add.staticSprite(x, y, 'tiles4').setScale(2).setTexture('tiles4', 40)
      } else {
        // unknown object type
        this.physics.add.staticSprite(x, y, 'tiles4').setScale(2).setTexture('tiles4', 52)
      }

    })



    this.player = createPlayer(this, 100, 100);

    this.cameras.main.setZoom(1);
    this.cameras.main.startFollow(this.player, false);

    this.target = this.physics.add.staticSprite(100, 100, 'groundArrows').setAlpha(0).setScale(2);
    this.target.play({ key: 'activate' });

    // this.physics.add.overlap(this.player, stairs, this.overlapCallback, undefined, this);

    // set up player-portal overlap handlers
    this.portals.forEach((portal) => {

      if (!this.player) throw new Error('failed to setup player-portal overlap handlers-- this.player was falsy.');
      const overlapCallback: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback = (
        object1: Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody | Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile,
        object2: Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody | Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile
      ) => {
        if (!this.isChangingScenes) {
          console.log('overlapCallback!');
          this.isChangingScenes = true;

          // load the portal
          // Load the corresponding tilemap based on the portal name

          // map.destroy();
          // @todo we need to also destroy the map's layers.


          const { groundLayer, itemsLayer, poiLayer, portalsLayer } = this.loadMap('originCave');


          let cave = this.add.tilemap('originCave');
          cave.addTilesetImage('tiles4');

          // const groundLayer = cave.createLayer('ground', 'tiles4');
          // const itemsLayer = cave.getObjectLayer('items');
          // const poiLayer = cave.createLayer('poi', 'tiles4');
          // const portalsLayer = cave.getObjectLayer('portals');

          groundLayer?.setScale(scaleFactor);
          poiLayer?.setScale(scaleFactor);

        }
      }
      this.physics.add.overlap(this.player, portal, overlapCallback, undefined, this);
    })


    this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      const isLeftButtonDown = this.input.activePointer.leftButtonDown();
      if (!isLeftButtonDown) {
        const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
        this.setTarget(worldPoint.x, worldPoint.y);
      }
    });

    if (!this.input.keyboard) throw new Error('this.input.keyboard is missing');
    this.input.keyboard.on('keydown-SPACE', () => {

      if (this.player) {
        this.player.setVelocity(0);
        this.player.play({ key: 'idle1' }, true);
      }
    })
  }

  update(): void {
    this.updatePlayerMovement();


    this.updateCamera();


  }


  private createPortal(x: number, y: number, frame: number) {

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
        target: 'town-square',
        duration: 500,
        onUpdate: (progress: any) => {
          fx.progress = progress;
        }
      });
    }
  }


  private setTarget(x: number, y: number): void {
    if (!this.target || !this.player) return;
    this.target.setPosition(x, y);
    this.target.body.position.set(x, y);
    this.isWalking = true;
    this.player.play({ key: 'run', repeat: -1 }, true);

    this.target.play({ key: 'activate' });
    this.target.setAlpha(1);
    // this.distanceText.setText(`Target set: (${x}, ${y})`);
    this.physics.moveToObject(this.player, this.target, playerSpeed);
  }


  private spawnGol(x: number = 0, y: number = 0, count: number = 1): void {

    // console.log(`spawnGol with x=${x} y=${y} count=${count}`)
    let frame = 65; // Default to frame for count 1

    // Determine frame based on count
    if (count >= 1 && count <= 10) {
      frame = 64 + count; // This will map 1-10 to 65-74
    } else if (count >= 11 && count <= 99) {
      frame = 74; // For counts 11-99, use frame 74
    } else if (count === 100) {
      frame = 75; // For count 100
    } else if (count === 1000) {
      frame = 77; // For count 1000
    } else if (count === 10000) {
      frame = 78; // For count 10000
    }

    // Create the sprite with the determined frame
    this.physics.add.staticSprite(x, y, 'tiles4').setScale(2).setTexture('tiles4', frame);
  }

  private spawnRandomItem(x: number = 0, y: number = 0): void {
    const potentials = ['orange', 'map', 'healthPot', 'manaPot'];
    const choice = getRandomElement(potentials);
    if (!choice) throw new Error(`getRandomElement failed go select a choice. choice=${choice}`);
    const frame = this.getNamedFrame(choice);
    this.physics.add.staticSprite(x, y, 'tiles4', frame)
  }

  private getNamedFrame(name: string) {
    if (name === 'orange') return 92;
    if (name === 'mystery') return 53;
    if (name === 'healthPot') return 24;
    if (name === 'manaPot') return 25;
    if (name === 'map') return 40;
    else return 52; // todo item
  }


  private loadMap(mapName: string): MapThing {
    if (this.map) {
      // this.map.destroyLayer('ground');
      // this.map.destroyLayer('poi');
      // this.map.destroy();
    }

    const world1Data = this.cache.json.get('world1') as WorldConfiguration;

    // we load Tiled world data to find the map offset
    const worldMapData = world1Data.maps.find((m: WorldTileMap) => m.fileName.includes(mapName));
    console.log('loading the following world.', worldMapData);


    // const x = worldMapData?.x || 0;
    const x = -300;
    const y = worldMapData?.y || 0;

    console.log(`x=${x}, y=${y}`);
    this.map = this.add.tilemap(mapName);
    this.map.addTilesetImage('tiles4', 'tiles4', tileSize, tileSize, 0, 0, 0, { x, y });
    this.map.addTilesetImage('tiles4')

    // this.map.worldToTileX(x);
    // this.map.worldToTileY(y);




    const groundLayer = this.map.createLayer('ground', 'tiles4', x, y);
    const poiLayer = this.map.createLayer('poi', 'tiles4', x, y);
    const itemsLayer = this.map.getObjectLayer('items');
    const portalsLayer = this.map.getObjectLayer('portals');

    groundLayer?.setScale(scaleFactor);
    poiLayer?.setScale(scaleFactor);

    return {
      groundLayer,
      poiLayer,
      itemsLayer,
      portalsLayer
    };
  }

private updatePlayerMovement(): void {
    if (!this.player || !this.target || !this.player.body) {
        console.warn('Player or target is not defined');
        return; // Exit early if either is not defined
    }

    const body = this.player.body;
    const halfWidth = body.width / 2;
    const sourceBodyCenter = new Phaser.Math.Vector2(body.position.x + halfWidth, body.position.y + (body.height / 2));

    const distance = Phaser.Math.Distance.BetweenPoints(sourceBodyCenter, this.target);

    if (body.speed > 0) {
        // Move the player towards the target
        // this.physics.moveToObject(this.player, this.target, playerSpeed);

        // Interpolate velocity toward (0, 0), starting at 10px away
        body.velocity.lerp(Phaser.Math.Vector2.ZERO, Phaser.Math.Clamp(1 - distance / 10, 0, 1));

        // Flip the player sprite based on movement direction
        this.player.flipX = body.velocity.x < 0;

        // Check if close enough to stop walking
        if (distance < 10 && body.speed < 0.1) {
            this.isWalking = false;
            this.player.play({ key: 'idle1', repeat: -1 });
        } else {
            this.isWalking = true;
            this.player.play({ key: 'run', repeat: -1 }, true);
        }
    }

    // Follow the player with the camera
    this.cameras.main.startFollow(this.player, true);
}


  private updateCamera() {
    if (!this.player) return;
    this.cameras.main.startFollow(this.player, true);
  }

}