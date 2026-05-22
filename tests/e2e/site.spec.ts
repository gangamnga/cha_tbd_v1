import { test, expect } from '@playwright/test'

// ─── Homepage (/) ─────────────────────────────────────────────────────────────

test.describe('Homepage (/)', () => {
  test('page loads with status 200', async ({ page }) => {
    const response = await page.goto('/')
    expect(response?.status()).toBe(200)
  })

  test('main nav is visible and contains TRANG CHỦ', async ({ page, isMobile }) => {
    await page.goto('/')
    if (isMobile) {
      // Mobile: nav links inside hamburger — verify hamburger button is present
      const hamburger = page.getByRole('button', { name: /Toggle Menu/i })
      await expect(hamburger).toBeVisible()
    } else {
      const nav = page.locator('nav').first()
      await expect(nav).toBeVisible()
      await expect(page.getByText('Trang Chủ', { exact: false }).first()).toBeVisible()
    }
  })

  test('sub-menu is visible with navigation links', async ({ page, isMobile }) => {
    await page.goto('/')
    if (isMobile) {
      // Mobile: sub-links in horizontal tab bar (md:hidden scrollable strip)
      const tabBar = page.locator('.no-scrollbar')
      await expect(tabBar.getByText('Địa Chỉ', { exact: false }).first()).toBeVisible()
      await expect(tabBar.getByText('Lược Sử', { exact: false }).first()).toBeVisible()
    } else {
      await expect(page.getByText('Địa Chỉ', { exact: false }).first()).toBeVisible()
      await expect(page.getByText('Lược Sử', { exact: false }).first()).toBeVisible()
    }
  })

  test('footer is visible', async ({ page }) => {
    await page.goto('/')
    const footer = page.locator('footer')
    await expect(footer).toBeVisible()
  })

  test('TIN NHANH section is visible', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('main').getByText('TIN NHANH', { exact: false }).first()).toBeVisible()
  })

  test('THÔNG BÁO section is visible', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('main').getByText('THÔNG BÁO', { exact: false }).first()).toBeVisible()
  })

  test('THÁNH CA section is visible', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('main').getByText('THÁNH CA', { exact: false }).first()).toBeVisible()
  })

  test('LỜI KINH section is visible', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('main').getByText('LỜI KINH', { exact: false }).first()).toBeVisible()
  })

  test('NHẬT KÝ CHỨNG NHÂN section is visible', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('main').getByText('NHẬT KÝ CHỨNG NHÂN', { exact: false }).first()).toBeVisible()
  })

  test('HOẠT ĐỘNG CỘNG ĐỒNG section is visible', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('main').getByText('HOẠT ĐỘNG CỘNG ĐỒNG', { exact: false }).first()).toBeVisible()
  })

  test('GÓC HÀNH HƯƠNG section is visible', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('main').getByText('GÓC HÀNH HƯƠNG', { exact: false }).first()).toBeVisible()
  })
})

// ─── Homepage mobile section order ────────────────────────────────────────────

