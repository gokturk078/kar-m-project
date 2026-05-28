import Phaser from 'phaser';
import { COLLECTIBLES, OBSTACLES } from '../data/gameConstants';
import type { GameplayState } from './GameplayDirector';
import {
  type HazardPatternSpec,
  type HeartPatternSpec,
  PatternFactory
} from './PatternFactory';

export type SpawnRequest = {
  hazardPattern?: HazardPatternSpec;
  heartPattern?: HeartPatternSpec;
};

export class SpawnDirector {
  private hazardTimer: number = OBSTACLES.firstSpawnDelay;
  private heartTimer: number = COLLECTIBLES.firstSpawnDelay;
  private lastHazardY: number | null = null;
  private warmupHazardCount = 0;

  reset(): void {
    this.hazardTimer = OBSTACLES.firstSpawnDelay;
    this.heartTimer = COLLECTIBLES.firstSpawnDelay;
    this.lastHazardY = null;
    this.warmupHazardCount = 0;
  }

  update(deltaMs: number, state: GameplayState): SpawnRequest {
    const request: SpawnRequest = {};

    this.heartTimer -= deltaMs;
    this.hazardTimer -= deltaMs;

    if (this.heartTimer <= 0) {
      request.heartPattern = PatternFactory.createHeartPattern(state, this.lastHazardY);
      this.heartTimer = Phaser.Math.Between(state.heartIntervalMin, state.heartIntervalMax);
    }

    if (this.hazardTimer <= 0 && this.canSpawnHazard(state)) {
      request.hazardPattern = PatternFactory.createHazardPattern(state, this.lastHazardY);
      this.lastHazardY = request.hazardPattern.hazards[request.hazardPattern.hazards.length - 1].y;
      this.warmupHazardCount += state.stageId === 0 ? 1 : 0;
      this.hazardTimer = Phaser.Math.Between(state.hazardIntervalMin, state.hazardIntervalMax);
    }

    return request;
  }

  private canSpawnHazard(state: GameplayState): boolean {
    if (state.elapsedSeconds < 4.2) {
      return false;
    }

    if (state.stageId === 0 && this.warmupHazardCount >= 4) {
      this.hazardTimer = Math.max(this.hazardTimer, 700);
      return false;
    }

    return true;
  }
}
