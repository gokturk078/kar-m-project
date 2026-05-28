import Phaser from 'phaser';
import { COLLECTIBLES, OBSTACLES } from '../data/gameConstants';
import type { HazardPatternKey, HeartPatternKey, PacingSection } from '../data/patterns';
import type { GameplayState } from './GameplayDirector';
import {
  type HazardPatternSpec,
  type HeartPatternSpec,
  PatternFactory
} from './PatternFactory';

export type SpawnRequest = {
  hazardPattern?: HazardPatternSpec;
  heartPattern?: HeartPatternSpec;
  pacingSection: PacingSection;
};

export class SpawnDirector {
  private hazardTimer: number = OBSTACLES.firstSpawnDelay;
  private heartTimer: number = COLLECTIBLES.firstSpawnDelay;
  private lastHazardY: number | null = null;
  private warmupHazardCount = 0;
  private sectionIndex = 0;
  private actionsInSection = 0;
  private lastStageId = 0;
  private stageTransitionPending = false;
  private readonly pacingCycle: PacingSection[] = ['reward', 'simpleHazard', 'recovery', 'riskReward'];

  reset(): void {
    this.hazardTimer = OBSTACLES.firstSpawnDelay;
    this.heartTimer = COLLECTIBLES.firstSpawnDelay;
    this.lastHazardY = null;
    this.warmupHazardCount = 0;
    this.sectionIndex = 0;
    this.actionsInSection = 0;
    this.lastStageId = 0;
    this.stageTransitionPending = false;
  }

  update(deltaMs: number, state: GameplayState): SpawnRequest {
    if (state.stageId !== this.lastStageId) {
      this.stageTransitionPending = true;
      this.heartTimer = Math.min(this.heartTimer, 180);
      this.hazardTimer = Math.max(this.hazardTimer, 900);
      this.lastStageId = state.stageId;
    }

    const section = this.getCurrentSection();
    const request: SpawnRequest = { pacingSection: section };

    this.heartTimer -= deltaMs;
    this.hazardTimer -= deltaMs;

    if (this.heartTimer <= 0) {
      request.heartPattern = PatternFactory.createHeartPattern(state, this.lastHazardY, this.pickHeartPattern(section, state));
      this.heartTimer = Phaser.Math.Between(state.heartIntervalMin, state.heartIntervalMax);
      this.markSectionAction();
    }

    if (this.hazardTimer <= 0 && this.canSpawnHazard(state, section)) {
      request.hazardPattern = PatternFactory.createHazardPattern(state, this.lastHazardY, this.pickHazardPattern(section, state));
      const finalHazard = request.hazardPattern.hazards[request.hazardPattern.hazards.length - 1];
      this.lastHazardY = finalHazard?.y ?? this.lastHazardY;
      this.warmupHazardCount += state.stageId === 0 ? 1 : 0;
      this.hazardTimer = Phaser.Math.Between(state.hazardIntervalMin, state.hazardIntervalMax);
      this.markSectionAction();
    }

    return request;
  }

  private canSpawnHazard(state: GameplayState, section: PacingSection): boolean {
    if (state.elapsedSeconds < 4.2) {
      return false;
    }

    if (section === 'reward' || section === 'recovery' || section === 'stageTransition') {
      this.hazardTimer = Math.max(this.hazardTimer, 520);
      return false;
    }

    if (state.stageId === 0 && this.warmupHazardCount >= 4) {
      this.hazardTimer = Math.max(this.hazardTimer, 700);
      return false;
    }

    return true;
  }

  private getCurrentSection(): PacingSection {
    if (this.stageTransitionPending) {
      return 'stageTransition';
    }

    return this.pacingCycle[this.sectionIndex];
  }

  private markSectionAction(): void {
    this.actionsInSection += 1;

    if (this.stageTransitionPending) {
      this.stageTransitionPending = false;
      this.actionsInSection = 0;
      this.sectionIndex = 0;
      return;
    }

    if (this.actionsInSection >= 2) {
      this.actionsInSection = 0;
      this.sectionIndex = (this.sectionIndex + 1) % this.pacingCycle.length;
    }
  }

  private pickHeartPattern(section: PacingSection, state: GameplayState): HeartPatternKey | undefined {
    if (section === 'stageTransition') {
      return state.allowedHeartPatterns.includes('heartTunnel') ? 'heartTunnel' : 'recoveryTrail';
    }

    if (section === 'recovery') {
      return 'recoveryTrail';
    }

    if (section === 'riskReward' && state.allowedHeartPatterns.includes('riskRewardLine')) {
      return 'riskRewardLine';
    }

    if (section === 'reward') {
      return Phaser.Math.RND.pick(state.allowedHeartPatterns.filter((pattern) => pattern !== 'riskRewardLine'));
    }

    return undefined;
  }

  private pickHazardPattern(section: PacingSection, state: GameplayState): HazardPatternKey | undefined {
    if (section === 'simpleHazard') {
      return state.allowedHazardPatterns.includes('singleVerticalLaser') ? 'singleVerticalLaser' : undefined;
    }

    if (section === 'riskReward') {
      const preferredPatterns = state.allowedHazardPatterns.filter((pattern) =>
        ['warningBeamEntry', 'doubleOffsetLaser', 'electricBar', 'mine', 'tallLaser'].includes(pattern)
      );

      return preferredPatterns.length > 0 ? Phaser.Math.RND.pick(preferredPatterns) : undefined;
    }

    return undefined;
  }
}
