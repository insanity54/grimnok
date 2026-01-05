import Phaser from "phaser";
import CONFIG from '../config.ts';
import Nakama from '../nakama.ts';
import { generateFramesFromPixeloramaData } from "../phaserDataLoader.ts";
import { spawnPlayer } from "$lib/player";
import { getRandomElement } from "$lib/random";

interface MapThing {
  groundLayer: Phaser.Tilemaps.TilemapLayer | null,
  itemsLayer: Phaser.Tilemaps.ObjectLayer | null,
  poiLayer: Phaser.Tilemaps.TilemapLayer | null,
  portalsLayer: Phaser.Tilemaps.ObjectLayer | null,
  notesLayer: Phaser.Tilemaps.ObjectLayer | null,
}

interface ObjectProperty {
  name: string;
  type: string;
  value: any;
}


interface ObjectWithProperties {
  properties: ObjectProperty[]; // An array of properties
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


export enum ItemType {
  CREATURE,
  BUFF,
}




const playerSpeed = 250;
const tileSize = 32;
const scaleFactor = 1;
const halfTileSize = (tileSize * scaleFactor) / 2;

export default class World extends Phaser.Scene {


  private distanceText: Phaser.GameObjects.Text | null = null;
  private player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody | null = null;
  private target: Phaser.Types.Physics.Arcade.SpriteWithStaticBody | null = null;
  private faraway: Phaser.Math.Vector2 = new Phaser.Math.Vector2(-2000, -2000);
  private isWalking: boolean;
  private currentMap: string | null = null;
  private isChangingMaps: boolean = false;
  private portals: Phaser.Physics.Arcade.StaticGroup | null = null;
  private fx: Phaser.GameObjects.Components.FX | null = null;

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
    this.load.tilemapTiledJSON('stoneville', '/assets/stoneville.tmj');

  }

