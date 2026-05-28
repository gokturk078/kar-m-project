import Phaser from 'phaser';
import { Player } from '../entities/Player';
import {
  COLLECTIBLES,
  COLORS,
  GAME_HEIGHT,
  GAME_WIDTH,
  OBSTACLES,
  PLAYER,
  UI,
  WORLD
} from '../data/gameConstants';
import { GameplayDirector } from '../systems/GameplayDirector';
import { InputManager } from '../systems/InputManager';
import { MissionSystem } from '../systems/MissionSystem';
import type { HazardPatternSpec, HazardSpawnSpec, HeartPatternSpec, HeartSpawnSpec } from '../systems/PatternFactory';
import { ProgressionSystem, type ProgressionState } from '../systems/ProgressionSystem';
import { SaveSystem } from '../systems/SaveSystem';
import { ScrollManager } from '../systems/ScrollManager';
import { SpawnDirector } from '../systems/SpawnDirector';
import { StageManager } from '../systems/StageManager';

type MovingArcadeObject = Phaser.GameObjects.GameObject & {
  x: number;
  y: number;
  active: boolean;
  destroy: () => void;
  getData: (key: string) => unknown;
  setData: (key: string, value: unknown) => void;
  body: Phaser.Physics.Arcade.Body;
};

type LinkedHazardObject = {
  object: Phaser.GameObjects.GameObject;
  offsetX: number;
  offsetY: number;
};

type ColliderObject =
  | Phaser.Types.Physics.Arcade.GameObjectWithBody
  | Phaser.Physics.Arcade.Body
  | Phaser.Physics.Arcade.StaticBody
  | Phaser.Tilemaps.Tile;

export class GameScene extends Phaser.Scene {
  private inputManager!: InputManager;
  private scrollManager!: ScrollManager;
  private stageManager!: StageManager;
  private gameplayDirector!: GameplayDirector;
  private spawnDirector!: SpawnDirector;
  private player!: Player;
  private hazards!: Phaser.Physics.Arcade.Group;
  private hearts!: Phaser.Physics.Arcade.Group;
  private distanceText!: Phaser.GameObjects.Text;
  private heartsText!: Phaser.GameObjects.Text;
  private bestText!: Phaser.GameObjects.Text;
  private heartsCollected = 0;
  private bestDistance = 0;
  private bestDistanceBeforeRun = 0;
  private highestStageReached = 0;
  private elapsedSeconds = 0;
  private progressionAtRunStart!: ProgressionState;
  private isGameOver = false;

  constructor() {
    super('GameScene');
  }

