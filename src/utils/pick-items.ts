/**
 * Picks up to `limit` items from `source`, prioritising the given `ids` order first,
 * then filling remaining slots with unselected items in source order.
 * Uses a Map for O(n) lookup instead of repeated .find() calls.
 */
export function pickItems<T extends { id: unknown }>(
  ids: unknown[],
  source: T[],
  limit: number,
): T[] {
  const sourceMap = new Map(source.map(x => [x.id, x]))
  const result: T[] = []
  const usedIds = new Set<unknown>()

  for (const id of ids) {
    if (!id || result.length >= limit) continue
    const item = sourceMap.get(id)
    if (item) {
      result.push(item)
      usedIds.add(id)
    }
  }

  for (const item of source) {
    if (result.length >= limit) break
    if (!usedIds.has(item.id)) {
      result.push(item)
      usedIds.add(item.id)
    }
  }

  return result
}
