import { createClient } from '@/utils/supabase/server'
import { PrayerManager } from './_components/PrayerManager'

import { AdminCard } from '@/components/admin/AdminCard'
import { BookOpen } from 'lucide-react'

export default async function LoiKinhPage() {
  const supabase = await createClient()
  const [{ data: prayers }, { data: themes }] = await Promise.all([
    supabase.from('prayers').select('*').order('sort_order'),
    supabase.from('prayer_themes').select('*').order('sort_order'),
  ])

  return (
    <div className="p-4 md:p-8 w-full max-w-[1400px] mx-auto">
      <AdminCard title="Lời Kinh" icon={<BookOpen size={18} strokeWidth={2.5} />}>
        <PrayerManager initialPrayers={prayers ?? []} initialThemes={themes ?? []} />
      </AdminCard>
    </div>
  )
}
