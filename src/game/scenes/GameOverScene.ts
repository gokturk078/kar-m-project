import Phaser from 'phaser';
import { COLORS, GAME_HEIGHT, GAME_WIDTH, UI } from '../data/gameConstants';
import { ROMANTIC_MESSAGES } from '../data/romanticMessages';

type GameOverData = {
  distance: number;
  hearts: number;
  bestDistance: number;
};

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOverScene');
  }

  create(data: GameOverData): void {
    const distance = Math.floor(data.distance ?? 0);
    const hearts = data.hearts ?? 0;
    const bestDistance = Math.floor(data.bestDistance ?? distance);

    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, COLORS.backgroundBottom).setOrigin(0);
    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, COLORS.purple, 0.28).setOrigin(0);

    this.add
      .text(GAME_WIDTH / 2, 126, 'Flight Complete', {
        color: '#fff7fb',
        fontFamily: 'Georgia, "Times New Roman", serif',
        fontSize: '39px',
        fontStyle: 'bold'
      })
      .setOrigin(0.5);

    const message = ROMANTIC_MESSAGES[Phaser.Math.Between(0, ROMANTIC_MESSAGES.length - 1)];

    this.add
      .text(GAME_WIDTH / 2, 190, message, {
        align: 'center',
        color: '#ffd7e8',
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '16px',
        wordWrap: { width: 300 }
      })
      .setOrigin(0.5);

    this.createStat(280, 'Distance', `${distance} m`);
    this.createStat(348, 'Hearts', `${hearts}`);
    this.createStat(416, 'Best', `${bestDistance} m`);

    this.createButton(GAME_WIDTH / 2, 544, 'Restart', () => this.scene.start('GameScene'), COLORS.hotPink);
    this.createButton(GAME_WIDTH / 2, 618, 'Menu', () => this.scene.start('MenuScene'), COLORS.purple);
  }

  private createStat(y: number, label: string, value: string): void {
    this.add.rectangle(GAME_WIDTH / 2, y, 286, 48, COLORS.navy, 0.86).setStrokeStyle(1, COLORS.lavender, 0.35);
    this.add
      .text(78, y, label, {
        color: '#bfb4ff',
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '15px'
      })
      .setOrigin(0, 0.5);
    this.add
      .text(GAME_WIDTH - 78, y, value, {
        color: '#fff7fb',
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '21px',
        fontStyle: '700'
      })
      .setOrigin(1, 0.5);
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
