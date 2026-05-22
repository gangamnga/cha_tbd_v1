import { createClient } from '@/utils/supabase/server'
import { MassScheduleEditor } from './_components/MassScheduleEditor'
import { AdminCard } from '@/components/admin/AdminCard'
import { Clock } from 'lucide-react'

export default async function GioLeAdminPage() {
  const supabase = await createClient()

  let [{ data: metaRows }, { data: slots }] = await Promise.all([
    supabase.from('mass_schedule_meta').select('*').limit(1),
    supabase.from('mass_schedule').select('*').order('sort_order'),
  ])

  // Tự tạo dòng meta mặc định nếu bảng còn trống
  if (!metaRows || metaRows.length === 0) {
    const { data: inserted } = await supabase
      .from('mass_schedule_meta')
      .insert({ location_name: 'Thánh đường Tắc Sậy', note: 'Lịch có thể thay đổi theo thông báo.' })
      .select()
      .single()
    metaRows = inserted ? [inserted] : []
  }

  const meta = metaRows?.[0] ?? null

  return (
    <div className="p-4 md:p-8 w-full max-w-[1400px] mx-auto">
      <AdminCard icon={<Clock size={18} strokeWidth={2.5} />} title="Giờ Lễ">
        {meta && <MassScheduleEditor meta={meta} slots={slots ?? []} />}
      </AdminCard>
    </div>
  )
}