  async create() {


    this.isChangingMaps = false;



    // await Nakama.authenticate();




    // this.source = this.physics.add.image(100, 300, 'groundArrows');
    this.distanceText = this.add.text(10, 10, '~', { color: 'lime' });
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
      repeat: -1,
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




    this.loadMap('originCave');



    // get the spawnpoint
    const portals = this.map?.getObjectLayer('portals');
    // console.log(portals)
    const spawnPoint = portals?.objects.find((portal) => portal.name == 'spawn');
    if (!spawnPoint) throw new Error(`failed to find 'spawn' object in portals layer`);
    this.player = spawnPlayer(this, spawnPoint.x, spawnPoint.y, scaleFactor);
    const portalsBodies = this.portals?.getChildren().map((portal) => portal) as Phaser.GameObjects.GameObject[]
    if (!portalsBodies) throw new Error('portalsBodies was falsy');
    this.physics.add.overlap(this.player, portalsBodies, this.overlapCallback, undefined, this);


    this.cameras.main.setZoom(1);

    this.target = this.physics.add.staticSprite(10, 10, 'groundArrows').setAlpha(0).setScale(2);
    this.target.play({ key: 'activate' });




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
        this.player.play({ key: 'idle1', repeat: -1 }, true);
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
    obj1: Phaser.Types.Physics.Arcade.GameObjectWithBody,
    obj2: Phaser.Types.Physics.Arcade.GameObjectWithBody
  ): void {
    if (this.isChangingMaps) return;
    console.log(`we have overlapped! ${obj1.type} (${obj1.name}), ${obj2.type} (${obj2.name})`);


    const targetMapName = obj2.getData('toMap'); // Fetch 'toMap' property


    if (targetMapName && targetMapName !== this.currentMap) {
      console.log('Portal touched! Transitioning to:', targetMapName);
      this.isChangingMaps = true;

      // transition effect
      this.cameras.main.fadeOut(500, 0, 0, 0, () => {
        this.loadMap(targetMapName);
        this.currentMap = targetMapName;
        this.cameras.main.fadeIn(500, 0, 0, 0, () => {
          this.isChangingMaps = false;  // Enable transition again
        });
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

      // clean up the items from last map

      // clean up the portals
      this.portals?.clear();
      

      // this.map.destroyLayer('ground');
      // this.map.destroyLayer('poi');
      // this.map.
      // this.map.destroy();
    }

    // const world1Data = this.cache.json.get('world1') as WorldConfiguration;

    // // we load Tiled world data to find the map offset
    // const worldMapData = world1Data.maps.find((m: WorldTileMap) => m.fileName.includes(mapName));
    console.log('loading', mapName);


    // const x = worldMapData?.x || 0;
    // // const x = -300;
    // const y = worldMapData?.y || 0;

    // console.log(`map offset x=${x}, y=${y}`);
    this.map = this.add.tilemap(mapName);
    // this.map.addTilesetImage('tiles4', 'tiles4', tileSize, tileSize, 0, 0, 0, { x, y });
    this.map.addTilesetImage('tiles4');

    // this.map.worldToTileX(x);
    // this.map.worldToTileY(y);






    const groundLayer = this.map.createLayer('ground', 'tiles4');
    const poiLayer = this.map.createLayer('poi', 'tiles4');
    const notesLayer = this.map.getObjectLayer('notes');
    const itemsLayer = this.map.getObjectLayer('items');
    const portalsLayer = this.map.getObjectLayer('portals');

    groundLayer?.setScale(scaleFactor);
    poiLayer?.setScale(scaleFactor);


    this.portals = this.physics.add.staticGroup();
    // this.portals = this.physics.add.group();
    portalsLayer?.objects.forEach((obj) => {
      const properties = obj.properties as ObjectProperty[]; // Ensure you assert to the correct type array

      // Check if the hidden property is present and its value
      const hiddenProperty = properties.find((prop) => prop.name === 'hidden');

      // If it has hidden set to true, we don't add it
      if (hiddenProperty?.value === true) return;

      // Optional: If you want to retrieve the 'count' property as well
      const countProperty = properties.find((prop) => prop.name === 'count');
      const count = countProperty ? countProperty.value : undefined;

      // Add the object from Tiled
      if (!this.portals) return;
      this.addObjectFromTiled(this.portals, obj, 'tiles4', 'tiles4').setDepth(5);

      


    });


    const notes = this.physics.add.staticGroup();
    notesLayer?.objects.forEach((obj) => {
      this.addObjectFromTiled(notes, obj, 'tiles4', 'tiles4');
    })

    // spawn items    
    const items = this.physics.add.staticGroup([])
    itemsLayer?.objects.forEach((obj) => {
      this.addObjectFromTiled(items, obj, 'tiles4', 'tiles4');
    })


    // console.log('depixelating now.')
    // this.cameras.main.fadeFrom(1500, 100, 0, 0);

    // const pixelate = this.cameras.main.postFX.addPixelate(40);
    // this.add.tween({
    //   targets: pixelate,
    //   duration: 1000,
    //   amount: -1,
    // });


    return {
      groundLayer,
      poiLayer,
      itemsLayer,
      portalsLayer,
      notesLayer
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
    if (this.distanceText) {
      this.distanceText.setDepth(100);
      this.distanceText.copyPosition(this.player.body.position);
      // this.distanceText.setText(`x:${this.player.x.toFixed(2)}, y:${this.player.y.toFixed(2)}, tileX:${this.map?.worldToTileX(this.player.x)}, tileY:${this.map?.worldToTileY(this.player.y)}`);
      this.distanceText.setText(`currentMap=${this.currentMap}, isChangingMap=${this.isChangingMaps}`);
    }

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

  // @greets @greetz @see https://github.com/thex3family/x3-metaverse/blob/58453abefd26c1932ed83a4eac7a330aa4442219/client/src/scenes/Game.ts#L191
  private addObjectFromTiled(
    group: Phaser.Physics.Arcade.StaticGroup,
    object: Phaser.Types.Tilemaps.TiledObject,
    key: string,
    tilesetName: string
  ) {
    const actualX = object.x! + object.width! * 0.5
    const actualY = object.y! - object.height! * 0.5
    if (!this.map) throw new Error('Cannot add object from Tiled-- this.map is falsy');
    const tileset = this.map.getTileset(tilesetName);
    if (!tileset) throw new Error('Cannot add Object from Tiled-- tileset is falsy.');
    // console.log('we are adding objectFromTiled and we  have the following properties', object.properties);
    const obj = group
      .get(actualX, actualY, key, object.gid! - tileset.firstgid)
      .setName(object.name)
      .setData('toMap', object.properties?.find((prop: ObjectProperty) => prop.name === 'toMap')?.value)
      .setData('toPortal', object.properties?.find((prop: ObjectProperty) => prop.name === 'toPortal')?.value)
      .setDepth(actualY);

    console.log(`There are ${group.getChildren().length} objects in the staticGroup`);
    return obj
  }

}