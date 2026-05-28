import Phaser from 'phaser';
import {
  COLLECTIBLES,
  GAME_HEIGHT,
  GAME_WIDTH,
  OBSTACLES,
  SAFE_ZONES
} from '../data/gameConstants';
import type { GameplayState } from './GameplayDirector';

export type HazardKind = 'verticalLaser' | 'horizontalBeam' | 'mine';

export type HazardSpawnSpec = {
  kind: HazardKind;
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number;
};

export type HazardPatternSpec = {
  name: string;
  hazards: HazardSpawnSpec[];
};

export type HeartPatternKind = 'straight' | 'upward' | 'downward' | 'wave' | 'cluster' | 'riskLine';

export type HeartSpawnSpec = {
  x: number;
  y: number;
  scale: number;
};

export type HeartPatternSpec = {
  kind: HeartPatternKind;
  hearts: HeartSpawnSpec[];
};

export class PatternFactory {
  static createHazardPattern(state: GameplayState, previousHazardY: number | null): HazardPatternSpec {
    const roll = Phaser.Math.FloatBetween(0, 1);

    if (state.stageId >= 3 && roll > 0.72) {
      return PatternFactory.createStaggeredPair(state, previousHazardY);
    }

    if (state.stageId >= 2 && roll > 0.56) {
      return PatternFactory.createMine(state, previousHazardY);
    }

    if (state.stageId >= 1 && roll > 0.42) {
      return PatternFactory.createHorizontalBeam(state, previousHazardY);
    }

    return PatternFactory.createVerticalLaser(state, previousHazardY);
  }

  static createHeartPattern(state: GameplayState, lastHazardY: number | null): HeartPatternSpec {
    const availablePatterns: HeartPatternKind[] =
      state.stageId === 0
        ? ['straight', 'upward', 'downward', 'wave']
        : ['straight', 'upward', 'downward', 'wave', 'cluster'];

    if (state.stageId >= 2 && lastHazardY !== null) {
      availablePatterns.push('riskLine');
    }

    const kind = Phaser.Math.RND.pick(availablePatterns);
    const baseY =
      kind === 'riskLine' && lastHazardY !== null
        ? PatternFactory.clampY(lastHazardY + Phaser.Math.RND.pick([-1, 1]) * COLLECTIBLES.riskOffsetFromHazard, state)
        : PatternFactory.pickHeartY(state, kind === 'cluster');

    switch (kind) {
      case 'upward':
        return PatternFactory.createTrail('upward', baseY, state, -COLLECTIBLES.trailSpacingY);
      case 'downward':
        return PatternFactory.createTrail('downward', baseY, state, COLLECTIBLES.trailSpacingY);
      case 'wave':
        return PatternFactory.createWave(baseY, state);
      case 'cluster':
        return PatternFactory.createCluster(baseY, state);
      case 'riskLine':
        return PatternFactory.createTrail('riskLine', baseY, state, 0, GAME_WIDTH + 86);
      case 'straight':
      default:
        return PatternFactory.createTrail('straight', baseY, state, 0);
    }
  }

  private static createVerticalLaser(state: GameplayState, previousHazardY: number | null): HazardPatternSpec {
    const height = Phaser.Math.Between(OBSTACLES.hazardHeightMin, state.maxHazardHeight);
    const y = PatternFactory.pickHazardY(state, previousHazardY);

    return {
      name: 'verticalLaser',
      hazards: [
        {
          kind: 'verticalLaser',
          x: GAME_WIDTH + OBSTACLES.spawnLead,
          y,
          width: OBSTACLES.hazardWidth,
          height,
          radius: 0
        }
      ]
    };
  }

  private static createHorizontalBeam(state: GameplayState, previousHazardY: number | null): HazardPatternSpec {
    const y = PatternFactory.pickHazardY(state, previousHazardY);

    return {
      name: 'horizontalBeam',
      hazards: [
        {
          kind: 'horizontalBeam',
          x: GAME_WIDTH + OBSTACLES.spawnLead,
          y,
          width: OBSTACLES.horizontalBeamWidth,
          height: OBSTACLES.horizontalBeamHeight,
          radius: 0
        }
      ]
    };
  }

