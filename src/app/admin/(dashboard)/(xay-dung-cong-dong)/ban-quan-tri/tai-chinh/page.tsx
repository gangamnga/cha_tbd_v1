import { Wallet } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'
import { AdminCard } from '@/components/admin/AdminCard'
import { FinanceTab } from '../_components/FinanceTab'

export default async function TaiChinhPage() {
  const supabase = await createClient()

  const { data: finances } = await supabase
    .from('bqt_finances')
    .select('*')
    .order('entry_date', { ascending: false })

  return (
    <div className="p-4 md:p-8 w-full max-w-[1400px] mx-auto">
      <AdminCard title="Tài Chính Ban Quản Trị" icon={<Wallet size={18} strokeWidth={2.5} />}>
        <div className="flex-1 p-2">
          <FinanceTab initial={finances ?? []} />
        </div>
      </AdminCard>
    </div>
  )
}
