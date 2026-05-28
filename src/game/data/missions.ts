export type MissionType =
  | 'collectHeartsRun'
  | 'reachDistanceRun'
  | 'surviveSecondsRun'
  | 'startFlightsTotal'
  | 'reachStageRun'
  | 'collectTotalHearts'
  | 'beatBestDistanceRun';

export type MissionDefinition = {
  id: string;
  title: string;
  type: MissionType;
  target: number;
  rewardHearts: number;
  rewardXp: number;
};

export const MISSION_DEFINITIONS: MissionDefinition[] = [
  {
    id: 'collect_12_hearts',
    title: 'Collect 12 hearts in one flight',
    type: 'collectHeartsRun',
    target: 12,
    rewardHearts: 8,
    rewardXp: 35
  },
  {
    id: 'reach_250m',
    title: 'Reach 250 m',
    type: 'reachDistanceRun',
    target: 250,
    rewardHearts: 6,
    rewardXp: 40
  },
  {
    id: 'survive_30s',
    title: 'Survive 30 seconds',
    type: 'surviveSecondsRun',
    target: 30,
    rewardHearts: 5,
    rewardXp: 38
  },
  {
    id: 'start_3_flights',
    title: 'Start 3 flights',
    type: 'startFlightsTotal',
    target: 3,
    rewardHearts: 10,
    rewardXp: 45
  },
  {
    id: 'reach_stage_2',
    title: 'Reach Candy Pulse Corridor',
    type: 'reachStageRun',
    target: 2,
    rewardHearts: 8,
    rewardXp: 50
  },
  {
    id: 'collect_50_total',
    title: 'Collect 50 total hearts',
    type: 'collectTotalHearts',
    target: 50,
    rewardHearts: 12,
    rewardXp: 55
  },
  {
    id: 'reach_500m',
    title: 'Reach 500 m',
    type: 'reachDistanceRun',
    target: 500,
    rewardHearts: 10,
    rewardXp: 65
  },
  {
    id: 'beat_best',
    title: 'Beat your best distance',
    type: 'beatBestDistanceRun',
    target: 1,
    rewardHearts: 12,
    rewardXp: 70
  }
];

export const DEFAULT_ACTIVE_MISSIONS = ['collect_12_hearts', 'reach_250m', 'survive_30s'] as const;
