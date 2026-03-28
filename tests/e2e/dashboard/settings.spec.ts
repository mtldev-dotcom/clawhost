import { test, expect } from '@playwright/test'

test.describe('Dashboard Settings', () => {
  // This test requires an existing user with an instance
  // For full testing, you'd set up test data in beforeAll

  test('shows instance status', async ({ page }) => {
    // Create user and instance via onboarding
    const email = `settings-${Date.now()}@example.com`

    await page.request.post('/api/auth/register', {
      data: { email, password: 'TestPassword123!', name: 'Settings Test' },
    })

    await page.goto('/login')
    await page.fill('input[type="email"]', email)
    await page.fill('input[type="password"]', 'TestPassword123!')
    await page.click('button[type="submit"]')

    await expect(page).toHaveURL('/onboarding', { timeout: 10000 })

    // Complete onboarding
    await page.click('button:has-text("Telegram")')
    await page.fill('input[type="password"]', 'test-token')
    await page.click('button:has-text("Continue")')

    await page.click('button:has-text("OpenAI")')
    await page.locator('input[placeholder*="sk-"]').fill('sk-test-key')
    await page.click('button:has-text("Continue")')
    await page.click('button:has-text("Deploy")')

    await expect(page).toHaveURL(/\/dashboard\/settings/, { timeout: 15000 })

    // Should show instance status
    await expect(
      page.locator('text=pending, text=provisioning, text=active, text=failed').first()
    ).toBeVisible({ timeout: 5000 })
  })

  test('can navigate to skills page', async ({ page }) => {
    const email = `nav-${Date.now()}@example.com`

    // Quick setup
    await page.request.post('/api/auth/register', {
      data: { email, password: 'TestPassword123!', name: 'Nav Test' },
    })

    await page.goto('/login')
    await page.fill('input[type="email"]', email)
    await page.fill('input[type="password"]', 'TestPassword123!')
    await page.click('button[type="submit"]')

    // Complete minimal onboarding
    await expect(page).toHaveURL('/onboarding', { timeout: 10000 })
    await page.click('button:has-text("Telegram")')
    await page.fill('input[type="password"]', 'test-token')
    await page.click('button:has-text("Continue")')
    await page.click('button:has-text("OpenAI")')
    await page.locator('input[placeholder*="sk-"]').fill('sk-test-key')
    await page.click('button:has-text("Continue")')
    await page.click('button:has-text("Deploy")')

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 })

    // Navigate to skills
    await page.click('a[href="/dashboard/skills"]')
    await expect(page).toHaveURL('/dashboard/skills')
  })

  test('can navigate to chat page', async ({ page }) => {
    const email = `chat-nav-${Date.now()}@example.com`

    await page.request.post('/api/auth/register', {
      data: { email, password: 'TestPassword123!', name: 'Chat Nav Test' },
    })

    await page.goto('/login')
    await page.fill('input[type="email"]', email)
    await page.fill('input[type="password"]', 'TestPassword123!')
    await page.click('button[type="submit"]')

    // Complete minimal onboarding
    await expect(page).toHaveURL('/onboarding', { timeout: 10000 })
    await page.click('button:has-text("Telegram")')
    await page.fill('input[type="password"]', 'test-token')
    await page.click('button:has-text("Continue")')
    await page.click('button:has-text("OpenAI")')
    await page.locator('input[placeholder*="sk-"]').fill('sk-test-key')
    await page.click('button:has-text("Continue")')
    await page.click('button:has-text("Deploy")')

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 })

    // Navigate to chat (main dashboard)
    await page.click('a[href="/dashboard"]')
    await expect(page).toHaveURL('/dashboard')
  })
})
