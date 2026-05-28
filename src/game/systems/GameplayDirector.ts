import Phaser from 'phaser';
import { COLLECTIBLES, GAME_HEIGHT, OBSTACLES, SAFE_ZONES, WORLD } from '../data/gameConstants';
import type { GameStagePreset } from '../data/stages';
import type { HazardPatternKey, HeartPatternKey } from '../data/patterns';

export type DifficultyStageId = 0 | 1 | 2 | 3 | 4;

export type GameplayState = {
  elapsedSeconds: number;
  distance: number;
  stageId: DifficultyStageId;
  stageName: string;
  timeInStage: number;
  stage: GameStagePreset;
  scrollSpeed: number;
  hazardIntervalMin: number;
  hazardIntervalMax: number;
  heartIntervalMin: number;
  heartIntervalMax: number;
  maxHazardHeight: number;
  patternRisk: number;
  allowedHeartPatterns: HeartPatternKey[];
  allowedHazardPatterns: HazardPatternKey[];
  safeTop: number;
  safeBottom: number;
  comfortTop: number;
  comfortBottom: number;
};

export class GameplayDirector {
  private elapsedSeconds = 0;
  private timeInStage = 0;
  private activeStageId: DifficultyStageId = 0;
  private scrollSpeed: number = WORLD.initialScrollSpeed;

  reset(): void {
    this.elapsedSeconds = 0;
    this.timeInStage = 0;
    this.activeStageId = 0;
    this.scrollSpeed = WORLD.initialScrollSpeed;
  }

  update(deltaSeconds: number, distance: number, stage: GameStagePreset): GameplayState {
    this.elapsedSeconds += deltaSeconds;
    this.timeInStage = stage.id === this.activeStageId ? this.timeInStage + deltaSeconds : 0;
    this.activeStageId = stage.id;

    const targetSpeed = Phaser.Math.Clamp(
      stage.scrollSpeedBase * stage.scrollSpeedModifier + this.timeInStage * stage.speedRampPerSecond,
      WORLD.initialScrollSpeed,
      WORLD.maxScrollSpeed
    );
    const smoothing = Phaser.Math.Clamp(deltaSeconds * 0.85, 0.01, 0.08);

    this.scrollSpeed = Phaser.Math.Linear(this.scrollSpeed, targetSpeed, smoothing);

    const band = this.getSafeBand(stage.id);

    return {
      elapsedSeconds: this.elapsedSeconds,
      distance,
      stageId: stage.id as DifficultyStageId,
      stageName: stage.name,
      timeInStage: this.timeInStage,
      stage,
      scrollSpeed: this.scrollSpeed,
      hazardIntervalMin: Math.floor(OBSTACLES.spawnIntervalMin * stage.obstacleSpawnModifier),
      hazardIntervalMax: Math.floor(OBSTACLES.spawnIntervalMax * stage.obstacleSpawnModifier),
      heartIntervalMin: Math.floor(COLLECTIBLES.spawnIntervalMin * stage.heartSpawnModifier),
      heartIntervalMax: Math.floor(COLLECTIBLES.spawnIntervalMax * stage.heartSpawnModifier),
      maxHazardHeight: stage.maxHazardHeight,
      patternRisk: stage.id,
      allowedHeartPatterns: stage.allowedHeartPatterns,
      allowedHazardPatterns: stage.allowedHazardPatterns,
      safeTop: band.safeTop,
      safeBottom: band.safeBottom,
      comfortTop: band.comfortTop,
      comfortBottom: band.comfortBottom
    };
  }

  private getSafeBand(stageId: number): Pick<GameplayState, 'safeTop' | 'safeBottom' | 'comfortTop' | 'comfortBottom'> {
    const safeTop = Math.max(SAFE_ZONES.topMargin, WORLD.hudHeight + 44);
    const safeBottom = GAME_HEIGHT - SAFE_ZONES.bottomMargin;

    if (stageId === 0) {
      return {
        safeTop,
        safeBottom,
        comfortTop: GAME_HEIGHT * SAFE_ZONES.warmupTopRatio,
        comfortBottom: GAME_HEIGHT * SAFE_ZONES.warmupBottomRatio
      };
    }

    return {
      safeTop,
      safeBottom,
      comfortTop: GAME_HEIGHT * SAFE_ZONES.comfortTopRatio,
      comfortBottom: GAME_HEIGHT * SAFE_ZONES.comfortBottomRatio
    };
  }
}
