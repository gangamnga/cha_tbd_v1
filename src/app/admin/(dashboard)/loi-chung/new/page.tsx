import { createClient } from '@/utils/supabase/server'
import { BookHeart } from 'lucide-react'
import { CommunityAdminGrid } from '../../hoat-dong-cong-dong/_components/CommunityAdminGrid'
import { AdminCard } from '@/components/admin/AdminCard'

export default async function NhatKyChungNhanPage() {
  const supabase = await createClient()
  const { data: articles } = await supabase
    .from('articles')
    .select('id, title, slug, status, created_at, thumbnail_url')
    .eq('category', 'loi-chung')
    .order('created_at', { ascending: false })

  return (
    <div className="p-4 md:p-8 w-full max-w-[1400px] mx-auto">
      <AdminCard icon={<BookHeart size={18} strokeWidth={2.5} />} title="Nhật Ký Chứng Nhân">
        <CommunityAdminGrid
          articles={articles ?? []}
          category="loi-chung"
          label="bài viết nhật ký chứng nhân"
        />
      </AdminCard>
    </div>
  )
}
