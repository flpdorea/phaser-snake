class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    init(data) {
        this.gameMode = data.mode || 'classic';
    }

    create() {
        this.theme = THEMES[getCurrentTheme()];
        this.cameras.main.setBackgroundColor(this.theme.background);

        this.GRID_SIZE = 20;
        this.GRID_COUNT = 30;

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

        this.initGameState();
        this.createGrid();
        this.createUI();
        this.setupInput();
        this.startGame();
    }

    initGameState() {
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
            this.foodRequired = this.levelConfig[this.currentLevel].foodRequired;
        } else {
            this.currentLevel = 1;
            this.foodRequired = 999;
        }
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
        this.snakeGraphics = this.add.graphics();
        this.foodGraphics = this.add.graphics();
    }

    createUI() {
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

        this.modeText = this.add.text(580, 20, this.getModeLabel(), {
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

            this.progressBg = this.add.rectangle(520, 60, 120, 12, 0x333333).setOrigin(0, 0.5);
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
                color: this.theme.food
            }).setOrigin(0.5);

            this.time.addEvent({
                delay: 1000,
                callback: this.updateTimer,
                callbackScope: this,
                loop: true
            });
        }
    }

    getModeLabel() {
        switch(this.gameMode) {
            case 'classic': return 'CLASSIC';
            case 'timeattack': return 'TIME ATTACK';
            case 'survival': return 'SURVIVAL';
            default: return this.gameMode.toUpperCase();
        }
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

        this.applyLevelObstacles();
        this.spawnFood();

        const speed = this.gameMode === 'classic' ? this.levelConfig[this.currentLevel].speed : 150;
        
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

    applyLevelObstacles() {
        if (this.gameMode !== 'classic') return;
        
        const config = this.levelConfig[this.currentLevel];
        this.obstacles = [];
        
        for (let i = 0; i < config.obstacles; i++) {
            this.spawnObstacle();
        }
    }

    spawnObstacle() {
        let attempts = 0;
        while (attempts < 100) {
            const pos = {
                x: Math.floor(Math.random() * this.GRID_COUNT),
                y: Math.floor(Math.random() * this.GRID_COUNT)
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

    spawnSurvivalObstacle() {
        if (this.gameState !== 'playing') return;
        this.spawnObstacle();
        this.render();
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

    updateProgress() {
        const progress = this.foodCollected / this.foodRequired;
        this.progressBar.width = progress * 120;
        this.progressText.setText(this.foodCollected + '/' + this.foodRequired);
    }

    levelUp() {
        if (this.currentLevel < 10) {
            this.currentLevel++;
            setSavedLevel(this.currentLevel);
            
            const config = this.levelConfig[this.currentLevel];
            this.foodRequired = config.foodRequired;
            this.foodCollected = 0;
            
            for (let i = this.obstacles.length; i < config.obstacles; i++) {
                this.spawnObstacle();
            }
            
            this.gameTimer.delay = config.speed;
            this.levelText.setText('Level ' + this.currentLevel);
            this.progressBar.width = 0;
            this.progressText.setText('0/' + this.foodRequired);
        }
    }

    spawnFood() {
        let attempts = 0;
        while (attempts < 100) {
            this.food = {
                x: Math.floor(Math.random() * this.GRID_COUNT),
                y: Math.floor(Math.random() * this.GRID_COUNT)
            };
            
            const onSnake = this.snake.some(seg => seg.x === this.food.x && seg.y === this.food.y);
            const onObstacle = this.obstacles.some(ob => ob.x === this.food.x && ob.y === this.food.y);
            const onPowerUp = this.powerUps.some(pu => pu.x === this.food.x && pu.y === this.food.y);
            
            if (!onSnake && !onObstacle && !onPowerUp) return;
            attempts++;
        }
    }

    spawnPowerUp() {
        if (this.powerUps.length >= 2 || this.gameState !== 'playing') return;
        
        const types = ['speed', 'shield', 'grow'];
        const type = types[Math.floor(Math.random() * types.length)];

        let attempts = 0;
        while (attempts < 100) {
            const pos = {
                x: Math.floor(Math.random() * this.GRID_COUNT),
                y: Math.floor(Math.random() * this.GRID_COUNT),
                type: type
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

    checkPowerUps(head) {
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

    activateSpeed() {
        this.activeEffects.speed = true;
        this.gameTimer.delay = 80;

        this.time.delayedCall(5000, () => {
            this.activeEffects.speed = false;
            if (this.gameState === 'playing') {
                this.gameTimer.delay = this.gameMode === 'classic' ? 
                    this.levelConfig[this.currentLevel].speed : 150;
            }
        });
    }

    activateShield() {
        this.activeEffects.shield = true;
        this.time.delayedCall(5000, () => {
            this.activeEffects.shield = false;
        });
    }

    activateGrow() {
        for (let i = 0; i < 3; i++) {
            const tail = this.snake[this.snake.length - 1];
            this.snake.push({ x: tail.x, y: tail.y });
        }
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

        this.powerUps.forEach(pu => {
            const px = pu.x * this.GRID_SIZE + this.GRID_SIZE / 2;
            const py = pu.y * this.GRID_SIZE + this.GRID_SIZE / 2 + 80;
            const colors = { speed: 0xa855f7, shield: 0xfbbf24, grow: 0x22c55e };
            this.foodGraphics.fillStyle(colors[pu.type], 1);
            this.foodGraphics.fillCircle(px, py, this.GRID_SIZE / 2 - 1);
        });

        this.obstacles.forEach(ob => {
            const px = ob.x * this.GRID_SIZE + this.GRID_SIZE / 2;
            const py = ob.y * this.GRID_SIZE + this.GRID_SIZE / 2 + 80;
            this.snakeGraphics.fillStyle(this.theme.obstacle, 1);
            this.snakeGraphics.fillRect(px - 9, py - 9, 18, 18);
        });
    }

    endGame() {
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
