import { FileSignature } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'
import { AdminCard } from '@/components/admin/AdminCard'
import { MeetingsTab } from '../_components/MeetingsTab'

export default async function BienBanPage() {
  const supabase = await createClient()

  const { data: meetings } = await supabase
    .from('bqt_meetings')
    .select('*')
    .order('meeting_date', { ascending: false })

  return (
    <div className="p-4 md:p-8 w-full max-w-[1400px] mx-auto">
      <AdminCard title="Biên Bản Họp" icon={<FileSignature size={18} strokeWidth={2.5} />}>
        <MeetingsTab initial={meetings ?? []} />
      </AdminCard>
    </div>
  )
}
