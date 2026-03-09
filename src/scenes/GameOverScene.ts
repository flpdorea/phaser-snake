import Phaser from 'phaser';
import { GameMode } from '../models/types';
import { THEMES } from '../models/theme';
import { setHighScore, getHighScore } from '../utils/storage';

export class GameOverScene extends Phaser.Scene {
  private finalScore: number = 0;
  private gameMode: GameMode = 'classic';
  private level: number = 1;

  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data: { score?: number; mode?: GameMode; level?: number }): void {
    this.finalScore = data.score || 0;
    this.gameMode = data.mode || 'classic';
    this.level = data.level || 1;
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#1a1a2e');

    const isNewHighScore = setHighScore(this.finalScore, this.gameMode);
    const highScore = getHighScore(this.gameMode);

    this.add.text(300, 100, 'GAME OVER', {
      fontSize: '48px',
      fontFamily: 'Segoe UI',
      color: '#ff6b35'
    }).setOrigin(0.5);

    if (isNewHighScore && this.finalScore > 0) {
      this.add.text(300, 160, 'NEW HIGH SCORE!', {
        fontSize: '24px',
        fontFamily: 'Segoe UI',
        color: '#00d9ff'
      }).setOrigin(0.5);
    }

    this.add.text(300, 220, 'Score: ' + this.finalScore, {
      fontSize: '36px',
      fontFamily: 'Segoe UI',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(300, 270, 'Best: ' + highScore, {
      fontSize: '20px',
      fontFamily: 'Segoe UI',
      color: '#888888'
    }).setOrigin(0.5);

    if (this.gameMode === 'classic') {
      this.add.text(300, 310, 'Level: ' + this.level, {
        fontSize: '18px',
        fontFamily: 'Segoe UI',
        color: '#666666'
      }).setOrigin(0.5);
    }

    this.displayUnlockedThemes();

    const retryBtn = this.add.rectangle(300, 430, 200, 50, 0x2a2a4e)
      .setInteractive({ useHandCursor: true });

    this.add.text(300, 430, 'Retry', {
      fontSize: '22px',
      fontFamily: 'Segoe UI',
      color: '#ffffff'
    }).setOrigin(0.5);

    retryBtn.on('pointerover', () => retryBtn.setFillStyle(0x3a3a5e));
    retryBtn.on('pointerout', () => retryBtn.setFillStyle(0x2a2a4e));
    retryBtn.on('pointerdown', () => {
      this.scene.start('GameScene', { mode: this.gameMode });
    });

    const menuBtn = this.add.rectangle(300, 500, 200, 40, 0x1a1a2e)
      .setInteractive({ useHandCursor: true });

    this.add.text(300, 500, 'Main Menu', {
      fontSize: '18px',
      fontFamily: 'Segoe UI',
      color: '#888888'
    }).setOrigin(0.5);

    menuBtn.on('pointerover', () => menuBtn.setFillStyle(0x2a2a4e));
    menuBtn.on('pointerout', () => menuBtn.setFillStyle(0x1a1a2e));
    menuBtn.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });

    this.input.keyboard?.on('keydown-SPACE', () => {
      this.scene.start('GameScene', { mode: this.gameMode });
    });

    this.input.keyboard?.on('keydown-ESC', () => {
      this.scene.start('MenuScene');
    });
  }

  private displayUnlockedThemes(): void {
    const totalHighScore = Math.max(
      getHighScore('classic'),
      getHighScore('timeattack'),
      getHighScore('survival')
    );

    const prevTotal = totalHighScore - this.finalScore;
    const newlyUnlocked = Object.entries(THEMES)
      .filter(([, theme]) =>
        prevTotal < theme.unlockScore && totalHighScore >= theme.unlockScore
      )
      .map(([, theme]) => theme.name);

    if (newlyUnlocked.length > 0) {
      this.add.text(300, 360, 'Unlocked: ' + newlyUnlocked.join(', '), {
        fontSize: '18px',
        fontFamily: 'Segoe UI',
        color: '#22c55e'
      }).setOrigin(0.5);
    }
  }
}
