'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition, useRef, useEffect } from 'react'
import { Search, X, ArrowUpDown } from 'lucide-react'

const iconBtn = 'w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-500 hover:border-vatican-blue hover:text-vatican-blue transition-colors shrink-0'

export function AdminPageSearchBar({
  defaultQ,
  activeStatus,
  sort,
  basePath,
}: {
  defaultQ: string
  activeStatus: string
  sort: string
  basePath: string
}) {
  const [q, setQ]       = useState(defaultQ)
  const [open, setOpen] = useState(!!defaultQ)
  const [, startTransition] = useTransition()
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { if (open) inputRef.current?.focus() }, [open])

  const buildUrl = (newQ: string, newSort: string) => {
    const p = new URLSearchParams()
    if (activeStatus !== 'pending') p.set('status', activeStatus)
    if (newQ.trim()) p.set('q', newQ.trim())
    if (newSort !== 'desc') p.set('sort', newSort)
    return `${basePath}${p.toString() ? '?' + p.toString() : ''}`
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(() => router.push(buildUrl(q, sort)))
  }

  const toggleSort = () => {
    startTransition(() => router.push(buildUrl(q, sort === 'desc' ? 'asc' : 'desc')))
  }

  const clearSearch = () => {
    setQ(''); setOpen(false)
    startTransition(() => router.push(buildUrl('', sort)))
  }

  return (
    <div className="flex items-center gap-1 shrink-0">
      {open ? (
        <form onSubmit={handleSearch} className="flex items-center gap-2 bg-white border border-vatican-blue rounded-lg px-3 h-9 transition-colors w-[200px]">
          <Search size={14} className="text-gray-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Tìm kiếm..."
            className="flex-1 text-[15px] outline-none text-vatican-dark placeholder:text-gray-400 bg-transparent min-w-0"
          />
          <button type="button" onClick={clearSearch} className="text-gray-400 hover:text-gray-600 shrink-0">
            <X size={13} />
          </button>
        </form>
      ) : (
        <button onClick={() => setOpen(true)} title="Tìm kiếm" className={iconBtn}>
          <Search size={16} />
        </button>
      )}
      <button
        onClick={toggleSort}
        title={sort === 'desc' ? 'Mới nhất trước' : 'Cũ nhất trước'}
        className={iconBtn}
      >
        <ArrowUpDown size={15} />
      </button>
    </div>
  )
}
