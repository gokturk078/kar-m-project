import { WORLD } from '../data/gameConstants';

export class DifficultyManager {
  private elapsedSeconds = 0;

  reset(): void {
    this.elapsedSeconds = 0;
  }

  update(deltaSeconds: number): number {
    this.elapsedSeconds += deltaSeconds;

    return Phaser.Math.Clamp(
      WORLD.initialScrollSpeed + this.elapsedSeconds * WORLD.speedIncreasePerSecond,
      WORLD.initialScrollSpeed,
      WORLD.maxScrollSpeed
    );
  }
}
