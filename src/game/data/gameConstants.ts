export const GAME_WIDTH = 390;
export const GAME_HEIGHT = 844;

export const COLORS = {
  backgroundTop: 0x170b35,
  backgroundBottom: 0x070514,
  navy: 0x0d1230,
  purple: 0x43206f,
  pink: 0xff6fb1,
  rose: 0xff9fca,
  hotPink: 0xff3f9b,
  lavender: 0xb69cff,
  cyan: 0x80f7ff,
  white: 0xfff7fb,
  danger: 0xff4273,
  gold: 0xffd27a,
  shadow: 0x05030d
} as const;

export const PLAYER = {
  startX: 96,
  startY: 422,
  radius: 18,
  gravity: 1220,
  thrust: -1780,
  maxUpVelocity: -500,
  maxDownVelocity: 585,
  dragWhenThrusting: 0.925,
  dragWhenFalling: 0.988,
  xSmoothing: 0.1,
  tiltFactor: 0.05,
  maxTiltDegrees: 16,
  topSoftLimit: 92,
  bottomSoftLimit: 736,
  softBounceVelocity: 190,
  warningZoneAlpha: 0.14
} as const;

export const WORLD = {
  hudHeight: 74,
  initialScrollSpeed: 240,
  maxScrollSpeed: 540,
  speedIncreasePerSecond: 4,
  distanceScale: 0.018,
  railHeight: 58,
  dangerInset: 34,
  speedLineCount: 32,
  starCount: 62,
  laneStripeSpacing: 70,
  laneStripeWidth: 34,
  laneStripeHeight: 4,
  neonStripeCount: 7
} as const;

export const OBSTACLES = {
  firstSpawnDelay: 4200,
  spawnIntervalMin: 980,
  spawnIntervalMax: 2100,
  minHazardGap: 152,
  hazardWidth: 18,
  horizontalBeamWidth: 116,
  horizontalBeamHeight: 16,
  mineRadius: 17,
  hazardHeightMin: 92,
  hazardHeightMax: 218,
  yMin: 150,
  yMax: 666,
  cleanupX: -90,
  spawnLead: 170,
  warningLead: 110,
  warningBlinkDuration: 190,
  collisionPadding: 8
} as const;

export const COLLECTIBLES = {
  firstSpawnDelay: 900,
  spawnIntervalMin: 720,
  spawnIntervalMax: 1500,
  heartValue: 1,
  yMin: 132,
  yMax: 704,
  cleanupX: -70,
  trailSpacingX: 42,
  trailSpacingY: 22,
  trailMinCount: 3,
  trailMaxCount: 6,
  clusterRadius: 28,
  riskOffsetFromHazard: 72
} as const;

export const SAFE_ZONES = {
  topMargin: 104,
  bottomMargin: 116,
  warmupTopRatio: 0.38,
  warmupBottomRatio: 0.62,
  comfortTopRatio: 0.28,
  comfortBottomRatio: 0.72,
  riskyTopRatio: 0.2,
  riskyBottomRatio: 0.8
} as const;

export const DIFFICULTY = {
  warmupSeconds: 20,
  warmupDistance: 210,
  stages: [
    {
      id: 0,
      name: 'Warmup',
      startsAtSeconds: 0,
      startsAtDistance: 0,
      scrollSpeed: 240,
      speedRampPerSecond: 2.4,
      hazardIntervalMin: 2600,
      hazardIntervalMax: 3600,
      heartIntervalMin: 720,
      heartIntervalMax: 1020,
      maxHazardHeight: 122,
      patternRisk: 0
    },
    {
      id: 1,
      name: 'Easy',
      startsAtSeconds: 20,
      startsAtDistance: 210,
      scrollSpeed: 292,
      speedRampPerSecond: 3.1,
      hazardIntervalMin: 1900,
      hazardIntervalMax: 2850,
      heartIntervalMin: 820,
      heartIntervalMax: 1200,
      maxHazardHeight: 158,
      patternRisk: 1
    },
    {
      id: 2,
      name: 'Normal',
      startsAtSeconds: 45,
      startsAtDistance: 520,
      scrollSpeed: 360,
      speedRampPerSecond: 3.7,
      hazardIntervalMin: 1420,
      hazardIntervalMax: 2260,
      heartIntervalMin: 930,
      heartIntervalMax: 1360,
      maxHazardHeight: 188,
      patternRisk: 2
    },
    {
      id: 3,
      name: 'Challenging',
      startsAtSeconds: 85,
      startsAtDistance: 1060,
      scrollSpeed: 438,
      speedRampPerSecond: 4.4,
      hazardIntervalMin: 1080,
      hazardIntervalMax: 1780,
      heartIntervalMin: 1040,
      heartIntervalMax: 1520,
      maxHazardHeight: 214,
      patternRisk: 3
    }
  ]
} as const;

export const UI = {
  margin: 18,
  buttonWidth: 220,
  buttonHeight: 54,
  panelRadius: 8
} as const;

export const STORAGE_KEYS = {
  bestDistance: 'heartpackJourney.bestDistance',
  progression: 'heartpackJourney.progression',
  missions: 'heartpackJourney.missions'
} as const;
