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
  private isWalking: boolean;
  private currentMap: string | null = null;
  private isChangingMaps: boolean = false;
  private portals: Phaser.Physics.Arcade.StaticGroup | null = null;
  private items: Phaser.Physics.Arcade.StaticGroup | null = null;
  private pois: Phaser.Physics.Arcade.StaticGroup | null = null;

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
    this.load.tilemapTiledJSON('stonevilleEast', '/assets/stonevilleEast.tmj');
    this.load.tilemapTiledJSON('stonevilleEastTunnel', '/assets/stonevilleEastTunnel.tmj');
    this.load.tilemapTiledJSON('stonevilleShop', '/assets/stonevilleShop.tmj');
    this.load.tilemapTiledJSON('stonevilleShopCellar', '/assets/stonevilleShopCellar.tmj');

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

      this.stopPlayerMovement();
      
    })
  }

  update(): void {
    this.updatePlayerMovement();

    this.updateCamera();

  }


  private overlapCallback(
    obj1: any,
    obj2: any
  ): void {

    console.log(`we have overlapped! ${obj1.type} (${obj1.name}), ${obj2.type} (${obj2.name})`);
    if (this.isChangingMaps) {
      console.log('isChangingMaps=true')
      return;
    }


    const targetMapName = obj2.getData('toMap'); // Fetch 'toMap' property
    const targetPortalName = obj2.getData('toPortal');


    if (targetMapName && targetMapName !== this.currentMap) {
      console.log('Portal touched! Transitioning to:', targetMapName);
      this.isChangingMaps = true;

      // transition effect
      this.cameras.main.fadeOut(500, 0, 0, 0, () => {
        this.loadMap(targetMapName, targetPortalName);

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


  private loadMap(mapName: string, portalName: string = 'spawn'): MapThing {
    if (this.map) {

      // clean up the items from last map

      // clean up the portals
      if (!this.portals) throw new Error('while loading map, there were no portals!');
      console.log('cleaning up portals');
      // this.portals.destroy(true);
      this.portals.clear(true, true);

      if (!this.items) throw new Error('while loading map, this.items was falsy');
      this.items.clear(true, true);

      // if (!this.pois) throw new Error('while loading map, this.pois was falsy');
      // this.pois.clear(true, true);




      this.map.destroyLayer('ground');
      // this.map.destroyLayer('poi');
      // this.map.destroyLayer('portals');
      // this.map.destroy();
    }

    // const world1Data = this.cache.json.get('world1') as WorldConfiguration;

    // // we load Tiled world data to find the map offset
    // const worldMapData = world1Data.maps.find((m: WorldTileMap) => m.fileName.includes(mapName));
    console.log('loading', mapName, 'portalName', portalName);


    // const x = worldMapData?.x || 0;
    // // const x = -300;
    // const y = worldMapData?.y || 0;

    // console.log(`map offset x=${x}, y=${y}`);
    this.map = this.add.tilemap(mapName);
    // this.map.addTilesetImage('tiles4', 'tiles4', tileSize, tileSize, 0, 0, 0, { x, y });
    this.map.addTilesetImage('tiles4');

    // this.map.createLayer()

    // this.map.worldToTileX(x);
    // this.map.worldToTileY(y);






    const groundLayer = this.map.createLayer('ground', 'tiles4');
    const poiLayer = this.map.getObjectLayer('poi');
    const notesLayer = this.map.getObjectLayer('notes');
    const itemsLayer = this.map.getObjectLayer('items');
    const portalsLayer = this.map.getObjectLayer('portals');


    groundLayer?.setCollisionFromCollisionGroup();
    groundLayer?.setScale(scaleFactor);






    const notes = this.physics.add.staticGroup();
    notesLayer?.objects.forEach((obj) => {
      this.addObjectFromTiled(notes, obj, 'tiles4', 'tiles4');
    })

    // spawn items    
    this.items = this.physics.add.staticGroup();
    const items = this.items;
    itemsLayer?.objects.forEach((obj) => {
      this.addObjectFromTiled(items, obj, 'tiles4', 'tiles4');
    });



    // Spawn the player at the spawnpoint
    const portalObjectLayer = this.map?.getObjectLayer('portals');
    const spawnPoint = portalObjectLayer?.objects.find((portal) => portal.name == 'spawn');
    if (!this.player) {
      if (!spawnPoint) throw new Error(`cannot spawn player-- failed to find 'spawn' object in portals layer`);
      this.player = spawnPlayer(this, spawnPoint.x, spawnPoint.y, scaleFactor);
    }
    this.stopPlayerMovement();

    // If we were given a portalName, move the player to that portal
    if (portalName) {
      console.log(`portalName=${portalName}`)
      const matchingPortal = portalObjectLayer?.objects.find((portal) => portal.name === portalName);
      this.player.setPosition(Number(matchingPortal?.x) + 64, matchingPortal?.y);
    }



    this.portals = this.physics.add.staticGroup();
    portalObjectLayer?.objects.forEach((obj) => {
      const properties = obj.properties as ObjectProperty[]; // Ensure you assert to the correct type array

      // if (properties.find((prop) => prop.name === 'spawn')) {
      // @todo move teh spawn handling here so we can do less looping???
      //   spawnPoint = 
      // }

      // Check if the hidden property is present and its value
      const hiddenProperty = properties.find((prop) => prop.name === 'hidden');

      // If it has hidden set to true, we don't add it
      if (hiddenProperty?.value === true) return;

      // Optional: If you want to retrieve the 'count' property as well
      const countProperty = properties.find((prop) => prop.name === 'count');
      const count = countProperty ? countProperty.value : undefined;

      // Add the object from Tiled
      if (!this.portals) return;
      console.log('adding portals')
      this.addObjectFromTiled(this.portals, obj, 'tiles4', 'tiles4').setDepth(5);
    });
    this.physics.add.overlap(this.player, this.portals, this.overlapCallback, undefined, this);


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

  private stopPlayerMovement() {

    if (this.player) {
      console.log('stopping player movement');
      this.player.setVelocity(0);
      this.player.play({ key: 'idle1', repeat: -1 }, true);
    }
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

    // console.log(`There are ${group.getChildren().length} objects in the staticGroup`);
    return obj
  }

}
