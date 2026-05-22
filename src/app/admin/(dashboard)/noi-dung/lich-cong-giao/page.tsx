import { CalendarDays } from 'lucide-react'
import { LiturgicalCalendar } from '@/app/_components/liturgical-calendar'
import { AdminCard } from '@/components/admin/AdminCard'

export default function LichCongGiaoAdminPage() {
  return (
    <div className="p-4 md:p-8 w-full max-w-[1400px] mx-auto">
      <AdminCard icon={<CalendarDays size={18} strokeWidth={2.5} />} title="Lịch Công Giáo">
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50 shrink-0">
          <p className="text-[16px] text-gray-500 font-medium">
            Lịch phụng vụ công giáo — tự động tính toán theo năm, không cần chỉnh sửa
          </p>
        </div>
        <LiturgicalCalendar />
      </AdminCard>
    </div>
  )
}
