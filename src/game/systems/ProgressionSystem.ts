import { STORAGE_KEYS } from '../data/gameConstants';
import { UNLOCK_TEASERS, type UnlockTeaser } from '../data/unlocks';

export type ProgressionState = {
  totalHearts: number;
  totalFlights: number;
  totalDistance: number;
  bestDistance: number;
  level: number;
  xp: number;
  completedMissionIds: string[];
  unlockedCosmeticFlags: Record<string, boolean>;
  maxStageReached: number;
};

export type ProgressionRunInput = {
  distance: number;
  hearts: number;
  bestDistance: number;
  highestStageReached: number;
  missionRewardHearts: number;
  missionRewardXp: number;
  completedMissionIds: string[];
};

export type ProgressionRunResult = {
  state: ProgressionState;
  xpGained: number;
  heartsRewarded: number;
  leveledUp: boolean;
  levelProgress: number;
  xpForNextLevel: number;
  nextUnlock: UnlockProgress;
};

export type UnlockProgress = {
  teaser: UnlockTeaser;
  progress: number;
  target: number;
  isUnlocked: boolean;
};

const DEFAULT_PROGRESSION: ProgressionState = {
  totalHearts: 0,
  totalFlights: 0,
  totalDistance: 0,
  bestDistance: 0,
  level: 1,
  xp: 0,
  completedMissionIds: [],
  unlockedCosmeticFlags: {},
  maxStageReached: 0
};

export class ProgressionSystem {
  static getState(): ProgressionState {
    const rawValue = window.localStorage.getItem(STORAGE_KEYS.progression);

    if (!rawValue) {
      return { ...DEFAULT_PROGRESSION };
    }

    try {
      const parsedValue = JSON.parse(rawValue) as Partial<ProgressionState>;

      return {
        ...DEFAULT_PROGRESSION,
        ...parsedValue,
        completedMissionIds: Array.isArray(parsedValue.completedMissionIds) ? parsedValue.completedMissionIds : [],
        unlockedCosmeticFlags:
          parsedValue.unlockedCosmeticFlags && typeof parsedValue.unlockedCosmeticFlags === 'object'
            ? parsedValue.unlockedCosmeticFlags
            : {}
      };
    } catch {
      return { ...DEFAULT_PROGRESSION };
    }
  }

  static saveState(state: ProgressionState): void {
    window.localStorage.setItem(STORAGE_KEYS.progression, JSON.stringify(state));
  }

  static recordFlightStarted(): ProgressionState {
    const state = ProgressionSystem.getState();
    const nextState = {
      ...state,
      totalFlights: state.totalFlights + 1
    };

    ProgressionSystem.saveState(nextState);

    return nextState;
  }

  static recordRun(input: ProgressionRunInput): ProgressionRunResult {
    const state = ProgressionSystem.getState();
    const distanceXp = Math.floor(input.distance * 0.22);
    const heartXp = input.hearts * 4;
    const xpGained = distanceXp + heartXp + input.missionRewardXp;
    const completedMissionIds = Array.from(new Set([...state.completedMissionIds, ...input.completedMissionIds]));
    let level = state.level;
    let xp = state.xp + xpGained;
    let leveledUp = false;

    while (xp >= ProgressionSystem.getXpForNextLevel(level)) {
      xp -= ProgressionSystem.getXpForNextLevel(level);
      level += 1;
      leveledUp = true;
    }

    const nextState: ProgressionState = {
      ...state,
      totalHearts: state.totalHearts + input.hearts + input.missionRewardHearts,
      totalDistance: state.totalDistance + input.distance,
      bestDistance: Math.max(state.bestDistance, input.bestDistance, input.distance),
      level,
      xp,
      completedMissionIds,
      maxStageReached: Math.max(state.maxStageReached, input.highestStageReached)
    };

    ProgressionSystem.saveState(nextState);

    const xpForNextLevel = ProgressionSystem.getXpForNextLevel(level);

    return {
      state: nextState,
      xpGained,
      heartsRewarded: input.missionRewardHearts,
      leveledUp,
      levelProgress: xp / xpForNextLevel,
      xpForNextLevel,
      nextUnlock: ProgressionSystem.getNextUnlock(nextState)
    };
  }

  static getXpForNextLevel(level: number): number {
    return 120 + (level - 1) * 80;
  }

  static getNextUnlock(state = ProgressionSystem.getState()): UnlockProgress {
    const rankedUnlocks = UNLOCK_TEASERS.map((teaser) => ({
      teaser,
      progress: ProgressionSystem.getUnlockProgress(teaser, state),
      target: teaser.target,
      isUnlocked: ProgressionSystem.getUnlockProgress(teaser, state) >= teaser.target
    }));

    return rankedUnlocks.find((unlock) => !unlock.isUnlocked) ?? rankedUnlocks[rankedUnlocks.length - 1];
  }

  private static getUnlockProgress(teaser: UnlockTeaser, state: ProgressionState): number {
    switch (teaser.requirementType) {
      case 'distance':
        return state.bestDistance;
      case 'missions':
        return state.completedMissionIds.length;
      case 'totalHearts':
        return state.totalHearts;
      case 'stage':
        return state.maxStageReached;
      default:
        return 0;
    }
  }
}
