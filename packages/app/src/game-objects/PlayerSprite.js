"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var phaser_1 = require("phaser");
var map = function (value, min, max, newMin, newMax) {
    return ((value - min) / (max - min)) * (newMax - newMin) + newMin;
};
var PlayerSprite = /** @class */ (function (_super) {
    __extends(PlayerSprite, _super);
    function PlayerSprite(scene, x, y, navMesh) {
        var _this = _super.call(this, scene, x, y, "player") || this;
        _this.navMesh = navMesh;
        _this.path = null;
        _this.currentTarget = null;
        _this.scene = scene;
        // Enable arcade physics for moving with velocity
        scene.physics.world.enable(_this);
        scene.add.existing(_this);
        scene.events.on("update", _this.update, _this);
        scene.events.once("shutdown", _this.destroy, _this);
        _this
            .setName('player')
            .setDepth(100)
            .play({ key: 'idle1' });
        return _this;
    }
    PlayerSprite.prototype.updateNavMesh = function (navMesh) {
        this.navMesh = navMesh;
    };
    PlayerSprite.prototype.goTo = function (targetPoint) {
        // Assuming this.path should be a Vector2[]
        var pointPath = this.navMesh.findPath(new phaser_1.default.Math.Vector2(this.x, this.y), targetPoint);
        // Convert the Point array to Vector2 array
        this.path = pointPath ? pointPath.map(function (point) { return new phaser_1.default.Math.Vector2(point.x, point.y); }) : null;
        // // Find a path to the target
        // this.path = this.navMesh.findPath(new Phaser.Math.Vector2(this.x, this.y), targetPoint);
        // If there is a valid path, grab the first point from the path and set it as the target
        if (this.path && this.path.length > 0)
            this.currentTarget = this.path.shift() || null;
        else
            this.currentTarget = null;
    };
    // create() {
    //       //     .sprite(x, y, 'helix')
    //       // .setName('player')
    //       // .setScale(scaleFactor)
    //       // .setDepth(100)
    //       // .play({ key: 'idle1' });
    // }
    PlayerSprite.prototype.update = function (_time, deltaTime) {
        // Bugfix: Phaser's event emitter caches listeners, so it's possible to get updated once after
        // being destroyed
        if (!this.body)
            return;
        var body = this.body;
        body.setVelocity(0);
        if (this.currentTarget) {
            // Check if we have reached the current target (within a fudge factor)
            var _a = this.currentTarget, x = _a.x, y = _a.y;
            var distance = phaser_1.default.Math.Distance.Between(this.x, this.y, x, y);
            if (distance < 5) {
                // If there is path left, grab the next point. Otherwise, null the target.
                if (this.path && this.path.length > 0) {
                    this.currentTarget = this.path.shift() || null;
                }
                else {
                    this.currentTarget = null;
                }
            }
            // Slow down as we approach the final point in the path
            var speed = 200;
            if (!this.path)
                throw new Error('this.path is falsy');
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
            }
            else {
                // this.isWalking = true;
                this.play({ key: 'run', repeat: -1 }, true);
            }
        }
    };
    PlayerSprite.prototype.moveTowards = function (targetPosition, maxSpeed, elapsedSeconds) {
        var _a;
        if (maxSpeed === void 0) { maxSpeed = 200; }
        var x = targetPosition.x, y = targetPosition.y;
        var angle = phaser_1.default.Math.Angle.Between(this.x, this.y, x, y);
        var distance = phaser_1.default.Math.Distance.Between(this.x, this.y, x, y);
        var targetSpeed = distance / elapsedSeconds;
        var magnitude = Math.min(maxSpeed, targetSpeed);
        this.scene.physics.velocityFromRotation(angle, magnitude, (_a = this.body) === null || _a === void 0 ? void 0 : _a.velocity);
        // this.rotation = angle;
    };
    PlayerSprite.prototype.stopMovement = function () {
        this.play({ key: 'idle1', repeat: -1 }, true);
        this.currentTarget = null;
        // const body = this.body as Phaser.Physics.Arcade.Body;
        // body.setVelocity(0);
    };
    PlayerSprite.prototype.destroy = function () {
        if (this.scene)
            this.scene.events.off("update", this.update, this);
        _super.prototype.destroy.call(this);
    };
    return PlayerSprite;
}(phaser_1.default.GameObjects.Sprite));
exports.default = PlayerSprite;
