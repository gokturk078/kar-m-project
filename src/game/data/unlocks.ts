export type UnlockRequirementType = 'distance' | 'missions' | 'totalHearts' | 'stage';

export type UnlockTeaser = {
  id: string;
  title: string;
  description: string;
  requirementType: UnlockRequirementType;
  target: number;
};

export const UNLOCK_TEASERS: UnlockTeaser[] = [
  {
    id: 'soft_spark_trail',
    title: 'Soft Spark Trail',
    description: 'Reach 300 m to unlock a future trail style.',
    requirementType: 'distance',
    target: 300
  },
  {
    id: 'neon_heart_trail',
    title: 'Neon Heart Trail',
    description: 'Complete 5 missions to unlock a future neon trail.',
    requirementType: 'missions',
    target: 5
  },
  {
    id: 'dream_background',
    title: 'Dream Background',
    description: 'Collect 150 total hearts to unlock a future background.',
    requirementType: 'totalHearts',
    target: 150
  },
  {
    id: 'electric_love_badge',
    title: 'Electric Love Badge',
    description: 'Reach Electric Heart Lab to unlock a future badge.',
    requirementType: 'stage',
    target: 3
  }
];
