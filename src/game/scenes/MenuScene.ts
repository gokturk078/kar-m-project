import Phaser from 'phaser';
import { COLORS, GAME_HEIGHT, GAME_WIDTH, UI } from '../data/gameConstants';
import { ROMANTIC_MESSAGES } from '../data/romanticMessages';
import { ProgressionSystem } from '../systems/ProgressionSystem';
import { SaveSystem } from '../systems/SaveSystem';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create(): void {
    const progression = ProgressionSystem.getState();
    const nextUnlock = ProgressionSystem.getNextUnlock(progression);

    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, COLORS.backgroundTop).setOrigin(0);
    this.createBackdrop();

    this.add
      .text(GAME_WIDTH / 2, 132, 'Heartpack\nJourney', {
        align: 'center',
        color: '#fff7fb',
        fontFamily: 'Georgia, "Times New Roman", serif',
        fontSize: '48px',
        fontStyle: 'bold',
        lineSpacing: -4
      })
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, 236, ROMANTIC_MESSAGES[0], {
        align: 'center',
        color: '#ffd7e8',
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '16px',
        wordWrap: { width: 290 }
      })
      .setOrigin(0.5);

    this.add.image(GAME_WIDTH / 2, 356, 'player-heartpack').setScale(2.3).setAngle(-8);

    this.createProgressPanel(466, progression, SaveSystem.getBestDistance(), nextUnlock);

    this.createButton(GAME_WIDTH / 2, 620, 'Start Flight', () => {
      this.scene.start('GameScene');
    });
  }

  private createBackdrop(): void {
    for (let index = 0; index < 34; index += 1) {
      this.add
        .circle(
          Phaser.Math.Between(0, GAME_WIDTH),
          Phaser.Math.Between(70, GAME_HEIGHT - 70),
          Phaser.Math.FloatBetween(1, 3),
          Phaser.Math.RND.pick([COLORS.pink, COLORS.lavender, COLORS.cyan]),
          Phaser.Math.FloatBetween(0.18, 0.55)
        )
        .setDepth(0);
    }

    this.add
      .rectangle(0, GAME_HEIGHT - 124, GAME_WIDTH, 124, COLORS.shadow, 0.36)
      .setOrigin(0);
  }

  private createButton(x: number, y: number, label: string, onClick: () => void): void {
    const button = this.add
      .rectangle(x, y, UI.buttonWidth, UI.buttonHeight, COLORS.hotPink, 1)
      .setStrokeStyle(2, COLORS.rose, 0.9)
      .setInteractive({ useHandCursor: true });

    const text = this.add
      .text(x, y, label, {
        color: '#fff7fb',
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '20px',
        fontStyle: '700'
      })
      .setOrigin(0.5);

    button.on(Phaser.Input.Events.POINTER_DOWN, onClick);
    button.on(Phaser.Input.Events.POINTER_OVER, () => button.setFillStyle(COLORS.pink));
    button.on(Phaser.Input.Events.POINTER_OUT, () => button.setFillStyle(COLORS.hotPink));

    this.tweens.add({
      targets: [button, text],
      scaleX: 1.025,
      scaleY: 1.025,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  private createProgressPanel(
    y: number,
    progression: ReturnType<typeof ProgressionSystem.getState>,
    bestDistance: number,
    nextUnlock: ReturnType<typeof ProgressionSystem.getNextUnlock>
  ): void {
    this.add.rectangle(GAME_WIDTH / 2, y, 304, 112, COLORS.navy, 0.72).setStrokeStyle(1, COLORS.lavender, 0.3);
    this.add
      .text(70, y - 34, `Level ${progression.level}`, {
        color: '#fff7fb',
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '18px',
        fontStyle: '700'
      })
      .setOrigin(0, 0.5);
    this.add
      .text(GAME_WIDTH - 70, y - 34, `Best ${Math.max(bestDistance, progression.bestDistance)} m`, {
        color: '#bfb4ff',
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '14px'
      })
      .setOrigin(1, 0.5);
    this.add
      .text(70, y - 4, `Total hearts ${progression.totalHearts}`, {
        color: '#ffd7e8',
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '14px'
      })
      .setOrigin(0, 0.5);
    this.add
      .text(70, y + 30, `Next: ${nextUnlock.teaser.title} (${Math.min(Math.floor(nextUnlock.progress), nextUnlock.target)}/${nextUnlock.target})`, {
        color: '#ffb8d7',
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '12px',
        wordWrap: { width: 250 }
      })
      .setOrigin(0, 0.5);
  }
}
