import Image from 'next/image'
import { Bell } from 'lucide-react'

export function PrayerMeetingSchedule({ imageUrl }: { imageUrl: string | null }) {
  if (!imageUrl) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center gap-3 p-6 text-gray-300">
        <Bell size={36} strokeWidth={1.5} />
        <p className="text-[16px] text-center text-gray-400">Chưa có thông báo.</p>
      </div>
    )
  }
  return (
    <div className="relative w-full" style={{ aspectRatio: '3/4' }}>
      <Image src={imageUrl} alt="Thông báo" fill className="object-contain" unoptimized />
    </div>
  )
}
