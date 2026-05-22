'use client'

import { useState, useCallback, useMemo } from 'react'

type UseAdminSearchOptions<T> = {
  items: T[]
  filterFn: (item: T, query: string) => boolean
  perPage?: number
}

type UseAdminSearchReturn<T> = {
  search: string
  searchOpen: boolean
  page: number
  filtered: T[]
  paged: T[]
  totalPages: number
  setSearch: (v: string) => void
  setSearchOpen: (v: boolean) => void
  setPage: (p: number) => void
  openSearch: () => void
  clearSearch: () => void
  onSearchChange: (v: string) => void
}

export function useAdminSearch<T>({
  items,
  filterFn,
  perPage = 10,
}: UseAdminSearchOptions<T>): UseAdminSearchReturn<T> {
  const [search, setSearch] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [page, setPage] = useState(1)

  const openSearch = useCallback(() => setSearchOpen(true), [])

  const clearSearch = useCallback(() => {
    setSearch('')
    setSearchOpen(false)
    setPage(1)
  }, [])

  const onSearchChange = useCallback((v: string) => {
    setSearch(v)
    setPage(1)
  }, [])

  const filtered = useMemo(
    () => (search.trim() ? items.filter(item => filterFn(item, search.trim().toLowerCase())) : items),
    [items, search, filterFn],
  )

  const totalPages = Math.ceil(filtered.length / perPage)
  const paged = useMemo(
    () => filtered.slice((page - 1) * perPage, page * perPage),
    [filtered, page, perPage],
  )

  return {
    search,
    searchOpen,
    page,
    filtered,
    paged,
    totalPages,
    setSearch,
    setSearchOpen,
    setPage,
    openSearch,
    clearSearch,
    onSearchChange,
  }
}
