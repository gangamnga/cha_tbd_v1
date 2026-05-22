import { type LucideIcon, Construction } from 'lucide-react'

type Feature = { label: string; note?: string }

export function ComingSoonBlock({
  icon: Icon,
  title,
  description,
  features,
}: {
  icon: LucideIcon
  title: string
  description: string
  features: Feature[]
}) {
  return (
    <div className="bg-white p-8 md:p-12 flex flex-col items-center gap-6">

      {/* Icon + badge */}
      <div className="flex flex-col items-center gap-3">
        <div className="w-16 h-16 bg-amber-50 border border-amber-100 rounded-2xl flex items-center justify-center">
          <Icon size={28} strokeWidth={1.5} className="text-amber-400" />
        </div>
        <span className="inline-flex items-center gap-1.5 text-[16px] font-bold px-3 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-200">
          <Construction size={13} strokeWidth={2.5} />
          Đang phát triển
        </span>
      </div>

      {/* Text */}
      <div className="text-center max-w-md">
        <h2 className="text-[18px] font-bold text-vatican-dark mb-2">{title}</h2>
        <p className="text-[16px] text-gray-400 leading-relaxed">{description}</p>
      </div>

      {/* Planned features */}
      <div className="w-full max-w-sm bg-gray-50 border border-gray-100 rounded-xl p-5">
        <p className="text-[16px] font-bold uppercase tracking-widest text-gray-400 mb-3">Tính năng dự kiến</p>
        <ul className="flex flex-col gap-2.5">
          {features.map((f, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-300 shrink-0 mt-[7px]" />
              <span className="text-[16px] text-gray-600">
                {f.label}
                {f.note && <span className="text-gray-400"> — {f.note}</span>}
              </span>
            </li>
          ))}
        </ul>
      </div>

    </div>
  )
}
