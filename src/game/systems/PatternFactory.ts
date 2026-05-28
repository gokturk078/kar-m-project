import Phaser from 'phaser';
import { COLLECTIBLES, GAME_HEIGHT, GAME_WIDTH, OBSTACLES, SAFE_ZONES } from '../data/gameConstants';
import type { HazardPatternKey, HeartPatternKey } from '../data/patterns';
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
  name: HazardPatternKey;
  hazards: HazardSpawnSpec[];
};

export type HeartSpawnSpec = {
  x: number;
  y: number;
  scale: number;
};

export type HeartPatternSpec = {
  kind: HeartPatternKey;
  hearts: HeartSpawnSpec[];
};

export class PatternFactory {
  static createHazardPattern(
    state: GameplayState,
    previousHazardY: number | null,
    forcedPattern?: HazardPatternKey
  ): HazardPatternSpec {
    const pattern = forcedPattern ?? Phaser.Math.RND.pick(state.allowedHazardPatterns);

    switch (pattern) {
      case 'calmGap':
        return { name: 'calmGap', hazards: [] };
      case 'tallLaser':
        return PatternFactory.createVerticalLaser('tallLaser', state, previousHazardY, state.maxHazardHeight);
      case 'doubleOffsetLaser':
        return PatternFactory.createDoubleOffsetLaser(state, previousHazardY);
      case 'warningBeamEntry':
        return PatternFactory.createHorizontalBeam('warningBeamEntry', state, previousHazardY);
      case 'lowHazard':
        return PatternFactory.createVerticalLaser('lowHazard', state, previousHazardY, OBSTACLES.hazardHeightMin, state.safeBottom - 62);
      case 'highHazard':
        return PatternFactory.createVerticalLaser('highHazard', state, previousHazardY, OBSTACLES.hazardHeightMin, state.safeTop + 62);
      case 'mine':
        return PatternFactory.createMine(state, previousHazardY);
      case 'electricBar':
        return PatternFactory.createHorizontalBeam('electricBar', state, previousHazardY, OBSTACLES.horizontalBeamWidth + 28);
      case 'singleVerticalLaser':
      default:
        return PatternFactory.createVerticalLaser('singleVerticalLaser', state, previousHazardY);
    }
  }

  static createHeartPattern(
    state: GameplayState,
    lastHazardY: number | null,
    forcedPattern?: HeartPatternKey
  ): HeartPatternSpec {
    const pattern = forcedPattern ?? Phaser.Math.RND.pick(state.allowedHeartPatterns);
    const baseY =
      pattern === 'riskRewardLine' && lastHazardY !== null
        ? PatternFactory.clampY(lastHazardY + Phaser.Math.RND.pick([-1, 1]) * COLLECTIBLES.riskOffsetFromHazard, state)
        : PatternFactory.pickHeartY(state, pattern === 'smallCluster' || pattern === 'heartTunnel');

    switch (pattern) {
      case 'gentleUpwardTrail':
        return PatternFactory.createTrail('gentleUpwardTrail', baseY, state, -COLLECTIBLES.trailSpacingY);
      case 'gentleDownwardTrail':
        return PatternFactory.createTrail('gentleDownwardTrail', baseY, state, COLLECTIBLES.trailSpacingY);
      case 'waveTrail':
        return PatternFactory.createWave(baseY, state);
      case 'smallCluster':
        return PatternFactory.createCluster(baseY, state);
      case 'riskRewardLine':
        return PatternFactory.createTrail('riskRewardLine', baseY, state, 0, GAME_WIDTH + 86, 5);
      case 'recoveryTrail':
        return PatternFactory.createTrail('recoveryTrail', PatternFactory.getComfortCenter(state), state, 0, GAME_WIDTH + 44, 6);
      case 'heartTunnel':
        return PatternFactory.createHeartTunnel(state);
      case 'safeHorizontalTrail':
      default:
        return PatternFactory.createTrail('safeHorizontalTrail', baseY, state, 0);
    }
  }

