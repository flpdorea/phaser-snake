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
