import { createClient } from '@/utils/supabase/server'
import { BeatificationEditor } from '../_components/BeatificationEditor'
import { AdminCard } from '@/components/admin/AdminCard'
import { Award } from 'lucide-react'

export default async function PhongChanPhuocPage() {
  const supabase = await createClient()
  const { data: steps } = await supabase.from('beatification_steps').select('*').order('sort_order')

  return (
    <div className="w-full max-w-[1400px] mx-auto px-5 py-8">
      <AdminCard title="Tiến Trình Phong Chân Phước" icon={<Award size={16} strokeWidth={2.5} />}>
        <div className="p-[20px]">
          <BeatificationEditor steps={steps ?? []} />
        </div>
      </AdminCard>
    </div>
  )
}