test.describe('Homepage mobile order', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('TIN NHANH appears before NHẬT KÝ CHỨNG NHÂN on mobile', async ({ page }) => {
    await page.goto('/')
    const tinNhanh   = page.locator('main').getByText('TIN NHANH', { exact: false }).first()
    const chungNhan  = page.locator('main').getByText('NHẬT KÝ CHỨNG NHÂN', { exact: false }).first()
    const tnBox      = await tinNhanh.boundingBox()
    const cnBox      = await chungNhan.boundingBox()
    expect(tnBox!.y).toBeLessThan(cnBox!.y)
  })

  test('NHẬT KÝ CHỨNG NHÂN appears before THÔNG BÁO on mobile', async ({ page }) => {
    await page.goto('/')
    const chungNhan  = page.locator('main').getByText('NHẬT KÝ CHỨNG NHÂN', { exact: false }).first()
    const thongBao   = page.locator('main').getByText('THÔNG BÁO', { exact: false }).first()
    const cnBox      = await chungNhan.boundingBox()
    const tbBox      = await thongBao.boundingBox()
    expect(cnBox!.y).toBeLessThan(tbBox!.y)
  })

  test('THÔNG BÁO appears before HOẠT ĐỘNG CỘNG ĐỒNG on mobile', async ({ page }) => {
    await page.goto('/')
    const thongBao   = page.locator('main').getByText('THÔNG BÁO', { exact: false }).first()
    const hoatDong   = page.locator('main').getByText('HOẠT ĐỘNG CỘNG ĐỒNG', { exact: false }).first()
    const tbBox      = await thongBao.boundingBox()
    const hdBox      = await hoatDong.boundingBox()
    expect(tbBox!.y).toBeLessThan(hdBox!.y)
  })

  test('HOẠT ĐỘNG CỘNG ĐỒNG appears before GÓC HÀNH HƯƠNG on mobile', async ({ page }) => {
    await page.goto('/')
    const hoatDong   = page.locator('main').getByText('HOẠT ĐỘNG CỘNG ĐỒNG', { exact: false }).first()
    const hanhHuong  = page.locator('main').getByText('GÓC HÀNH HƯƠNG', { exact: false }).first()
    const hdBox      = await hoatDong.boundingBox()
    const hhBox      = await hanhHuong.boundingBox()
    expect(hdBox!.y).toBeLessThan(hhBox!.y)
  })

  test('GÓC HÀNH HƯƠNG appears before THÁNH CA on mobile', async ({ page }) => {
    await page.goto('/')
    const hanhHuong  = page.locator('main').getByText('GÓC HÀNH HƯƠNG', { exact: false }).first()
    const thanhCa    = page.locator('main').getByText('THÁNH CA', { exact: false }).first()
    const hhBox      = await hanhHuong.boundingBox()
    const tcBox      = await thanhCa.boundingBox()
    expect(hhBox!.y).toBeLessThan(tcBox!.y)
  })

  test('THÁNH CA appears before LỜI KINH on mobile', async ({ page }) => {
    await page.goto('/')
    const thanhCa    = page.locator('main').getByText('THÁNH CA', { exact: false }).first()
    const loiKinh    = page.locator('main').getByText('LỜI KINH', { exact: false }).first()
    const tcBox      = await thanhCa.boundingBox()
    const lkBox      = await loiKinh.boundingBox()
    expect(tcBox!.y).toBeLessThan(lkBox!.y)
  })
})

// ─── Tiểu sử (/tieu-su) ───────────────────────────────────────────────────────

test.describe('Tiểu sử (/tieu-su)', () => {
  test('page loads', async ({ page }) => {
    const response = await page.goto('/tieu-su')
    expect(response?.status()).toBe(200)
  })

  test('section LƯỢC SỬ is visible', async ({ page }) => {
    await page.goto('/tieu-su')
    await expect(page.locator('main').getByText('LƯỢC SỬ', { exact: false }).first()).toBeVisible()
  })

  test('section HÀNH TRÌNH ĐỨC TIN is visible', async ({ page }) => {
    await page.goto('/tieu-su')
    await expect(page.locator('main').getByText('HÀNH TRÌNH ĐỨC TIN', { exact: false }).first()).toBeVisible()
  })
})

// ─── Cần biết (/can-biet) ─────────────────────────────────────────────────────

test.describe('Cần biết (/can-biet)', () => {
  test('page loads', async ({ page }) => {
    const response = await page.goto('/can-biet')
    expect(response?.status()).toBe(200)
  })

  test('section ĐỊA CHỈ is visible', async ({ page }) => {
    await page.goto('/can-biet')
    await expect(page.locator('main').getByText('ĐỊA CHỈ', { exact: false }).first()).toBeVisible()
  })

  test('section THAM GIA CỘNG ĐỒNG is visible', async ({ page }) => {
    await page.goto('/can-biet')
    await expect(page.locator('main').getByText('THAM GIA CỘNG ĐỒNG', { exact: false }).first()).toBeVisible()
  })

  test('section HOẠT ĐỘNG CỘNG ĐỒNG is visible', async ({ page }) => {
    await page.goto('/can-biet')
    await expect(page.locator('main').getByText('HOẠT ĐỘNG CỘNG ĐỒNG', { exact: false }).first()).toBeVisible()
  })
})

// ─── Chứng nhân (/chung-nhan) ─────────────────────────────────────────────────

