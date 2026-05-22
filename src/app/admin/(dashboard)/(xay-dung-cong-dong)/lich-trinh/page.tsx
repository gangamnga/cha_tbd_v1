import { CalendarDays } from 'lucide-react'
import { AdminCard } from '@/components/admin/AdminCard'
import { ScheduleManager } from './_components/ScheduleManager'

export default function LichTrinhPage() {
  return (
    <div className="p-4 md:p-8 w-full max-w-[1400px] mx-auto">
      <AdminCard title="Lịch Trình" icon={<CalendarDays size={18} strokeWidth={2.5} />}>
        <ScheduleManager />
      </AdminCard>
    </div>
  )
}
