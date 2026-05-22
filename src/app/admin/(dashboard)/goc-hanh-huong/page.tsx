import { createClient } from '@/utils/supabase/server'
import { NotebookText } from 'lucide-react'
import { CommunityAdminGrid } from '../hoat-dong-cong-dong/_components/CommunityAdminGrid'
import { AdminCard } from '@/components/admin/AdminCard'

export default async function CamNangPage() {
  const supabase = await createClient()
  const { data: articles } = await supabase
    .from('articles')
    .select('id, title, slug, status, created_at, thumbnail_url')
    .eq('category', 'cam-nang')
    .order('created_at', { ascending: false })

  const list = articles ?? []

  return (
    <div className="p-4 md:p-8 w-full max-w-[1400px] mx-auto">
      <AdminCard icon={<NotebookText size={18} strokeWidth={2.5} />} title="Góc Hành Hương">
        <CommunityAdminGrid
          articles={list}
          category="cam-nang"
          label="bài viết góc hành hương"
        />
      </AdminCard>
    </div>
  )
}