  private static createMine(state: GameplayState, previousHazardY: number | null): HazardPatternSpec {
    const y = PatternFactory.pickHazardY(state, previousHazardY);

    return {
      name: 'mine',
      hazards: [
        {
          kind: 'mine',
          x: GAME_WIDTH + OBSTACLES.spawnLead,
          y,
          width: OBSTACLES.mineRadius * 2,
          height: OBSTACLES.mineRadius * 2,
          radius: OBSTACLES.mineRadius
        }
      ]
    };
  }

  private static createStaggeredPair(state: GameplayState, previousHazardY: number | null): HazardPatternSpec {
    const firstY = PatternFactory.pickHazardY(state, previousHazardY);
    const direction = firstY < GAME_HEIGHT / 2 ? 1 : -1;
    const secondY = PatternFactory.clampY(firstY + direction * Phaser.Math.Between(150, 210), state);

    return {
      name: 'staggeredPair',
      hazards: [
        {
          kind: 'verticalLaser',
          x: GAME_WIDTH + OBSTACLES.spawnLead,
          y: firstY,
          width: OBSTACLES.hazardWidth,
          height: Phaser.Math.Between(OBSTACLES.hazardHeightMin, state.maxHazardHeight - 12),
          radius: 0
        },
        {
          kind: 'mine',
          x: GAME_WIDTH + OBSTACLES.spawnLead + 160,
          y: secondY,
          width: OBSTACLES.mineRadius * 2,
          height: OBSTACLES.mineRadius * 2,
          radius: OBSTACLES.mineRadius
        }
      ]
    };
  }

  private static createTrail(
    kind: HeartPatternKind,
    baseY: number,
    state: GameplayState,
    slopeY: number,
    startX = GAME_WIDTH + 48
  ): HeartPatternSpec {
    const count = Phaser.Math.Between(COLLECTIBLES.trailMinCount, COLLECTIBLES.trailMaxCount);
    const hearts = Array.from({ length: count }, (_, index) => ({
      x: startX + index * COLLECTIBLES.trailSpacingX,
      y: PatternFactory.clampY(baseY + index * slopeY, state),
      scale: 0.82
    }));

    return { kind, hearts };
  }

  private static createWave(baseY: number, state: GameplayState): HeartPatternSpec {
    const count = Phaser.Math.Between(4, 6);
    const hearts = Array.from({ length: count }, (_, index) => ({
      x: GAME_WIDTH + 48 + index * COLLECTIBLES.trailSpacingX,
      y: PatternFactory.clampY(baseY + Math.sin(index * 0.95) * 26, state),
      scale: 0.82
    }));

    return { kind: 'wave', hearts };
  }

  private static createCluster(baseY: number, state: GameplayState): HeartPatternSpec {
    const offsets = [
      { x: 0, y: 0 },
      { x: 34, y: -COLLECTIBLES.clusterRadius },
      { x: 34, y: COLLECTIBLES.clusterRadius },
      { x: 70, y: 0 }
    ];
    const hearts = offsets.map((offset) => ({
      x: GAME_WIDTH + 58 + offset.x,
      y: PatternFactory.clampY(baseY + offset.y, state),
      scale: 0.78
    }));

    return { kind: 'cluster', hearts };
  }

  private static pickHeartY(state: GameplayState, allowRisk: boolean): number {
    if (state.stageId === 0 || !allowRisk) {
      return Phaser.Math.Between(Math.floor(state.comfortTop), Math.floor(state.comfortBottom));
    }

    if (state.stageId >= 2 && Phaser.Math.FloatBetween(0, 1) > 0.68) {
      return Phaser.Math.Between(
        Math.floor(GAME_HEIGHT * SAFE_ZONES.riskyTopRatio),
        Math.floor(GAME_HEIGHT * SAFE_ZONES.riskyBottomRatio)
      );
    }

    return Phaser.Math.Between(Math.floor(state.comfortTop), Math.floor(state.comfortBottom));
  }

  private static pickHazardY(state: GameplayState, previousHazardY: number | null): number {
    let y = Phaser.Math.Between(Math.floor(state.safeTop + 48), Math.floor(state.safeBottom - 48));

    if (previousHazardY !== null && Math.abs(y - previousHazardY) < OBSTACLES.minHazardGap) {
      const direction = y > GAME_HEIGHT / 2 ? -1 : 1;
      y = previousHazardY + direction * OBSTACLES.minHazardGap;
    }

    return PatternFactory.clampY(y, state);
  }

  private static clampY(y: number, state: GameplayState): number {
    return Phaser.Math.Clamp(y, state.safeTop, state.safeBottom);
  }
}
