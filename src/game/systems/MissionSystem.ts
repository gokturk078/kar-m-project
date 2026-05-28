import { DEFAULT_ACTIVE_MISSIONS, MISSION_DEFINITIONS, type MissionDefinition } from '../data/missions';
import { STORAGE_KEYS } from '../data/gameConstants';

export type MissionRunStats = {
  distance: number;
  hearts: number;
  elapsedSeconds: number;
  highestStageReached: number;
  totalFlights: number;
  totalHeartsAfterRun: number;
  bestDistanceBeforeRun: number;
};

export type MissionProgressView = {
  definition: MissionDefinition;
  progress: number;
  isCompleted: boolean;
};

export type MissionCompletionResult = {
  activeMissions: MissionProgressView[];
  completedMissions: MissionDefinition[];
  rewardHearts: number;
  rewardXp: number;
  completedMissionIds: string[];
};

type MissionStorageState = {
  activeMissionIds: string[];
  completedMissionIds: string[];
};

const DEFAULT_MISSION_STATE: MissionStorageState = {
  activeMissionIds: [...DEFAULT_ACTIVE_MISSIONS],
  completedMissionIds: []
};

export class MissionSystem {
  static getActiveMissions(stats?: MissionRunStats): MissionProgressView[] {
    const missionState = MissionSystem.getMissionState();

    return missionState.activeMissionIds
      .map((id) => MISSION_DEFINITIONS.find((mission) => mission.id === id))
      .filter((mission): mission is MissionDefinition => Boolean(mission))
      .map((definition) => {
        const progress = stats ? MissionSystem.getProgress(definition, stats) : 0;

        return {
          definition,
          progress,
          isCompleted: progress >= definition.target
        };
      });
  }

  static completeRun(stats: MissionRunStats): MissionCompletionResult {
    const missionState = MissionSystem.getMissionState();
    const activeMissions = MissionSystem.getActiveMissions(stats);
    const completedMissions = activeMissions
      .filter((mission) => mission.isCompleted)
      .map((mission) => mission.definition)
      .filter((definition) => !missionState.completedMissionIds.includes(definition.id));
    const completedMissionIds = Array.from(
      new Set([...missionState.completedMissionIds, ...completedMissions.map((mission) => mission.id)])
    );
    const activeMissionIds = MissionSystem.replaceCompletedMissions(
      missionState.activeMissionIds,
      completedMissions.map((mission) => mission.id),
      completedMissionIds
    );

    MissionSystem.saveMissionState({
      activeMissionIds,
      completedMissionIds
    });

    return {
      activeMissions,
      completedMissions,
      rewardHearts: completedMissions.reduce((total, mission) => total + mission.rewardHearts, 0),
      rewardXp: completedMissions.reduce((total, mission) => total + mission.rewardXp, 0),
      completedMissionIds: completedMissions.map((mission) => mission.id)
    };
  }

  private static getMissionState(): MissionStorageState {
    const rawValue = window.localStorage.getItem(STORAGE_KEYS.missions);

    if (!rawValue) {
      return { ...DEFAULT_MISSION_STATE, activeMissionIds: [...DEFAULT_MISSION_STATE.activeMissionIds] };
    }

    try {
      const parsedValue = JSON.parse(rawValue) as Partial<MissionStorageState>;

      return {
        activeMissionIds:
          Array.isArray(parsedValue.activeMissionIds) && parsedValue.activeMissionIds.length > 0
            ? parsedValue.activeMissionIds
            : [...DEFAULT_ACTIVE_MISSIONS],
        completedMissionIds: Array.isArray(parsedValue.completedMissionIds) ? parsedValue.completedMissionIds : []
      };
    } catch {
      return { ...DEFAULT_MISSION_STATE, activeMissionIds: [...DEFAULT_MISSION_STATE.activeMissionIds] };
    }
  }

  private static saveMissionState(state: MissionStorageState): void {
    window.localStorage.setItem(STORAGE_KEYS.missions, JSON.stringify(state));
  }

  private static replaceCompletedMissions(
    activeMissionIds: string[],
    completedMissionIdsThisRun: string[],
    allCompletedMissionIds: string[]
  ): string[] {
    const nextActiveIds = activeMissionIds.filter((id) => !completedMissionIdsThisRun.includes(id));
    const availableMissions = MISSION_DEFINITIONS.filter(
      (mission) => !nextActiveIds.includes(mission.id) && !allCompletedMissionIds.includes(mission.id)
    );

    while (nextActiveIds.length < 3 && availableMissions.length > 0) {
      const nextMission = availableMissions.shift();

      if (nextMission) {
        nextActiveIds.push(nextMission.id);
      }
    }

    while (nextActiveIds.length < 3) {
      const recycledMission = MISSION_DEFINITIONS.find((mission) => !nextActiveIds.includes(mission.id));

      if (!recycledMission) {
        break;
      }

      nextActiveIds.push(recycledMission.id);
    }

    return nextActiveIds;
  }

  private static getProgress(definition: MissionDefinition, stats: MissionRunStats): number {
    switch (definition.type) {
      case 'collectHeartsRun':
        return stats.hearts;
      case 'reachDistanceRun':
        return stats.distance;
      case 'surviveSecondsRun':
        return stats.elapsedSeconds;
      case 'startFlightsTotal':
        return stats.totalFlights;
      case 'reachStageRun':
        return stats.highestStageReached;
      case 'collectTotalHearts':
        return stats.totalHeartsAfterRun;
      case 'beatBestDistanceRun':
        return stats.distance > stats.bestDistanceBeforeRun ? 1 : 0;
      default:
        return 0;
    }
  }
}
