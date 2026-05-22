import { describe, it, expect } from 'vitest'
import { slugify } from '@/utils/slugify'

describe('slugify', () => {
  it('lowercases ASCII text', () => {
    expect(slugify('Hello World')).toBe('hello-world')
  })

  it('replaces spaces with hyphens', () => {
    expect(slugify('tin tuc moi')).toBe('tin-tuc-moi')
  })

  it('collapses multiple spaces into one hyphen', () => {
    expect(slugify('a  b   c')).toBe('a-b-c')
  })

  it('strips diacritics from Vietnamese characters', () => {
    expect(slugify('Cha Trương Bửu Diệp')).toBe('cha-truong-buu-diep')
  })

  it('converts đ/Đ to d', () => {
    expect(slugify('Đại Lễ')).toBe('dai-le')
    expect(slugify('đức tin')).toBe('duc-tin')
  })

  it('removes special characters', () => {
    expect(slugify('title! (2026)')).toBe('title-2026')
  })

  it('handles an already-clean slug', () => {
    expect(slugify('loi-chung')).toBe('loi-chung')
  })

  it('trims leading and trailing whitespace', () => {
    expect(slugify('  hanh huong  ')).toBe('hanh-huong')
  })

  it('returns empty string for empty input', () => {
    expect(slugify('')).toBe('')
  })
})
