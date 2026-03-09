# Snake Game Implementation Plan

> **For Claude:** Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Create a Snake game using Phaser 3 with modern visuals, power-ups, and proper game states.

**Architecture:** Single HTML file with Phaser 3 loaded from CDN. Game logic in a single Scene class with state management for game states.

**Tech Stack:** Phaser 3 (CDN), JavaScript, HTML5

---

### Task 1: Create project structure and basic HTML

**Files:**
- Create: `index.html`
- Create: `src/game.js`

**Step 1: Create index.html with Phaser CDN**

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
    <script src="src/game.js"></script>
</body>
</html>
```

**Step 2: Create basic game.js with Phaser config**

```javascript
const config = {
    type: Phaser.AUTO,
    width: 600,
    height: 600,
    parent: 'game-container',
    backgroundColor: '#1a1a2e',
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

function preload() {}

function create() {}

function update() {}
```

**Step 3: Test game loads**

Run: Open index.html in browser
Expected: Game canvas appears with dark background

---

### Task 2: Implement game constants and state

**Files:**
- Modify: `src/game.js`

**Step 1: Add game constants after config**

```javascript
const GRID_SIZE = 20;
const GRID_COUNT = 30;
const COLORS = {
    background: 0x1a1a2e,
    grid: 0x2a2a4e,
    snake: 0x00d9ff,
    snakeHead: 0x00b8d9,
    food: 0xff6b35,
    powerSpeed: 0xa855f7,
    powerShield: 0xfbbf24,
    powerGrow: 0x22c55e,
    text: '#ffffff'
};

let snake = [];
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };
let food = null;
let score = 0;
let gameState = 'start';
let powerUps = [];
let activeEffects = { speed: false, shield: false };
```

**Step 2: Test constants are defined**

Run: Open browser console, check for errors
Expected: No errors

---

### Task 3: Draw grid and UI

**Files:**
- Modify: `src/game.js:create`

**Step 1: Add grid drawing and score text**

```javascript
function create() {
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
    
    this.statusText = this.add.text(300, 300, 'Press SPACE to Start', {
        fontSize: '24px',
        fontFamily: 'Segoe UI',
        color: '#ffffff'
    }).setOrigin(0.5);
    
    for (let x = 0; x < GRID_COUNT; x++) {
        for (let y = 0; y < GRID_COUNT; y++) {
            this.add.rectangle(
                x * GRID_SIZE + GRID_SIZE / 2,
                y * GRID_SIZE + GRID_SIZE / 2 + 80,
                GRID_SIZE - 1,
                GRID_SIZE - 1,
                COLORS.grid
            );
        }
    }
    
    this.gridGraphics = this.add.graphics();
    this.snakeGraphics = this.add.graphics();
    this.foodGraphics = this.add.graphics();
    
    this.input.keyboard.on('keydown-SPACE', () => {
        if (gameState === 'start' || gameState === 'gameover') {
            startGame.call(this);
        }
    });
    
    this.input.keyboard.on('keydown-LEFT', () => changeDirection(0, -1));
    this.input.keyboard.on('keydown-RIGHT', () => changeDirection(0, 1));
    this.input.keyboard.on('keydown-UP', () => changeDirection(-1, 0));
    this.input.keyboard.on('keydown-DOWN', () => changeDirection(1, 0));
}
```

**Step 2: Add helper functions**

```javascript
function changeDirection(dx, dy) {
    if (gameState !== 'playing') return;
    if (direction.x === -dx && direction.y === -dy) return;
    if (direction.x === 0 && dx !== 0) return;
    if (direction.y === 0 && dy !== 0) return;
    nextDirection = { x: dx, y: dy };
}

