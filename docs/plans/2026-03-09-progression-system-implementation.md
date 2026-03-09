# Progression System Implementation Plan

> **For Claude:** Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Add level system, game modes, unlockable themes, and high score persistence to the Snake game.

**Architecture:** Refactor into Phaser Scene classes (MenuScene, GameScene, GameOverScene). Add state management for progression data persisted to localStorage. Theme system uses color palettes swapped at render time.

**Tech Stack:** Phaser 3, JavaScript, localStorage

---

### Task 1: Refactor into scene structure

**Files:**
- Create: `src/scenes/MenuScene.js`
- Create: `src/scenes/GameScene.js`
- Create: `src/scenes/GameOverScene.js`
- Modify: `src/game.js`

**Step 1: Create MenuScene.js**

```javascript
class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        this.add.text(300, 100, 'SNAKE', {
            fontSize: '48px',
            fontFamily: 'Segoe UI',
            color: '#00d9ff'
        }).setOrigin(0.5);

        const modes = ['Classic', 'Time Attack', 'Survival'];
        modes.forEach((mode, i) => {
            const btn = this.add.text(300, 250 + i * 60, mode, {
                fontSize: '28px',
                fontFamily: 'Segoe UI',
                color: '#ffffff',
                backgroundColor: '#2a2a4e',
                padding: { x: 20, y: 10 }
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });

            btn.on('pointerover', () => btn.setColor('#00d9ff'));
            btn.on('pointerout', () => btn.setColor('#ffffff'));
            btn.on('pointerdown', () => {
                this.scene.start('GameScene', { mode: mode.toLowerCase().replace(' ', '') });
            });
        });

        this.add.text(300, 500, 'High Scores', {
            fontSize: '20px',
            fontFamily: 'Segoe UI',
            color: '#888888'
        }).setOrigin(0.5);
    }
}
```

**Step 2: Create GameScene.js with core game logic moved from game.js**

