import { test, expect } from '@playwright/test'

test.describe('Onboarding — platform model selection', () => {
  test.beforeEach(async ({ request }, testInfo) => {
    const email = `onboard-${Date.now()}-${testInfo.parallelIndex}@example.com`
    const res = await request.post('/api/auth/register', {
      data: { email, password: 'TestPassword123!', name: 'Onboard Test' },
    })
    expect(res.status()).toBe(201)
    // Store for use in test
    testInfo.annotations.push({ type: 'email', description: email })
  })

  test('step 1 shows platform model options, not provider key input', async ({ page, request }, testInfo) => {
    const email = testInfo.annotations.find(a => a.type === 'email')?.description ?? ''
    // Login
    await page.goto('/login')
    await page.fill('input[type="email"]', email)
    await page.fill('input[type="password"]', 'TestPassword123!')
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/(onboarding|dashboard\/workspace)/, { timeout: 10000 })
    if (!page.url().includes('/onboarding')) {
      await page.goto('/onboarding')
    }
    // Should NOT have a provider-key input
    await expect(page.locator('input[placeholder="sk-..."]')).toHaveCount(0)
    // Should show model selection options
    await expect(page.getByText('Platform-managed AI access')).toBeVisible({ timeout: 8000 })
  })

  test('can select a model and proceed to workspace', async ({ page }, testInfo) => {
    const email = testInfo.annotations.find(a => a.type === 'email')?.description ?? ''
    await page.goto('/login')
    await page.fill('input[type="email"]', email)
    await page.fill('input[type="password"]', 'TestPassword123!')
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/(onboarding|dashboard\/workspace)/, { timeout: 10000 })
    if (!page.url().includes('/onboarding')) {
      await page.goto('/onboarding')
    }
    // Mock the instance PATCH so no real DB write needed in E2E
    await page.route('**/api/instance', async route => {
      if (route.request().method() === 'PATCH') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ instance: {} }) })
      } else {
        await route.continue()
      }
    })
    // Click save model button
    await page.getByRole('button', { name: /save model/i }).click()
    // Should advance to step 2
    await expect(page.getByText('Telegram')).toBeVisible({ timeout: 8000 })
    // Click go to workspace
    await page.getByRole('button', { name: /go to workspace/i }).click()
    // Should land in workspace
    await page.waitForURL(/\/dashboard\/workspace/, { timeout: 10000 })
    await expect(page).toHaveURL(/\/dashboard\/workspace/)
  })
})