  private static createVerticalLaser(
    name: HazardPatternKey,
    state: GameplayState,
    previousHazardY: number | null,
    targetHeight?: number,
    forcedY?: number
  ): HazardPatternSpec {
    const height = targetHeight ?? Phaser.Math.Between(OBSTACLES.hazardHeightMin, state.maxHazardHeight);
    const y = forcedY ?? PatternFactory.pickHazardY(state, previousHazardY);

    return {
      name,
      hazards: [
        {
          kind: 'verticalLaser',
          x: GAME_WIDTH + OBSTACLES.spawnLead,
          y: PatternFactory.clampY(y, state),
          width: OBSTACLES.hazardWidth,
          height,
          radius: 0
        }
      ]
    };
  }

  private static createHorizontalBeam(
    name: HazardPatternKey,
    state: GameplayState,
    previousHazardY: number | null,
    width: number = OBSTACLES.horizontalBeamWidth
  ): HazardPatternSpec {
    const y = PatternFactory.pickHazardY(state, previousHazardY);

    return {
      name,
      hazards: [
        {
          kind: 'horizontalBeam',
          x: GAME_WIDTH + OBSTACLES.spawnLead,
          y,
          width,
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

  private static createDoubleOffsetLaser(state: GameplayState, previousHazardY: number | null): HazardPatternSpec {
    const firstY = PatternFactory.pickHazardY(state, previousHazardY);
    const direction = firstY < GAME_HEIGHT / 2 ? 1 : -1;
    const secondY = PatternFactory.clampY(firstY + direction * Phaser.Math.Between(158, 220), state);
    const height = Math.min(state.maxHazardHeight, OBSTACLES.hazardHeightMin + 52);

    return {
      name: 'doubleOffsetLaser',
      hazards: [
        {
          kind: 'verticalLaser',
          x: GAME_WIDTH + OBSTACLES.spawnLead,
          y: firstY,
          width: OBSTACLES.hazardWidth,
          height,
          radius: 0
        },
        {
          kind: 'verticalLaser',
          x: GAME_WIDTH + OBSTACLES.spawnLead + 168,
          y: secondY,
          width: OBSTACLES.hazardWidth,
          height,
          radius: 0
        }
      ]
    };
  }

  private static createTrail(
    kind: HeartPatternKey,
    baseY: number,
    state: GameplayState,
    slopeY: number,
    startX = GAME_WIDTH + 48,
    forcedCount?: number
  ): HeartPatternSpec {
    const count = forcedCount ?? Phaser.Math.Between(COLLECTIBLES.trailMinCount, COLLECTIBLES.trailMaxCount);
    const hearts = Array.from({ length: count }, (_, index) => ({
      x: startX + index * COLLECTIBLES.trailSpacingX,
      y: PatternFactory.clampY(baseY + index * slopeY, state),
      scale: 0.82
    }));

    return { kind, hearts };
  }

  private static createWave(baseY: number, state: GameplayState): HeartPatternSpec {
    const count = Phaser.Math.Between(4, 7);
    const hearts = Array.from({ length: count }, (_, index) => ({
      x: GAME_WIDTH + 48 + index * COLLECTIBLES.trailSpacingX,
      y: PatternFactory.clampY(baseY + Math.sin(index * 0.95) * 28, state),
      scale: 0.82
    }));

    return { kind: 'waveTrail', hearts };
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

    return { kind: 'smallCluster', hearts };
  }

  private static createHeartTunnel(state: GameplayState): HeartPatternSpec {
    const center = PatternFactory.getComfortCenter(state);
    const hearts = Array.from({ length: 8 }, (_, index) => {
      const isTop = index % 2 === 0;

      return {
        x: GAME_WIDTH + 54 + Math.floor(index / 2) * 46,
        y: PatternFactory.clampY(center + (isTop ? -42 : 42), state),
        scale: 0.76
      };
    });

    return { kind: 'heartTunnel', hearts };
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

  private static getComfortCenter(state: GameplayState): number {
    return (state.comfortTop + state.comfortBottom) / 2;
  }

  private static clampY(y: number, state: GameplayState): number {
    return Phaser.Math.Clamp(y, state.safeTop, state.safeBottom);
  }
}
