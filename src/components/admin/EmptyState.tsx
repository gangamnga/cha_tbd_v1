import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

type EmptyStateProps = {
  icon: ReactNode
  message: ReactNode
  className?: string
}

export function EmptyState({ icon, message, className }: EmptyStateProps) {
  return (
    <div className={cn('px-6 py-16 flex flex-col items-center gap-3 text-center', className)}>
      <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center">
        {icon}
      </div>
      <p className="text-[15px] text-gray-400">{message}</p>
    </div>
  )
}