```javascript
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    init(data) {
        this.gameMode = data.mode || 'classic';
    }

    create() {
        this.initGameState();
        this.createGrid();
        this.createUI();
        this.setupInput();
        this.startGame();
    }

    initGameState() {
        this.GRID_SIZE = 20;
        this.GRID_COUNT = 30;
        this.snake = [];
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        this.food = null;
        this.score = 0;
        this.gameState = 'playing';
        this.powerUps = [];
        this.activeEffects = { speed: false, shield: false };
        this.obstacles = [];
        this.currentLevel = 1;
        this.foodCollected = 0;
        this.foodRequired = 5;
        this.timeLeft = 60;
    }

    createGrid() {
        for (let x = 0; x < this.GRID_COUNT; x++) {
            for (let y = 0; y < this.GRID_COUNT; y++) {
                this.add.rectangle(
                    x * this.GRID_SIZE + this.GRID_SIZE / 2,
                    y * this.GRID_SIZE + this.GRID_SIZE / 2 + 80,
                    this.GRID_SIZE - 1,
                    this.GRID_SIZE - 1,
                    0x2a2a4e
                );
            }
        }
        this.snakeGraphics = this.add.graphics();
        this.foodGraphics = this.add.graphics();
    }

    createUI() {
        this.add.text(20, 20, 'SNAKE', {
            fontSize: '32px',
            fontFamily: 'Segoe UI',
            color: '#00d9ff'
        });

        this.scoreText = this.add.text(20, 60, 'Score: 0', {
            fontSize: '20px',
            fontFamily: 'Segoe UI',
            color: '#ffffff'
        });

        this.modeText = this.add.text(580, 20, this.gameMode.toUpperCase(), {
            fontSize: '16px',
            fontFamily: 'Segoe UI',
            color: '#888888'
        }).setOrigin(1, 0);
    }

    setupInput() {
        this.input.keyboard.on('keydown-LEFT', () => this.changeDirection(-1, 0));
        this.input.keyboard.on('keydown-RIGHT', () => this.changeDirection(1, 0));
        this.input.keyboard.on('keydown-UP', () => this.changeDirection(0, -1));
        this.input.keyboard.on('keydown-DOWN', () => this.changeDirection(0, 1));
        this.input.keyboard.on('keydown-ESC', () => this.scene.start('MenuScene'));
    }

    changeDirection(dx, dy) {
        if (this.gameState !== 'playing') return;
        if (this.direction.x === -dx && this.direction.y === -dy) return;
        if (this.direction.x !== 0 && dx !== 0) return;
        if (this.direction.y !== 0 && dy !== 0) return;
        this.nextDirection = { x: dx, y: dy };
    }

    startGame() {
        this.snake = [{ x: 5, y: 5 }, { x: 4, y: 5 }, { x: 3, y: 5 }];
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        this.spawnFood();

        this.gameTimer = this.time.addEvent({
            delay: 150,
            callback: this.gameLoop,
            callbackScope: this,
            loop: true
        });
    }

    gameLoop() {
        if (this.gameState !== 'playing') return;

        this.direction = { ...this.nextDirection };
        const head = { x: this.snake[0].x + this.direction.x, y: this.snake[0].y + this.direction.y };

        if (head.x < 0 || head.x >= this.GRID_COUNT || head.y < 0 || head.y >= this.GRID_COUNT) {
            if (!this.activeEffects.shield) {
                this.endGame();
                return;
            }
            head.x = (head.x + this.GRID_COUNT) % this.GRID_COUNT;
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
            this.score += 10;
            this.scoreText.setText('Score: ' + this.score);
            this.foodCollected++;
            this.food = null;
            this.spawnFood();
        } else {
            this.snake.pop();
        }

        this.render();
    }

    spawnFood() {
        let validPosition = false;
        while (!validPosition) {
            this.food = {
                x: Math.floor(Math.random() * this.GRID_COUNT),
                y: Math.floor(Math.random() * this.GRID_COUNT)
            };
            validPosition = !this.snake.some(seg => seg.x === this.food.x && seg.y === this.food.y);
        }
    }

    render() {
        this.snakeGraphics.clear();
        this.foodGraphics.clear();

        this.snake.forEach((seg, i) => {
            const px = seg.x * this.GRID_SIZE + this.GRID_SIZE / 2;
            const py = seg.y * this.GRID_SIZE + this.GRID_SIZE / 2 + 80;
            const color = i === 0 ? 0x00b8d9 : 0x00d9ff;
            this.snakeGraphics.fillStyle(color, 1);
            this.snakeGraphics.fillCircle(px, py, this.GRID_SIZE / 2 - 1);
        });

        if (this.food) {
            const fx = this.food.x * this.GRID_SIZE + this.GRID_SIZE / 2;
            const fy = this.food.y * this.GRID_SIZE + this.GRID_SIZE / 2 + 80;
            this.foodGraphics.fillStyle(0xff6b35, 1);
            this.foodGraphics.fillCircle(fx, fy, this.GRID_SIZE / 2 - 1);
        }
    }

    endGame() {
        this.gameState = 'gameover';
        if (this.gameTimer) this.gameTimer.remove();
        this.scene.start('GameOverScene', { score: this.score, mode: this.gameMode });
    }
}
```

**Step 3: Create GameOverScene.js**

```javascript
class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    init(data) {
        this.finalScore = data.score || 0;
        this.gameMode = data.mode || 'classic';
    }

    create() {
        this.add.text(300, 150, 'GAME OVER', {
            fontSize: '48px',
            fontFamily: 'Segoe UI',
            color: '#ff6b35'
        }).setOrigin(0.5);

        this.add.text(300, 250, 'Score: ' + this.finalScore, {
            fontSize: '32px',
            fontFamily: 'Segoe UI',
            color: '#ffffff'
        }).setOrigin(0.5);

        this.add.text(300, 350, 'Press SPACE to Retry', {
            fontSize: '24px',
            fontFamily: 'Segoe UI',
            color: '#00d9ff'
        }).setOrigin(0.5);

        this.add.text(300, 420, 'Press ESC for Menu', {
            fontSize: '20px',
            fontFamily: 'Segoe UI',
            color: '#888888'
        }).setOrigin(0.5);

        this.input.keyboard.on('keydown-SPACE', () => {
            this.scene.start('GameScene', { mode: this.gameMode });
        });

        this.input.keyboard.on('keydown-ESC', () => {
            this.scene.start('MenuScene');
        });
    }
}
```

