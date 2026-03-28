import { test, expect } from '@playwright/test'

test.describe('Signup Flow', () => {
  const uniqueEmail = () => `test-${Date.now()}@example.com`

  test('successful signup redirects to onboarding', async ({ page }) => {
    const email = uniqueEmail()

    await page.goto('/register')
    await expect(page).toHaveURL('/register')

    // Fill form
    await page.fill('input[type="email"]', email)
    await page.fill('input[type="password"]', 'TestPassword123!')
    await page.fill('input[type="text"]', 'Test User')

    // Submit
    await page.click('button[type="submit"]')

    // Should redirect to onboarding after successful signup + auto-login
    await expect(page).toHaveURL('/onboarding', { timeout: 10000 })
  })

  test('shows error for duplicate email', async ({ page, request }) => {
    // Create user via API first
    const email = uniqueEmail()
    await request.post('/api/auth/register', {
      data: { email, password: 'TestPassword123!', name: 'Test' },
    })

    // Try to register with same email via UI
    await page.goto('/register')
    await page.fill('input[type="email"]', email)
    await page.fill('input[type="password"]', 'TestPassword123!')
    await page.click('button[type="submit"]')

    // Should show error
    await expect(page.locator('text=Email taken')).toBeVisible({ timeout: 5000 })
  })

  test('shows validation for short password', async ({ page }) => {
    await page.goto('/register')

    await page.fill('input[type="email"]', uniqueEmail())
    await page.fill('input[type="password"]', 'short')
    await page.click('button[type="submit"]')

    // HTML5 validation should prevent submission
    const passwordInput = page.locator('input[type="password"]')
    await expect(passwordInput).toHaveAttribute('minlength', '8')
  })

  test('form is disabled during submission', async ({ page }) => {
    await page.goto('/register')

    await page.fill('input[type="email"]', uniqueEmail())
    await page.fill('input[type="password"]', 'TestPassword123!')

    const submitButton = page.locator('button[type="submit"]')
    await submitButton.click()

    // Button should be disabled during submission
    await expect(submitButton).toBeDisabled()
  })

  test('link to login page works', async ({ page }) => {
    await page.goto('/register')

    await page.click('a[href="/login"]')
    await expect(page).toHaveURL('/login')
  })
})
