import { test, expect } from '@playwright/test'

test.describe('Onboarding Wizard', () => {
  const testEmail = `onboarding-${Date.now()}@example.com`
  const testPassword = 'TestPassword123!'

  test.beforeEach(async ({ page, request }) => {
    // Create fresh user (no instance)
    await request.post('/api/auth/register', {
      data: {
        email: testEmail,
        password: testPassword,
        name: 'Onboarding Test',
      },
    })

    await page.goto('/login')
    await page.fill('input[type="email"]', testEmail)
    await page.fill('input[type="password"]', testPassword)
    await page.click('button[type="submit"]')

    // Should be on onboarding page
    await expect(page).toHaveURL('/onboarding', { timeout: 10000 })
  })

  test('step 1: can select channel and enter token', async ({ page }) => {
    // Should show step 1
    await expect(page.locator('text=Telegram')).toBeVisible()
    await expect(page.locator('text=Discord')).toBeVisible()
    await expect(page.locator('text=WhatsApp')).toBeVisible()

    // Continue button should be disabled
    const continueButton = page.locator('button:has-text("Continue")')
    await expect(continueButton).toBeDisabled()

    // Select Telegram
    await page.click('button:has-text("Telegram")')

    // Token input should appear
    const tokenInput = page.locator('input[type="password"]')
    await expect(tokenInput).toBeVisible()

    // Continue still disabled without token
    await expect(continueButton).toBeDisabled()

    // Enter token
    await tokenInput.fill('test-telegram-token')

    // Continue should be enabled
    await expect(continueButton).toBeEnabled()
  })

  test('step 2: can select AI provider and enter API key', async ({ page }) => {
    // Complete step 1
    await page.click('button:has-text("Telegram")')
    await page.fill('input[type="password"]', 'test-token')
    await page.click('button:has-text("Continue")')

    // Should be on step 2
    await expect(page.locator('text=OpenAI')).toBeVisible()
    await expect(page.locator('text=Anthropic')).toBeVisible()
    await expect(page.locator('text=OpenRouter')).toBeVisible()

    // Select OpenAI
    await page.click('button:has-text("OpenAI")')

    // API key input should appear
    const apiKeyInput = page.locator('input[placeholder*="sk-"]')
    await expect(apiKeyInput).toBeVisible()

    // Enter API key
    await apiKeyInput.fill('sk-test-api-key')

    // Can proceed
    const continueButton = page.locator('button:has-text("Continue")')
    await expect(continueButton).toBeEnabled()
  })

  test('step 3: review shows selected options', async ({ page }) => {
    // Complete steps 1 and 2
    await page.click('button:has-text("Telegram")')
    await page.fill('input[type="password"]', 'test-token')
    await page.click('button:has-text("Continue")')

    await page.click('button:has-text("OpenAI")')
    await page.locator('input[placeholder*="sk-"]').fill('sk-test-key')
    await page.click('button:has-text("Continue")')

    // Should show review with selected values
    await expect(page.locator('text=Telegram')).toBeVisible()
    await expect(page.locator('text=OpenAI')).toBeVisible()

    // Deploy button should be visible
    await expect(page.locator('button:has-text("Deploy")')).toBeVisible()
  })

  test('back button returns to previous step', async ({ page }) => {
    // Go to step 2
    await page.click('button:has-text("Telegram")')
    await page.fill('input[type="password"]', 'test-token')
    await page.click('button:has-text("Continue")')

    // Should be on step 2
    await expect(page.locator('text=OpenAI')).toBeVisible()

    // Click back
    await page.click('button:has-text("Back")')

    // Should be back on step 1
    await expect(page.locator('text=Discord')).toBeVisible()
  })

  test('full flow creates instance and redirects to settings', async ({ page }) => {
    // Complete all steps
    await page.click('button:has-text("Telegram")')
    await page.fill('input[type="password"]', 'test-telegram-token')
    await page.click('button:has-text("Continue")')

    await page.click('button:has-text("OpenAI")')
    await page.locator('input[placeholder*="sk-"]').fill('sk-test-api-key-12345')
    await page.click('button:has-text("Continue")')

    // Click deploy
    await page.click('button:has-text("Deploy")')

    // Should redirect to settings (provisioning may fail but redirect should happen)
    await expect(page).toHaveURL(/\/dashboard\/settings/, { timeout: 15000 })
  })
})
