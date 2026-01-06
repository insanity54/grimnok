import Phaser from "phaser";
import CONFIG from '../config.ts';
import Nakama from '../nakama.ts';
import { generateFramesFromPixeloramaData } from "../phaserDataLoader.ts";
import { getRandomElement } from "$lib/random";
import PlayerSprite from "../game-objects/player.ts";
import IntentStack from "$lib/IntentStack";


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
  private target: Phaser.Types.Physics.Arcade.SpriteWithStaticBody | null = null;
  private isWalking: boolean;
  private currentMap: string | null = null;
  private isChangingMaps: boolean = false;
  private portals: Phaser.Physics.Arcade.StaticGroup | null = null;
  private items: Phaser.Physics.Arcade.StaticGroup | null = null;
  private pois: Phaser.Physics.Arcade.StaticGroup | null = null;
  private player: PlayerSprite | null = null;
  private intents: IntentStack| null = null;

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

    this.intents = new IntentStack();

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

      
      // this.stopPlayerMovement();

    })
  }

  update(): void {
    // this.updatePlayerMovement();

    this.updateCamera();

    if (this.intents) {
      this.intents.checkTopIntent();
    }

  }


  private overlapCallback(
    obj1: any,
    obj2: any
  ): void {

    console.log('@TODO overlap. Replace this with an intent handler.');
    return;

    console.log(`we have overlapped! ${obj1.type} (${obj1.name}), ${obj2.type} (${obj2.name})`);
    if (this.isChangingMaps) {
      console.log('isChangingMaps=true')
      return;
    }

    // if (!this.isWalking) {
    //   console.log('the player is walking so we do not teleport.');
    //   return;
    // }

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
          setTimeout(() => this.isChangingMaps = false, 750);
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

    this.target.play({ key: 'activate' }).setAlpha(1).setDepth(10);

    // this.distanceText.setText(`Target set: (${x}, ${y})`);
    // this.physics.moveToObject(this.player, this.target, playerSpeed);
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


  private loadMap(mapName: string, portalName: string = 'spawn'): void {
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
    const wallLayer = this.map.createLayer("walls", 'tiles4');


    groundLayer?.setCollisionFromCollisionGroup();
    groundLayer?.setScale(scaleFactor);

    const style = {
      font: "22px Josefin Sans",
      fill: "#ff0044",
      padding: { x: 20, y: 10 },
      backgroundColor: "#fff",
    };
    const uiTextLines = [
      "Click to find a path!",
      "Is mouse inside navmesh: false",
      "Press 'm' to see navmesh.",
    ];
    const uiText = this.add.text(10, 5, uiTextLines, style).setAlpha(0.9);

    
    // setup navmesh
    // this.navMeshPlugin.buildMeshFromTilemap('navmesh1', )
    const navMeshLayer = this.map.getObjectLayer("navmesh");
    const navMesh = this.navMeshPlugin.buildMeshFromTiled("mesh1", navMeshLayer);

    // Game object that can follow a path (inherits from Phaser.Sprite)
    this.player = new PlayerSprite(this, 50, 200, navMesh);

    // Display whether the mouse is currently over a valid point in the navmesh
    this.input.on(Phaser.Input.Events.POINTER_MOVE, (pointer: Phaser.Input.Pointer) => {
      const isInMesh = navMesh.isPointInMesh(pointer);
      uiTextLines[1] = `Is mouse inside navmesh: ${isInMesh ? "yes" : "no "}`;
      uiText.setText(uiTextLines);
    });


    // Toggle the navmesh visibility on/off
    if (!this.input.keyboard) throw new Error('this.input.keyboard is falsy');
    this.input.keyboard.on("keydown-M", () => {
      navMesh.debugDrawClear();
      navMesh.debugDrawMesh({
        drawCentroid: true,
        drawBounds: false,
        drawNeighbors: false,
        drawPortals: true,
      });
    });

    // On click
    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      if (!this.player) return;
      const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
      const start = new Phaser.Math.Vector2(this.player.x, this.player.y);
      const end = new Phaser.Math.Vector2(worldPoint.x, worldPoint.y);

      // Tell the follower sprite to find its path to the target
      this.player.goTo(end);

      // For demo purposes, let's recalculate the path here and draw it on the screen
      const startTime = performance.now();
      const path = navMesh.findPath(start, end);
      // -> path is now an array of points, or null if no valid path found
      const pathTime = performance.now() - startTime;

      navMesh.debugDrawClear();
      navMesh.debugDrawPath(path, 0xffd900);

      const formattedTime = pathTime.toFixed(3);
      uiTextLines[0] = path
        ? `Path found in: ${formattedTime}ms`
        : `No path found (${formattedTime}ms)`;
      uiText.setText(uiTextLines);
    });

    // Graphics overlay for visualizing path
    const graphics = this.add.graphics().setAlpha(0.5);
    navMesh.enableDebug(graphics);

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
      // this.player = spawnPlayer(this, spawnPoint.x, spawnPoint.y, scaleFactor);
    }
    this.player.stopMovement();

    // If we were given a portalName, move the player to that portal
    if (portalName) {
      console.log(`portalName=${portalName}`);
      const matchingPortal = portalObjectLayer?.objects.find((portal) => portal.name === portalName);
      this.player.setPosition(Number(matchingPortal?.x), matchingPortal?.y);
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
      const sprite = this.addObjectFromTiled(this.portals, obj, 'tiles4', 'tiles4').setDepth(5);

      // click handler
      // Add event listener for pointer down (click)
      console.log(`sprite?`, sprite);
      sprite.setInteractive();
      sprite.on('pointerdown', (s: Phaser.GameObjects.Sprite) => {
          
          this.intents?.pushIntent({ 
            action: () => {
              const toMap = sprite.data.get('toMap');
              const toPortal = sprite.data.get('toPortal');
              console.log(`Sprite ${sprite.name} clicked! Motherfucker!`)
              this.loadMap(toMap, toPortal);
            },
            satisfiable: () => {
              if (!this.player) return false;
              return Phaser.Math.Distance.Between(this.player.x, this.player.y, sprite.x, sprite.y) < 33;
            }
          })
          // Call any action you want here
      });

    });
    // this.physics.add.overlap(this.player, this.portals, this.overlapCallback, undefined, this);




    return


  }



  private updateCamera() {
    if (!this.player) return;

    // this.cameras.main.startFollow(this.player, true);
    this.cameras.main.startFollow(this.player, true);
  }


  // @greets @greetz @see https://github.com/thex3family/x3-metaverse/blob/58453abefd26c1932ed83a4eac7a330aa4442219/client/src/scenes/Game.ts#L191
  private addObjectFromTiled(
    group: Phaser.Physics.Arcade.StaticGroup,
    object: Phaser.Types.Tilemaps.TiledObject,
    key: string,
    tilesetName: string
  ): Phaser.GameObjects.Sprite {
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
      .setDepth(actualY) as Phaser.GameObjects.Sprite;

    // console.log(`There are ${group.getChildren().length} objects in the staticGroup`);
    // console.log(`the obj we are returning is `, obj);
    return obj
  }

}
