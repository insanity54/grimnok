import Phaser from "phaser";

const map = (value: number, min: number, max: number, newMin: number, newMax: number): number => {
  return ((value - min) / (max - min)) * (newMax - newMin) + newMin;
};

class PlayerSprite extends Phaser.GameObjects.Sprite {
  private navMesh: any; // Define a more specific type if possible
  private path: Phaser.Math.Vector2[] | null;
  private currentTarget: Phaser.Math.Vector2 | null;
  public scene: Phaser.Scene;

  constructor(scene: Phaser.Scene, x: number, y: number, navMesh: any) {
    super(scene, x, y, "player");

    this.navMesh = navMesh;
    this.path = null;
    this.currentTarget = null;
    this.scene = scene;

    // Enable arcade physics for moving with velocity
    scene.physics.world.enable(this);

    scene.add.existing(this);
    scene.events.on("update", this.update, this);
    scene.events.once("shutdown", this.destroy, this);

    this
      .setName('player')
      .play({ key: 'idle1' });

  }

  goTo(targetPoint: Phaser.Math.Vector2): void {
    // Find a path to the target
    this.path = this.navMesh.findPath(new Phaser.Math.Vector2(this.x, this.y), targetPoint);

    // If there is a valid path, grab the first point from the path and set it as the target
    if (this.path && this.path.length > 0) this.currentTarget = this.path.shift() || null;
    else this.currentTarget = null;
  }

  create() {
        //     .sprite(x, y, 'helix')
        // .setName('player')
        // .setScale(scaleFactor)
        // .setDepth(100)
        // .play({ key: 'idle1' });
  }

  update(time: number, deltaTime: number): void {
    // Bugfix: Phaser's event emitter caches listeners, so it's possible to get updated once after
    // being destroyed
    if (!this.body) return;

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0);

    if (this.currentTarget) {
      // Check if we have reached the current target (within a fudge factor)
      const { x, y } = this.currentTarget;
      const distance = Phaser.Math.Distance.Between(this.x, this.y, x, y);

      if (distance < 5) {
        // If there is path left, grab the next point. Otherwise, null the target.
        if (this.path && this.path.length > 0) {
          this.currentTarget = this.path.shift() || null;
        } else {
          this.currentTarget = null;
        }
      }

      // Slow down as we approach the final point in the path
      let speed = 200;
      if (!this.path) throw new Error('this.path is falsy');
      if (this.path.length === 0 && distance < 50) {
        speed = map(distance, 50, 0, 200, 50);
      }

      // Still got a valid target?
      if (this.currentTarget) {
        this.moveTowards(this.currentTarget, speed, deltaTime / 1000);
      }

      // Flip the player sprite based on movement direction
      this.flipX = body.velocity.x < 0;

      // Check if close enough to stop walking
      if (distance < 10 && body.speed < 0.1) {
        // this.isWalking = false;
        this.play({ key: 'idle1', repeat: -1 });
      } else {
        // this.isWalking = true;
        this.play({ key: 'run', repeat: -1 }, true);
      }
    }
  }

  moveTowards(targetPosition: Phaser.Math.Vector2, maxSpeed: number = 200, elapsedSeconds: number): void {
    const { x, y } = targetPosition;
    const angle = Phaser.Math.Angle.Between(this.x, this.y, x, y);
    const distance = Phaser.Math.Distance.Between(this.x, this.y, x, y);
    const targetSpeed = distance / elapsedSeconds;
    const magnitude = Math.min(maxSpeed, targetSpeed);

    this.scene.physics.velocityFromRotation(angle, magnitude, this.body?.velocity as Phaser.Math.Vector2);
    // this.rotation = angle;
  }

  stopMovement(): void {
    this.play({ key: 'idle1', repeat: -1 }, true);
  }

  destroy(): void {
    if (this.scene) this.scene.events.off("update", this.update, this);
    super.destroy();
  }
}

export default PlayerSprite;
