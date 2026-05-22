import { createClient } from '@/utils/supabase/server'
import { Newspaper } from 'lucide-react'
import { CommunityAdminGrid } from './_components/CommunityAdminGrid'
import { AdminCard } from '@/components/admin/AdminCard'

export default async function CongDongPage() {
  const supabase = await createClient()
  const { data: articles } = await supabase
    .from('articles')
    .select('id, title, slug, status, created_at, thumbnail_url')
    .eq('category', 'cong-dong')
    .order('created_at', { ascending: false })

  const list = articles ?? []

  return (
    <div className="p-4 md:p-8 w-full max-w-[1400px] mx-auto">
      <AdminCard icon={<Newspaper size={18} strokeWidth={2.5} />} title="Hoạt Động Cộng Đồng">
        <CommunityAdminGrid articles={list} />
      </AdminCard>
    </div>
  )
}
