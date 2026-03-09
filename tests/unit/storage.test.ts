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