**Step 4: Update game.js to use scenes**

```javascript
const config = {
    type: Phaser.AUTO,
    width: 600,
    height: 680,
    parent: 'game-container',
    backgroundColor: '#1a1a2e',
    scene: [MenuScene, GameScene, GameOverScene]
};

const game = new Phaser.Game(config);
```

**Step 5: Update index.html to load scenes**

```html
<script src="src/scenes/MenuScene.js"></script>
<script src="src/scenes/GameScene.js"></script>
<script src="src/scenes/GameOverScene.js"></script>
<script src="src/game.js"></script>
```

---

### Task 2: Add level system to GameScene

**Files:**
- Modify: `src/scenes/GameScene.js`

**Step 1: Add level configuration**

```javascript
initGameState() {
    // ... existing code ...
    
    this.levelConfig = {
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
    
    this.currentLevel = this.getSavedLevel();
    this.applyLevelConfig();
}

getSavedLevel() {
    const saved = localStorage.getItem('snakeLevel');
    return saved ? parseInt(saved) : 1;
}

applyLevelConfig() {
    const config = this.levelConfig[this.currentLevel];
    this.foodRequired = config.foodRequired;
    this.foodCollected = 0;
    this.obstacles = [];
    
    for (let i = 0; i < config.obstacles; i++) {
        this.spawnObstacle();
    }
}

spawnObstacle() {
    let validPosition = false;
    let pos;
    while (!validPosition) {
        pos = {
            x: Math.floor(Math.random() * this.GRID_COUNT),
            y: Math.floor(Math.random() * this.GRID_COUNT)
        };
        const onSnake = this.snake.some(seg => seg.x === pos.x && seg.y === pos.y);
        const onFood = this.food && this.food.x === pos.x && this.food.y === pos.y;
        const onObstacle = this.obstacles.some(ob => ob.x === pos.x && ob.y === pos.y);
        validPosition = !onSnake && !onFood && !onObstacle && pos.x > 3 && pos.y > 3;
    }
    this.obstacles.push(pos);
}
```

**Step 2: Add level UI and progress bar**

```javascript
createUI() {
    // ... existing code ...

    this.levelText = this.add.text(20, 85, 'Level: ' + this.currentLevel, {
        fontSize: '16px',
        fontFamily: 'Segoe UI',
        color: '#ffffff'
    });

    this.progressBg = this.add.rectangle(150, 92, 100, 10, 0x444444);
    this.progressBar = this.add.rectangle(150, 92, 0, 10, 0x00d9ff);
    
    this.progressText = this.add.text(210, 85, '0/' + this.foodRequired, {
        fontSize: '14px',
        fontFamily: 'Segoe UI',
        color: '#888888'
    });
}
```

**Step 3: Update gameLoop for level progression**

```javascript
gameLoop() {
    // ... after eating food ...

    if (this.food && head.x === this.food.x && head.y === this.food.y) {
        this.score += 10;
        this.foodCollected++;
        this.updateProgress();
        
        if (this.foodCollected >= this.foodRequired) {
            this.levelUp();
        }
        
        this.food = null;
        this.spawnFood();
    }
    // ... rest of code ...
}

updateProgress() {
    const progress = this.foodCollected / this.foodRequired;
    this.progressBar.width = progress * 100;
    this.progressText.setText(this.foodCollected + '/' + this.foodRequired);
}

levelUp() {
    if (this.currentLevel < 10) {
        this.currentLevel++;
        localStorage.setItem('snakeLevel', this.currentLevel);
        this.applyLevelConfig();
        
        this.gameTimer.delay = this.levelConfig[this.currentLevel].speed;
        this.levelText.setText('Level: ' + this.currentLevel);
        this.progressText.setText('0/' + this.foodRequired);
        this.progressBar.width = 0;
    }
}
```

**Step 4: Add obstacle collision check**

```javascript
gameLoop() {
    // ... after head calculation ...

    for (const ob of this.obstacles) {
        if (head.x === ob.x && head.y === ob.y) {
            if (!this.activeEffects.shield) {
                this.endGame();
                return;
            }
        }
    }
    // ... rest of collision checks ...
}
```

**Step 5: Render obstacles**

