import { createClient } from '@/utils/supabase/server'
import { AnnouncementManager } from './_components/AnnouncementManager'

import { AdminCard } from '@/components/admin/AdminCard'
import { Bell } from 'lucide-react'

export default async function ThongBaoPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('announcements')
    .select('id, title, image_url, is_active, created_at, updated_at')
    .order('created_at', { ascending: false })

  return (
    <div className="p-4 md:p-8 w-full max-w-[1400px] mx-auto">
      <AdminCard title="Thông Báo" icon={<Bell size={18} strokeWidth={2.5} />}>
        <AnnouncementManager initial={data ?? []} />
      </AdminCard>
    </div>
  )
}
