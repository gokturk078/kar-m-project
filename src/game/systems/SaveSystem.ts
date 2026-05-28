import { STORAGE_KEYS } from '../data/gameConstants';

export class SaveSystem {
  static getBestDistance(): number {
    const rawValue = window.localStorage.getItem(STORAGE_KEYS.bestDistance);
    const parsedValue = rawValue ? Number.parseInt(rawValue, 10) : 0;

    return Number.isFinite(parsedValue) ? parsedValue : 0;
  }

  static setBestDistance(distance: number): number {
    const roundedDistance = Math.max(0, Math.floor(distance));
    const currentBest = SaveSystem.getBestDistance();
    const nextBest = Math.max(currentBest, roundedDistance);

    window.localStorage.setItem(STORAGE_KEYS.bestDistance, String(nextBest));

    return nextBest;
  }
}
