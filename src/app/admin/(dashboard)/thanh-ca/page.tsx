import { createClient } from '@/utils/supabase/server'
import { HymnManager } from './_components/HymnManager'

import { AdminCard } from '@/components/admin/AdminCard'
import { Music } from 'lucide-react'

export default async function ThanhCaPage() {
  const supabase = await createClient()
  const [{ data: hymns }, { data: playlists }] = await Promise.all([
    supabase.from('hymns').select('*').order('sort_order'),
    supabase.from('hymn_playlists').select('*').order('sort_order'),
  ])

  return (
    <div className="p-4 md:p-8 w-full max-w-[1400px] mx-auto">
      <AdminCard title="Thánh Ca" icon={<Music size={18} strokeWidth={2.5} />}>
        <HymnManager initialHymns={hymns ?? []} initialPlaylists={playlists ?? []} />
      </AdminCard>
    </div>
  )
}
