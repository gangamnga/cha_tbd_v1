import { describe, it, expect } from 'vitest'
import { getPageNumbers } from '@/utils/pagination'

describe('getPageNumbers', () => {
  // 1. total <= 7 returns all pages
  it('returns all pages when total <= 7', () => {
    expect(getPageNumbers(1, 5)).toEqual([1, 2, 3, 4, 5])
    expect(getPageNumbers(3, 6)).toEqual([1, 2, 3, 4, 5, 6])
    expect(getPageNumbers(4, 7)).toEqual([1, 2, 3, 4, 5, 6, 7])
  })

  // 2. total = 1
  it('returns [1] when total is 1', () => {
    expect(getPageNumbers(1, 1)).toEqual([1])
  })

  // 3. total = 7
  it('returns [1,2,3,4,5,6,7] when total is 7', () => {
    expect(getPageNumbers(1, 7)).toEqual([1, 2, 3, 4, 5, 6, 7])
  })

  // 4. total=10, current=1 → first page
  it('returns [1, 2, "...", 10] on first page', () => {
    expect(getPageNumbers(1, 10)).toEqual([1, 2, '...', 10])
  })

  // 5. total=10, current=5 → middle
  it('returns [1, "...", 4, 5, 6, "...", 10] in the middle', () => {
    expect(getPageNumbers(5, 10)).toEqual([1, '...', 4, 5, 6, '...', 10])
  })

  // 6. total=10, current=10 → last page
  it('returns [1, "...", 9, 10] on last page', () => {
    expect(getPageNumbers(10, 10)).toEqual([1, '...', 9, 10])
  })

  // 7. total=10, current=3 → near start, no leading ellipsis
  it('returns [1, 2, 3, 4, "...", 10] when near the start', () => {
    expect(getPageNumbers(3, 10)).toEqual([1, 2, 3, 4, '...', 10])
  })

  // 8. total=10, current=8 → near end, no trailing ellipsis
  it('returns [1, "...", 7, 8, 9, 10] when near the end', () => {
    expect(getPageNumbers(8, 10)).toEqual([1, '...', 7, 8, 9, 10])
  })

  // 9. Result always starts with 1 and ends with total
  it('always starts with 1 and ends with total', () => {
    for (const [current, total] of [
      [1, 10], [5, 10], [10, 10], [3, 15], [12, 15],
    ] as [number, number][]) {
      const result = getPageNumbers(current, total)
      expect(result[0]).toBe(1)
      expect(result[result.length - 1]).toBe(total)
    }
  })

  // 10. Active page always in result
  it('always includes the active (current) page in the result', () => {
    for (const [current, total] of [
      [1, 10], [2, 10], [5, 10], [9, 10], [10, 10],
      [1, 1], [4, 7], [3, 15], [12, 15],
    ] as [number, number][]) {
      const result = getPageNumbers(current, total)
      expect(result).toContain(current)
    }
  })
})
