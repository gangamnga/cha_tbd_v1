import { createClient } from '@/utils/supabase/server'
import { TripsEditor } from './_components/TripsEditor'
import { Calendar } from 'lucide-react'
import { AdminCard } from '@/components/admin/AdminCard'

export default async function LichHanhHuongPage() {
  const supabase = await createClient()

  const [{ data: trips }, { data: regRows }] = await Promise.all([
    supabase.from('pilgrimage_trips').select('*').order('sort_order'),
    supabase.from('pilgrimage_registrations').select('trip_id').neq('status', 'cancelled'),
  ])

  const regCounts: Record<string, number> = {}
  for (const r of regRows ?? []) {
    if (r.trip_id) regCounts[r.trip_id] = (regCounts[r.trip_id] ?? 0) + 1
  }

  return (
    <div className="p-4 md:p-8 w-full max-w-[1400px] mx-auto">
      <AdminCard icon={<Calendar size={18} strokeWidth={2.5} />} title="Lịch Hành Hương">
        <TripsEditor trips={trips ?? []} regCounts={regCounts} />
      </AdminCard>
    </div>
  )
}