```javascript
render() {
    // ... existing render code ...

    this.obstacles.forEach(ob => {
        const px = ob.x * this.GRID_SIZE + this.GRID_SIZE / 2;
        const py = ob.y * this.GRID_SIZE + this.GRID_SIZE / 2 + 80;
        this.snakeGraphics.fillStyle(0x666666, 1);
        this.snakeGraphics.fillRect(px - 9, py - 9, 18, 18);
    });
}
```

---

### Task 3: Add theme system

**Files:**
- Create: `src/themes.js`
- Modify: `src/scenes/MenuScene.js`
- Modify: `src/scenes/GameScene.js`

**Step 1: Create themes.js**

```javascript
const THEMES = {
    modern: {
        name: 'Modern',
        unlockScore: 0,
        snake: 0x00d9ff,
        snakeHead: 0x00b8d9,
        food: 0xff6b35,
        grid: 0x2a2a4e,
        background: '#1a1a2e'
    },
    retro: {
        name: 'Retro',
        unlockScore: 100,
        snake: 0x00ff00,
        snakeHead: 0x00cc00,
        food: 0xffff00,
        grid: 0x003300,
        background: '#000000'
    },
    neon: {
        name: 'Neon',
        unlockScore: 250,
        snake: 0xff00ff,
        snakeHead: 0xcc00cc,
        food: 0x00ffff,
        grid: 0x1a0033,
        background: '#0d001a'
    },
    nature: {
        name: 'Nature',
        unlockScore: 500,
        snake: 0x8b4513,
        snakeHead: 0x654321,
        food: 0x228b22,
        grid: 0x3d2914,
        background: '#1a0f05'
    },
    cyberpunk: {
        name: 'Cyberpunk',
        unlockScore: 1000,
        snake: 0xffff00,
        snakeHead: 0xcccc00,
        food: 0x00ffff,
        grid: 0x1a1a00,
        background: '#0a0a00'
    }
};

function getUnlockedThemes(highScore) {
    return Object.entries(THEMES)
        .filter(([key, theme]) => highScore >= theme.unlockScore)
        .map(([key]) => key);
}

function getCurrentTheme() {
    return localStorage.getItem('snakeTheme') || 'modern';
}

function setCurrentTheme(themeKey) {
    localStorage.setItem('snakeTheme', themeKey);
}

function getHighScore() {
    return parseInt(localStorage.getItem('snakeHighScore') || '0');
}

function setHighScore(score) {
    const current = getHighScore();
    if (score > current) {
        localStorage.setItem('snakeHighScore', score.toString());
        return true;
    }
    return false;
}
```

**Step 2: Add theme selector to MenuScene**

```javascript
create() {
    // ... existing code ...

    this.add.text(300, 450, 'Themes', {
        fontSize: '20px',
        fontFamily: 'Segoe UI',
        color: '#888888'
    }).setOrigin(0.5);

    const highScore = getHighScore();
    const unlocked = getUnlockedThemes(highScore);
    const currentTheme = getCurrentTheme();

    Object.entries(THEMES).forEach(([key, theme], i) => {
        const isUnlocked = unlocked.includes(key);
        const x = 120 + (i % 5) * 90;
        const y = 490;

        const btn = this.add.text(x, y, theme.name, {
            fontSize: '14px',
            fontFamily: 'Segoe UI',
            color: isUnlocked ? (currentTheme === key ? '#00d9ff' : '#ffffff') : '#444444'
        }).setOrigin(0.5);

        if (isUnlocked) {
            btn.setInteractive({ useHandCursor: true });
            btn.on('pointerover', () => btn.setColor('#00d9ff'));
            btn.on('pointerout', () => btn.setColor(currentTheme === key ? '#00d9ff' : '#ffffff'));
            btn.on('pointerdown', () => {
                setCurrentTheme(key);
                this.scene.restart();
            });
        } else {
            this.add.text(x, y + 20, '🔒', { fontSize: '12px' }).setOrigin(0.5);
        }
    });
}
```

**Step 3: Apply theme in GameScene**

