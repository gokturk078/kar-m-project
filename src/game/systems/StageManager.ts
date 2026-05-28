import { STAGE_PRESETS, type GameStagePreset } from '../data/stages';

export type StageUpdate = {
  stage: GameStagePreset;
  changed: boolean;
  previousStage?: GameStagePreset;
};

export class StageManager {
  private currentStage: GameStagePreset = STAGE_PRESETS[0];

  reset(): void {
    this.currentStage = STAGE_PRESETS[0];
  }

  update(distance: number): StageUpdate {
    const nextStage = StageManager.getStageForDistance(distance);
    const changed = nextStage.id !== this.currentStage.id;
    const previousStage = changed ? this.currentStage : undefined;

    this.currentStage = nextStage;

    return {
      stage: this.currentStage,
      changed,
      previousStage
    };
  }

  get current(): GameStagePreset {
    return this.currentStage;
  }

  static getStageForDistance(distance: number): GameStagePreset {
    return (
      STAGE_PRESETS.find((stage) => distance >= stage.fromDistance && distance < stage.toDistance) ??
      STAGE_PRESETS[STAGE_PRESETS.length - 1]
    );
  }
}
