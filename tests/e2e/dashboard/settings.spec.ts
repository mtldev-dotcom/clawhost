import { test, expect, type Page } from '@playwright/test'

async function waitForHydration(page: Page) {
  await page.waitForLoadState('domcontentloaded')
  await page.waitForTimeout(5000)
}

async function loginAndCompleteOnboarding(page: Page, email: string) {
  await page.route('**/api/onboarding/test-provider', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ valid: true }),
    })
  })

  await page.route('**/api/provision', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ status: 'provisioning' }),
    })
  })

  await page.goto('/login')
  await waitForHydration(page)
  await page.fill('input[type="email"]', email)
  await page.fill('input[type="password"]', 'TestPassword123!')
  await page.click('button[type="submit"]')

  await page.waitForURL(/\/(onboarding|dashboard\/workspace)$/, { timeout: 10000 })
  if (!page.url().endsWith('/onboarding')) {
    await page.goto('/onboarding')
    await expect(page).toHaveURL('/onboarding', { timeout: 10000 })
  }

  await page.click('button:has-text("OpenAI")')
  await page.locator('input[placeholder="sk-..."]').fill('sk-test-key')
  await page.click('button:has-text("Test & Continue")')
  await page.click('button:has-text("GPT-4o")')
  await page.click('button:has-text("Deploy Agent")')
  await expect(page).toHaveURL('/dashboard/workspace', { timeout: 15000 })
}

test.describe('Dashboard Settings', () => {
  test('shows instance status', async ({ page }) => {
    const email = `settings-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`

    await page.request.post('/api/auth/register', {
      data: { email, password: 'TestPassword123!', name: 'Settings Test' },
    })

    await loginAndCompleteOnboarding(page, email)
    await page.goto('/dashboard/settings')

    // Should show instance status
    await expect(page.locator('text=Instance Status')).toBeVisible()
    await expect(page.locator('text=pending')).toHaveCount(2)
  })

  test('can navigate to skills page', async ({ page }) => {
    const email = `nav-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`

    await page.request.post('/api/auth/register', {
      data: { email, password: 'TestPassword123!', name: 'Nav Test' },
    })

    await loginAndCompleteOnboarding(page, email)

    await page.click('a[href="/dashboard/skills"]')
    await expect(page).toHaveURL('/dashboard/skills')
  })

  test('can navigate to workspace page', async ({ page }) => {
    const email = `workspace-nav-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`

    await page.request.post('/api/auth/register', {
      data: { email, password: 'TestPassword123!', name: 'Workspace Nav Test' },
    })

    await loginAndCompleteOnboarding(page, email)
    await page.goto('/dashboard/settings')

    await page.click('a[href="/dashboard/workspace"]')
    await expect(page).toHaveURL('/dashboard/workspace')
  })
})