```javascript
create() {
    this.theme = THEMES[getCurrentTheme()];
    this.cameras.main.setBackgroundColor(this.theme.background);
    // ... rest of create ...
}

createGrid() {
    for (let x = 0; x < this.GRID_COUNT; x++) {
        for (let y = 0; y < this.GRID_COUNT; y++) {
            this.add.rectangle(
                x * this.GRID_SIZE + this.GRID_SIZE / 2,
                y * this.GRID_SIZE + this.GRID_SIZE / 2 + 80,
                this.GRID_SIZE - 1,
                this.GRID_SIZE - 1,
                this.theme.grid
            );
        }
    }
    // ... rest ...
}

render() {
    this.snakeGraphics.clear();
    this.foodGraphics.clear();

    this.snake.forEach((seg, i) => {
        const px = seg.x * this.GRID_SIZE + this.GRID_SIZE / 2;
        const py = seg.y * this.GRID_SIZE + this.GRID_SIZE / 2 + 80;
        const color = i === 0 ? this.theme.snakeHead : this.theme.snake;
        this.snakeGraphics.fillStyle(color, 1);
        this.snakeGraphics.fillCircle(px, py, this.GRID_SIZE / 2 - 1);
    });

    if (this.food) {
        const fx = this.food.x * this.GRID_SIZE + this.GRID_SIZE / 2;
        const fy = this.food.y * this.GRID_SIZE + this.GRID_SIZE / 2 + 80;
        this.foodGraphics.fillStyle(this.theme.food, 1);
        this.foodGraphics.fillCircle(fx, fy, this.GRID_SIZE / 2 - 1);
    }

    this.obstacles.forEach(ob => {
        const px = ob.x * this.GRID_SIZE + this.GRID_SIZE / 2;
        const py = ob.y * this.GRID_SIZE + this.GRID_SIZE / 2 + 80;
        this.snakeGraphics.fillStyle(0x666666, 1);
        this.snakeGraphics.fillRect(px - 9, py - 9, 18, 18);
    });
}
```

---

### Task 4: Add Time Attack mode

**Files:**
- Modify: `src/scenes/GameScene.js`

**Step 1: Add timer for Time Attack mode**

```javascript
createUI() {
    // ... existing code ...

    if (this.gameMode === 'timeattack') {
        this.timerText = this.add.text(300, 60, '60', {
            fontSize: '32px',
            fontFamily: 'Segoe UI',
            color: '#ff6b35'
        }).setOrigin(0.5);

        this.time.addEvent({
            delay: 1000,
            callback: this.updateTimer,
            callbackScope: this,
            loop: true
        });
    }
}

updateTimer() {
    if (this.gameState !== 'playing') return;
    
    this.timeLeft--;
    this.timerText.setText(this.timeLeft.toString());
    
    if (this.timeLeft <= 10) {
        this.timerText.setColor('#ff0000');
    }
    
    if (this.timeLeft <= 0) {
        this.endGame();
    }
}
```

**Step 2: Adjust scoring for Time Attack**

```javascript
gameLoop() {
    // ... after eating food ...

    if (this.food && head.x === this.food.x && head.y === this.food.y) {
        const points = this.gameMode === 'timeattack' ? 20 : 10;
        this.score += points;
        // ... rest ...
    }
}
```

---

### Task 5: Add Survival mode with spawning obstacles

**Files:**
- Modify: `src/scenes/GameScene.js`

**Step 1: Add obstacle spawner for Survival mode**

```javascript
startGame() {
    // ... existing code ...

    if (this.gameMode === 'survival') {
        this.survivalTimer = this.time.addEvent({
            delay: 5000,
            callback: this.spawnSurvivalObstacle,
            callbackScope: this,
            loop: true
        });
    }
}

spawnSurvivalObstacle() {
    if (this.gameState !== 'playing') return;
    this.spawnObstacle();
    this.render();
}
```

**Step 2: Remove level progression for non-Classic modes**

```javascript
createUI() {
    // ... existing code ...

    if (this.gameMode !== 'classic') {
        this.levelText.setVisible(false);
        this.progressBg.setVisible(false);
        this.progressBar.setVisible(false);
        this.progressText.setVisible(false);
    }
}

levelUp() {
    if (this.gameMode !== 'classic') return;
    // ... rest of level up code ...
}
```

---

### Task 6: Add high score system

