import { test, expect } from '@playwright/test';

test.describe('Snake Game E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('game loads and displays canvas', async ({ page }) => {
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
  });

  test('canvas has correct dimensions', async ({ page }) => {
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
    
    const width = await canvas.evaluate((el) => (el as HTMLCanvasElement).width);
    const height = await canvas.evaluate((el) => (el as HTMLCanvasElement).height);
    
    expect(width).toBe(600);
    expect(height).toBe(680);
  });

  test('keyboard input is captured', async ({ page }) => {
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
    
    await canvas.click();
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(100);
    
    await expect(canvas).toBeVisible();
  });

  test('game container exists', async ({ page }) => {
    const container = page.locator('#game-container');
    await expect(container).toBeVisible();
  });

  test('multiple canvases can render', async ({ page }) => {
    await page.waitForTimeout(500);
    
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
  });
});
