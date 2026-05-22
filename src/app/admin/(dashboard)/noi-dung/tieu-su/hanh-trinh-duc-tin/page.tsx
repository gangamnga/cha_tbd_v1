import { createClient } from '@/utils/supabase/server'
import { MilestonesEditor } from '../_components/MilestonesEditor'
import { AdminCard } from '@/components/admin/AdminCard'
import { Milestone } from 'lucide-react'

export default async function HanhTrinhDucTinPage() {
  const supabase = await createClient()
  const { data: milestones } = await supabase.from('biography_milestones').select('*').order('sort_order')

  return (
    <div className="w-full max-w-[1400px] mx-auto px-5 py-8">
      <AdminCard title="Hành Trình Đức Tin" icon={<Milestone size={16} strokeWidth={2.5} />}>
        <div className="p-[20px]">
          <MilestonesEditor milestones={milestones ?? []} />
        </div>
      </AdminCard>
    </div>
  )
}
