'use client'

import { useRef, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

type Props = {
  open: boolean
  value: string
  onOpen: () => void
  onChange: (v: string) => void
  onClear: () => void
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
  placeholder?: string
  width?: string
  className?: string
}

export function AdminSearchInput({
  open,
  value,
  onOpen,
  onChange,
  onClear,
  onKeyDown,
  placeholder = 'Tìm kiếm...',
  width = 'w-[180px]',
  className = '',
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  useEffect(() => { if (open) inputRef.current?.focus() }, [open])

  if (open) {
    return (
      <div className={cn(
        'flex items-center gap-2 bg-white border border-vatican-blue rounded-lg px-3 h-9 shrink-0',
        width,
        className,
      )}>
        <Search size={14} className="text-vatican-blue shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className="flex-1 text-[14px] outline-none text-vatican-dark placeholder:text-gray-400 bg-transparent min-w-0"
        />
        <button type="button" onClick={onClear} className="text-gray-400 hover:text-gray-600 shrink-0">
          <X size={13} />
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={onOpen}
      title="Tìm kiếm"
      className={cn(
        'w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-500 hover:border-vatican-blue hover:text-vatican-blue transition-colors shrink-0',
        className,
      )}
    >
      <Search size={14} />
    </button>
  )
}
