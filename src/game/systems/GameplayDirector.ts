import Phaser from 'phaser';
import { DIFFICULTY, GAME_HEIGHT, SAFE_ZONES, WORLD } from '../data/gameConstants';

export type DifficultyStageId = 0 | 1 | 2 | 3;

export type GameplayState = {
  elapsedSeconds: number;
  distance: number;
  stageId: DifficultyStageId;
  stageName: string;
  timeInStage: number;
  scrollSpeed: number;
  hazardIntervalMin: number;
  hazardIntervalMax: number;
  heartIntervalMin: number;
  heartIntervalMax: number;
  maxHazardHeight: number;
  patternRisk: number;
  safeTop: number;
  safeBottom: number;
  comfortTop: number;
  comfortBottom: number;
};

type StageConfig = (typeof DIFFICULTY.stages)[number];

export class GameplayDirector {
  private elapsedSeconds = 0;
  private scrollSpeed: number = WORLD.initialScrollSpeed;

  reset(): void {
    this.elapsedSeconds = 0;
    this.scrollSpeed = WORLD.initialScrollSpeed;
  }

  update(deltaSeconds: number, distance: number): GameplayState {
    this.elapsedSeconds += deltaSeconds;

    const stage = this.getStage(distance);
    const timeInStage = Math.max(0, this.elapsedSeconds - stage.startsAtSeconds);
    const targetSpeed = Phaser.Math.Clamp(
      stage.scrollSpeed + timeInStage * stage.speedRampPerSecond,
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
      timeInStage,
      scrollSpeed: this.scrollSpeed,
      hazardIntervalMin: stage.hazardIntervalMin,
      hazardIntervalMax: stage.hazardIntervalMax,
      heartIntervalMin: stage.heartIntervalMin,
      heartIntervalMax: stage.heartIntervalMax,
      maxHazardHeight: stage.maxHazardHeight,
      patternRisk: stage.patternRisk,
      safeTop: band.safeTop,
      safeBottom: band.safeBottom,
      comfortTop: band.comfortTop,
      comfortBottom: band.comfortBottom
    };
  }

  private getStage(distance: number): StageConfig {
    let selectedStage: StageConfig = DIFFICULTY.stages[0];

    DIFFICULTY.stages.forEach((stage) => {
      if (this.elapsedSeconds >= stage.startsAtSeconds || distance >= stage.startsAtDistance) {
        selectedStage = stage;
      }
    });

    return selectedStage;
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
