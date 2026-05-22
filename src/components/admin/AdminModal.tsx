import React from 'react'

type Props = {
  children: React.ReactNode
  onClose: () => void
  maxWidth?: string
  disabled?: boolean
}

export function AdminModal({ children, onClose, maxWidth = 'max-w-[600px]', disabled }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-10 sm:pt-[10vh] overflow-y-auto">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={disabled ? undefined : onClose}
      />
      <div className={`relative bg-white rounded-2xl w-full ${maxWidth} max-h-[92vh] flex flex-col overflow-hidden transition-all duration-200`}>
        {children}
      </div>
    </div>
  )
}
