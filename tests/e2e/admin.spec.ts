import { test, expect } from '@playwright/test'

test.describe('Admin — unauthenticated access', () => {
  test('GET /admin redirects to auth or stays on admin', async ({ page }) => {
    await page.goto('/admin')
    await expect(page).toHaveURL(/\/(auth|admin)/)
  })

  test('GET /admin/trang-chu redirects when not logged in', async ({ page }) => {
    await page.goto('/admin/trang-chu')
    await expect(page).toHaveURL(/\/(auth|admin)/)
  })

  test('GET /admin/y-chi redirects when not logged in', async ({ page }) => {
    await page.goto('/admin/y-chi')
    await expect(page).toHaveURL(/\/(auth|admin)/)
  })

  test('GET /admin/loi-chung redirects when not logged in', async ({ page }) => {
    await page.goto('/admin/loi-chung')
    await expect(page).toHaveURL(/\/(auth|admin)/)
  })

  test('GET /admin/dang-ky-hanh-huong redirects when not logged in', async ({ page }) => {
    await page.goto('/admin/dang-ky-hanh-huong')
    await expect(page).toHaveURL(/\/(auth|admin)/)
  })

  test('GET /admin/thanh-vien-cong-dong redirects when not logged in', async ({ page }) => {
    await page.goto('/admin/thanh-vien-cong-dong')
    await expect(page).toHaveURL(/\/(auth|admin)/)
  })
})

test.describe('Admin — cron endpoint security', () => {
  test('GET /api/cron/scrape returns 401 without auth header', async ({ request }) => {
    const res = await request.get('/api/cron/scrape')
    expect(res.status()).toBe(401)
  })

  test('GET /api/cron/scrape returns 401 with wrong bearer token', async ({ request }) => {
    const res = await request.get('/api/cron/scrape', {
      headers: { Authorization: 'Bearer wrong-secret' },
    })
    expect(res.status()).toBe(401)
  })
})

test.describe('API — community signup', () => {
  test('POST /api/community-signup returns 400 when fields are missing', async ({ request }) => {
    const res = await request.post('/api/community-signup', { data: {} })
    expect(res.status()).toBe(400)
  })

  test('POST /api/community-signup returns 400 when full_name is empty', async ({ request }) => {
    const res = await request.post('/api/community-signup', {
      data: { full_name: '', phone: '0901234567' },
    })
    expect(res.status()).toBe(400)
  })

  test('POST /api/community-signup returns 400 when phone is empty', async ({ request }) => {
    const res = await request.post('/api/community-signup', {
      data: { full_name: 'Test User', phone: '' },
    })
    expect(res.status()).toBe(400)
  })
})
