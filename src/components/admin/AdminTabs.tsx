'use client'

import React from 'react'

export interface TabOption<T extends string> {
  id: T
  label: string
  count?: number
  href?: string
}

interface AdminTabsProps<T extends string> {
  tabs: TabOption<T>[]
  activeTab: T
  onChange?: (tabId: T) => void
  className?: string
}

export function AdminTabs<T extends string>({
  tabs,
  activeTab,
  onChange,
  className = '',
}: AdminTabsProps<T>) {
  return (
    <div className={`flex items-center gap-2 select-none overflow-x-auto scrollbar-none ${className}`}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab
        const baseCls = `flex items-center px-4 h-9 rounded-lg text-[14px] transition-colors whitespace-nowrap shrink-0 font-bold ${
          isActive
            ? 'bg-white text-vatican-blue border border-gray-200 font-extrabold shadow-sm'
            : 'bg-gray-100 text-gray-600 border border-transparent hover:bg-gray-200/80 hover:text-gray-700'
        }`

        const labelContent = (
          <>
            <span>{tab.label}</span>
            {tab.count !== undefined && tab.count > 0 && (
              <span className="ml-1.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-black rounded-full px-1.5 shrink-0">
                <span className="translate-y-[0.5px] transform leading-none">{tab.count}</span>
              </span>
            )}
          </>
        )

        if (tab.href) {
          return (
            <a key={tab.id} href={tab.href} className={baseCls}>
              {labelContent}
            </a>
          )
        }

        if (onChange) {
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={baseCls}
            >
              {labelContent}
            </button>
          )
        }

        return null
      })}
    </div>
  )
}
