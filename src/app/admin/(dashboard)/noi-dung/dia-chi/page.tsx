import { createClient } from '@/utils/supabase/server'
import { LocationsManager } from './_components/LocationsManager'

export default async function DiaChiAdminPage() {
  const supabase = await createClient()
  const { data: locations } = await supabase.from('locations').select('*').order('sort_order')

  return (
    <div className="p-4 md:p-8 w-full max-w-[1400px] mx-auto">
      <LocationsManager locations={locations ?? []} />
    </div>
  )
}
