import { test, expect, type Page } from '@playwright/test'

async function waitForHydration(page: Page) {
  await page.waitForLoadState('domcontentloaded')
  await page.waitForTimeout(5000)
}

async function completeLogout(page: Page) {
  const logoutButton = page.locator('button:has-text("Sign out"), button:has-text("Deconnexion")').first()

  if (await logoutButton.isVisible()) {
    await logoutButton.click()
  } else {
    await page.goto('/api/auth/signout')
  }

  const confirmHeading = page.getByRole('heading', { name: /signout/i })
  if (await confirmHeading.isVisible({ timeout: 3000 }).catch(() => false)) {
    await page.getByRole('button', { name: /^sign out$/i }).click()
  }

  await page.waitForURL((url) => url.pathname === '/', { timeout: 20000 })
  await expect(page.getByRole('link', { name: /sign in/i }).first()).toBeVisible({ timeout: 10000 })
}

test.describe('Logout Flow', () => {
  test.beforeEach(async ({ page, request }, testInfo) => {
    const testEmail = `logout-test-${Date.now()}-${testInfo.parallelIndex}-${Math.random().toString(36).slice(2, 8)}@example.com`
    const testPassword = 'TestPassword123!'

    await request.post('/api/auth/register', {
      data: {
        email: testEmail,
        password: testPassword,
        name: 'Logout Test User',
      },
    })

    await page.goto('/login')
    await waitForHydration(page)
    await page.fill('input[type="email"]', testEmail)
    await page.fill('input[type="password"]', testPassword)
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/\/(dashboard|onboarding|dashboard\/workspace)/, { timeout: 10000 })
  })

  test('logout clears session and returns to public home', async ({ page }) => {
    await completeLogout(page)
  })

  test('protected routes redirect to login after logout', async ({ page }) => {
    await completeLogout(page)
    await page.goto('/dashboard')
    await page.waitForURL((url) => url.pathname === '/login', { timeout: 10000 })
    await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 5000 })
  })
})