'use client'

import { useState } from 'react'

export function useBulkSelection<T extends { id: string }>(
  items: T[],
  filterSelectable?: (item: T) => boolean
) {
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const selectableItems = filterSelectable ? items.filter(filterSelectable) : items
  const selectedCount = selected.size
  const allSelected = selectableItems.length > 0 && selectableItems.every(item => selected.has(item.id))
  const someSelected = selectableItems.some(item => selected.has(item.id)) && !allSelected

  const toggleAll = () => {
    if (allSelected || someSelected) setSelected(new Set())
    else setSelected(new Set(selectableItems.map(item => item.id)))
  }

  const toggleItem = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const clearSelection = () => setSelected(new Set())

  return { selected, selectedCount, allSelected, someSelected, toggleAll, toggleItem, clearSelection }
}
