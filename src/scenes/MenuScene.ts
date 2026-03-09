import Phaser from 'phaser';
import { GameMode, ThemeKey } from '../models/types';
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

    const themeKeys = Object.keys(THEMES) as ThemeKey[];
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
