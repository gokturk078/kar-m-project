import { COLORS, PLAYER } from '../data/gameConstants';

export class Player extends Phaser.Physics.Arcade.Sprite {
  private verticalVelocity = 0;
  private sparkTimer = 0;

  constructor(scene: Phaser.Scene) {
    super(scene, PLAYER.startX, PLAYER.startY, 'player-heartpack');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDepth(20);
    this.setCircle(PLAYER.radius, 8, 8);
    this.setCollideWorldBounds(false);
    this.setDrag(0, 0);
  }

  updatePlayer(deltaSeconds: number, isThrusting: boolean): void {
    const acceleration = isThrusting ? PLAYER.thrust : PLAYER.gravity;
    const drag = isThrusting ? PLAYER.dragWhenThrusting : PLAYER.dragWhenFalling;

    this.verticalVelocity = Phaser.Math.Clamp(
      (this.verticalVelocity + acceleration * deltaSeconds) * drag,
      PLAYER.maxUpVelocity,
      PLAYER.maxDownVelocity
    );

    this.y += this.verticalVelocity * deltaSeconds;
    this.x += (PLAYER.startX - this.x) * PLAYER.xSmoothing;

    this.applySoftBounds();
    this.updateTilt();

    if (isThrusting) {
      this.emitSpark(deltaSeconds);
    }
  }

  private applySoftBounds(): void {
    if (this.y < PLAYER.topSoftLimit) {
      this.y = Phaser.Math.Linear(this.y, PLAYER.topSoftLimit, 0.45);
      this.verticalVelocity = Math.max(this.verticalVelocity, PLAYER.softBounceVelocity);
    }

    if (this.y > PLAYER.bottomSoftLimit) {
      this.y = Phaser.Math.Linear(this.y, PLAYER.bottomSoftLimit, 0.45);
      this.verticalVelocity = Math.min(this.verticalVelocity, -PLAYER.softBounceVelocity);
    }
  }

  private updateTilt(): void {
    const targetAngle = Phaser.Math.Clamp(
      this.verticalVelocity * PLAYER.tiltFactor,
      -PLAYER.maxTiltDegrees,
      PLAYER.maxTiltDegrees
    );

    this.angle = Phaser.Math.Linear(this.angle, targetAngle, 0.18);
  }

  private emitSpark(deltaSeconds: number): void {
    this.sparkTimer -= deltaSeconds * 1000;

    if (this.sparkTimer > 0) {
      return;
    }

    this.sparkTimer = 34;

    const spark = this.scene.add
      .image(this.x - 20, this.y + Phaser.Math.Between(8, 16), 'sparkle')
      .setDepth(16)
      .setTint(Phaser.Math.RND.pick([COLORS.pink, COLORS.rose, COLORS.cyan]))
      .setAlpha(0.9)
      .setScale(Phaser.Math.FloatBetween(0.65, 1));

    this.scene.tweens.add({
      targets: spark,
      x: spark.x - Phaser.Math.Between(20, 42),
      y: spark.y + Phaser.Math.Between(-8, 14),
      alpha: 0,
      scale: 0.15,
      duration: 260,
      ease: 'Sine.easeOut',
      onComplete: () => spark.destroy()
    });
  }
}
