import { test, expect } from '@playwright/test';

test.describe('Authentication and Security', () => {
    test('should redirect unauthenticated users from admin page', async ({ page }) => {
        await page.goto('/admin');
        // Wait for redirect to home
        await expect(page).toHaveURL('http://localhost:3000/');
    });

    test('should show login page correctly', async ({ page }) => {
        await page.goto('/login');
        await expect(page.locator('h1')).toContainText(['Giriş Yap', 'Login']);
    });
});
