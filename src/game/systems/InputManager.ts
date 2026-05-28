export class InputManager {
  private readonly scene: Phaser.Scene;
  private readonly spaceKey: Phaser.Input.Keyboard.Key | null;
  private pointerHeld = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.spaceKey = scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE) ?? null;

    scene.input.on(Phaser.Input.Events.POINTER_DOWN, this.handlePointerDown, this);
    scene.input.on(Phaser.Input.Events.POINTER_UP, this.handlePointerUp, this);
    scene.input.on(Phaser.Input.Events.POINTER_OUT, this.handlePointerUp, this);
    scene.input.on(Phaser.Input.Events.POINTER_UP_OUTSIDE, this.handlePointerUp, this);
  }

  get isThrusting(): boolean {
    return this.pointerHeld || Boolean(this.spaceKey?.isDown);
  }

  destroy(): void {
    this.scene.input.off(Phaser.Input.Events.POINTER_DOWN, this.handlePointerDown, this);
    this.scene.input.off(Phaser.Input.Events.POINTER_UP, this.handlePointerUp, this);
    this.scene.input.off(Phaser.Input.Events.POINTER_OUT, this.handlePointerUp, this);
    this.scene.input.off(Phaser.Input.Events.POINTER_UP_OUTSIDE, this.handlePointerUp, this);
    this.spaceKey?.destroy();
  }

  private handlePointerDown(pointer: Phaser.Input.Pointer): void {
    pointer.event?.preventDefault();
    this.pointerHeld = true;
  }

  private handlePointerUp(pointer: Phaser.Input.Pointer): void {
    pointer.event?.preventDefault();
    this.pointerHeld = false;
  }
}
