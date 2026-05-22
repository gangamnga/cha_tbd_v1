import { ShieldCheck } from 'lucide-react'
import { AdminCard } from '@/components/admin/AdminCard'
import { RuleManager } from './_components/RuleManager'

export default function QuyDinhQuyTacPage() {
  return (
    <div className="p-4 md:p-8 w-full max-w-[1400px] mx-auto">
      <AdminCard title="Nội Quy & Quy Chế" icon={<ShieldCheck size={18} strokeWidth={2.5} />}>
        <div className="flex-1 p-2">
          <RuleManager />
        </div>
      </AdminCard>
    </div>
  )
}
