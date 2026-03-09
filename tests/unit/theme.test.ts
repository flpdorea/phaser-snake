import { describe, it, expect, beforeEach } from 'vitest';
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
