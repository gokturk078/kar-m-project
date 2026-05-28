export type HeartPatternKey =
  | 'safeHorizontalTrail'
  | 'gentleUpwardTrail'
  | 'gentleDownwardTrail'
  | 'waveTrail'
  | 'smallCluster'
  | 'riskRewardLine'
  | 'recoveryTrail'
  | 'heartTunnel';

export type HazardPatternKey =
  | 'singleVerticalLaser'
  | 'tallLaser'
  | 'doubleOffsetLaser'
  | 'warningBeamEntry'
  | 'lowHazard'
  | 'highHazard'
  | 'calmGap'
  | 'electricBar'
  | 'mine';

export type PacingSection = 'reward' | 'simpleHazard' | 'recovery' | 'riskReward' | 'stageTransition';
