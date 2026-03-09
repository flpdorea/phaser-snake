import { Theme, ThemeKey } from './types';

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
