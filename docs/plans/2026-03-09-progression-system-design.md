# Snake Game Progression System - Design Document

## Overview
A comprehensive progression system that rewards players with unlocks as they improve, while providing variety through different game modes and increasing difficulty.

## Level System
- **10 levels** with increasing difficulty
- **Difficulty scaling** per level:
  - Base speed increases (Level 1: 150ms → Level 10: 80ms)
  - More obstacles spawn (Level 1: 0 → Level 10: 5 static walls)
  - Food required per level increases (5 → 15 items)
- **Progress tracking**: Visual progress bar shows items collected
- **Level complete screen**: Shows stats, unlocks earned

## Unlockable Themes/Skins
- **Starter**: Modern (current teal/snake)
- **Unlock at 100 pts**: Retro (green on black, pixel style)
- **Unlock at 250 pts**: Neon (purple/pink glow effects)
- **Unlock at 500 pts**: Nature (earth tones, organic shapes)
- **Unlock at 1000 pts**: Cyberpunk (yellow/cyan, glitch effects)

## Game Modes
1. **Classic**: Standard snake gameplay
2. **Time Attack**: 60 seconds, get as many points as possible
3. **Survival**: Infinite mode, obstacles spawn over time, see how long you last

## Data Persistence
- High scores saved to localStorage
- Unlocked themes saved
- Current level progress saved
- Separate high score per mode

## Acceptance Criteria
1. Main menu displays with mode selection
2. Level system shows current level and progress
3. Each level has correct difficulty parameters
4. Food requirement displays and tracks correctly
5. Level complete screen shows when requirements met
6. Game over shows stats and unlocks earned
7. Theme selector shows locked/unlocked states
8. Unlocking happens at correct score thresholds
9. All 5 themes render correctly
10. Time Attack mode ends at 60 seconds
11. Survival mode spawns obstacles over time
12. High scores persist across sessions
13. Theme preferences persist across sessions
