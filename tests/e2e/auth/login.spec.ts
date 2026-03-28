import { test, expect } from '@playwright/test'

test.describe('Login Flow', () => {
  const testEmail = `login-test-${Date.now()}@example.com`
  const testPassword = 'TestPassword123!'

  test.beforeAll(async ({ request }) => {
    // Create test user via API
    await request.post('/api/auth/register', {
      data: {
        email: testEmail,
        password: testPassword,
        name: 'Login Test User',
      },
    })
  })

  test('successful login redirects to dashboard', async ({ page }) => {
    await page.goto('/login')

    await page.fill('input[type="email"]', testEmail)
    await page.fill('input[type="password"]', testPassword)
    await page.click('button[type="submit"]')

    // Should redirect to dashboard (or onboarding if no instance)
    await expect(page).toHaveURL(/\/(dashboard|onboarding)/, { timeout: 10000 })
  })

  test('shows error for invalid credentials', async ({ page }) => {
    await page.goto('/login')

    await page.fill('input[type="email"]', testEmail)
    await page.fill('input[type="password"]', 'WrongPassword!')
    await page.click('button[type="submit"]')

    // Should show error message
    await expect(page.locator('[class*="text-red"]')).toBeVisible({ timeout: 5000 })
  })

  test('shows error for non-existent user', async ({ page }) => {
    await page.goto('/login')

    await page.fill('input[type="email"]', 'nonexistent@example.com')
    await page.fill('input[type="password"]', 'SomePassword123!')
    await page.click('button[type="submit"]')

    // Should show error message
    await expect(page.locator('[class*="text-red"]')).toBeVisible({ timeout: 5000 })
  })

  test('preserves callbackUrl after login', async ({ page }) => {
    // Try to access protected page while logged out
    await page.goto('/dashboard/settings')

    // Should redirect to login with callbackUrl
    await expect(page).toHaveURL(/\/login\?callbackUrl/)

    // Login
    await page.fill('input[type="email"]', testEmail)
    await page.fill('input[type="password"]', testPassword)
    await page.click('button[type="submit"]')

    // Should redirect back to settings (or onboarding if no instance)
    await expect(page).toHaveURL(/\/(dashboard|onboarding)/, { timeout: 10000 })
  })

  test('link to register page works', async ({ page }) => {
    await page.goto('/login')

    await page.click('a[href="/register"]')
    await expect(page).toHaveURL('/register')
  })
})
