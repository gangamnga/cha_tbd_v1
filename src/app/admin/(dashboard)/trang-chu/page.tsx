import { createClient } from '@/utils/supabase/server'
import { HomepageConfigForm } from './_components/HomepageConfigForm'
import { AdminCard } from '@/components/admin/AdminCard'
import { Home } from 'lucide-react'

export default async function TrangChuAdminPage() {
  const supabase = await createClient()

  const [
    { data: configRow },
    { data: allArticles },
    { data: camNangArticles },
    { data: announcements },
    { data: loiChungArticles },
    { data: prayers },
    { data: hymns },
  ] = await Promise.all([
    supabase.from('homepage_config').select('config').eq('id', 'main').maybeSingle(),
    supabase.from('articles').select('id, title').eq('status', 'published').order('created_at', { ascending: false }),
    supabase.from('articles').select('id, title').eq('status', 'published').eq('category', 'cam-nang').order('created_at', { ascending: false }),
    supabase.from('announcements').select('id, content_html').eq('is_active', true),
    supabase.from('articles').select('id, title').eq('status', 'published').eq('category', 'loi-chung').order('created_at', { ascending: false }),
    supabase.from('prayers').select('id, title').eq('is_active', true).order('sort_order'),
    supabase.from('hymns').select('id, title, artist').eq('is_active', true).order('sort_order'),
  ])

  const config = (configRow?.config ?? {}) as Record<string, Record<string, string | null>>

  return (
    <div className="p-4 md:p-8 w-full max-w-[1400px] mx-auto">
      <AdminCard icon={<Home size={18} strokeWidth={2.5} />} title="Trang Chủ">
        <HomepageConfigForm
          initialConfig={config}
          allArticles={allArticles ?? []}
          camNangArticles={camNangArticles ?? []}
          announcements={announcements ?? []}
          testimonies={loiChungArticles ?? []}
          prayers={prayers ?? []}
          hymns={hymns ?? []}
        />
      </AdminCard>
    </div>
  )
}
