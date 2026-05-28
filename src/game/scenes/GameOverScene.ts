import Phaser from 'phaser';
import { COLORS, GAME_HEIGHT, GAME_WIDTH, UI } from '../data/gameConstants';
import type { MissionDefinition } from '../data/missions';
import { ROMANTIC_MESSAGES } from '../data/romanticMessages';
import { ProgressionSystem, type ProgressionRunResult } from '../systems/ProgressionSystem';

type GameOverData = {
  distance: number;
  hearts: number;
  bestDistance: number;
  highestStageReached: number;
  completedMissions: MissionDefinition[];
  progression: ProgressionRunResult;
};

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOverScene');
  }

  create(data: Partial<GameOverData>): void {
    const distance = Math.floor(data.distance ?? 0);
    const hearts = data.hearts ?? 0;
    const bestDistance = Math.floor(data.bestDistance ?? distance);
    const completedMissions = data.completedMissions ?? [];
    const progression = data.progression ?? this.createFallbackProgression();

    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, COLORS.backgroundBottom).setOrigin(0);
    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, COLORS.purple, 0.28).setOrigin(0);

    this.add
      .text(GAME_WIDTH / 2, 62, 'Flight Complete', {
        color: '#fff7fb',
        fontFamily: 'Georgia, "Times New Roman", serif',
        fontSize: '34px',
        fontStyle: 'bold'
      })
      .setOrigin(0.5);

    const message = ROMANTIC_MESSAGES[Phaser.Math.Between(0, ROMANTIC_MESSAGES.length - 1)];

    this.add
      .text(GAME_WIDTH / 2, 105, message, {
        align: 'center',
        color: '#ffd7e8',
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '14px',
        wordWrap: { width: 300 }
      })
      .setOrigin(0.5);

    this.createStat(156, 'Distance', `${distance} m`);
    this.createStat(202, 'Run Hearts', `${hearts}`);
    this.createStat(248, 'Best', `${bestDistance} m`);
    this.createStat(294, 'Total Hearts', `${progression.state.totalHearts}`);

    this.createXpPanel(356, progression);
    this.createMissionPanel(462, completedMissions);
    this.createUnlockPanel(586, progression);

    this.createButton(GAME_WIDTH / 2, 716, 'Restart', () => this.scene.start('GameScene'), COLORS.hotPink);
    this.createButton(GAME_WIDTH / 2, 782, 'Menu', () => this.scene.start('MenuScene'), COLORS.purple);
  }

  private createFallbackProgression(): ProgressionRunResult {
    const state = ProgressionSystem.getState();
    const xpForNextLevel = ProgressionSystem.getXpForNextLevel(state.level);

    return {
      state,
      xpGained: 0,
      heartsRewarded: 0,
      leveledUp: false,
      levelProgress: state.xp / xpForNextLevel,
      xpForNextLevel,
      nextUnlock: ProgressionSystem.getNextUnlock(state)
    };
  }

  private createStat(y: number, label: string, value: string): void {
    this.add.rectangle(GAME_WIDTH / 2, y, 302, 36, COLORS.navy, 0.84).setStrokeStyle(1, COLORS.lavender, 0.28);
    this.add
      .text(60, y, label, {
        color: '#bfb4ff',
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '13px'
      })
      .setOrigin(0, 0.5);
    this.add
      .text(GAME_WIDTH - 60, y, value, {
        color: '#fff7fb',
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '18px',
        fontStyle: '700'
      })
      .setOrigin(1, 0.5);
  }

  private createXpPanel(y: number, progression: ProgressionRunResult): void {
    this.add.rectangle(GAME_WIDTH / 2, y, 302, 76, COLORS.navy, 0.84).setStrokeStyle(1, COLORS.pink, 0.32);
    this.add
      .text(60, y - 22, `Level ${progression.state.level}${progression.leveledUp ? '  Level up' : ''}`, {
        color: '#fff7fb',
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '16px',
        fontStyle: '700'
      })
      .setOrigin(0, 0.5);
    this.add
      .text(GAME_WIDTH - 60, y - 22, `+${progression.xpGained} XP`, {
        color: '#ffd7e8',
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '14px'
      })
      .setOrigin(1, 0.5);

    const barWidth = 242;
    const progressWidth = Phaser.Math.Clamp(progression.levelProgress, 0, 1) * barWidth;
    this.add.rectangle(GAME_WIDTH / 2, y + 12, barWidth, 10, COLORS.shadow, 0.72);
    this.add.rectangle(74, y + 12, progressWidth, 10, COLORS.hotPink, 0.95).setOrigin(0, 0.5);
    this.add
      .text(GAME_WIDTH / 2, y + 31, `${progression.state.xp}/${progression.xpForNextLevel} XP`, {
        color: '#bfb4ff',
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '12px'
      })
      .setOrigin(0.5);
  }

  private createMissionPanel(y: number, completedMissions: MissionDefinition[]): void {
    this.add.rectangle(GAME_WIDTH / 2, y, 302, 84, COLORS.navy, 0.84).setStrokeStyle(1, COLORS.rose, 0.28);
    this.add
      .text(60, y - 26, 'Completed Missions', {
        color: '#fff7fb',
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '15px',
        fontStyle: '700'
      })
      .setOrigin(0, 0.5);

    const missionText =
      completedMissions.length > 0
        ? completedMissions
            .slice(0, 2)
            .map((mission) => `${mission.title}  +${mission.rewardXp} XP`)
            .join('\n')
        : 'No mission completed this run';

    this.add
      .text(60, y + 10, missionText, {
        color: completedMissions.length > 0 ? '#ffd7e8' : '#bfb4ff',
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '12px',
        lineSpacing: 5,
        wordWrap: { width: 270 }
      })
      .setOrigin(0, 0.5);
  }

  private createUnlockPanel(y: number, progression: ProgressionRunResult): void {
    const unlock = progression.nextUnlock;

    this.add.rectangle(GAME_WIDTH / 2, y, 302, 68, COLORS.navy, 0.84).setStrokeStyle(1, COLORS.gold, 0.3);
    this.add
      .text(60, y - 18, `Next: ${unlock.teaser.title}`, {
        color: '#fff7fb',
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '14px',
        fontStyle: '700'
      })
      .setOrigin(0, 0.5);
    this.add
      .text(60, y + 13, `${Math.min(Math.floor(unlock.progress), unlock.target)}/${unlock.target} - ${unlock.teaser.description}`, {
        color: '#ffd7e8',
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '11px',
        wordWrap: { width: 270 }
      })
      .setOrigin(0, 0.5);
  }

  private createButton(x: number, y: number, label: string, onClick: () => void, color: number): void {
    const button = this.add
      .rectangle(x, y, UI.buttonWidth, UI.buttonHeight, color, 1)
      .setStrokeStyle(2, COLORS.rose, 0.7)
      .setInteractive({ useHandCursor: true });
    this.add
      .text(x, y, label, {
        color: '#fff7fb',
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '19px',
        fontStyle: '700'
      })
      .setOrigin(0.5);

    button.on(Phaser.Input.Events.POINTER_DOWN, onClick);
  }
}
