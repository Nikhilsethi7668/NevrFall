import { test, expect } from '@playwright/test';

test.describe('Visual Regression', () => {
    test('Navbar Mobile', async ({ page }) => {
        await page.setViewportSize({ width: 360, height: 800 });
        await page.goto('http://localhost:6006/iframe.html?id=components-navbar--default');
        await expect(page).toHaveScreenshot('navbar-mobile.png');
    });

    test('Navbar Desktop', async ({ page }) => {
        await page.setViewportSize({ width: 1366, height: 768 });
        await page.goto('http://localhost:6006/iframe.html?id=components-navbar--default');
        await expect(page).toHaveScreenshot('navbar-desktop.png');
    });

    // Add more tests as we build components
});
