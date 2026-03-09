# TypeScript Migration & Test Suite Design

## Overview

Migrate the Snake game from plain JavaScript to TypeScript with strict type checking, and implement a comprehensive test suite at multiple levels.

## Decisions

- **Build Tool**: Vite - fast, modern, excellent DX with TypeScript and Phaser
- **Test Framework**: Vitest - Vite-native, fast, excellent ESM support
- **TypeScript**: Strict mode enabled for maximum type safety
- **E2E Testing**: Playwright for browser automation

## Architecture

### Project Structure

```
phaser-test/
├── src/
│   ├── main.ts                 # Entry point
│   ├── config/
│   │   └── game.config.ts      # Phaser config
│   ├── scenes/
│   │   ├── MenuScene.ts
│   │   ├── GameScene.ts
│   │   └── GameOverScene.ts
│   ├── models/
│   │   ├── types.ts            # Interfaces & types
│   │   └── theme.ts            # Theme definitions & helpers
│   └── utils/
│       ├── storage.ts          # localStorage helpers
│       └── score.ts            # Score calculations
├── tests/
│   ├── unit/                   # Pure function tests
│   ├── scenes/                 # Scene integration tests
│   └── e2e/                    # Playwright browser tests
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── vitest.config.ts
```

### Type Definitions

```typescript
interface Position {
  x: number;
  y: number;
}

interface Direction {
  x: number;
  y: number;
}

interface Theme {
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

type GameMode = 'classic' | 'timeattack' | 'survival';

interface LevelConfig {
  speed: number;
  obstacles: number;
  foodRequired: number;
}

interface PowerUp extends Position {
  type: 'speed' | 'shield' | 'grow';
}

interface ActiveEffects {
  speed: boolean;
  shield: boolean;
}

interface GameData {
  mode: GameMode;
  score: number;
  level: number;
}
```

## Migration Approach

### Phase 1: Project Setup
1. Initialize npm project with package.json
2. Install dependencies: vite, typescript, phaser, @types/phaser
3. Create tsconfig.json with strict mode
4. Create vite.config.ts for build pipeline
5. Update index.html for Vite

### Phase 2: Type Definitions
1. Create src/models/types.ts with all interfaces
2. Define strict types for all data structures

### Phase 3: Extract Utilities
1. Move theme logic to src/models/theme.ts
2. Move storage functions to src/utils/storage.ts
3. Move score logic to src/utils/score.ts
4. Add proper typing to all functions

### Phase 4: Scene Migration
1. Convert themes.js to src/models/theme.ts
2. Convert MenuScene.js to TypeScript
3. Convert GameScene.js to TypeScript
4. Convert GameOverScene.js to TypeScript
5. Create game.config.ts with Phaser configuration

### Phase 5: Build Verification
1. Ensure TypeScript compiles without errors
2. Verify game runs in browser
3. Clean up old JS files

## Testing Strategy

### Unit Tests (Vitest)

Test pure functions in isolation:

**Theme Functions:**
- getUnlockedThemes() - returns correct themes based on score
- getCurrentTheme() - returns stored theme or default
- setCurrentTheme() - persists theme to localStorage

**Storage Functions:**
- getHighScore() - retrieves correct score per mode
- setHighScore() - updates only when score is higher
- getSavedLevel() - retrieves saved level
- setSavedLevel() - persists level

**Score Functions:**
- Score calculations per game mode

### Scene/Integration Tests (Vitest + Phaser Mocks)

Test scene behavior with mocked Phaser:

- Scene initialization with correct data
- Direction change validation
- Collision detection (walls, obstacles, self)
- Power-up activation effects
- Level progression logic
- Game state transitions

### E2E Tests (Playwright)

Browser automation tests:

- Game loads and displays menu
- Mode selection navigates to game
- Snake movement responds to keyboard
- Game over screen shows score
- High score persists across sessions
- Theme selection works
- Retry and menu navigation

## Dependencies

```json
{
  "dependencies": {
    "phaser": "^3.60.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "vitest": "^1.0.0",
    "@vitest/ui": "^1.0.0",
    "@playwright/test": "^1.40.0",
    "jsdom": "^24.0.0"
  }
}
```

## Configuration Files

### tsconfig.json
- strict: true
- target: ES2020
- module: ESNext
- moduleResolution: bundler
- esModuleInterop: true

### vite.config.ts
- Development server on port 3000
- Build output to dist/
- TypeScript support

### vitest.config.ts
- Environment: jsdom
- Coverage reporting
- Global test APIs

## Success Criteria

1. All code compiles with TypeScript strict mode
2. Game runs identically to JS version
3. Unit test coverage > 80% for utility functions
4. Scene tests cover critical game logic
5. E2E tests cover main user flows
6. Build process is reproducible