function startGame() {
    snake = [{ x: 5, y: 5 }, { x: 4, y: 5 }, { x: 3, y: 5 }];
    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
    score = 0;
    gameState = 'playing';
    powerUps = [];
    activeEffects = { speed: false, shield: false };
    
    if (this.scoreText) this.scoreText.setText('Score: 0');
    if (this.statusText) this.statusText.setVisible(false);
    
    spawnFood.call(this);
    spawnPowerUp.call(this);
    
    if (this.gameTimer) this.gameTimer.remove();
    this.gameTimer = this.time.addEvent({
        delay: activeEffects.speed ? 80 : 150,
        callback: gameLoop,
        callbackScope: this,
        loop: true
    });
    
    if (this.powerUpTimer) this.powerUpTimer.remove();
    this.powerUpTimer = this.time.addEvent({
        delay: 12000,
        callback: () => spawnPowerUp.call(this),
        callbackScope: this,
        loop: true
    });
}
```

**Step 3: Test start screen**

Run: Refresh browser
Expected: Grid visible, "Press SPACE to Start" displayed

---

### Task 4: Implement game loop and rendering

**Files:**
- Modify: `src/game.js`

**Step 1: Add gameLoop and render functions**

```javascript
function gameLoop() {
    if (gameState !== 'playing') return;
    
    direction = { ...nextDirection };
    
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
    
    if (head.x < 0 || head.x >= GRID_COUNT || head.y < 0 || head.y >= GRID_COUNT) {
        if (!activeEffects.shield) {
            gameOver.call(this);
            return;
        }
        head.x = (head.x + GRID_COUNT) % GRID_COUNT;
    }
    
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            if (!activeEffects.shield) {
                gameOver.call(this);
                return;
            }
        }
    }
    
    snake.unshift(head);
    
    if (food && head.x === food.x && head.y === food.y) {
        score += 10;
        if (this.scoreText) this.scoreText.setText('Score: ' + score);
        food = null;
        spawnFood.call(this);
    } else {
        snake.pop();
    }
    
    checkPowerUps.call(this, head);
    render.call(this);
}

function spawnFood() {
    let validPosition = false;
    while (!validPosition) {
        food = {
            x: Math.floor(Math.random() * GRID_COUNT),
            y: Math.floor(Math.random() * GRID_COUNT)
        };
        validPosition = !snake.some(seg => seg.x === food.x && seg.y === food.y);
    }
}

function render() {
    this.snakeGraphics.clear();
    this.foodGraphics.clear();
    
    snake.forEach((seg, i) => {
        const px = seg.x * GRID_SIZE + GRID_SIZE / 2;
        const py = seg.y * GRID_SIZE + GRID_SIZE / 2 + 80;
        const color = i === 0 ? COLORS.snakeHead : COLORS.snake;
        this.snakeGraphics.fillStyle(color, 1);
        this.snakeGraphics.fillCircle(px, py, GRID_SIZE / 2 - 1);
    });
    
    if (food) {
        const fx = food.x * GRID_SIZE + GRID_SIZE / 2;
        const fy = food.y * GRID_SIZE + GRID_SIZE / 2 + 80;
        this.foodGraphics.fillStyle(COLORS.food, 1);
        this.foodGraphics.fillCircle(fx, fy, GRID_SIZE / 2 - 1);
    }
    
    powerUps.forEach(pu => {
        const px = pu.x * GRID_SIZE + GRID_SIZE / 2;
        const py = pu.y * GRID_SIZE + GRID_SIZE / 2 + 80;
        const color = pu.type === 'speed' ? COLORS.powerSpeed :
                      pu.type === 'shield' ? COLORS.powerShield : COLORS.powerGrow;
        this.foodGraphics.fillStyle(color, 1);
        this.foodGraphics.fillCircle(px, py, GRID_SIZE / 2 - 1);
    });
}

