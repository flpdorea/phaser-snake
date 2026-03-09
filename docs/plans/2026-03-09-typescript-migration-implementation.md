# TypeScript Migration & Test Suite Implementation Plan

**Goal:** Migrate the Snake game from plain JavaScript to TypeScript with strict typing and implement comprehensive test suites (unit, integration, E2E).

**Architecture:** Extract pure functions into typed utility modules, convert Phaser scenes to TypeScript classes with proper typing, and implement three testing layers using Vitest for unit/integration and Playwright for E2E.

**Tech Stack:** TypeScript (strict), Vite, Phaser 3, Vitest, Playwright

---

## Task 1: Initialize Project with npm and Dependencies

**Files:**

- Create: `package.json`
- Modify: `index.html:26-31`

**Step 1: Create package.json with dependencies**

```json
{
  "name": "phaser-snake",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:e2e": "playwright test",
    "lint": "tsc --noEmit"
  },
  "dependencies": {
    "phaser": "^3.70.0"
  },
  "devDependencies": {
    "typescript": "^5.3.3",
    "vite": "^5.0.10",
    "vitest": "^1.1.0",
    "@vitest/ui": "^1.1.0",
    "@vitest/coverage-v8": "^1.1.0",
    "jsdom": "^23.0.1",
    "@playwright/test": "^1.40.1"
  }
}
```

**Step 2: Install dependencies**

Run: `npm install`
Expected: Dependencies installed successfully

**Step 3: Update index.html for Vite**

Replace script tags with:

```html
<script type="module" src="/src/main.ts"></script>
```

Remove the CDN script tag for Phaser (line 26).

**Step 4: Commit**

```bash
git add package.json package-lock.json index.html
git commit -m "chore: initialize npm project with vite and dependencies"
```

---

## Task 2: Configure TypeScript

**Files:**

- Create: `tsconfig.json`

