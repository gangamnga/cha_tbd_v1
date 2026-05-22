import { test as setup } from '@playwright/test'
import path from 'path'

export const ADMIN_STORAGE_STATE = path.join(__dirname, '../.auth/admin.json')

setup('authenticate as admin', async ({ page }) => {
  await page.goto('/admin/login')
  await page.locator('#email').fill(process.env.TEST_ADMIN_EMAIL!)
  await page.locator('#password').fill(process.env.TEST_ADMIN_PASSWORD!)
  await page.locator('button[type="submit"]').click()
  // Wait until redirected away from login
  await page.waitForURL(url => !url.pathname.includes('/login'), { timeout: 15000 })
  await page.context().storageState({ path: ADMIN_STORAGE_STATE })
})
