'use client'

import React from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

interface AdminPaginationProps {
  currentPage: number
  totalPages: number
  totalCount: number
  itemName?: string
  from: number
  to: number
  onPageChange?: (page: number) => void
  pageParamName?: string
}

export function AdminPagination({
  currentPage,
  totalPages,
  totalCount,
  itemName = 'mục',
  from,
  to,
  onPageChange,
  pageParamName = 'page',
}: AdminPaginationProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  if (totalPages <= 1) return null

  // Calculate page numbers to display (max 7 pages shown, sliding window)
  let pages = Array.from({ length: Math.min(totalPages, 7) }, (_, idx) => {
    let p = idx + 1
    if (totalPages > 7) {
      if (currentPage <= 4) {
        p = idx + 1
      } else if (currentPage >= totalPages - 3) {
        p = totalPages - 6 + idx
      } else {
        p = currentPage - 3 + idx
      }
    }
    return p
  })

  const prevDisabled = currentPage <= 1
  const nextDisabled = currentPage >= totalPages

  const prevPage = currentPage - 1
  const nextPage = currentPage + 1

  const createPageUrl = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams?.toString() ?? '')
    params.set(pageParamName, String(pageNumber))
    return `${pathname}?${params.toString()}`
  }

  const renderLinkOrButton = (
    targetPage: number,
    label: React.ReactNode,
    className: string,
    disabled: boolean = false
  ) => {
    if (disabled) {
      return (
        <span className={`${className} border-gray-200 text-gray-300 pointer-events-none`}>
          {label}
        </span>
      )
    }

    if (onPageChange) {
      return (
        <button
          type="button"
          onClick={() => onPageChange(targetPage)}
          className={className}
        >
          {label}
        </button>
      )
    }

    return (
      <a href={createPageUrl(targetPage)} className={className}>
        {label}
      </a>
    )
  }

  return (
    <div className="px-5 py-3 border-t border-gray-100 flex flex-col sm:flex-row gap-3 items-center justify-between bg-gray-50/50">
      <p className="text-[14px] md:text-[15px] text-gray-500 font-medium">
        Hiển thị{' '}
        <strong className="text-vatican-dark font-bold">
          {from + 1}–{Math.min(to + 1, totalCount)}
        </strong>{' '}
        trong số {totalCount} {itemName}
      </p>

      <div className="flex items-center gap-1 shrink-0">
        {/* Previous page link/button */}
        {renderLinkOrButton(
          prevPage,
          '← Trước',
          `px-3 h-8 flex items-center justify-center rounded-lg text-sm font-bold border transition-colors select-none ${
            prevDisabled
              ? ''
              : 'border-gray-200 text-gray-600 bg-white hover:border-vatican-blue hover:text-vatican-blue cursor-pointer'
          }`,
          prevDisabled
        )}

        {/* Page numbers */}
        {pages.map((p) => {
          const isCurrent = p === currentPage
          const baseCls = `w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-colors select-none`

          if (isCurrent) {
            return (
              <span key={p} className={`${baseCls} bg-vatican-blue text-white`}>
                {p}
              </span>
            )
          }

          if (onPageChange) {
            return (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                className={`${baseCls} text-gray-600 bg-white border border-transparent hover:border-gray-200 cursor-pointer`}
              >
                {p}
              </button>
            )
          }

          return (
            <a
              key={p}
              href={createPageUrl(p)}
              className={`${baseCls} text-gray-600 bg-white border border-transparent hover:border-gray-200 cursor-pointer`}
            >
              {p}
            </a>
          )
        })}

        {/* Next page link/button */}
        {renderLinkOrButton(
          nextPage,
          'Sau →',
          `px-3 h-8 flex items-center justify-center rounded-lg text-sm font-bold border transition-colors select-none ${
            nextDisabled
              ? ''
              : 'border-gray-200 text-gray-600 bg-white hover:border-vatican-blue hover:text-vatican-blue cursor-pointer'
          }`,
          nextDisabled
        )}
      </div>
    </div>
  )
}
