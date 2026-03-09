# Snake Game - Design Document

## Overview
A modern Snake game built with Phaser 3 featuring vibrant visuals, smooth animations, and power-up mechanics.

## Visual Style
- **Modern clean aesthetic**: Rounded snake segments with subtle gradients
- **Color palette**: 
  - Background: Dark charcoal (#1a1a2e)
  - Snake: Vibrant teal (#00d9ff) with glow effect
  - Food: Warm orange (#ff6b35)
  - Power-ups: Purple (#a855f7), Gold (#fbbf24)
- **Grid**: Subtle grid lines for visual guidance

## Gameplay Mechanics
- **Core**: Classic snake movement - arrow keys to control
- **Scoring**: +10 points per food item
- **Power-ups** (appear randomly every 10-15 seconds):
  - ⚡ **Speed Boost** (purple): Snake moves faster for 5 seconds
  - 🛡️ **Shield** (gold): Invincible for 5 seconds (pass through self)
  - ➕ **Extra Length** (green): Grow by 3 segments instantly

## Game States
- Start screen with "Press SPACE to Start"
- Playing state with live score
- Game over screen with final score and restart option

## Controls
- Arrow keys: Change direction
- Space: Start game / Restart after game over
- No opposite direction turns allowed (can't reverse into self)

## Acceptance Criteria
1. Game loads and displays start screen
2. Snake moves continuously in current direction
3. Arrow keys change snake direction (no 180° turns)
4. Food spawns randomly and can be eaten to grow snake
5. Three power-up types spawn periodically with distinct visual effects
6. Power-ups activate correct effects and expire after duration
7. Game ends on wall collision (unless shielded)
8. Game ends on self collision (unless shielded)
9. Score displays and updates in real-time
10. Game over screen shows final score and allows restart
