import Phaser from 'phaser';
import { COLORS, GAME_HEIGHT, GAME_WIDTH } from '../data/gameConstants';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  preload(): void {
    const loadingText = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'Preparing journey...', {
        color: '#fff7fb',
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '18px'
      })
      .setOrigin(0.5);

    this.load.once(Phaser.Loader.Events.COMPLETE, () => loadingText.destroy());
  }

  create(): void {
    this.createPlayerTexture();
    this.createHeartTexture();
    this.createSparkleTexture();
    this.scene.start('MenuScene');
  }

  private createPlayerTexture(): void {
    const graphics = this.make.graphics({ x: 0, y: 0 }, false);

    graphics.fillStyle(COLORS.hotPink, 1);
    graphics.fillCircle(26, 24, 14);
    graphics.fillCircle(40, 24, 14);
    graphics.fillTriangle(13, 31, 53, 31, 33, 56);

    graphics.fillStyle(COLORS.white, 0.92);
    graphics.fillCircle(30, 24, 4);
    graphics.fillCircle(44, 24, 4);

    graphics.fillStyle(COLORS.lavender, 1);
    graphics.fillRoundedRect(2, 26, 16, 20, 5);
    graphics.fillStyle(COLORS.cyan, 1);
    graphics.fillRoundedRect(0, 31, 9, 8, 4);

    graphics.generateTexture('player-heartpack', 64, 64);
    graphics.destroy();
  }

  private createHeartTexture(): void {
    const graphics = this.make.graphics({ x: 0, y: 0 }, false);

    graphics.fillStyle(COLORS.pink, 1);
    graphics.fillCircle(13, 11, 9);
    graphics.fillCircle(27, 11, 9);
    graphics.fillTriangle(4, 17, 36, 17, 20, 38);
    graphics.lineStyle(2, COLORS.white, 0.75);
    graphics.strokeCircle(13, 11, 9);
    graphics.strokeCircle(27, 11, 9);

    graphics.generateTexture('heart-collectible', 40, 42);
    graphics.destroy();
  }

  private createSparkleTexture(): void {
    const graphics = this.make.graphics({ x: 0, y: 0 }, false);

    graphics.fillStyle(COLORS.white, 1);
    graphics.fillCircle(6, 6, 3);
    graphics.lineStyle(1, COLORS.white, 0.85);
    graphics.lineBetween(6, 0, 6, 12);
    graphics.lineBetween(0, 6, 12, 6);

    graphics.generateTexture('sparkle', 12, 12);
    graphics.destroy();
  }
}
