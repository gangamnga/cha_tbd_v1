'use client'

import { useState, useCallback } from 'react'

export function useAdminSearch() {
  const [search, setSearch] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)

  const clearSearch = useCallback(() => {
    setSearch('')
    setSearchOpen(false)
  }, [])

  return { search, setSearch, searchOpen, setSearchOpen, clearSearch }
}
