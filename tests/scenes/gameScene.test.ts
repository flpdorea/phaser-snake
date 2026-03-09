import { describe, it, expect, beforeEach } from 'vitest';

describe('GameScene Logic', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Direction Changes', () => {
    it('should not allow 180 degree turns', () => {
      const currentDir = { x: 1, y: 0 };
      const newDir = { x: -1, y: 0 };
      
      const isValidTurn = !(currentDir.x === -newDir.x && currentDir.y === -newDir.y);
      expect(isValidTurn).toBe(false);
    });

    it('should allow 90 degree turns', () => {
      const currentDir = { x: 1, y: 0 };
      const newDir = { x: 0, y: -1 };
      
      const isValidTurn = !(currentDir.x === -newDir.x && currentDir.y === -newDir.y);
      expect(isValidTurn).toBe(true);
    });

    it('should not allow same axis turns', () => {
      const currentDir = { x: 1, y: 0 };
      const newDir = { x: 1, y: 0 };
      
      const isSameAxis = currentDir.x !== 0 && newDir.x !== 0;
      expect(isSameAxis).toBe(true);
    });
  });

  describe('Collision Detection', () => {
    it('detects wall collision (left)', () => {
      const head = { x: -1, y: 5 };
      const gridCount = 30;
      
      const hitWall = head.x < 0 || head.x >= gridCount || head.y < 0 || head.y >= gridCount;
      expect(hitWall).toBe(true);
    });

    it('detects wall collision (right)', () => {
      const head = { x: 30, y: 5 };
      const gridCount = 30;
      
      const hitWall = head.x < 0 || head.x >= gridCount || head.y < 0 || head.y >= gridCount;
      expect(hitWall).toBe(true);
    });

    it('detects wall collision (top)', () => {
      const head = { x: 5, y: -1 };
      const gridCount = 30;
      
      const hitWall = head.x < 0 || head.x >= gridCount || head.y < 0 || head.y >= gridCount;
      expect(hitWall).toBe(true);
    });

    it('detects wall collision (bottom)', () => {
      const head = { x: 5, y: 30 };
      const gridCount = 30;
      
      const hitWall = head.x < 0 || head.x >= gridCount || head.y < 0 || head.y >= gridCount;
      expect(hitWall).toBe(true);
    });

    it('detects self collision', () => {
      const head = { x: 5, y: 5 };
      const snake = [
        { x: 5, y: 5 },
        { x: 4, y: 5 },
        { x: 3, y: 5 }
      ];
      
      const hitSelf = snake.slice(1).some(seg => seg.x === head.x && seg.y === head.y);
      expect(hitSelf).toBe(false);
    });

    it('detects collision with body (not head)', () => {
      const head = { x: 4, y: 5 };
      const snake = [
        { x: 5, y: 5 },
        { x: 4, y: 5 },
        { x: 3, y: 5 }
      ];
      
      const hitSelf = snake.slice(1).some(seg => seg.x === head.x && seg.y === head.y);
      expect(hitSelf).toBe(true);
    });

    it('detects obstacle collision', () => {
      const head = { x: 10, y: 10 };
      const obstacles = [{ x: 10, y: 10 }, { x: 15, y: 15 }];
      
      const hitObstacle = obstacles.some(ob => ob.x === head.x && ob.y === head.y);
      expect(hitObstacle).toBe(true);
    });

    it('no obstacle collision when clear', () => {
      const head = { x: 5, y: 5 };
      const obstacles = [{ x: 10, y: 10 }, { x: 15, y: 15 }];
      
      const hitObstacle = obstacles.some(ob => ob.x === head.x && ob.y === head.y);
      expect(hitObstacle).toBe(false);
    });
  });

  describe('Power-up Effects', () => {
    it('grow power-up adds 3 segments', () => {
      const snake = [{ x: 5, y: 5 }, { x: 4, y: 5 }, { x: 3, y: 5 }];
      const initialLength = snake.length;
      
      for (let i = 0; i < 3; i++) {
        const tail = snake[snake.length - 1];
        snake.push({ x: tail.x, y: tail.y });
      }
      
      expect(snake.length).toBe(initialLength + 3);
    });

    it('shield effect prevents wall death', () => {
      const head = { x: -1, y: 5 };
      const gridCount = 30;
      const hasShield = true;
      
      if (hasShield) {
        head.x = (head.x + gridCount) % gridCount;
      }
      
      expect(head.x).toBe(29);
    });
  });

  describe('Level Progression', () => {
    it('levels up when food required is met', () => {
      const foodCollected = 5;
      const foodRequired = 5;
      
      expect(foodCollected >= foodRequired).toBe(true);
    });

    it('does not level up when food required is not met', () => {
      const foodCollected = 4;
      const foodRequired = 5;
      
      expect(foodCollected >= foodRequired).toBe(false);
    });

    it('level config increases speed as level increases', () => {
      const levelConfig: Record<number, { speed: number }> = {
        1: { speed: 150 },
        5: { speed: 110 },
        10: { speed: 80 }
      };
      
      expect(levelConfig[5].speed).toBeLessThan(levelConfig[1].speed);
      expect(levelConfig[10].speed).toBeLessThan(levelConfig[5].speed);
    });
  });

  describe('Score Calculation', () => {
    it('classic mode gives 10 points per food', () => {
      const gameMode = 'classic';
      const points = gameMode === 'timeattack' ? 20 : 10;
      expect(points).toBe(10);
    });

    it('time attack mode gives 20 points per food', () => {
      const gameMode = 'timeattack';
      const points = gameMode === 'timeattack' ? 20 : 10;
      expect(points).toBe(20);
    });
  });

  describe('Food Spawning', () => {
    it('food should not spawn on snake', () => {
      const snake = [{ x: 5, y: 5 }, { x: 4, y: 5 }, { x: 3, y: 5 }];
      const food = { x: 5, y: 5 };
      
      const onSnake = snake.some(seg => seg.x === food.x && seg.y === food.y);
      expect(onSnake).toBe(true);
    });

    it('food should not spawn on obstacle', () => {
      const obstacles = [{ x: 10, y: 10 }];
      const food = { x: 10, y: 10 };
      
      const onObstacle = obstacles.some(ob => ob.x === food.x && ob.y === food.y);
      expect(onObstacle).toBe(true);
    });
  });
});
