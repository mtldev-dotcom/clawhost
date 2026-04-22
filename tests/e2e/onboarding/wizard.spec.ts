import { test, expect, type Page } from '@playwright/test'

async function waitForHydration(page: Page) {
  await page.waitForLoadState('domcontentloaded')
  await page.waitForTimeout(5000)
}

async function loginToOnboarding(page: Page, email: string, password: string) {
  await page.goto('/login')
  await waitForHydration(page)
  await page.fill('input[type="email"]', email)
  await page.fill('input[type="password"]', password)
  await page.click('button[type="submit"]')
  await page.waitForURL(/\/(onboarding|dashboard\/workspace)$/, { timeout: 10000 })
  if (!page.url().endsWith('/onboarding')) {
    await page.goto('/onboarding')
  }
  await expect(page).toHaveURL('/onboarding', { timeout: 10000 })
}

test.describe('Onboarding Wizard', () => {
  test.beforeEach(async ({ page, request }, testInfo) => {
    const testEmail = `onboarding-${Date.now()}-${testInfo.parallelIndex}-${Math.random().toString(36).slice(2, 8)}@example.com`
    const testPassword = 'TestPassword123!'

    await request.post('/api/auth/register', {
      data: {
        email: testEmail,
        password: testPassword,
        name: 'Onboarding Test',
      },
    })

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

    await loginToOnboarding(page, testEmail, testPassword)
  })

  test('step 1: shows provider-first setup and validates required fields', async ({ page }) => {
    await expect(page.locator('text=OpenAI')).toBeVisible()
    await expect(page.locator('text=Anthropic')).toBeVisible()
    await expect(page.locator('text=OpenRouter')).toBeVisible()
    await expect(page.locator('text=Telegram')).toHaveCount(0)

    const continueButton = page.locator('button:has-text("Test & Continue")')
    await expect(continueButton).toBeDisabled()

    await page.click('button:has-text("OpenAI")')
    await expect(page.locator('input[placeholder="sk-..."]')).toBeVisible()
    await expect(continueButton).toBeDisabled()

    await page.locator('input[placeholder="sk-..."]').fill('sk-test-api-key')
    await expect(continueButton).toBeEnabled()
  })

  test('step 2: can test provider and select a model', async ({ page }) => {
    await page.click('button:has-text("OpenAI")')
    await page.locator('input[placeholder="sk-..."]').fill('sk-test-api-key')
    await page.click('button:has-text("Test & Continue")')

    await expect(page.locator('text=Choose which model your agent will use')).toBeVisible()
    await expect(page.locator('button:has-text("GPT-4o")')).toBeVisible()
    await expect(page.locator('button:has-text("GPT-4 Turbo")')).toBeVisible()
  })

  test('step 2: deploy stays disabled until a model is selected', async ({ page }) => {
    await page.click('button:has-text("OpenAI")')
    await page.locator('input[placeholder="sk-..."]').fill('sk-test-api-key')
    await page.click('button:has-text("Test & Continue")')

    const deployButton = page.locator('button:has-text("Deploy Agent")')
    await expect(deployButton).toBeDisabled()

    await page.click('button:has-text("GPT-4o")')
    await expect(deployButton).toBeEnabled()
  })

  test('back button returns to provider selection', async ({ page }) => {
    await page.click('button:has-text("OpenAI")')
    await page.locator('input[placeholder="sk-..."]').fill('sk-test-api-key')
    await page.click('button:has-text("Test & Continue")')

    await expect(page.locator('text=Choose which model your agent will use')).toBeVisible()
    await page.click('button:has-text("Back")')

    await expect(page.locator('text=Select your AI provider and enter your API key')).toBeVisible()
    await expect(page.locator('button:has-text("OpenAI")')).toBeVisible()
  })

  test('full flow creates an instance and redirects to workspace', async ({ page }) => {
    await page.click('button:has-text("OpenAI")')
    await page.locator('input[placeholder="sk-..."]').fill('sk-test-api-key-12345')
    await page.click('button:has-text("Test & Continue")')
    await page.click('button:has-text("GPT-4o")')
    await page.click('button:has-text("Deploy Agent")')

    await expect(page.locator('text=Your workspace is ready!')).toBeVisible()
    await expect(page).toHaveURL('/dashboard/workspace', { timeout: 15000 })
  })
})
