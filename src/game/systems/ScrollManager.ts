import { COLORS, GAME_HEIGHT, GAME_WIDTH, WORLD } from '../data/gameConstants';
import { STAGE_PRESETS, type StageTheme } from '../data/stages';

type MovingObject = Phaser.GameObjects.Shape & { speedFactor: number; resetY?: number };

export class ScrollManager {
  private readonly scene: Phaser.Scene;
  private readonly backgroundTop: Phaser.GameObjects.Rectangle;
  private readonly backgroundBottom: Phaser.GameObjects.Rectangle;
  private readonly farStars: MovingObject[] = [];
  private readonly nearStars: MovingObject[] = [];
  private readonly speedLines: MovingObject[] = [];
  private readonly laneStripes: MovingObject[] = [];
  private readonly neonStripes: MovingObject[] = [];
  private readonly railMarks: Phaser.GameObjects.Rectangle[] = [];
  private readonly topRail: Phaser.GameObjects.Rectangle;
  private readonly bottomRail: Phaser.GameObjects.Rectangle;
  private currentTheme: StageTheme = STAGE_PRESETS[0].theme;
  private scrollSpeed: number = WORLD.initialScrollSpeed;
  private distance = 0;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    this.backgroundTop = this.scene.add
      .rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, COLORS.backgroundTop)
      .setOrigin(0)
      .setDepth(-50);

    this.backgroundBottom = this.scene.add
      .rectangle(0, GAME_HEIGHT * 0.5, GAME_WIDTH, GAME_HEIGHT * 0.5, COLORS.backgroundBottom, 0.86)
      .setOrigin(0)
      .setDepth(-49);

    this.createStarLayer(this.farStars, 0.15, 0.4, COLORS.lavender, 0.45);
    this.createStarLayer(this.nearStars, 0.34, 0.7, COLORS.rose, 0.62);
    this.createSpeedLines();
    this.createLaneStripes();
    this.createNeonStripes();

    this.topRail = this.scene.add
      .rectangle(0, 0, GAME_WIDTH, WORLD.railHeight, COLORS.navy, 0.94)
      .setOrigin(0)
      .setDepth(-20);
    this.bottomRail = this.scene.add
      .rectangle(0, GAME_HEIGHT - WORLD.railHeight, GAME_WIDTH, WORLD.railHeight, COLORS.navy, 0.96)
      .setOrigin(0)
      .setDepth(-20);

    this.createRailMarks();
  }

  get speed(): number {
    return this.scrollSpeed;
  }

  get currentDistance(): number {
    return this.distance;
  }

  update(deltaSeconds: number, scrollSpeed: number): void {
    this.scrollSpeed = scrollSpeed;
    this.distance += this.scrollSpeed * WORLD.distanceScale * deltaSeconds;

    this.updateLayer(this.farStars, deltaSeconds);
    this.updateLayer(this.nearStars, deltaSeconds);
    this.updateLayer(this.speedLines, deltaSeconds);
    this.updateLayer(this.laneStripes, deltaSeconds);
    this.updateLayer(this.neonStripes, deltaSeconds);
    this.updateRails(deltaSeconds);
  }

  destroy(): void {
    [...this.farStars, ...this.nearStars, ...this.speedLines, ...this.laneStripes, ...this.neonStripes].forEach((object) =>
      object.destroy()
    );
    this.railMarks.forEach((mark) => mark.destroy());
    this.topRail.destroy();
    this.bottomRail.destroy();
    this.backgroundTop.destroy();
    this.backgroundBottom.destroy();
  }

  applyTheme(theme: StageTheme, duration = 900): void {
    const startTheme = this.currentTheme;
    this.currentTheme = theme;

    this.scene.tweens.addCounter({
      from: 0,
      to: 1,
      duration,
      ease: 'Sine.easeInOut',
      onUpdate: (tween) => {
        const progress = tween.getValue() ?? 1;

        this.backgroundTop.setFillStyle(ScrollManager.mixColor(startTheme.backgroundTop, theme.backgroundTop, progress));
        this.backgroundBottom.setFillStyle(
          ScrollManager.mixColor(startTheme.backgroundBottom, theme.backgroundBottom, progress),
          0.86
        );
        this.topRail.setFillStyle(ScrollManager.mixColor(startTheme.railColor, theme.railColor, progress), 0.94);
        this.bottomRail.setFillStyle(ScrollManager.mixColor(startTheme.railColor, theme.railColor, progress), 0.96);

        this.speedLines.forEach((line) => {
          line.setFillStyle(
            ScrollManager.mixColor(startTheme.speedLineColor, theme.speedLineColor, progress),
            Phaser.Math.Linear(startTheme.speedLineAlpha, theme.speedLineAlpha, progress) * 0.24
          );
        });
        this.laneStripes.forEach((stripe, index) => {
          const color = index % 3 === 1 ? theme.centerLaneColor : theme.laneColor;
          stripe.setFillStyle(color, Phaser.Math.Clamp(theme.stripeAlpha * (index % 3 === 1 ? 0.16 : 0.1), 0.06, 0.28));
        });
        this.neonStripes.forEach((stripe) => {
          stripe.setFillStyle(theme.neonColor, Phaser.Math.Clamp(theme.speedLineAlpha * 0.08, 0.06, 0.18));
        });
        this.railMarks.forEach((mark) => mark.setFillStyle(theme.accentColor, 0.34));
      }
    });
  }

  private createStarLayer(
    target: MovingObject[],
    speedFactor: number,
    scale: number,
    color: number,
    alpha: number
  ): void {
    for (let index = 0; index < WORLD.starCount / 2; index += 1) {
      const star = this.scene.add
        .circle(
          Phaser.Math.Between(0, GAME_WIDTH),
          Phaser.Math.Between(WORLD.railHeight + 8, GAME_HEIGHT - WORLD.railHeight - 8),
          Phaser.Math.FloatBetween(0.8, 2.2) * scale,
          color,
          alpha
        )
        .setDepth(-40) as unknown as MovingObject;

      star.speedFactor = speedFactor;
      target.push(star);
    }
  }

  private createSpeedLines(): void {
    for (let index = 0; index < WORLD.speedLineCount; index += 1) {
      const line = this.scene.add
        .rectangle(
          Phaser.Math.Between(0, GAME_WIDTH),
          Phaser.Math.Between(WORLD.railHeight + 20, GAME_HEIGHT - WORLD.railHeight - 20),
          Phaser.Math.Between(20, 70),
          Phaser.Math.FloatBetween(1, 2.5),
          COLORS.cyan,
          Phaser.Math.FloatBetween(0.1, 0.28)
        )
        .setOrigin(0.5)
        .setDepth(-28) as unknown as MovingObject;

      line.speedFactor = Phaser.Math.FloatBetween(0.78, 1.14);
      this.speedLines.push(line);
    }
  }

  private createRailMarks(): void {
    for (let x = 0; x < GAME_WIDTH + 120; x += 54) {
      const topMark = this.scene.add
        .rectangle(x, WORLD.railHeight - 10, 34, 3, COLORS.pink, 0.34)
        .setDepth(-18);
      const bottomMark = this.scene.add
        .rectangle(x + 24, GAME_HEIGHT - WORLD.railHeight + 10, 34, 3, COLORS.pink, 0.34)
        .setDepth(-18);

      this.railMarks.push(topMark, bottomMark);
    }
  }

  private createLaneStripes(): void {
    const laneYs = [GAME_HEIGHT * 0.36, GAME_HEIGHT * 0.5, GAME_HEIGHT * 0.64];

    laneYs.forEach((y, laneIndex) => {
      for (let x = -20; x < GAME_WIDTH + WORLD.laneStripeSpacing; x += WORLD.laneStripeSpacing) {
        const stripe = this.scene.add
          .rectangle(
            x + laneIndex * 23,
            y,
            WORLD.laneStripeWidth,
            WORLD.laneStripeHeight,
            laneIndex === 1 ? COLORS.lavender : COLORS.pink,
            laneIndex === 1 ? 0.16 : 0.1
          )
          .setDepth(-26) as unknown as MovingObject;

        stripe.speedFactor = 1.05 + laneIndex * 0.08;
        stripe.resetY = y;
        this.laneStripes.push(stripe);
      }
    });
  }

  private createNeonStripes(): void {
    for (let index = 0; index < WORLD.neonStripeCount; index += 1) {
      const progress = index / (WORLD.neonStripeCount - 1);
      const y = Phaser.Math.Linear(WORLD.railHeight + 28, GAME_HEIGHT - WORLD.railHeight - 28, progress);
      const stripe = this.scene.add
        .rectangle(Phaser.Math.Between(0, GAME_WIDTH), y, Phaser.Math.Between(64, 120), 2, COLORS.cyan, 0.08)
        .setDepth(-30) as unknown as MovingObject;

      stripe.speedFactor = Phaser.Math.FloatBetween(0.48, 0.72);
      stripe.resetY = y;
      this.neonStripes.push(stripe);
    }
  }

  private updateLayer(objects: MovingObject[], deltaSeconds: number): void {
    objects.forEach((object) => {
      object.x -= this.scrollSpeed * object.speedFactor * deltaSeconds;

      if (object.x < -90) {
        object.x = GAME_WIDTH + Phaser.Math.Between(20, 140);
        object.y = object.resetY ?? Phaser.Math.Between(WORLD.railHeight + 8, GAME_HEIGHT - WORLD.railHeight - 8);
      }
    });
  }

  private updateRails(deltaSeconds: number): void {
    this.railMarks.forEach((mark) => {
      mark.x -= this.scrollSpeed * 1.25 * deltaSeconds;

      if (mark.x < -46) {
        mark.x = GAME_WIDTH + Phaser.Math.Between(10, 70);
      }
    });
  }

  private static mixColor(from: number, to: number, progress: number): number {
    const fromColor = Phaser.Display.Color.IntegerToColor(from);
    const toColor = Phaser.Display.Color.IntegerToColor(to);
    const mixed = Phaser.Display.Color.Interpolate.ColorWithColor(fromColor, toColor, 1, progress);

    return Phaser.Display.Color.GetColor(mixed.r, mixed.g, mixed.b);
  }
}
