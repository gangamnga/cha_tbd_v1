import { type ReactNode } from 'react'

export function AdminCard({ icon, title, children }: {
  icon: ReactNode
  title: string
  children: ReactNode
}) {
  return (
    <div className="bg-white rounded-lg flex flex-col border border-gray-100 overflow-hidden">
      <div className="bg-white border-b-[3px] border-vatican-yellow text-vatican-blue flex items-center gap-2 px-[20px] h-[48px] shrink-0 rounded-t-lg">
        <span className="text-vatican-blue/80">{icon}</span>
        <span className="text-[16px] font-bold uppercase tracking-wide">{title}</span>
      </div>
      <div className="flex-1 flex flex-col">
        {children}
      </div>
    </div>
  )
}
