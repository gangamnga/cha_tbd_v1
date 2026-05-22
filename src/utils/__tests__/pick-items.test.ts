import { describe, it, expect } from 'vitest'
import { pickItems } from '@/utils/pick-items'

type Item = { id: string; title: string }

const source: Item[] = [
  { id: 'a', title: 'A' },
  { id: 'b', title: 'B' },
  { id: 'c', title: 'C' },
  { id: 'd', title: 'D' },
  { id: 'e', title: 'E' },
]

describe('pickItems', () => {
  it('returns items in the order of provided ids', () => {
    const result = pickItems(['c', 'a'], source, 6)
    expect(result[0].id).toBe('c')
    expect(result[1].id).toBe('a')
  })

  it('fills remaining slots from source in source order', () => {
    const result = pickItems(['c'], source, 3)
    expect(result.map(x => x.id)).toEqual(['c', 'a', 'b'])
  })

  it('respects the limit', () => {
    const result = pickItems([], source, 2)
    expect(result).toHaveLength(2)
  })

  it('skips null and undefined ids', () => {
    const result = pickItems([null, undefined, 'b'], source, 6)
    expect(result[0].id).toBe('b')
  })

  it('ignores ids not found in source', () => {
    const result = pickItems(['z', 'a'], source, 6)
    expect(result[0].id).toBe('a')
  })

  it('does not duplicate items (pinned id also appears in source)', () => {
    const result = pickItems(['a'], source, 5)
    const ids = result.map(x => x.id)
    expect(ids.filter(id => id === 'a')).toHaveLength(1)
  })

  it('returns empty array when source is empty', () => {
    expect(pickItems(['a', 'b'], [], 5)).toEqual([])
  })

  it('returns empty array when limit is 0', () => {
    expect(pickItems(['a'], source, 0)).toEqual([])
  })

  it('returns all source items when ids is empty and limit >= source length', () => {
    const result = pickItems([], source, 10)
    expect(result.map(x => x.id)).toEqual(['a', 'b', 'c', 'd', 'e'])
  })

  it('pinned items always appear before unpinned items', () => {
    const result = pickItems(['e', 'd'], source, 4)
    expect(result[0].id).toBe('e')
    expect(result[1].id).toBe('d')
    // remaining 2 come from source in order (a, b)
    expect(result[2].id).toBe('a')
    expect(result[3].id).toBe('b')
  })
})
