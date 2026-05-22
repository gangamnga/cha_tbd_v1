import { createClient } from '@/utils/supabase/server'
import { BioFactsEditor } from '../_components/BioFactsEditor'
import { PortraitEditor } from '../_components/PortraitEditor'
import { AdminCard } from '@/components/admin/AdminCard'
import { Star } from 'lucide-react'

export default async function LuocSuPage() {
  const supabase = await createClient()
  const [{ data: facts }, { data: setting }] = await Promise.all([
    supabase.from('bio_facts').select('*').order('sort_order'),
    supabase.from('site_settings').select('value').eq('key', 'bio_portrait_url').single(),
  ])

  const portraitUrl = setting?.value ?? '/images/cha-truong-buu-diep.jpg'

  return (
    <div className="w-full max-w-[1400px] mx-auto px-5 py-8">
      <AdminCard title="Lược Sử" icon={<Star size={16} strokeWidth={2.5} />}>
        <div className="p-[20px]">
          <div className="flex flex-col sm:flex-row gap-[20px]">
            <PortraitEditor initialUrl={portraitUrl} />
            <BioFactsEditor facts={facts ?? []} />
          </div>
        </div>
      </AdminCard>
    </div>
  )
}
