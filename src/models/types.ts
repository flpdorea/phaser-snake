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