test.describe('Chứng nhân (/chung-nhan)', () => {
  test('page loads', async ({ page }) => {
    const response = await page.goto('/chung-nhan')
    expect(response?.status()).toBe(200)
  })

  test('section NHẬT KÝ CHỨNG NHÂN is visible', async ({ page }) => {
    await page.goto('/chung-nhan')
    await expect(page.locator('main').getByText('NHẬT KÝ CHỨNG NHÂN', { exact: false }).first()).toBeVisible()
  })

  test('section GỬI LỜI CHỨNG CỦA BẠN is visible', async ({ page }) => {
    await page.goto('/chung-nhan')
    await expect(page.locator('main').getByText('GỬI LỜI CHỨNG', { exact: false }).first()).toBeVisible()
  })

  test('testimony form has name, phone, location and content fields', async ({ page }) => {
    await page.goto('/chung-nhan')
    await expect(page.locator('#ol-name')).toBeVisible()
    await expect(page.locator('#ol-phone')).toBeVisible()
    await expect(page.locator('#ol-location')).toBeVisible()
    await expect(page.locator('#ol-title')).toBeVisible()
    await expect(page.locator('#ol-content')).toBeVisible()
  })
})

// ─── Cùng cầu nguyện (/cung-cau-nguyen) ──────────────────────────────────────

test.describe('Cùng cầu nguyện (/cung-cau-nguyen)', () => {
  test('page loads', async ({ page }) => {
    const response = await page.goto('/cung-cau-nguyen')
    expect(response?.status()).toBe(200)
  })

  test('section LỜI KINH or THÁNH CA is visible', async ({ page }) => {
    await page.goto('/cung-cau-nguyen')
    const loiKinh = page.locator('main').getByText('LỜI KINH', { exact: false }).first()
    const thanhCa = page.locator('main').getByText('THÁNH CA', { exact: false }).first()
    const loiKinhVisible = await loiKinh.isVisible().catch(() => false)
    const thanhCaVisible = await thanhCa.isVisible().catch(() => false)
    expect(loiKinhVisible || thanhCaVisible).toBe(true)
  })

  test('intention form has name, phone, location and content fields', async ({ page }) => {
    await page.goto('/cung-cau-nguyen')
    await expect(page.locator('#ccn-name')).toBeVisible()
    await expect(page.locator('#ccn-phone')).toBeVisible()
    await expect(page.locator('#ccn-location')).toBeVisible()
    await expect(page.locator('#ccn-content')).toBeVisible()
  })
})

// ─── Hành hương (/hanh-huong) ─────────────────────────────────────────────────

test.describe('Hành hương (/hanh-huong)', () => {
  test('page loads', async ({ page }) => {
    const response = await page.goto('/hanh-huong')
    expect(response?.status()).toBe(200)
  })

  test('section LỊCH HÀNH HƯƠNG is visible', async ({ page }) => {
    await page.goto('/hanh-huong')
    await expect(page.locator('main').getByText('LỊCH HÀNH HƯƠNG', { exact: false }).first()).toBeVisible()
  })
})

// ─── Navigation ───────────────────────────────────────────────────────────────

test.describe('Navigation', () => {
  test('clicking CẦN BIẾT in main nav navigates to /can-biet', async ({ page, isMobile }) => {
    await page.goto('/')
    if (isMobile) {
      // Mobile: open hamburger, then click within the mobile nav (last nav in DOM)
      await page.getByRole('button', { name: /Toggle Menu/i }).click()
      await page.locator('nav').last().getByText('Cần Biết', { exact: false }).click()
    } else {
      const nav = page.locator('nav').first()
      await nav.getByText('Cần Biết', { exact: false }).first().click()
    }
    await expect(page).toHaveURL(/\/can-biet/)
  })

  test('sub-menu link Tham Gia Cộng Đồng navigates to /can-biet', async ({ page, isMobile }) => {
    await page.goto('/')
    if (isMobile) {
      // Mobile: link is in the horizontal tab bar — scope to avoid hidden desktop sub-bar
      const tabBar = page.locator('.no-scrollbar')
      await tabBar.getByText('Tham Gia Cộng Đồng', { exact: false }).first().click()
    } else {
      await page.getByText('Tham Gia Cộng Đồng', { exact: false }).first().click()
    }
    await expect(page).toHaveURL(/\/can-biet/)
  })
})

// ─── Mobile responsiveness ────────────────────────────────────────────────────

test.describe('Mobile responsiveness', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('homepage loads on mobile viewport', async ({ page }) => {
    const response = await page.goto('/')
    expect(response?.status()).toBe(200)
  })

  test('hamburger menu button is visible on mobile', async ({ page }) => {
    await page.goto('/')
    const hamburger = page.getByRole('button', { name: /Toggle Menu/i })
    await expect(hamburger).toBeVisible()
  })

  test('chứng nhân page loads on mobile', async ({ page }) => {
    const response = await page.goto('/chung-nhan')
    expect(response?.status()).toBe(200)
  })
})
