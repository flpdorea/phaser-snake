import Phaser from 'phaser';
import {
  GameMode,
  Position,
  Direction,
  PowerUp,
  ActiveEffects,
  GameState,
  Theme,
  LevelConfig
} from '../models/types';
import { getCurrentTheme, getTheme } from '../models/theme';
import { getSavedLevel, setSavedLevel } from '../utils/storage';

const GRID_SIZE = 20;
const GRID_COUNT = 30;

const LEVEL_CONFIG: Record<number, LevelConfig> = {
  1: { speed: 150, obstacles: 0, foodRequired: 5 },
  2: { speed: 140, obstacles: 0, foodRequired: 6 },
  3: { speed: 130, obstacles: 1, foodRequired: 7 },
  4: { speed: 120, obstacles: 1, foodRequired: 8 },
  5: { speed: 110, obstacles: 2, foodRequired: 9 },
  6: { speed: 100, obstacles: 2, foodRequired: 10 },
  7: { speed: 95, obstacles: 3, foodRequired: 11 },
  8: { speed: 90, obstacles: 4, foodRequired: 12 },
  9: { speed: 85, obstacles: 5, foodRequired: 13 },
  10: { speed: 80, obstacles: 5, foodRequired: 15 }
};

export class GameScene extends Phaser.Scene {
  private gameMode: GameMode = 'classic';
  private theme!: Theme;
  private snake: Position[] = [];
  private direction: Direction = { x: 1, y: 0 };
  private nextDirection: Direction = { x: 1, y: 0 };
  private food: Position | null = null;
  private score: number = 0;
  private gameState: GameState = 'playing';
  private powerUps: PowerUp[] = [];
  private activeEffects: ActiveEffects = { speed: false, shield: false };
  private obstacles: Position[] = [];
  private timeLeft: number = 60;
  private foodCollected: number = 0;
  private currentLevel: number = 1;
  private foodRequired: number = 5;
  private gameTimer!: Phaser.Time.TimerEvent;
  private powerUpTimer!: Phaser.Time.TimerEvent;
  private survivalTimer?: Phaser.Time.TimerEvent;
  private snakeGraphics!: Phaser.GameObjects.Graphics;
  private foodGraphics!: Phaser.GameObjects.Graphics;
  private scoreText!: Phaser.GameObjects.Text;
  private timerText?: Phaser.GameObjects.Text;
  private levelText?: Phaser.GameObjects.Text;
  private progressBar?: Phaser.GameObjects.Rectangle;
  private progressText?: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'GameScene' });
  }

  init(data: { mode?: GameMode }): void {
    this.gameMode = data.mode || 'classic';
  }

  create(): void {
    this.theme = getTheme(getCurrentTheme());
    this.cameras.main.setBackgroundColor(this.theme.background);

    this.initGameState();
    this.createGrid();
    this.createUI();
    this.setupInput();
    this.startGame();
  }

  private initGameState(): void {
    this.snake = [];
    this.direction = { x: 1, y: 0 };
    this.nextDirection = { x: 1, y: 0 };
    this.food = null;
    this.score = 0;
    this.gameState = 'playing';
    this.powerUps = [];
    this.activeEffects = { speed: false, shield: false };
    this.obstacles = [];
    this.timeLeft = 60;
    this.foodCollected = 0;

    if (this.gameMode === 'classic') {
      this.currentLevel = getSavedLevel();
      this.foodRequired = LEVEL_CONFIG[this.currentLevel].foodRequired;
    } else {
      this.currentLevel = 1;
      this.foodRequired = 999;
    }
  }

  private createGrid(): void {
    for (let x = 0; x < GRID_COUNT; x++) {
      for (let y = 0; y < GRID_COUNT; y++) {
        this.add.rectangle(
          x * GRID_SIZE + GRID_SIZE / 2,
          y * GRID_SIZE + GRID_SIZE / 2 + 80,
          GRID_SIZE - 1,
          GRID_SIZE - 1,
          this.theme.grid
        );
      }
    }
    this.snakeGraphics = this.add.graphics();
    this.foodGraphics = this.add.graphics();
  }

  private createUI(): void {
    this.add.text(20, 20, 'SNAKE', {
      fontSize: '28px',
      fontFamily: 'Segoe UI',
      color: this.theme.accent
    });

    this.scoreText = this.add.text(20, 55, 'Score: 0', {
      fontSize: '18px',
      fontFamily: 'Segoe UI',
      color: '#ffffff'
    });

    this.add.text(580, 20, this.getModeLabel(), {
      fontSize: '14px',
      fontFamily: 'Segoe UI',
      color: '#666666'
    }).setOrigin(1, 0);

    if (this.gameMode === 'classic') {
      this.levelText = this.add.text(580, 40, 'Level ' + this.currentLevel, {
        fontSize: '14px',
        fontFamily: 'Segoe UI',
        color: '#888888'
      }).setOrigin(1, 0);

      this.add.rectangle(520, 60, 120, 12, 0x333333).setOrigin(0, 0.5);
      this.progressBar = this.add.rectangle(520, 60, 0, 12, this.theme.snake).setOrigin(0, 0.5);

      this.progressText = this.add.text(520, 75, '0/' + this.foodRequired, {
        fontSize: '12px',
        fontFamily: 'Segoe UI',
        color: '#666666'
      }).setOrigin(0, 0);
    }

    if (this.gameMode === 'timeattack') {
      this.timerText = this.add.text(300, 40, '60', {
        fontSize: '40px',
        fontFamily: 'Segoe UI',
        color: `#${this.theme.food.toString(16).padStart(6, '0')}`
      }).setOrigin(0.5);

      this.time.addEvent({
        delay: 1000,
        callback: this.updateTimer,
        callbackScope: this,
        loop: true
      });
    }
  }

  private getModeLabel(): string {
    switch (this.gameMode) {
      case 'classic': return 'CLASSIC';
      case 'timeattack': return 'TIME ATTACK';
      case 'survival': return 'SURVIVAL';
    }
  }

  private setupInput(): void {
    this.input.keyboard?.on('keydown-LEFT', () => this.changeDirection(-1, 0));
    this.input.keyboard?.on('keydown-RIGHT', () => this.changeDirection(1, 0));
    this.input.keyboard?.on('keydown-UP', () => this.changeDirection(0, -1));
    this.input.keyboard?.on('keydown-DOWN', () => this.changeDirection(0, 1));
    this.input.keyboard?.on('keydown-ESC', () => this.scene.start('MenuScene'));
  }

  private changeDirection(dx: number, dy: number): void {
    if (this.gameState !== 'playing') return;
    if (this.direction.x === -dx && this.direction.y === -dy) return;
    if (this.direction.x !== 0 && dx !== 0) return;
    if (this.direction.y !== 0 && dy !== 0) return;
    this.nextDirection = { x: dx, y: dy };
  }

  private startGame(): void {
    this.snake = [{ x: 5, y: 5 }, { x: 4, y: 5 }, { x: 3, y: 5 }];
    this.direction = { x: 1, y: 0 };
    this.nextDirection = { x: 1, y: 0 };

    this.applyLevelObstacles();
    this.spawnFood();

    const speed = this.gameMode === 'classic' ? LEVEL_CONFIG[this.currentLevel].speed : 150;

    this.gameTimer = this.time.addEvent({
      delay: speed,
      callback: this.gameLoop,
      callbackScope: this,
      loop: true
    });

    if (this.gameMode === 'survival') {
      this.survivalTimer = this.time.addEvent({
        delay: 5000,
        callback: this.spawnSurvivalObstacle,
        callbackScope: this,
        loop: true
      });
    }

    this.powerUpTimer = this.time.addEvent({
      delay: 12000,
      callback: this.spawnPowerUp,
      callbackScope: this,
      loop: true
    });

    this.render();
  }

  private applyLevelObstacles(): void {
    if (this.gameMode !== 'classic') return;

    const config = LEVEL_CONFIG[this.currentLevel];
    this.obstacles = [];

    for (let i = 0; i < config.obstacles; i++) {
      this.spawnObstacle();
    }
  }

  private spawnObstacle(): void {
    let attempts = 0;
    while (attempts < 100) {
      const pos: Position = {
        x: Math.floor(Math.random() * GRID_COUNT),
        y: Math.floor(Math.random() * GRID_COUNT)
      };

      const onSnake = this.snake.some(seg => seg.x === pos.x && seg.y === pos.y);
      const onFood = this.food && this.food.x === pos.x && this.food.y === pos.y;
      const onObstacle = this.obstacles.some(ob => ob.x === pos.x && ob.y === pos.y);
      const inSpawnArea = pos.x < 8 && pos.y < 8;

      if (!onSnake && !onFood && !onObstacle && !inSpawnArea) {
        this.obstacles.push(pos);
        return;
      }
      attempts++;
    }
  }

  private spawnSurvivalObstacle(): void {
    if (this.gameState !== 'playing') return;
    this.spawnObstacle();
    this.render();
  }

  private updateTimer(): void {
    if (this.gameState !== 'playing') return;

    this.timeLeft--;
    if (this.timerText) {
      this.timerText.setText(this.timeLeft.toString());

      if (this.timeLeft <= 10) {
        this.timerText.setColor('#ff0000');
      }
    }

    if (this.timeLeft <= 0) {
      this.endGame();
    }
  }

  private gameLoop(): void {
    if (this.gameState !== 'playing') return;

    this.direction = { ...this.nextDirection };
    const head: Position = {
      x: this.snake[0].x + this.direction.x,
      y: this.snake[0].y + this.direction.y
    };

    if (head.x < 0 || head.x >= GRID_COUNT || head.y < 0 || head.y >= GRID_COUNT) {
      if (!this.activeEffects.shield) {
        this.endGame();
        return;
      }
      head.x = (head.x + GRID_COUNT) % GRID_COUNT;
    }

    for (const ob of this.obstacles) {
      if (head.x === ob.x && head.y === ob.y) {
        if (!this.activeEffects.shield) {
          this.endGame();
          return;
        }
      }
    }

    for (let i = 1; i < this.snake.length; i++) {
      if (head.x === this.snake[i].x && head.y === this.snake[i].y) {
        if (!this.activeEffects.shield) {
          this.endGame();
          return;
        }
      }
    }

    this.snake.unshift(head);

    if (this.food && head.x === this.food.x && head.y === this.food.y) {
      const points = this.gameMode === 'timeattack' ? 20 : 10;
      this.score += points;
      this.scoreText.setText('Score: ' + this.score);
      this.foodCollected++;

      if (this.gameMode === 'classic') {
        this.updateProgress();
        if (this.foodCollected >= this.foodRequired) {
          this.levelUp();
        }
      }

      this.food = null;
      this.spawnFood();
    } else {
      this.snake.pop();
    }

    this.checkPowerUps(head);
    this.render();
  }

  private updateProgress(): void {
    const progress = this.foodCollected / this.foodRequired;
    if (this.progressBar) {
      this.progressBar.width = progress * 120;
    }
    if (this.progressText) {
      this.progressText.setText(this.foodCollected + '/' + this.foodRequired);
    }
  }

  private levelUp(): void {
    if (this.currentLevel < 10) {
      this.currentLevel++;
      setSavedLevel(this.currentLevel);

      const config = LEVEL_CONFIG[this.currentLevel];
      this.foodRequired = config.foodRequired;
      this.foodCollected = 0;

      for (let i = this.obstacles.length; i < config.obstacles; i++) {
        this.spawnObstacle();
      }

      (this.gameTimer as unknown as { delay: number }).delay = config.speed;
      if (this.levelText) {
        this.levelText.setText('Level ' + this.currentLevel);
      }
      if (this.progressBar) {
        this.progressBar.width = 0;
      }
      if (this.progressText) {
        this.progressText.setText('0/' + this.foodRequired);
      }
    }
  }

  private spawnFood(): void {
    let attempts = 0;
    while (attempts < 100) {
      this.food = {
        x: Math.floor(Math.random() * GRID_COUNT),
        y: Math.floor(Math.random() * GRID_COUNT)
      };

      const onSnake = this.snake.some(seg => seg.x === this.food!.x && seg.y === this.food!.y);
      const onObstacle = this.obstacles.some(ob => ob.x === this.food!.x && ob.y === this.food!.y);
      const onPowerUp = this.powerUps.some(pu => pu.x === this.food!.x && pu.y === this.food!.y);

      if (!onSnake && !onObstacle && !onPowerUp) return;
      attempts++;
    }
  }

  private spawnPowerUp(): void {
    if (this.powerUps.length >= 2 || this.gameState !== 'playing') return;

    const types: PowerUp['type'][] = ['speed', 'shield', 'grow'];
    const type = types[Math.floor(Math.random() * types.length)];

    let attempts = 0;
    while (attempts < 100) {
      const pos: PowerUp = {
        x: Math.floor(Math.random() * GRID_COUNT),
        y: Math.floor(Math.random() * GRID_COUNT),
        type
      };

      const onSnake = this.snake.some(seg => seg.x === pos.x && seg.y === pos.y);
      const onFood = this.food && this.food.x === pos.x && this.food.y === pos.y;
      const onObstacle = this.obstacles.some(ob => ob.x === pos.x && ob.y === pos.y);
      const onPowerUp = this.powerUps.some(pu => pu.x === pos.x && pu.y === pos.y);

      if (!onSnake && !onFood && !onObstacle && !onPowerUp) {
        this.powerUps.push(pos);
        this.render();

        this.time.delayedCall(8000, () => {
          this.powerUps = this.powerUps.filter(pu => pu !== pos);
          this.render();
        });
        return;
      }
      attempts++;
    }
  }

  private checkPowerUps(head: Position): void {
    const puIndex = this.powerUps.findIndex(pu => pu.x === head.x && pu.y === head.y);
    if (puIndex === -1) return;

    const pu = this.powerUps[puIndex];
    this.powerUps.splice(puIndex, 1);

    switch (pu.type) {
      case 'speed':
        this.activateSpeed();
        break;
      case 'shield':
        this.activateShield();
        break;
      case 'grow':
        this.activateGrow();
        break;
    }
    this.render();
  }

  private activateSpeed(): void {
    this.activeEffects.speed = true;
    (this.gameTimer as unknown as { delay: number }).delay = 80;

    this.time.delayedCall(5000, () => {
      this.activeEffects.speed = false;
      if (this.gameState === 'playing') {
        (this.gameTimer as unknown as { delay: number }).delay = this.gameMode === 'classic' ?
          LEVEL_CONFIG[this.currentLevel].speed : 150;
      }
    });
  }

  private activateShield(): void {
    this.activeEffects.shield = true;
    this.time.delayedCall(5000, () => {
      this.activeEffects.shield = false;
    });
  }

  private activateGrow(): void {
    for (let i = 0; i < 3; i++) {
      const tail = this.snake[this.snake.length - 1];
      this.snake.push({ x: tail.x, y: tail.y });
    }
  }

  private render(): void {
    this.snakeGraphics.clear();
    this.foodGraphics.clear();

    this.snake.forEach((seg, i) => {
      const px = seg.x * GRID_SIZE + GRID_SIZE / 2;
      const py = seg.y * GRID_SIZE + GRID_SIZE / 2 + 80;
      const color = i === 0 ? this.theme.snakeHead : this.theme.snake;
      this.snakeGraphics.fillStyle(color, 1);
      this.snakeGraphics.fillCircle(px, py, GRID_SIZE / 2 - 1);
    });

    if (this.food) {
      const fx = this.food.x * GRID_SIZE + GRID_SIZE / 2;
      const fy = this.food.y * GRID_SIZE + GRID_SIZE / 2 + 80;
      this.foodGraphics.fillStyle(this.theme.food, 1);
      this.foodGraphics.fillCircle(fx, fy, GRID_SIZE / 2 - 1);
    }

    this.powerUps.forEach(pu => {
      const px = pu.x * GRID_SIZE + GRID_SIZE / 2;
      const py = pu.y * GRID_SIZE + GRID_SIZE / 2 + 80;
      const colors: Record<PowerUp['type'], number> = { speed: 0xa855f7, shield: 0xfbbf24, grow: 0x22c55e };
      this.foodGraphics.fillStyle(colors[pu.type], 1);
      this.foodGraphics.fillCircle(px, py, GRID_SIZE / 2 - 1);
    });

    this.obstacles.forEach(ob => {
      const px = ob.x * GRID_SIZE + GRID_SIZE / 2;
      const py = ob.y * GRID_SIZE + GRID_SIZE / 2 + 80;
      this.snakeGraphics.fillStyle(this.theme.obstacle, 1);
      this.snakeGraphics.fillRect(px - 9, py - 9, 18, 18);
    });
  }

  private endGame(): void {
    this.gameState = 'gameover';
    if (this.gameTimer) this.gameTimer.remove();
    if (this.powerUpTimer) this.powerUpTimer.remove();
    if (this.survivalTimer) this.survivalTimer.remove();

    this.scene.start('GameOverScene', {
      score: this.score,
      mode: this.gameMode,
      level: this.currentLevel
    });
  }
}
