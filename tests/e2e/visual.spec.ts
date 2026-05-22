import { test, expect } from '@playwright/test'

// Visual regression tests — pixel-by-pixel screenshot comparison.
// First run creates the baseline in tests/e2e/__screenshots__.
// Subsequent runs diff against that baseline.

test.describe('Visual — /can-biet buttons', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/can-biet')
    // Wait for the page to be fully painted (fonts, images settled)
    await page.waitForLoadState('networkidle')
  })

  // ── Bản đồ button ──────────────────────────────────────────────────────────
  test('Bản đồ button — default state', async ({ page }) => {
    const btn = page.getByRole('link', { name: /Bản đồ/i }).first()
    await expect(btn).toBeVisible()
    await expect(btn).toHaveScreenshot('ban-do-default.png', { maxDiffPixelRatio: 0.02 })
  })

  test('Bản đồ button — hover state', async ({ page }) => {
    const btn = page.getByRole('link', { name: /Bản đồ/i }).first()
    await btn.hover()
    await page.waitForTimeout(150) // let CSS transition settle
    await expect(btn).toHaveScreenshot('ban-do-hover.png', { maxDiffPixelRatio: 0.02 })
  })

  // ── Hướng dẫn button ───────────────────────────────────────────────────────
  test('Hướng dẫn button — default state', async ({ page }) => {
    const btn = page.getByRole('link', { name: /Hướng dẫn/i }).first()
    await expect(btn).toBeVisible()
    await expect(btn).toHaveScreenshot('huong-dan-default.png', { maxDiffPixelRatio: 0.02 })
  })

  test('Hướng dẫn button — hover state (outlined → filled)', async ({ page }) => {
    const btn = page.getByRole('link', { name: /Hướng dẫn/i }).first()
    await btn.hover()
    await page.waitForTimeout(150)
    await expect(btn).toHaveScreenshot('huong-dan-hover.png', { maxDiffPixelRatio: 0.02 })
  })

  // ── Tham gia cộng đồng button ──────────────────────────────────────────────
  test('Tham gia cộng đồng button — default state', async ({ page }) => {
    const btn = page.getByTestId('community-signup-btn')
    await btn.scrollIntoViewIfNeeded()
    await expect(btn).toBeVisible()
    await expect(btn).toHaveScreenshot('tham-gia-cong-dong-default.png', { maxDiffPixelRatio: 0.02 })
  })

  test('Tham gia cộng đồng button — hover state (blue → darker)', async ({ page }) => {
    const btn = page.getByTestId('community-signup-btn')
    await btn.scrollIntoViewIfNeeded()
    await btn.hover()
    await page.waitForTimeout(150)
    await expect(btn).toHaveScreenshot('tham-gia-cong-dong-hover.png', { maxDiffPixelRatio: 0.02 })
  })

  // ── Paired comparison: both buttons side-by-side ───────────────────────────
  test('location card button row — default layout', async ({ page }) => {
    const row = page.locator('.px-4.pb-4.flex.gap-2').first()
    await expect(row).toBeVisible()
    await expect(row).toHaveScreenshot('button-row-default.png', { maxDiffPixelRatio: 0.02 })
  })
})

// ── Homepage section headers ───────────────────────────────────────────────────
test.describe('Visual — homepage section headers', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('TIN NHANH section header', async ({ page }) => {
    const header = page.getByText('TIN NHANH', { exact: true }).first()
    await expect(header).toHaveScreenshot('section-tin-nhanh.png', { maxDiffPixelRatio: 0.02 })
  })

  test('THÔNG BÁO section header', async ({ page }) => {
    const header = page.getByText('THÔNG BÁO', { exact: true }).first()
    await expect(header).toHaveScreenshot('section-thong-bao.png', { maxDiffPixelRatio: 0.02 })
  })
})

// ── Tham gia cộng đồng modal ───────────────────────────────────────────────────
test.describe('Visual — community signup modal', () => {
  test('modal opens when button clicked', async ({ page }) => {
    await page.goto('/can-biet')
    await page.waitForLoadState('load')

    // Wait for React hydration — button becomes interactive once mounted
    const btn = page.getByTestId('community-signup-btn')
    await expect(btn).toBeVisible({ timeout: 10000 })
    await btn.scrollIntoViewIfNeeded()
    await btn.click()

    // The modal form contains an input for name — wait for it
    const nameInput = page.locator('input[placeholder="Nguyễn Văn A"]')
    await expect(nameInput).toBeVisible({ timeout: 8000 })
    await page.waitForTimeout(200)
    await expect(page).toHaveScreenshot('signup-modal-open.png', { maxDiffPixelRatio: 0.02 })
  })
})