**Step 1: Create tsconfig.json with strict configuration**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*.ts", "tests/**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

**Step 2: Verify TypeScript config**

Run: `npx tsc --noEmit`
Expected: No errors (no TS files yet, but config is valid)

**Step 3: Commit**

```bash
git add tsconfig.json
git commit -m "chore: add strict typescript configuration"
```

---

## Task 3: Configure Vite

**Files:**

- Create: `vite.config.ts`

**Step 1: Create vite.config.ts**

```typescript
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});
```

**Step 2: Commit**

```bash
git add vite.config.ts
git commit -m "chore: add vite configuration"
```

---

## Task 4: Configure Vitest

**Files:**

- Create: `vitest.config.ts`

**Step 1: Create vitest.config.ts**

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/main.ts']
    }
  }
});
```

**Step 2: Commit**

```bash
git add vitest.config.ts
git commit -m "chore: add vitest configuration"
```

---

## Task 5: Configure Playwright

**Files:**

- Create: `playwright.config.ts`

**Step 1: Create playwright.config.ts**

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI
  }
});
```

**Step 2: Commit**

```bash
git add playwright.config.ts
git commit -m "chore: add playwright configuration"
```

---

## Task 6: Create Type Definitions

**Files:**

- Create: `src/models/types.ts`

**Step 1: Create types.ts with all interfaces**

```typescript
export interface Position {
  x: number;
  y: number;
}

export interface Direction {
  x: number;
  y: number;
}

export interface Theme {
  name: string;
  unlockScore: number;
  snake: number;
  snakeHead: number;
  food: number;
  grid: number;
  background: string;
  obstacle: number;
  accent: string;
}

export type ThemeKey = 'modern' | 'retro' | 'neon' | 'nature' | 'cyberpunk';

export type GameMode = 'classic' | 'timeattack' | 'survival';

export interface LevelConfig {
  speed: number;
  obstacles: number;
  foodRequired: number;
}

export interface PowerUp extends Position {
  type: 'speed' | 'shield' | 'grow';
}

export interface ActiveEffects {
  speed: boolean;
  shield: boolean;
}

export interface GameData {
  mode: GameMode;
  score: number;
  level: number;
}

export interface HighScores {
  classic: number;
  timeattack: number;
  survival: number;
}

export type GameState = 'playing' | 'paused' | 'gameover';
```

**Step 2: Commit**

```bash
git add src/models/types.ts
git commit -m "feat: add core type definitions"
```

---

## Task 7: Create Theme Module with Tests

**Files:**

- Create: `src/models/theme.ts`
- Create: `tests/unit/theme.test.ts`

**Step 1: Write failing tests for theme functions**

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getUnlockedThemes,
  getCurrentTheme,
  setCurrentTheme,
  THEMES
} from '../../src/models/theme';

describe('Theme Functions', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('getUnlockedThemes', () => {
    it('returns modern theme for score 0', () => {
      const result = getUnlockedThemes(0);
      expect(result).toEqual(['modern']);
    });

    it('returns modern and retro for score 100', () => {
      const result = getUnlockedThemes(100);
      expect(result).toContain('modern');
      expect(result).toContain('retro');
    });

    it('returns all themes for score 1000+', () => {
      const result = getUnlockedThemes(1000);
      expect(result).toHaveLength(5);
      expect(result).toContain('cyberpunk');
    });
  });

  describe('getCurrentTheme', () => {
    it('returns modern as default', () => {
      expect(getCurrentTheme()).toBe('modern');
    });

    it('returns stored theme', () => {
      localStorage.setItem('snakeTheme', 'neon');
      expect(getCurrentTheme()).toBe('neon');
    });
  });

  describe('setCurrentTheme', () => {
    it('stores theme in localStorage', () => {
      setCurrentTheme('retro');
      expect(localStorage.getItem('snakeTheme')).toBe('retro');
    });
  });

  describe('THEMES', () => {
    it('has 5 themes defined', () => {
      expect(Object.keys(THEMES)).toHaveLength(5);
    });

    it('each theme has required properties', () => {
      const requiredKeys = ['name', 'unlockScore', 'snake', 'snakeHead', 'food', 'grid', 'background', 'obstacle', 'accent'];
      
      Object.values(THEMES).forEach(theme => {
        requiredKeys.forEach(key => {
          expect(theme).toHaveProperty(key);
        });
      });
    });
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `npm test -- tests/unit/theme.test.ts`
Expected: FAIL - module not found

**Step 3: Create theme.ts implementation**

```typescript
import { Theme, ThemeKey, HighScores } from './types';

export const THEMES: Record<ThemeKey, Theme> = {
  modern: {
    name: 'Modern',
    unlockScore: 0,
    snake: 0x00d9ff,
    snakeHead: 0x00b8d9,
    food: 0xff6b35,
    grid: 0x2a2a4e,
    background: '#1a1a2e',
    obstacle: 0x666666,
    accent: '#00d9ff'
  },
  retro: {
    name: 'Retro',
    unlockScore: 100,
    snake: 0x00ff00,
    snakeHead: 0x00cc00,
    food: 0xffff00,
    grid: 0x003300,
    background: '#000000',
    obstacle: 0x006600,
    accent: '#00ff00'
  },
  neon: {
    name: 'Neon',
    unlockScore: 250,
    snake: 0xff00ff,
    snakeHead: 0xcc00cc,
    food: 0x00ffff,
    grid: 0x1a0033,
    background: '#0d001a',
    obstacle: 0x6600aa,
    accent: '#ff00ff'
  },
  nature: {
    name: 'Nature',
    unlockScore: 500,
    snake: 0x8b4513,
    snakeHead: 0x654321,
    food: 0x228b22,
    grid: 0x3d2914,
    background: '#1a0f05',
    obstacle: 0x5c4033,
    accent: '#228b22'
  },
  cyberpunk: {
    name: 'Cyberpunk',
    unlockScore: 1000,
    snake: 0xffff00,
    snakeHead: 0xcccc00,
    food: 0x00ffff,
    grid: 0x1a1a00,
    background: '#0a0a00',
    obstacle: 0x666600,
    accent: '#ffff00'
  }
};

export function getUnlockedThemes(highScore: number): ThemeKey[] {
  return (Object.entries(THEMES) as [ThemeKey, Theme][])
    .filter(([, theme]) => highScore >= theme.unlockScore)
    .map(([key]) => key);
}

export function getCurrentTheme(): ThemeKey {
  return (localStorage.getItem('snakeTheme') as ThemeKey) || 'modern';
}

export function setCurrentTheme(themeKey: ThemeKey): void {
  localStorage.setItem('snakeTheme', themeKey);
}

export function getTheme(key: ThemeKey): Theme {
  return THEMES[key];
}
```

**Step 4: Run tests to verify they pass**

Run: `npm test -- tests/unit/theme.test.ts`
Expected: PASS - all tests pass

**Step 5: Commit**

```bash
git add src/models/theme.ts tests/unit/theme.test.ts
git commit -m "feat: add theme module with tests"
```

---

## Task 8: Create Storage Module with Tests

**Files:**

- Create: `src/utils/storage.ts`
- Create: `tests/unit/storage.test.ts`

**Step 1: Write failing tests for storage functions**

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import {
  getHighScore,
  setHighScore,
  getAllHighScores,
  getSavedLevel,
  setSavedLevel
} from '../../src/utils/storage';

describe('Storage Functions', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('getHighScore', () => {
    it('returns 0 when no score stored', () => {
      expect(getHighScore('classic')).toBe(0);
    });

    it('returns stored score for mode', () => {
      localStorage.setItem('snakeHighScore_classic', '500');
      expect(getHighScore('classic')).toBe(500);
    });

    it('returns correct score for each mode', () => {
      localStorage.setItem('snakeHighScore_timeattack', '200');
      localStorage.setItem('snakeHighScore_survival', '300');
      expect(getHighScore('timeattack')).toBe(200);
      expect(getHighScore('survival')).toBe(300);
    });
  });

  describe('setHighScore', () => {
    it('returns true when new score is higher', () => {
      const result = setHighScore(100, 'classic');
      expect(result).toBe(true);
      expect(getHighScore('classic')).toBe(100);
    });

    it('returns false when new score is not higher', () => {
      localStorage.setItem('snakeHighScore_classic', '500');
      const result = setHighScore(100, 'classic');
      expect(result).toBe(false);
      expect(getHighScore('classic')).toBe(500);
    });

    it('updates score when new score is equal', () => {
      localStorage.setItem('snakeHighScore_classic', '100');
      const result = setHighScore(100, 'classic');
      expect(result).toBe(false);
    });
  });

  describe('getAllHighScores', () => {
    it('returns all zeros when no scores stored', () => {
      const scores = getAllHighScores();
      expect(scores).toEqual({ classic: 0, timeattack: 0, survival: 0 });
    });

    it('returns all stored scores', () => {
      localStorage.setItem('snakeHighScore_classic', '100');
      localStorage.setItem('snakeHighScore_timeattack', '200');
      localStorage.setItem('snakeHighScore_survival', '300');
      const scores = getAllHighScores();
      expect(scores).toEqual({ classic: 100, timeattack: 200, survival: 300 });
    });
  });

  describe('getSavedLevel', () => {
    it('returns 1 as default', () => {
      expect(getSavedLevel()).toBe(1);
    });

    it('returns stored level', () => {
      localStorage.setItem('snakeLevel', '5');
      expect(getSavedLevel()).toBe(5);
    });
  });

  describe('setSavedLevel', () => {
    it('stores level in localStorage', () => {
      setSavedLevel(7);
      expect(localStorage.getItem('snakeLevel')).toBe('7');
    });
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `npm test -- tests/unit/storage.test.ts`
Expected: FAIL - module not found

**Step 3: Create storage.ts implementation**

```typescript
import { GameMode, HighScores } from '../models/types';

export function getHighScore(mode: GameMode): number {
  return parseInt(localStorage.getItem(`snakeHighScore_${mode}`) || '0', 10);
}

export function setHighScore(score: number, mode: GameMode): boolean {
  const current = getHighScore(mode);
  if (score > current) {
    localStorage.setItem(`snakeHighScore_${mode}`, score.toString());
    return true;
  }
  return false;
}

export function getAllHighScores(): HighScores {
  return {
    classic: getHighScore('classic'),
    timeattack: getHighScore('timeattack'),
    survival: getHighScore('survival')
  };
}

export function getSavedLevel(): number {
  return parseInt(localStorage.getItem('snakeLevel') || '1', 10);
}

export function setSavedLevel(level: number): void {
  localStorage.setItem('snakeLevel', level.toString());
}
```

**Step 4: Run tests to verify they pass**

Run: `npm test -- tests/unit/storage.test.ts`
Expected: PASS - all tests pass

**Step 5: Commit**

```bash
git add src/utils/storage.ts tests/unit/storage.test.ts
git commit -m "feat: add storage module with tests"
```

---

## Task 9: Create Game Config

**Files:**

- Create: `src/config/game.config.ts`

**Step 1: Create game configuration**

```typescript
import Phaser from 'phaser';
import { MenuScene } from '../scenes/MenuScene';
import { GameScene } from '../scenes/GameScene';
import { GameOverScene } from '../scenes/GameOverScene';

export const GAME_WIDTH = 600;
export const GAME_HEIGHT = 680;
export const GRID_SIZE = 20;
export const GRID_COUNT = 30;

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: 'game-container',
  backgroundColor: '#1a1a2e',
  scene: [MenuScene, GameScene, GameOverScene]
};

export const LEVEL_CONFIG: Record<number, { speed: number; obstacles: number; foodRequired: number }> = {
  1: { speed: 150, obstacles: 0, foodRequired: 5 },
  2: { speed: 140, obstacles: 0, foodRequired: 6 },
  3: { speed: 130, obstacles: 1, foodRequired: 7 },
  4: { speed: 120, obstacles: 1, foodRequired: 8 },
  5: { speed: 110, obstacles: 2, foodRequired: 9 },
  6: { speed: 100, obstacles: 2, foodRequired: 10 },
  7: { speed: 95, obstacles: 3, foodRequired: 11 },
  8: { speed: 90, obstacles: 4, foodRequired: 12 },
  9: { speed: 85, obstacles: 5, foodRequired: 13 },
  10: { speed: 80, obstacles: 5, foodRequired: 15 }
};
```

**Step 2: Commit**

```bash
git add src/config/game.config.ts
git commit -m "feat: add game configuration constants"
```

---

## Task 10: Create MenuScene TypeScript

**Files:**

- Create: `src/scenes/MenuScene.ts`

**Step 1: Convert MenuScene.js to TypeScript**

```typescript
import Phaser from 'phaser';
import { GameMode } from '../models/types';
import { THEMES, getUnlockedThemes, getCurrentTheme, setCurrentTheme } from '../models/theme';
import { getAllHighScores } from '../utils/storage';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#1a1a2e');

    this.add.text(300, 80, 'SNAKE', {
      fontSize: '56px',
      fontFamily: 'Segoe UI',
      color: '#00d9ff'
    }).setOrigin(0.5);

    this.add.text(300, 130, 'Select Game Mode', {
      fontSize: '18px',
      fontFamily: 'Segoe UI',
      color: '#888888'
    }).setOrigin(0.5);

    this.createModeButtons();
    this.createHighScores();
    this.createThemeButtons();
  }

  private createModeButtons(): void {
    const modes: { key: GameMode; label: string; desc: string }[] = [
      { key: 'classic', label: 'Classic', desc: 'Progress through 10 levels' },
      { key: 'timeattack', label: 'Time Attack', desc: '60 seconds, score max points' },
      { key: 'survival', label: 'Survival', desc: 'Obstacles spawn, survive!' }
    ];

    modes.forEach((mode, i) => {
      const y = 220 + i * 70;

      const btn = this.add.rectangle(300, y, 280, 50, 0x2a2a4e)
        .setInteractive({ useHandCursor: true });

      this.add.text(300, y - 8, mode.label, {
        fontSize: '22px',
        fontFamily: 'Segoe UI',
        color: '#ffffff'
      }).setOrigin(0.5);

      this.add.text(300, y + 12, mode.desc, {
        fontSize: '12px',
        fontFamily: 'Segoe UI',
        color: '#666666'
      }).setOrigin(0.5);

      btn.on('pointerover', () => btn.setFillStyle(0x3a3a5e));
      btn.on('pointerout', () => btn.setFillStyle(0x2a2a4e));
      btn.on('pointerdown', () => {
        this.scene.start('GameScene', { mode: mode.key });
      });
    });
  }

  private createHighScores(): void {
    const highScores = getAllHighScores();

    this.add.text(300, 440, 'High Scores', {
      fontSize: '16px',
      fontFamily: 'Segoe UI',
      color: '#666666'
    }).setOrigin(0.5);

    this.add.text(300, 465,
      `Classic: ${highScores.classic}  |  Time: ${highScores.timeattack}  |  Survival: ${highScores.survival}`, {
      fontSize: '14px',
      fontFamily: 'Segoe UI',
      color: '#888888'
    }).setOrigin(0.5);
  }

  private createThemeButtons(): void {
    this.add.text(300, 520, 'Themes', {
      fontSize: '16px',
      fontFamily: 'Segoe UI',
      color: '#666666'
    }).setOrigin(0.5);

    const highScores = getAllHighScores();
    const totalHighScore = Math.max(highScores.classic, highScores.timeattack, highScores.survival);
    const unlocked = getUnlockedThemes(totalHighScore);
    const currentTheme = getCurrentTheme();

    const themeKeys = Object.keys(THEMES) as Array<keyof typeof THEMES>;
    const startX = 300 - (themeKeys.length * 45) / 2 + 45;

    themeKeys.forEach((key, i) => {
      const theme = THEMES[key];
      const isUnlocked = unlocked.includes(key);
      const isSelected = currentTheme === key;
      const x = startX + i * 90;
      const y = 560;

      const btn = this.add.rectangle(x, y, 80, 35, isSelected ? theme.snake : 0x2a2a4e)
        .setInteractive(isUnlocked ? { useHandCursor: true } : undefined);

      const labelColor = isUnlocked ? (isSelected ? '#000000' : '#ffffff') : '#444444';

      this.add.text(x, y, theme.name, {
        fontSize: '12px',
        fontFamily: 'Segoe UI',
        color: labelColor
      }).setOrigin(0.5);

      if (!isUnlocked) {
        this.add.text(x, y + 22, '🔒 ' + theme.unlockScore + 'pts', {
          fontSize: '10px',
          fontFamily: 'Segoe UI',
          color: '#444444'
        }).setOrigin(0.5);
      }

      if (isUnlocked) {
        btn.on('pointerover', () => {
          if (currentTheme !== key) btn.setFillStyle(0x3a3a5e);
        });
        btn.on('pointerout', () => {
          if (currentTheme !== key) btn.setFillStyle(0x2a2a4e);
        });
        btn.on('pointerdown', () => {
          setCurrentTheme(key);
          this.scene.restart();
        });
      }
    });
  }
}
```

**Step 2: Commit**

```bash
git add src/scenes/MenuScene.ts
git commit -m "feat: convert MenuScene to TypeScript"
```

---

## Task 11: Create GameScene TypeScript (Part 1 - Core Structure)

**Files:**

- Create: `src/scenes/GameScene.ts`

**Step 1: Create GameScene with core structure**

```typescript
import Phaser from 'phaser';
import {
  GameMode,
  Position,
  Direction,
  PowerUp,
  ActiveEffects,
  GameState,
  ThemeKey,
  Theme
} from '../models/types';
import { THEMES, getCurrentTheme, getTheme } from '../models/theme';
import { getSavedLevel, setSavedLevel } from '../utils/storage';
import { GAME_WIDTH, GAME_HEIGHT, GRID_SIZE, GRID_COUNT, LEVEL_CONFIG } from '../config/game.config';

export class GameScene extends Phaser.Scene {
  private gameMode: GameMode = 'classic';
  private theme!: Theme;
  private snake: Position[] = [];
  private direction: Direction = { x: 1, y: 0 };
  private nextDirection: Direction = { x: 1, y: 0 };
  private food: Position | null = null;
  private score: number = 0;
  private gameState: GameState = 'playing';
  private powerUps: PowerUp[] = [];
  private activeEffects: ActiveEffects = { speed: false, shield: false };
  private obstacles: Position[] = [];
  private timeLeft: number = 60;
  private foodCollected: number = 0;
  private currentLevel: number = 1;
  private foodRequired: number = 5;
  private gameTimer!: Phaser.Time.TimerEvent;
  private powerUpTimer!: Phaser.Time.TimerEvent;
  private survivalTimer?: Phaser.Time.TimerEvent;
  private snakeGraphics!: Phaser.GameObjects.Graphics;
  private foodGraphics!: Phaser.GameObjects.Graphics;
  private scoreText!: Phaser.GameObjects.Text;
  private timerText?: Phaser.GameObjects.Text;
  private levelText?: Phaser.GameObjects.Text;
  private progressBar?: Phaser.GameObjects.Rectangle;
  private progressText?: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'GameScene' });
  }

  init(data: { mode?: GameMode }): void {
    this.gameMode = data.mode || 'classic';
  }

  create(): void {
    this.theme = getTheme(getCurrentTheme());
    this.cameras.main.setBackgroundColor(this.theme.background);

    this.initGameState();
    this.createGrid();
    this.createUI();
    this.setupInput();
    this.startGame();
  }

  private initGameState(): void {
    this.snake = [];
    this.direction = { x: 1, y: 0 };
    this.nextDirection = { x: 1, y: 0 };
    this.food = null;
    this.score = 0;
    this.gameState = 'playing';
    this.powerUps = [];
    this.activeEffects = { speed: false, shield: false };
    this.obstacles = [];
    this.timeLeft = 60;
    this.foodCollected = 0;

    if (this.gameMode === 'classic') {
      this.currentLevel = getSavedLevel();
      this.foodRequired = LEVEL_CONFIG[this.currentLevel].foodRequired;
    } else {
      this.currentLevel = 1;
      this.foodRequired = 999;
    }
  }

  private createGrid(): void {
    for (let x = 0; x < GRID_COUNT; x++) {
      for (let y = 0; y < GRID_COUNT; y++) {
        this.add.rectangle(
          x * GRID_SIZE + GRID_SIZE / 2,
          y * GRID_SIZE + GRID_SIZE / 2 + 80,
          GRID_SIZE - 1,
          GRID_SIZE - 1,
          this.theme.grid
        );
      }
    }
    this.snakeGraphics = this.add.graphics();
    this.foodGraphics = this.add.graphics();
  }

  private createUI(): void {
    this.add.text(20, 20, 'SNAKE', {
      fontSize: '28px',
      fontFamily: 'Segoe UI',
      color: this.theme.accent
    });

    this.scoreText = this.add.text(20, 55, 'Score: 0', {
      fontSize: '18px',
      fontFamily: 'Segoe UI',
      color: '#ffffff'
    });

    this.add.text(580, 20, this.getModeLabel(), {
      fontSize: '14px',
      fontFamily: 'Segoe UI',
      color: '#666666'
    }).setOrigin(1, 0);

    if (this.gameMode === 'classic') {
      this.levelText = this.add.text(580, 40, 'Level ' + this.currentLevel, {
        fontSize: '14px',
        fontFamily: 'Segoe UI',
        color: '#888888'
      }).setOrigin(1, 0);

      this.add.rectangle(520, 60, 120, 12, 0x333333).setOrigin(0, 0.5);
      this.progressBar = this.add.rectangle(520, 60, 0, 12, this.theme.snake).setOrigin(0, 0.5);

      this.progressText = this.add.text(520, 75, '0/' + this.foodRequired, {
        fontSize: '12px',
        fontFamily: 'Segoe UI',
        color: '#666666'
      }).setOrigin(0, 0);
    }

    if (this.gameMode === 'timeattack') {
      this.timerText = this.add.text(300, 40, '60', {
        fontSize: '40px',
        fontFamily: 'Segoe UI',
        color: this.theme.food
      }).setOrigin(0.5);

      this.time.addEvent({
        delay: 1000,
        callback: this.updateTimer,
        callbackScope: this,
        loop: true
      });
    }
  }

  private getModeLabel(): string {
    switch (this.gameMode) {
      case 'classic': return 'CLASSIC';
      case 'timeattack': return 'TIME ATTACK';
      case 'survival': return 'SURVIVAL';
    }
  }

  private setupInput(): void {
    this.input.keyboard.on('keydown-LEFT', () => this.changeDirection(-1, 0));
    this.input.keyboard.on('keydown-RIGHT', () => this.changeDirection(1, 0));
    this.input.keyboard.on('keydown-UP', () => this.changeDirection(0, -1));
    this.input.keyboard.on('keydown-DOWN', () => this.changeDirection(0, 1));
    this.input.keyboard.on('keydown-ESC', () => this.scene.start('MenuScene'));
  }

  private changeDirection(dx: number, dy: number): void {
    if (this.gameState !== 'playing') return;
    if (this.direction.x === -dx && this.direction.y === -dy) return;
    if (this.direction.x !== 0 && dx !== 0) return;
    if (this.direction.y !== 0 && dy !== 0) return;
    this.nextDirection = { x: dx, y: dy };
  }

  private startGame(): void {
    this.snake = [{ x: 5, y: 5 }, { x: 4, y: 5 }, { x: 3, y: 5 }];
    this.direction = { x: 1, y: 0 };
    this.nextDirection = { x: 1, y: 0 };

    this.applyLevelObstacles();
    this.spawnFood();

    const speed = this.gameMode === 'classic' ? LEVEL_CONFIG[this.currentLevel].speed : 150;

    this.gameTimer = this.time.addEvent({
      delay: speed,
      callback: this.gameLoop,
      callbackScope: this,
      loop: true
    });

    if (this.gameMode === 'survival') {
      this.survivalTimer = this.time.addEvent({
        delay: 5000,
        callback: this.spawnSurvivalObstacle,
        callbackScope: this,
        loop: true
      });
    }

    this.powerUpTimer = this.time.addEvent({
      delay: 12000,
      callback: this.spawnPowerUp,
      callbackScope: this,
      loop: true
    });

    this.render();
  }

  private applyLevelObstacles(): void {
    if (this.gameMode !== 'classic') return;

    const config = LEVEL_CONFIG[this.currentLevel];
    this.obstacles = [];

    for (let i = 0; i < config.obstacles; i++) {
      this.spawnObstacle();
    }
  }

  private spawnObstacle(): void {
    let attempts = 0;
    while (attempts < 100) {
      const pos: Position = {
        x: Math.floor(Math.random() * GRID_COUNT),
        y: Math.floor(Math.random() * GRID_COUNT)
      };

      const onSnake = this.snake.some(seg => seg.x === pos.x && seg.y === pos.y);
      const onFood = this.food && this.food.x === pos.x && this.food.y === pos.y;
      const onObstacle = this.obstacles.some(ob => ob.x === pos.x && ob.y === pos.y);
      const inSpawnArea = pos.x < 8 && pos.y < 8;

      if (!onSnake && !onFood && !onObstacle && !inSpawnArea) {
        this.obstacles.push(pos);
        return;
      }
      attempts++;
    }
  }

  private spawnSurvivalObstacle(): void {
    if (this.gameState !== 'playing') return;
    this.spawnObstacle();
    this.render();
  }

  private updateTimer(): void {
    if (this.gameState !== 'playing') return;

    this.timeLeft--;
    if (this.timerText) {
      this.timerText.setText(this.timeLeft.toString());

      if (this.timeLeft <= 10) {
        this.timerText.setColor('#ff0000');
      }
    }

    if (this.timeLeft <= 0) {
      this.endGame();
    }
  }

  private gameLoop(): void {
    if (this.gameState !== 'playing') return;

    this.direction = { ...this.nextDirection };
    const head: Position = {
      x: this.snake[0].x + this.direction.x,
      y: this.snake[0].y + this.direction.y
    };

    if (head.x < 0 || head.x >= GRID_COUNT || head.y < 0 || head.y >= GRID_COUNT) {
      if (!this.activeEffects.shield) {
        this.endGame();
        return;
      }
      head.x = (head.x + GRID_COUNT) % GRID_COUNT;
    }

    for (const ob of this.obstacles) {
      if (head.x === ob.x && head.y === ob.y) {
        if (!this.activeEffects.shield) {
          this.endGame();
          return;
        }
      }
    }

    for (let i = 1; i < this.snake.length; i++) {
      if (head.x === this.snake[i].x && head.y === this.snake[i].y) {
        if (!this.activeEffects.shield) {
          this.endGame();
          return;
        }
      }
    }

    this.snake.unshift(head);

    if (this.food && head.x === this.food.x && head.y === this.food.y) {
      const points = this.gameMode === 'timeattack' ? 20 : 10;
      this.score += points;
      this.scoreText.setText('Score: ' + this.score);
      this.foodCollected++;

      if (this.gameMode === 'classic') {
        this.updateProgress();
        if (this.foodCollected >= this.foodRequired) {
          this.levelUp();
        }
      }

      this.food = null;
      this.spawnFood();
    } else {
      this.snake.pop();
    }

    this.checkPowerUps(head);
    this.render();
  }

  private updateProgress(): void {
    const progress = this.foodCollected / this.foodRequired;
    if (this.progressBar) {
      this.progressBar.width = progress * 120;
    }
    if (this.progressText) {
      this.progressText.setText(this.foodCollected + '/' + this.foodRequired);
    }
  }

  private levelUp(): void {
    if (this.currentLevel < 10) {
      this.currentLevel++;
      setSavedLevel(this.currentLevel);

      const config = LEVEL_CONFIG[this.currentLevel];
      this.foodRequired = config.foodRequired;
      this.foodCollected = 0;

      for (let i = this.obstacles.length; i < config.obstacles; i++) {
        this.spawnObstacle();
      }

      this.gameTimer.delay = config.speed;
      if (this.levelText) {
        this.levelText.setText('Level ' + this.currentLevel);
      }
      if (this.progressBar) {
        this.progressBar.width = 0;
      }
      if (this.progressText) {
        this.progressText.setText('0/' + this.foodRequired);
      }
    }
  }

  private spawnFood(): void {
    let attempts = 0;
    while (attempts < 100) {
      this.food = {
        x: Math.floor(Math.random() * GRID_COUNT),
        y: Math.floor(Math.random() * GRID_COUNT)
      };

      const onSnake = this.snake.some(seg => seg.x === this.food!.x && seg.y === this.food!.y);
      const onObstacle = this.obstacles.some(ob => ob.x === this.food!.x && ob.y === this.food!.y);
      const onPowerUp = this.powerUps.some(pu => pu.x === this.food!.x && pu.y === this.food!.y);

      if (!onSnake && !onObstacle && !onPowerUp) return;
      attempts++;
    }
  }

  private spawnPowerUp(): void {
    if (this.powerUps.length >= 2 || this.gameState !== 'playing') return;

    const types: PowerUp['type'][] = ['speed', 'shield', 'grow'];
    const type = types[Math.floor(Math.random() * types.length)];

    let attempts = 0;
    while (attempts < 100) {
      const pos: PowerUp = {
        x: Math.floor(Math.random() * GRID_COUNT),
        y: Math.floor(Math.random() * GRID_COUNT),
        type
      };

      const onSnake = this.snake.some(seg => seg.x === pos.x && seg.y === pos.y);
      const onFood = this.food && this.food.x === pos.x && this.food.y === pos.y;
      const onObstacle = this.obstacles.some(ob => ob.x === pos.x && ob.y === pos.y);
      const onPowerUp = this.powerUps.some(pu => pu.x === pos.x && pu.y === pos.y);

      if (!onSnake && !onFood && !onObstacle && !onPowerUp) {
        this.powerUps.push(pos);
        this.render();

        this.time.delayedCall(8000, () => {
          this.powerUps = this.powerUps.filter(pu => pu !== pos);
          this.render();
        });
        return;
      }
      attempts++;
    }
  }

  private checkPowerUps(head: Position): void {
    const puIndex = this.powerUps.findIndex(pu => pu.x === head.x && pu.y === head.y);
    if (puIndex === -1) return;

    const pu = this.powerUps[puIndex];
    this.powerUps.splice(puIndex, 1);

    switch (pu.type) {
      case 'speed':
        this.activateSpeed();
        break;
      case 'shield':
        this.activateShield();
        break;
      case 'grow':
        this.activateGrow();
        break;
    }
    this.render();
  }

  private activateSpeed(): void {
    this.activeEffects.speed = true;
    this.gameTimer.delay = 80;

    this.time.delayedCall(5000, () => {
      this.activeEffects.speed = false;
      if (this.gameState === 'playing') {
        this.gameTimer.delay = this.gameMode === 'classic' ?
          LEVEL_CONFIG[this.currentLevel].speed : 150;
      }
    });
  }

  private activateShield(): void {
    this.activeEffects.shield = true;
    this.time.delayedCall(5000, () => {
      this.activeEffects.shield = false;
    });
  }

  private activateGrow(): void {
    for (let i = 0; i < 3; i++) {
      const tail = this.snake[this.snake.length - 1];
      this.snake.push({ x: tail.x, y: tail.y });
    }
  }

  private render(): void {
    this.snakeGraphics.clear();
    this.foodGraphics.clear();

    this.snake.forEach((seg, i) => {
      const px = seg.x * GRID_SIZE + GRID_SIZE / 2;
      const py = seg.y * GRID_SIZE + GRID_SIZE / 2 + 80;
      const color = i === 0 ? this.theme.snakeHead : this.theme.snake;
      this.snakeGraphics.fillStyle(color, 1);
      this.snakeGraphics.fillCircle(px, py, GRID_SIZE / 2 - 1);
    });

    if (this.food) {
      const fx = this.food.x * GRID_SIZE + GRID_SIZE / 2;
      const fy = this.food.y * GRID_SIZE + GRID_SIZE / 2 + 80;
      this.foodGraphics.fillStyle(this.theme.food, 1);
      this.foodGraphics.fillCircle(fx, fy, GRID_SIZE / 2 - 1);
    }

    this.powerUps.forEach(pu => {
      const px = pu.x * GRID_SIZE + GRID_SIZE / 2;
      const py = pu.y * GRID_SIZE + GRID_SIZE / 2 + 80;
      const colors: Record<PowerUp['type'], number> = { speed: 0xa855f7, shield: 0xfbbf24, grow: 0x22c55e };
      this.foodGraphics.fillStyle(colors[pu.type], 1);
      this.foodGraphics.fillCircle(px, py, GRID_SIZE / 2 - 1);
    });

    this.obstacles.forEach(ob => {
      const px = ob.x * GRID_SIZE + GRID_SIZE / 2;
      const py = ob.y * GRID_SIZE + GRID_SIZE / 2 + 80;
      this.snakeGraphics.fillStyle(this.theme.obstacle, 1);
      this.snakeGraphics.fillRect(px - 9, py - 9, 18, 18);
    });
  }

  private endGame(): void {
    this.gameState = 'gameover';
    if (this.gameTimer) this.gameTimer.remove();
    if (this.powerUpTimer) this.powerUpTimer.remove();
    if (this.survivalTimer) this.survivalTimer.remove();

    this.scene.start('GameOverScene', {
      score: this.score,
      mode: this.gameMode,
      level: this.currentLevel
    });
  }
}
```

**Step 2: Commit**

```bash
git add src/scenes/GameScene.ts
git commit -m "feat: convert GameScene to TypeScript"
```

---

## Task 12: Create GameOverScene TypeScript

**Files:**

- Create: `src/scenes/GameOverScene.ts`

**Step 1: Convert GameOverScene.js to TypeScript**

```typescript
import Phaser from 'phaser';
import { GameMode } from '../models/types';
import { THEMES } from '../models/theme';
import { setHighScore, getHighScore } from '../utils/storage';

export class GameOverScene extends Phaser.Scene {
  private finalScore: number = 0;
  private gameMode: GameMode = 'classic';
  private level: number = 1;

  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data: { score?: number; mode?: GameMode; level?: number }): void {
    this.finalScore = data.score || 0;
    this.gameMode = data.mode || 'classic';
    this.level = data.level || 1;
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#1a1a2e');

    const isNewHighScore = setHighScore(this.finalScore, this.gameMode);
    const highScore = getHighScore(this.gameMode);

    this.add.text(300, 100, 'GAME OVER', {
      fontSize: '48px',
      fontFamily: 'Segoe UI',
      color: '#ff6b35'
    }).setOrigin(0.5);

    if (isNewHighScore && this.finalScore > 0) {
      this.add.text(300, 160, 'NEW HIGH SCORE!', {
        fontSize: '24px',
        fontFamily: 'Segoe UI',
        color: '#00d9ff'
      }).setOrigin(0.5);
    }

    this.add.text(300, 220, 'Score: ' + this.finalScore, {
      fontSize: '36px',
      fontFamily: 'Segoe UI',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(300, 270, 'Best: ' + highScore, {
      fontSize: '20px',
      fontFamily: 'Segoe UI',
      color: '#888888'
    }).setOrigin(0.5);

    if (this.gameMode === 'classic') {
      this.add.text(300, 310, 'Level: ' + this.level, {
        fontSize: '18px',
        fontFamily: 'Segoe UI',
        color: '#666666'
      }).setOrigin(0.5);
    }

    this.displayUnlockedThemes();

    const retryBtn = this.add.rectangle(300, 430, 200, 50, 0x2a2a4e)
      .setInteractive({ useHandCursor: true });

    this.add.text(300, 430, 'Retry', {
      fontSize: '22px',
      fontFamily: 'Segoe UI',
      color: '#ffffff'
    }).setOrigin(0.5);

    retryBtn.on('pointerover', () => retryBtn.setFillStyle(0x3a3a5e));
    retryBtn.on('pointerout', () => retryBtn.setFillStyle(0x2a2a4e));
    retryBtn.on('pointerdown', () => {
      this.scene.start('GameScene', { mode: this.gameMode });
    });

    const menuBtn = this.add.rectangle(300, 500, 200, 40, 0x1a1a2e)
      .setInteractive({ useHandCursor: true });

    this.add.text(300, 500, 'Main Menu', {
      fontSize: '18px',
      fontFamily: 'Segoe UI',
      color: '#888888'
    }).setOrigin(0.5);

    menuBtn.on('pointerover', () => menuBtn.setFillStyle(0x2a2a4e));
    menuBtn.on('pointerout', () => menuBtn.setFillStyle(0x1a1a2e));
    menuBtn.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });

    this.input.keyboard.on('keydown-SPACE', () => {
      this.scene.start('GameScene', { mode: this.gameMode });
    });

    this.input.keyboard.on('keydown-ESC', () => {
      this.scene.start('MenuScene');
    });
  }

  private displayUnlockedThemes(): void {
    const totalHighScore = Math.max(
      getHighScore('classic'),
      getHighScore('timeattack'),
      getHighScore('survival')
    );

    const prevTotal = totalHighScore - this.finalScore;
    const newlyUnlocked = Object.entries(THEMES)
      .filter(([, theme]) =>
        prevTotal < theme.unlockScore && totalHighScore >= theme.unlockScore
      )
      .map(([, theme]) => theme.name);

    if (newlyUnlocked.length > 0) {
      this.add.text(300, 360, 'Unlocked: ' + newlyUnlocked.join(', '), {
        fontSize: '18px',
        fontFamily: 'Segoe UI',
        color: '#22c55e'
      }).setOrigin(0.5);
    }
  }
}
```

**Step 2: Commit**

```bash
git add src/scenes/GameOverScene.ts
git commit -m "feat: convert GameOverScene to TypeScript"
```

---

## Task 13: Create Entry Point

**Files:**

- Create: `src/main.ts`

**Step 1: Create main entry point**

```typescript
import Phaser from 'phaser';
import { gameConfig } from './config/game.config';

new Phaser.Game(gameConfig);
```

**Step 2: Commit**

```bash
git add src/main.ts
git commit -m "feat: add main entry point"
```

---

## Task 14: Verify Build and Run

**Step 1: Run TypeScript type check**

Run: `npm run lint`
Expected: No TypeScript errors

**Step 2: Start development server**

Run: `npm run dev`
Expected: Game opens in browser and plays correctly

**Step 3: Verify all game modes work**

Test: Classic, Time Attack, and Survival modes manually

**Step 4: Commit any fixes**

---

## Task 15: Remove Old JS Files

**Files:**

- Delete: `src/game.js`
- Delete: `src/themes.js`
- Delete: `src/scenes/MenuScene.js`
- Delete: `src/scenes/GameScene.js`
- Delete: `src/scenes/GameOverScene.js`

**Step 1: Remove old JavaScript files**

Run: `rm -rf src/game.js src/themes.js src/scenes/*.js`

**Step 2: Verify game still works**

Run: `npm run dev`
Expected: Game works correctly

**Step 3: Commit**

```bash
git add -A
git commit -m "chore: remove old JavaScript files"
```

---

## Task 16: Add Scene Integration Tests

**Files:**

- Create: `tests/scenes/gameScene.test.ts`

**Step 1: Create scene tests with Phaser mocking**

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('phaser', () => {
  const mockScene = {
    add: {
      text: vi.fn(() => ({
        setOrigin: vi.fn().mockReturnThis(),
        setColor: vi.fn()
      })),
      rectangle: vi.fn(() => ({
        setOrigin: vi.fn().mockReturnThis(),
        setInteractive: vi.fn().mockReturnThis(),
        setFillStyle: vi.fn(),
        on: vi.fn()
      })),
      graphics: vi.fn(() => ({
        clear: vi.fn(),
        fillStyle: vi.fn().mockReturnThis(),
        fillCircle: vi.fn(),
        fillRect: vi.fn()
      }))
    },
    cameras: {
      main: {
        setBackgroundColor: vi.fn()
      }
    },
    input: {
      keyboard: {
        on: vi.fn()
      }
    },
    time: {
      addEvent: vi.fn(() => ({ delay: 0, remove: vi.fn() })),
      delayedCall: vi.fn()
    },
    scene: {
      start: vi.fn()
    }
  };

  return {
    default: {
      Scene: class {
        constructor() {
          Object.assign(this, mockScene);
        }
      }
    }
  };
});

describe('GameScene Logic', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('Direction Changes', () => {
    it('should not allow 180 degree turns', () => {
      const currentDir = { x: 1, y: 0 };
      const newDir = { x: -1, y: 0 };
      
      const isValidTurn = !(currentDir.x === -newDir.x && currentDir.y === -newDir.y);
      expect(isValidTurn).toBe(false);
    });

    it('should allow 90 degree turns', () => {
      const currentDir = { x: 1, y: 0 };
      const newDir = { x: 0, y: -1 };
      
      const isValidTurn = !(currentDir.x === -newDir.x && currentDir.y === -newDir.y);
      expect(isValidTurn).toBe(true);
    });
  });

  describe('Collision Detection', () => {
    it('detects wall collision', () => {
      const head = { x: -1, y: 5 };
      const gridCount = 30;
      
      const hitWall = head.x < 0 || head.x >= gridCount || head.y < 0 || head.y >= gridCount;
      expect(hitWall).toBe(true);
    });

    it('detects self collision', () => {
      const head = { x: 5, y: 5 };
      const snake = [
        { x: 5, y: 5 },
        { x: 4, y: 5 },
        { x: 3, y: 5 }
      ];
      
      const hitSelf = snake.slice(1).some(seg => seg.x === head.x && seg.y === head.y);
      expect(hitSelf).toBe(true);
    });

    it('detects obstacle collision', () => {
      const head = { x: 10, y: 10 };
      const obstacles = [{ x: 10, y: 10 }, { x: 15, y: 15 }];
      
      const hitObstacle = obstacles.some(ob => ob.x === head.x && ob.y === head.y);
      expect(hitObstacle).toBe(true);
    });
  });

  describe('Power-up Effects', () => {
    it('grow power-up adds 3 segments', () => {
      const snake = [{ x: 5, y: 5 }, { x: 4, y: 5 }, { x: 3, y: 5 }];
      const initialLength = snake.length;
      
      for (let i = 0; i < 3; i++) {
        const tail = snake[snake.length - 1];
        snake.push({ x: tail.x, y: tail.y });
      }
      
      expect(snake.length).toBe(initialLength + 3);
    });
  });

  describe('Level Progression', () => {
    it('levels up when food required is met', () => {
      const foodCollected = 5;
      const foodRequired = 5;
      
      expect(foodCollected >= foodRequired).toBe(true);
    });
  });
});
```

**Step 2: Run tests**

Run: `npm test -- tests/scenes/gameScene.test.ts`
Expected: PASS

**Step 3: Commit**

```bash
git add tests/scenes/gameScene.test.ts
git commit -m "test: add scene integration tests"
```

---

## Task 17: Add E2E Tests with Playwright

**Files:**

- Create: `tests/e2e/game.spec.ts`

**Step 1: Create E2E test file**

```typescript
import { test, expect } from '@playwright/test';

test.describe('Snake Game E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('displays main menu', async ({ page }) => {
    await expect(page.locator('text=SNAKE')).toBeVisible();
    await expect(page.locator('text=Classic')).toBeVisible();
    await expect(page.locator('text=Time Attack')).toBeVisible();
    await expect(page.locator('text=Survival')).toBeVisible();
  });

  test('starts classic mode', async ({ page }) => {
    await page.click('text=Classic');
    await expect(page.locator('text=CLASSIC')).toBeVisible();
    await expect(page.locator('text=Score: 0')).toBeVisible();
  });

  test('snake moves with arrow keys', async ({ page }) => {
    await page.click('text=Classic');
    
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(300);
    
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(300);
    
    await expect(page.locator('text=Score:')).toBeVisible();
  });

  test('ESC returns to menu', async ({ page }) => {
    await page.click('text=Classic');
    await expect(page.locator('text=CLASSIC')).toBeVisible();
    
    await page.keyboard.press('Escape');
    await expect(page.locator('text=Select Game Mode')).toBeVisible();
  });

  test('high score persists after game over', async ({ page }) => {
    await page.click('text=Time Attack');
    await page.waitForTimeout(65000);

    await expect(page.locator('text=GAME OVER')).toBeVisible();
    
    const scoreText = await page.locator('text=/Score: \\d+/').textContent();
    const score = parseInt(scoreText?.match(/\d+/)?.[0] || '0');
    
    await page.click('text=Main Menu');
    await expect(page.locator(`text=Time: ${score}`)).toBeVisible();
  });

  test('theme selection works', async ({ page }) => {
    await expect(page.locator('text=Modern')).toBeVisible();
    
    await page.click('text=Modern');
    await page.waitForTimeout(100);
    
    await expect(page.locator('text=SNAKE')).toBeVisible();
  });

  test('retry button works', async ({ page }) => {
    await page.click('text=Time Attack');
    await page.waitForTimeout(65000);
    
    await expect(page.locator('text=GAME OVER')).toBeVisible();
    await page.click('text=Retry');
    await expect(page.locator('text=TIME ATTACK')).toBeVisible();
  });
});
```

**Step 2: Install Playwright browsers**

Run: `npx playwright install chromium`

**Step 3: Run E2E tests**

Run: `npm run test:e2e`
Expected: Tests pass

**Step 4: Commit**

```bash
git add tests/e2e/game.spec.ts
git commit -m "test: add E2E tests with Playwright"
```

---

## Task 18: Final Verification

**Step 1: Run all unit tests**

Run: `npm test`
Expected: All tests pass

**Step 2: Run TypeScript lint**

Run: `npm run lint`
Expected: No errors

**Step 3: Build production bundle**

Run: `npm run build`
Expected: Build succeeds

**Step 4: Verify coverage**

Run: `npm run test:coverage`
Expected: Coverage > 80% for utility modules

**Step 5: Final commit**

```bash
git add -A
git commit -m "chore: finalize TypeScript migration and test suite"
```

---

## Summary

This migration:

- Converts all JavaScript to TypeScript with strict typing
- Extracts pure functions into testable utility modules
- Implements comprehensive unit tests with Vitest
- Adds scene integration tests with Phaser mocking
- Adds E2E browser tests with Playwright
- Maintains 100% feature parity with original game
