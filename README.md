# Snake Game

A modern Snake game built with Phaser 3, TypeScript, and Vite.

## Features

- **3 Game Modes:**
  - **Classic** - Progress through 10 levels with increasing difficulty
  - **Time Attack** - Score maximum points in 60 seconds
  - **Survival** - Avoid spawning obstacles and survive as long as possible

- **Power-ups:**
  - ⚡ Speed - Temporarily increases movement speed
  - 🛡️ Shield - Temporary invincibility
  - 🌱 Grow - Instantly adds 3 segments

- **5 Unlockable Themes:**
  - Modern (default)
  - Retro (unlocks at 100 points)
  - Neon (unlocks at 250 points)
  - Nature (unlocks at 500 points)
  - Cyberpunk (unlocks at 1000 points)

- **High Score Tracking** - Persistent high scores per game mode

## Tech Stack

- **Phaser 3** - Game framework
- **TypeScript** - Strict mode for type safety
- **Vite** - Build tool and dev server
- **Vitest** - Unit testing
- **Playwright** - E2E testing

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The game will open at http://localhost:3000

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Controls

| Key | Action |
|-----|--------|
| ↑ ↓ ← → | Move snake |
| ESC | Return to menu |
| SPACE | Retry (on game over) |

## Testing

### Unit Tests

```bash
npm test
```

### Test with UI

```bash
npm run test:ui
```

### Test Coverage

```bash
npm run test:coverage
```

### E2E Tests

```bash
npm run test:e2e
```

## Project Structure

```
phaser-test/
├── src/
│   ├── main.ts                 # Entry point
│   ├── config/
│   │   └── game.config.ts      # Phaser configuration
│   ├── scenes/
│   │   ├── MenuScene.ts        # Main menu
│   │   ├── GameScene.ts        # Core game logic
│   │   └── GameOverScene.ts    # Game over screen
│   ├── models/
│   │   ├── types.ts            # TypeScript interfaces
│   │   └── theme.ts            # Theme definitions
│   └── utils/
│       └── storage.ts          # localStorage helpers
├── tests/
│   ├── unit/                   # Vitest unit tests
│   ├── scenes/                 # Scene integration tests
│   └── e2e/                    # Playwright E2E tests
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
└── playwright.config.ts
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm test` | Run unit tests |
| `npm run test:ui` | Run tests with UI |
| `npm run test:coverage` | Run tests with coverage |
| `npm run test:e2e` | Run E2E tests |
| `npm run lint` | TypeScript type check |

## License

MIT