  create(): void {
    this.isGameOver = false;
    this.heartsCollected = 0;
    this.highestStageReached = 0;
    this.elapsedSeconds = 0;
    this.bestDistance = SaveSystem.getBestDistance();
    this.bestDistanceBeforeRun = this.bestDistance;
    this.progressionAtRunStart = ProgressionSystem.recordFlightStarted();

    this.inputManager = new InputManager(this);
    this.scrollManager = new ScrollManager(this);
    this.stageManager = new StageManager();
    this.scrollManager.applyTheme(this.stageManager.current.theme, 0);
    this.gameplayDirector = new GameplayDirector();
    this.spawnDirector = new SpawnDirector();
    this.player = new Player(this);
    this.hazards = this.physics.add.group({ allowGravity: false, immovable: true });
    this.hearts = this.physics.add.group({ allowGravity: false, immovable: true });

    this.createDangerZones();
    this.createHud();

    this.physics.add.overlap(this.player, this.hazards, this.handleHazardCollision, undefined, this);
    this.physics.add.overlap(this.player, this.hearts, this.handleHeartCollect, undefined, this);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdown, this);
  }

  update(_time: number, delta: number): void {
    if (this.isGameOver) {
      return;
    }

    const deltaSeconds = Math.min(delta / 1000, 0.033);
    const stageUpdate = this.stageManager.update(this.scrollManager.currentDistance);
    const gameplayState = this.gameplayDirector.update(deltaSeconds, this.scrollManager.currentDistance, stageUpdate.stage);
    this.elapsedSeconds = gameplayState.elapsedSeconds;
    this.highestStageReached = Math.max(this.highestStageReached, gameplayState.stageId);

    if (stageUpdate.changed) {
      this.scrollManager.applyTheme(stageUpdate.stage.theme);
      this.showStageTitle(stageUpdate.stage.name);
    }

    this.player.updatePlayer(deltaSeconds, this.inputManager.isThrusting);
    this.scrollManager.update(deltaSeconds, gameplayState.scrollSpeed);

    this.updateSpawns(delta, gameplayState);
    this.updateMovingObjects(deltaSeconds, gameplayState.scrollSpeed);
    this.updateHud();
  }

  private createDangerZones(): void {
    this.add
      .rectangle(0, WORLD.railHeight, GAME_WIDTH, WORLD.dangerInset, COLORS.danger, 0.08)
      .setOrigin(0)
      .setDepth(-8);
    this.add
      .rectangle(0, GAME_HEIGHT - WORLD.railHeight - WORLD.dangerInset, GAME_WIDTH, WORLD.dangerInset, COLORS.danger, 0.08)
      .setOrigin(0)
      .setDepth(-8);

    this.add
      .rectangle(0, PLAYER.topSoftLimit - 10, GAME_WIDTH, 3, COLORS.danger, PLAYER.warningZoneAlpha)
      .setOrigin(0)
      .setDepth(-7);
    this.add
      .rectangle(0, PLAYER.bottomSoftLimit + 10, GAME_WIDTH, 3, COLORS.danger, PLAYER.warningZoneAlpha)
      .setOrigin(0)
      .setDepth(-7);
  }

  private createHud(): void {
    this.add.rectangle(0, 0, GAME_WIDTH, 74, COLORS.shadow, 0.3).setOrigin(0).setDepth(50);

    this.distanceText = this.add
      .text(UI.margin, 18, '0 m', {
        color: '#fff7fb',
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '22px',
        fontStyle: '700'
      })
      .setDepth(51);

    this.heartsText = this.add
      .text(UI.margin, 46, 'Hearts 0', {
        color: '#ffb8d7',
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '15px'
      })
      .setDepth(51);

    this.bestText = this.add
      .text(GAME_WIDTH - UI.margin, 22, `Best ${this.bestDistance} m`, {
        color: '#bfb4ff',
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '15px'
      })
      .setOrigin(1, 0)
      .setDepth(51);
  }

  private updateHud(): void {
    this.distanceText.setText(`${Math.floor(this.scrollManager.currentDistance)} m`);
    this.heartsText.setText(`Hearts ${this.heartsCollected}`);
    this.bestText.setText(`Best ${this.bestDistance} m`);
  }

  private updateSpawns(deltaMs: number, gameplayState: ReturnType<GameplayDirector['update']>): void {
    const request = this.spawnDirector.update(deltaMs, gameplayState);

    if (request.hazardPattern) {
      this.spawnHazardPattern(request.hazardPattern);
    }

    if (request.heartPattern) {
      this.spawnHeartPattern(request.heartPattern);
    }
  }

  private spawnHazardPattern(pattern: HazardPatternSpec): void {
    pattern.hazards.forEach((hazard) => this.spawnHazard(hazard));
  }

  private spawnHazard(spec: HazardSpawnSpec): void {
    if (spec.kind === 'mine') {
      this.spawnMine(spec);
      return;
    }

    const theme = this.stageManager.current.theme;
    const hazard = this.add
      .rectangle(spec.x, spec.y, spec.width, spec.height, COLORS.danger, spec.kind === 'horizontalBeam' ? 0.78 : 0.86)
      .setStrokeStyle(2, theme.accentColor, 0.95)
      .setDepth(12);

    if (spec.kind === 'verticalLaser') {
      this.addVerticalHazardGlow(hazard, spec.height);
    } else {
      this.addHorizontalHazardGlow(hazard, spec.width);
    }

    this.addWarningMarker(hazard, spec.y, spec.kind === 'horizontalBeam' ? spec.width : 34);
    this.physics.add.existing(hazard);

    const body = hazard.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setImmovable(true);
    body.setSize(
      Math.max(6, spec.width - OBSTACLES.collisionPadding),
      Math.max(6, spec.height - OBSTACLES.collisionPadding)
    );

    this.hazards.add(hazard);
  }

  private spawnMine(spec: HazardSpawnSpec): void {
    const theme = this.stageManager.current.theme;
    const mine = this.add.circle(spec.x, spec.y, spec.radius, COLORS.danger, 0.9).setDepth(12);
    const core = this.add.circle(spec.x, spec.y, spec.radius * 0.42, theme.neonColor, 0.82).setDepth(13);
    const ring = this.add.circle(spec.x, spec.y, spec.radius + 8, theme.accentColor, 0.12).setDepth(11);

    mine.setData('linkedObjects', [
      { object: core, offsetX: 0, offsetY: 0 },
      { object: ring, offsetX: 0, offsetY: 0 }
    ] satisfies LinkedHazardObject[]);

    this.addWarningMarker(mine, spec.y, 42);
    this.physics.add.existing(mine);

    const body = mine.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setImmovable(true);
    body.setCircle(spec.radius - 3);

    this.tweens.add({
      targets: [mine, ring],
      scale: { from: 0.92, to: 1.12 },
      duration: 360,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    this.hazards.add(mine);
  }

  private addVerticalHazardGlow(laser: Phaser.GameObjects.Rectangle, height: number): void {
    const theme = this.stageManager.current.theme;
    const topNode = this.add.circle(laser.x, laser.y - height / 2, 12, theme.neonColor, 0.85).setDepth(13);
    const bottomNode = this.add.circle(laser.x, laser.y + height / 2, 12, theme.neonColor, 0.85).setDepth(13);

    laser.setData('linkedObjects', [
      { object: topNode, offsetX: 0, offsetY: -height / 2 },
      { object: bottomNode, offsetX: 0, offsetY: height / 2 }
    ] satisfies LinkedHazardObject[]);

    this.tweens.add({
      targets: [laser, topNode, bottomNode],
      alpha: { from: 0.55, to: 1 },
      duration: 220,
      yoyo: true,
      repeat: -1
    });
  }

  private addHorizontalHazardGlow(beam: Phaser.GameObjects.Rectangle, width: number): void {
    const theme = this.stageManager.current.theme;
    const leftNode = this.add.circle(beam.x - width / 2, beam.y, 9, theme.neonColor, 0.82).setDepth(13);
    const rightNode = this.add.circle(beam.x + width / 2, beam.y, 9, theme.neonColor, 0.82).setDepth(13);

    beam.setData('linkedObjects', [
      { object: leftNode, offsetX: -width / 2, offsetY: 0 },
      { object: rightNode, offsetX: width / 2, offsetY: 0 }
    ] satisfies LinkedHazardObject[]);

    this.tweens.add({
      targets: [beam, leftNode, rightNode],
      alpha: { from: 0.5, to: 1 },
      duration: 180,
      yoyo: true,
      repeat: -1
    });
  }

  private addWarningMarker(hazard: Phaser.GameObjects.Shape, y: number, height: number): void {
    const theme = this.stageManager.current.theme;
    const warning = this.add
      .rectangle(GAME_WIDTH - 8, y, 6, Math.max(32, height), theme.accentColor, 0.75)
      .setDepth(18);

    hazard.setData('warningMarker', warning);

    this.tweens.add({
      targets: warning,
      alpha: { from: 0.2, to: 0.95 },
      duration: OBSTACLES.warningBlinkDuration,
      yoyo: true,
      repeat: -1
    });
  }

  private spawnHeartPattern(pattern: HeartPatternSpec): void {
    pattern.hearts.forEach((heart) => this.spawnHeart(heart));
  }

  private spawnHeart(spec: HeartSpawnSpec): void {
    const heart = this.physics.add
      .sprite(spec.x, spec.y, 'heart-collectible')
      .setDepth(15)
      .setScale(spec.scale);

    heart.body.setAllowGravity(false);
    heart.body.setCircle(15, 5, 6);
    this.hearts.add(heart);

    this.tweens.add({
      targets: heart,
      y: heart.y - 12,
      duration: 620,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  private updateMovingObjects(deltaSeconds: number, scrollSpeed: number): void {
    this.hazards.children.each((child) => {
      const hazard = child as MovingArcadeObject;
      hazard.x -= scrollSpeed * deltaSeconds;
      hazard.body.updateFromGameObject();

      const linkedObjects = hazard.getData('linkedObjects') as LinkedHazardObject[] | undefined;
      linkedObjects?.forEach((entry) => {
        const linked = entry.object as Phaser.GameObjects.Shape;
        linked.x = hazard.x + entry.offsetX;
        linked.y = hazard.y + entry.offsetY;
      });

      const warningMarker = hazard.getData('warningMarker') as Phaser.GameObjects.Rectangle | undefined;
      if (warningMarker && hazard.x <= GAME_WIDTH + 4) {
        warningMarker.destroy();
        hazard.setData('warningMarker', undefined);
      }

      if (hazard.x < OBSTACLES.cleanupX) {
        linkedObjects?.forEach((entry) => entry.object.destroy());
        warningMarker?.destroy();
        hazard.destroy();
      }

      return true;
    });

    this.hearts.children.each((child) => {
      const heart = child as MovingArcadeObject;
      heart.x -= scrollSpeed * deltaSeconds;
      heart.body.updateFromGameObject();

      if (heart.x < COLLECTIBLES.cleanupX) {
        heart.destroy();
      }

      return true;
    });
  }

  private handleHeartCollect(
    _playerObject: ColliderObject,
    heartObject: ColliderObject
  ): void {
    const heart = heartObject as unknown as Phaser.Physics.Arcade.Sprite;
    heart.disableBody(true, false);
    this.heartsCollected += COLLECTIBLES.heartValue;
    this.popScore(heart.x, heart.y);

    this.tweens.add({
      targets: heart,
      scale: 1.55,
      alpha: 0,
      y: heart.y - 22,
      duration: 220,
      ease: 'Back.easeOut',
      onComplete: () => heart.destroy()
    });
  }

  private popScore(x: number, y: number): void {
    const pop = this.add
      .text(x, y - 16, '+1', {
        color: '#fff7fb',
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '18px',
        fontStyle: '700'
      })
      .setOrigin(0.5)
      .setDepth(30);

    this.tweens.add({
      targets: pop,
      y: pop.y - 32,
      alpha: 0,
      duration: 420,
      ease: 'Sine.easeOut',
      onComplete: () => pop.destroy()
    });
  }

  private handleHazardCollision(): void {
    if (this.isGameOver) {
      return;
    }

    this.isGameOver = true;
    this.cameras.main.shake(180, 0.01);
    this.cameras.main.flash(180, 255, 84, 124);

    const finalDistance = Math.floor(this.scrollManager.currentDistance);
    const bestDistance = SaveSystem.setBestDistance(finalDistance);
    const missionResult = MissionSystem.completeRun({
      distance: finalDistance,
      hearts: this.heartsCollected,
      elapsedSeconds: this.elapsedSeconds,
      highestStageReached: this.highestStageReached,
      totalFlights: this.progressionAtRunStart.totalFlights,
      totalHeartsAfterRun: this.progressionAtRunStart.totalHearts + this.heartsCollected,
      bestDistanceBeforeRun: this.bestDistanceBeforeRun
    });
    const progressionResult = ProgressionSystem.recordRun({
      distance: finalDistance,
      hearts: this.heartsCollected,
      bestDistance,
      highestStageReached: this.highestStageReached,
      missionRewardHearts: missionResult.rewardHearts,
      missionRewardXp: missionResult.rewardXp,
      completedMissionIds: missionResult.completedMissionIds
    });

    this.time.delayedCall(260, () => {
      this.scene.start('GameOverScene', {
        distance: finalDistance,
        hearts: this.heartsCollected,
        bestDistance,
        highestStageReached: this.highestStageReached,
        completedMissions: missionResult.completedMissions,
        progression: progressionResult
      });
    });
  }

  private showStageTitle(stageName: string): void {
    const title = this.add
      .text(GAME_WIDTH / 2, 128, stageName, {
        align: 'center',
        color: '#fff7fb',
        fontFamily: 'Georgia, "Times New Roman", serif',
        fontSize: '28px',
        fontStyle: 'bold'
      })
      .setOrigin(0.5)
      .setDepth(70)
      .setAlpha(0);
    const subtitle = this.add
      .text(GAME_WIDTH / 2, 162, 'new section', {
        color: '#ffd7e8',
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '13px'
      })
      .setOrigin(0.5)
      .setDepth(70)
      .setAlpha(0);

    this.tweens.add({
      targets: [title, subtitle],
      alpha: { from: 0, to: 1 },
      y: '-=8',
      duration: 280,
      yoyo: true,
      hold: 760,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        title.destroy();
        subtitle.destroy();
      }
    });
  }

  private shutdown(): void {
    this.inputManager?.destroy();
    this.scrollManager?.destroy();
  }
}
