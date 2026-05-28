# Heartpack Journey

Heartpack Journey is a private romantic endless jetpack runner built as a personal gift. The Phase 1 build establishes the arcade foundation: a left-side player, fast right-to-left world motion, smooth hold-to-thrust jetpack movement, hearts, hazards, distance, and a restartable loop.

## Tech Stack

- Vite
- TypeScript
- Phaser 3
- Mobile-first web canvas
- Prepared for future Vercel deployment and Capacitor Android packaging

## Commands

```bash
npm run dev
npm run build
npm run preview
```

## Folder Structure

```text
src/
  main.ts
  game/
    config/
      gameConfig.ts
    scenes/
      BootScene.ts
      PreloadScene.ts
      MenuScene.ts
      GameScene.ts
      GameOverScene.ts
    entities/
      Player.ts
    systems/
      InputManager.ts
      ScrollManager.ts
      DifficultyManager.ts
      SaveSystem.ts
    data/
      gameConstants.ts
      romanticMessages.ts
  styles/
    global.css

public/
  assets/
    images/
      backgrounds/
      memories/
      player/
      obstacles/
      ui/
    audio/
    particles/
```

## Current Playable Features

- Complete scene flow: boot, preload, menu, gameplay, game over, restart, and menu return.
- Smooth jetpack controls using hold touch, mouse, or Space.
- Player stays near the left side while the world scrolls right to left.
- Parallax background, speed lines, and moving corridor rails.
- Slowly increasing scroll speed and distance tracking.
- Simple non-pipe electric hazards that collide with the player.
- Heart collectibles with score feedback.
- Best distance saved with localStorage.
- Mobile-first canvas scaling and touch scroll prevention.

## 8-Phase Roadmap

1. Foundation and correct jetpack runner feel
2. Full obstacle director and hazard variety
3. Hearts, rewards, combo, and economy
4. Game feel, particles, juice, and audio
5. Power-ups, missions, and replayability
6. Romantic photo/memory system
7. Premium UI/UX and mobile polish
8. Vercel + Capacitor Android gift build
# kar-m-project
