import { Users } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'
import { AdminCard } from '@/components/admin/AdminCard'
import { MembersTab } from '../_components/MembersTab'

export default async function ThanhVienPage() {
  const supabase = await createClient()

  const { data: members } = await supabase
    .from('bqt_members')
    .select('*')
    .order('department')
    .order('sort_order')

  return (
    <div className="p-4 md:p-8 w-full max-w-[1400px] mx-auto">
      <AdminCard title="Thành Viên Ban Quản Trị" icon={<Users size={18} strokeWidth={2.5} />}>
        <MembersTab initial={members ?? []} />
      </AdminCard>
    </div>
  )
}