**Files:**
- Modify: `src/scenes/GameOverScene.js`
- Modify: `src/themes.js`

**Step 1: Update themes.js with mode-specific high scores**

```javascript
function getHighScore(mode = 'classic') {
    return parseInt(localStorage.getItem('snakeHighScore_' + mode) || '0');
}

function setHighScore(score, mode = 'classic') {
    const current = getHighScore(mode);
    if (score > current) {
        localStorage.setItem('snakeHighScore_' + mode, score.toString());
        return true;
    }
    return false;
}

function getAllHighScores() {
    return {
        classic: getHighScore('classic'),
        timeattack: getHighScore('timeattack'),
        survival: getHighScore('survival')
    };
}
```

**Step 2: Update GameOverScene to show high score**

```javascript
create() {
    const isNewHighScore = setHighScore(this.finalScore, this.gameMode);
    const highScore = getHighScore(this.gameMode);

    this.add.text(300, 150, 'GAME OVER', {
        fontSize: '48px',
        fontFamily: 'Segoe UI',
        color: '#ff6b35'
    }).setOrigin(0.5);

    if (isNewHighScore) {
        this.add.text(300, 220, 'NEW HIGH SCORE!', {
            fontSize: '24px',
            fontFamily: 'Segoe UI',
            color: '#00d9ff'
        }).setOrigin(0.5);
    }

    this.add.text(300, 270, 'Score: ' + this.finalScore, {
        fontSize: '32px',
        fontFamily: 'Segoe UI',
        color: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(300, 320, 'Best: ' + highScore, {
        fontSize: '20px',
        fontFamily: 'Segoe UI',
        color: '#888888'
    }).setOrigin(0.5);

    // Check for new unlocks
    const totalHighScore = Math.max(
        getHighScore('classic'),
        getHighScore('timeattack'),
        getHighScore('survival')
    );
    
    const unlocked = getUnlockedThemes(totalHighScore);
    const allThemes = Object.keys(THEMES);
    const newlyUnlocked = allThemes.filter(t => 
        !getUnlockedThemes(totalHighScore - this.finalScore).includes(t) && unlocked.includes(t)
    );

    if (newlyUnlocked.length > 0) {
        this.add.text(300, 380, 'Unlocked: ' + newlyUnlocked.map(t => THEMES[t].name).join(', '), {
            fontSize: '18px',
            fontFamily: 'Segoe UI',
            color: '#22c55e'
        }).setOrigin(0.5);
    }

    // ... rest of create ...
}
```

**Step 3: Show high scores in MenuScene**

```javascript
create() {
    // ... existing mode buttons ...

    const highScores = getAllHighScores();
    this.add.text(300, 430, 'High Scores', {
        fontSize: '16px',
        fontFamily: 'Segoe UI',
        color: '#666666'
    }).setOrigin(0.5);

    this.add.text(300, 455, 
        `Classic: ${highScores.classic} | Time: ${highScores.timeattack} | Survival: ${highScores.survival}`, {
        fontSize: '14px',
        fontFamily: 'Segoe UI',
        color: '#888888'
    }).setOrigin(0.5);

    // ... theme selector ...
}
```

---

### Task 7: Final integration and testing

**Files:**
- Modify: `index.html`

**Step 1: Update index.html with correct script order**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Snake Game</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background: #0f0f1a;
            font-family: 'Segoe UI', sans-serif;
        }
        #game-container {
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 0 40px rgba(0, 217, 255, 0.2);
        }
    </style>
</head>
<body>
    <div id="game-container"></div>
    <script src="https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.min.js"></script>
    <script src="src/themes.js"></script>
    <script src="src/scenes/MenuScene.js"></script>
    <script src="src/scenes/GameScene.js"></script>
    <script src="src/scenes/GameOverScene.js"></script>
    <script src="src/game.js"></script>
</body>
</html>
```

**Step 2: Test all features**

1. Open index.html in browser
2. Verify menu shows with 3 game modes
3. Test Classic mode - verify level progression works
4. Test Time Attack - verify 60 second timer
5. Test Survival - verify obstacles spawn over time
6. Play to unlock themes (100+ pts)
7. Restart and verify high scores persist
8. Test theme selector
9. Test ESC key returns to menu

---

**Plan complete!**