function gameOver() {
    gameState = 'gameover';
    if (this.gameTimer) this.gameTimer.remove();
    if (this.powerUpTimer) this.powerUpTimer.remove();
    if (this.statusText) {
        this.statusText.setText('Game Over!\nScore: ' + score + '\nPress SPACE');
        this.statusText.setVisible(true);
    }
}
```

**Step 2: Test snake movement**

Run: Press SPACE, use arrow keys
Expected: Snake moves, eats food, grows

---

### Task 5: Implement power-ups

**Files:**
- Modify: `src/game.js`

**Step 1: Add power-up functions**

```javascript
function spawnPowerUp() {
    if (powerUps.length >= 2) return;
    
    const types = ['speed', 'shield', 'grow'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    let validPosition = false;
    let pos;
    while (!validPosition) {
        pos = {
            x: Math.floor(Math.random() * GRID_COUNT),
            y: Math.floor(Math.random() * GRID_COUNT),
            type: type
        };
        const onSnake = snake.some(seg => seg.x === pos.x && seg.y === pos.y);
        const onFood = food && food.x === pos.x && food.y === pos.y;
        const onPowerUp = powerUps.some(pu => pu.x === pos.x && pu.y === pos.y);
        validPosition = !onSnake && !onFood && !onPowerUp;
    }
    
    powerUps.push(pos);
    render.call(this);
    
    this.time.delayedCall(8000, () => {
        powerUps = powerUps.filter(pu => pu !== pos);
        render.call(this);
    });
}

function checkPowerUps(head) {
    const puIndex = powerUps.findIndex(pu => pu.x === head.x && pu.y === head.y);
    if (puIndex === -1) return;
    
    const pu = powerUps[puIndex];
    powerUps.splice(puIndex, 1);
    
    switch (pu.type) {
        case 'speed':
            activateSpeed.call(this);
            break;
        case 'shield':
            activateShield.call(this);
            break;
        case 'grow':
            activateGrow.call(this);
            break;
    }
    render.call(this);
}

function activateSpeed() {
    activeEffects.speed = true;
    if (this.gameTimer) {
        this.gameTimer.delay = 80;
    }
    
    this.time.delayedCall(5000, () => {
        activeEffects.speed = false;
        if (this.gameTimer && gameState === 'playing') {
            this.gameTimer.delay = 150;
        }
    });
}

function activateShield() {
    activeEffects.shield = true;
    this.time.delayedCall(5000, () => {
        activeEffects.shield = false;
    });
}

function activateGrow() {
    for (let i = 0; i < 3; i++) {
        const tail = snake[snake.length - 1];
        snake.push({ x: tail.x, y: tail.y });
    }
}
```

**Step 2: Test power-ups**

Run: Play game, wait for power-ups, collect them
Expected: Power-ups spawn, effects activate (speed: faster, shield: pass through self, grow: +3 segments)

---

### Task 6: Verify complete game

**Files:**
- Modify: `src/game.js`

**Step 1: Add update function stub**

```javascript
function update() {}
```

**Step 2: Test all features**

Run: Play through full game
Expected:
- Start screen displays
- Snake moves with arrow keys
- Food spawns and can be eaten (+10 points)
- 3 power-up types spawn (speed/shield/grow)
- Shield allows passing through walls/self
- Speed increases movement speed
- Grow adds 3 segments
- Game over on collision (without shield)
- Restart with SPACE works

---

### Task 7: Final verification

**Step 1: Check all acceptance criteria**

1. Game loads and displays start screen ✓
2. Snake moves continuously in current direction ✓
3. Arrow keys change snake direction (no 180° turns) ✓
4. Food spawns randomly and can be eaten to grow snake ✓
5. Three power-up types spawn with distinct visual effects ✓
6. Power-ups activate correct effects and expire ✓
7. Game ends on wall collision (unless shielded) ✓
8. Game ends on self collision (unless shielded) ✓
9. Score displays and updates in real-time ✓
10. Game over screen shows final score and allows restart ✓

**Step 2: Commit changes**

```bash
git init
git add index.html src/game.js docs/plans/2026-03-09-snake-game-design.md
git commit -m "feat: add snake game with phaser 3"
```

---

**Plan complete!** Ready for implementation.
