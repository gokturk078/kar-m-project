import { COLORS } from './gameConstants';
import type { HazardPatternKey, HeartPatternKey } from './patterns';

export type StageTheme = {
  backgroundTop: number;
  backgroundBottom: number;
  railColor: number;
  laneColor: number;
  centerLaneColor: number;
  neonColor: number;
  speedLineColor: number;
  accentColor: number;
  stripeAlpha: number;
  speedLineAlpha: number;
};

export type GameStagePreset = {
  id: 0 | 1 | 2 | 3 | 4;
  name: string;
  fromDistance: number;
  toDistance: number;
  scrollSpeedBase: number;
  scrollSpeedModifier: number;
  speedRampPerSecond: number;
  obstacleSpawnModifier: number;
  heartSpawnModifier: number;
  maxHazardHeight: number;
  allowedHeartPatterns: HeartPatternKey[];
  allowedHazardPatterns: HazardPatternKey[];
  theme: StageTheme;
};

export const STAGE_PRESETS: GameStagePreset[] = [
  {
    id: 0,
    name: 'Soft Start',
    fromDistance: 0,
    toDistance: 150,
    scrollSpeedBase: 238,
    scrollSpeedModifier: 1,
    speedRampPerSecond: 2,
    obstacleSpawnModifier: 1.28,
    heartSpawnModifier: 0.86,
    maxHazardHeight: 122,
    allowedHeartPatterns: ['safeHorizontalTrail', 'gentleUpwardTrail', 'gentleDownwardTrail', 'recoveryTrail'],
    allowedHazardPatterns: ['singleVerticalLaser', 'calmGap'],
    theme: {
      backgroundTop: 0x170b35,
      backgroundBottom: 0x070514,
      railColor: COLORS.navy,
      laneColor: COLORS.pink,
      centerLaneColor: COLORS.lavender,
      neonColor: COLORS.cyan,
      speedLineColor: COLORS.cyan,
      accentColor: COLORS.rose,
      stripeAlpha: 0.9,
      speedLineAlpha: 0.78
    }
  },
  {
    id: 1,
    name: 'Neon Love Tunnel',
    fromDistance: 150,
    toDistance: 350,
    scrollSpeedBase: 294,
    scrollSpeedModifier: 1.02,
    speedRampPerSecond: 2.8,
    obstacleSpawnModifier: 1.02,
    heartSpawnModifier: 0.96,
    maxHazardHeight: 158,
    allowedHeartPatterns: ['safeHorizontalTrail', 'gentleUpwardTrail', 'gentleDownwardTrail', 'waveTrail', 'smallCluster'],
    allowedHazardPatterns: ['singleVerticalLaser', 'warningBeamEntry', 'lowHazard', 'highHazard', 'calmGap'],
    theme: {
      backgroundTop: 0x1b0c44,
      backgroundBottom: 0x09061d,
      railColor: 0x111944,
      laneColor: 0xff72bd,
      centerLaneColor: 0x92f6ff,
      neonColor: 0x80f7ff,
      speedLineColor: 0xff9fca,
      accentColor: 0xff6fb1,
      stripeAlpha: 1.08,
      speedLineAlpha: 0.9
    }
  },
  {
    id: 2,
    name: 'Candy Pulse Corridor',
    fromDistance: 350,
    toDistance: 600,
    scrollSpeedBase: 356,
    scrollSpeedModifier: 1.04,
    speedRampPerSecond: 3.2,
    obstacleSpawnModifier: 0.9,
    heartSpawnModifier: 1,
    maxHazardHeight: 184,
    allowedHeartPatterns: ['safeHorizontalTrail', 'waveTrail', 'smallCluster', 'riskRewardLine', 'recoveryTrail'],
    allowedHazardPatterns: ['singleVerticalLaser', 'warningBeamEntry', 'lowHazard', 'highHazard', 'mine', 'electricBar'],
    theme: {
      backgroundTop: 0x230d3d,
      backgroundBottom: 0x10051b,
      railColor: 0x191243,
      laneColor: 0xff83aa,
      centerLaneColor: 0xffd27a,
      neonColor: 0xff6fb1,
      speedLineColor: 0xb69cff,
      accentColor: 0xffd27a,
      stripeAlpha: 1.18,
      speedLineAlpha: 1
    }
  },
  {
    id: 3,
    name: 'Electric Heart Lab',
    fromDistance: 600,
    toDistance: 900,
    scrollSpeedBase: 420,
    scrollSpeedModifier: 1.05,
    speedRampPerSecond: 3.8,
    obstacleSpawnModifier: 0.78,
    heartSpawnModifier: 1.04,
    maxHazardHeight: 210,
    allowedHeartPatterns: ['waveTrail', 'smallCluster', 'riskRewardLine', 'recoveryTrail', 'heartTunnel'],
    allowedHazardPatterns: ['singleVerticalLaser', 'tallLaser', 'warningBeamEntry', 'doubleOffsetLaser', 'mine', 'electricBar'],
    theme: {
      backgroundTop: 0x101448,
      backgroundBottom: 0x060719,
      railColor: 0x0a1d42,
      laneColor: 0x80f7ff,
      centerLaneColor: 0xff6fb1,
      neonColor: 0x92f6ff,
      speedLineColor: 0x80f7ff,
      accentColor: 0xff4273,
      stripeAlpha: 1.26,
      speedLineAlpha: 1.12
    }
  },
  {
    id: 4,
    name: 'Dream Rush',
    fromDistance: 900,
    toDistance: Number.POSITIVE_INFINITY,
    scrollSpeedBase: 476,
    scrollSpeedModifier: 1.06,
    speedRampPerSecond: 4.2,
    obstacleSpawnModifier: 0.68,
    heartSpawnModifier: 1.08,
    maxHazardHeight: 224,
    allowedHeartPatterns: ['waveTrail', 'smallCluster', 'riskRewardLine', 'recoveryTrail', 'heartTunnel'],
    allowedHazardPatterns: ['tallLaser', 'doubleOffsetLaser', 'warningBeamEntry', 'mine', 'electricBar'],
    theme: {
      backgroundTop: 0x250b4f,
      backgroundBottom: 0x080413,
      railColor: 0x161338,
      laneColor: 0xff6fb1,
      centerLaneColor: 0x80f7ff,
      neonColor: 0xffd27a,
      speedLineColor: 0xff9fca,
      accentColor: 0xb69cff,
      stripeAlpha: 1.38,
      speedLineAlpha: 1.24
    }
  }
];
