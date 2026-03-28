import { test, expect } from '@playwright/test'

test.describe('Logout Flow', () => {
  const testEmail = `logout-test-${Date.now()}@example.com`
  const testPassword = 'TestPassword123!'

  test.beforeEach(async ({ page, request }) => {
    // Create and login test user
    await request.post('/api/auth/register', {
      data: {
        email: testEmail,
        password: testPassword,
        name: 'Logout Test User',
      },
    })

    await page.goto('/login')
    await page.fill('input[type="email"]', testEmail)
    await page.fill('input[type="password"]', testPassword)
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/\/(dashboard|onboarding)/, { timeout: 10000 })
  })

  test('logout clears session and redirects to home', async ({ page }) => {
    // Find and click logout button
    const logoutButton = page.locator('button:has-text("Sign out"), button:has-text("Deconnexion")')

    if (await logoutButton.isVisible()) {
      await logoutButton.click()
    } else {
      // If no logout button visible, go to signout endpoint directly
      await page.goto('/api/auth/signout')
      await page.click('button[type="submit"]')
    }

    // Should be redirected to home
    await expect(page).toHaveURL('/', { timeout: 10000 })
  })

  test('protected routes redirect to login after logout', async ({ page }) => {
    // Logout
    await page.goto('/api/auth/signout')
    const submitButton = page.locator('button[type="submit"]')
    if (await submitButton.isVisible()) {
      await submitButton.click()
    }

    // Wait for redirect
    await page.waitForURL('**/*', { timeout: 5000 })

    // Try to access dashboard
    await page.goto('/dashboard')

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/, { timeout: 5000 })
  })
})
