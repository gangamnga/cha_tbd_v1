import { test, expect } from '@playwright/test'

// Visual regression tests for admin UI — requires authenticated session.
// Run via the 'admin-chromium' project which loads tests/.auth/admin.json.

test.describe('Visual — admin login page', () => {
  test('login page — default state', async ({ page }) => {
    await page.goto('/admin/login')
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveScreenshot('admin-login-page.png', { maxDiffPixelRatio: 0.02 })
  })

  test('login submit button — default state', async ({ page }) => {
    await page.goto('/admin/login')
    await page.waitForLoadState('networkidle')
    const btn = page.locator('button[type="submit"]')
    await expect(btn).toHaveScreenshot('admin-login-btn-default.png', { maxDiffPixelRatio: 0.02 })
  })

  test('login submit button — hover state (blue → darker)', async ({ page }) => {
    await page.goto('/admin/login')
    await page.waitForLoadState('networkidle')
    const btn = page.locator('button[type="submit"]')
    await btn.hover()
    await page.waitForTimeout(150)
    await expect(btn).toHaveScreenshot('admin-login-btn-hover.png', { maxDiffPixelRatio: 0.02 })
  })
})

test.describe('Visual — admin dashboard buttons (authenticated)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/dang-ky-hanh-huong')
    await page.waitForLoadState('networkidle')
  })

  test('Nhập thủ công button (dang-ky) — default state', async ({ page }) => {
    const btn = page.getByRole('button', { name: /Nhập thủ công/i }).first()
    await expect(btn).toBeVisible()
    await expect(btn).toHaveScreenshot('admin-nhap-thu-cong-dkhh-btn-default.png', { maxDiffPixelRatio: 0.02 })
  })

  test('Nhập thủ công button (dang-ky) — hover state (blue → darker)', async ({ page }) => {
    const btn = page.getByRole('button', { name: /Nhập thủ công/i }).first()
    await btn.hover()
    await page.waitForTimeout(150)
    await expect(btn).toHaveScreenshot('admin-nhap-thu-cong-dkhh-btn-hover.png', { maxDiffPixelRatio: 0.02 })
  })
})

test.describe('Visual — admin y-chi buttons (authenticated)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/y-chi')
    await page.waitForLoadState('networkidle')
  })

  test('Nhập thủ công button (y-chi) — default state', async ({ page }) => {
    const btn = page.getByRole('button', { name: /Nhập thủ công/i }).first()
    await expect(btn).toBeVisible()
    await expect(btn).toHaveScreenshot('admin-nhap-thu-cong-ychi-btn-default.png', { maxDiffPixelRatio: 0.02 })
  })

  test('Nhập thủ công button (y-chi) — hover state (blue → darker)', async ({ page }) => {
    const btn = page.getByRole('button', { name: /Nhập thủ công/i }).first()
    await btn.hover()
    await page.waitForTimeout(150)
    await expect(btn).toHaveScreenshot('admin-nhap-thu-cong-ychi-btn-hover.png', { maxDiffPixelRatio: 0.02 })
  })
})

test.describe('Visual — admin trang-chu config (authenticated)', () => {
  test('Lưu cấu hình button — default state', async ({ page }) => {
    await page.goto('/admin/trang-chu')
    await page.waitForLoadState('networkidle')
    const btn = page.getByRole('button', { name: /Lưu/i }).first()
    await expect(btn).toBeVisible()
    await expect(btn).toHaveScreenshot('admin-luu-btn-default.png', { maxDiffPixelRatio: 0.02 })
  })

  test('Lưu cấu hình button — hover state (blue → darker)', async ({ page }) => {
    await page.goto('/admin/trang-chu')
    await page.waitForLoadState('networkidle')
    const btn = page.getByRole('button', { name: /Lưu/i }).first()
    await btn.hover()
    await page.waitForTimeout(150)
    await expect(btn).toHaveScreenshot('admin-luu-btn-hover.png', { maxDiffPixelRatio: 0.02 })
  })
})
