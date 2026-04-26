import { test, expect } from '@playwright/test'

async function registerAndLogin(page: Parameters<typeof test>[1] extends (...args: infer A) => unknown ? A[0] : never, request: Parameters<typeof test>[1] extends (...args: infer A) => unknown ? A[1] : never, testInfo: Parameters<typeof test>[1] extends (...args: infer A) => unknown ? A[2] : never) {
  const email = `workspace-${Date.now()}-${testInfo.parallelIndex}@example.com`
  await request.post('/api/auth/register', {
    data: { email, password: 'TestPassword123!', name: 'WS Test' },
  })
  await page.goto('/login')
  await page.fill('input[type="email"]', email)
  await page.fill('input[type="password"]', 'TestPassword123!')
  await page.click('button[type="submit"]')
  await page.waitForURL(/\/(onboarding|dashboard\/workspace)/, { timeout: 10000 })
  if (!page.url().includes('/dashboard/workspace')) {
    await page.goto('/dashboard/workspace')
    await page.waitForURL(/\/dashboard\/workspace/, { timeout: 10000 })
  }
}

test.describe('Workspace shell', () => {
  test('loads the workspace shell after login', async ({ page, request }, testInfo) => {
    await registerAndLogin(page, request, testInfo)
    await expect(page.getByText('My Workspace')).toBeVisible({ timeout: 8000 })
  })

  test('shows root folders in workspace', async ({ page, request }, testInfo) => {
    await registerAndLogin(page, request, testInfo)
    await expect(page.getByText('Inbox')).toBeVisible({ timeout: 8000 })
    await expect(page.getByText('Projects')).toBeVisible({ timeout: 8000 })
    await expect(page.getByText('Notes')).toBeVisible({ timeout: 8000 })
  })

  test('can create a new standard page', async ({ page, request }, testInfo) => {
    await registerAndLogin(page, request, testInfo)
    await page.fill('input[name="title"]', 'My Test Page')
    await page.getByRole('button', { name: /create page/i }).click()
    await expect(page.getByText('My Test Page')).toBeVisible({ timeout: 8000 })
  })

  test('dashboard redirects to workspace', async ({ page, request }, testInfo) => {
    await registerAndLogin(page, request, testInfo)
    await page.goto('/dashboard')
    await page.waitForURL(/\/dashboard\/workspace/, { timeout: 10000 })
    await expect(page).toHaveURL(/\/dashboard\/workspace/)
  })
})
