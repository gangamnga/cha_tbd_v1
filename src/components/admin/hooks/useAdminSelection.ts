'use client'

import { useState, useCallback, useMemo } from 'react'

type UseAdminSelectionOptions<T extends { id: string }> = {
  items: T[]
  /** Optional filter to limit which items are selectable (e.g. only pending items) */
  selectableFn?: (item: T) => boolean
}

type UseAdminSelectionReturn = {
  selected: Set<string>
  selectedCount: number
  allSelected: boolean
  someSelected: boolean
  toggleAll: () => void
  toggleItem: (id: string) => void
  clearSelection: () => void
  setSelected: React.Dispatch<React.SetStateAction<Set<string>>>
}

export function useAdminSelection<T extends { id: string }>({
  items,
  selectableFn,
}: UseAdminSelectionOptions<T>): UseAdminSelectionReturn {
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const selectableItems = useMemo(
    () => (selectableFn ? items.filter(selectableFn) : items),
    [items, selectableFn],
  )

  const allSelected = selectableItems.length > 0 && selectableItems.every(i => selected.has(i.id))
  const someSelected = selectableItems.some(i => selected.has(i.id)) && !allSelected
  const selectedCount = selected.size

  const toggleAll = useCallback(() => {
    if (allSelected || someSelected) {
      setSelected(new Set())
    } else {
      setSelected(new Set(selectableItems.map(i => i.id)))
    }
  }, [allSelected, someSelected, selectableItems])

  const toggleItem = useCallback((id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }, [])

  const clearSelection = useCallback(() => setSelected(new Set()), [])

  return {
    selected,
    selectedCount,
    allSelected,
    someSelected,
    toggleAll,
    toggleItem,
    clearSelection,
    setSelected,
  }
}
