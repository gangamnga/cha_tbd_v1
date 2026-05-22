import { HandHeart } from 'lucide-react'
import { PartnerManager } from './_components/PartnerManager'
import { AdminCard } from '@/components/admin/AdminCard'

export default function DoiTacPage() {
  return (
    <div className="p-4 md:p-8 w-full max-w-[1400px] mx-auto">
      <AdminCard title="Quản Lý Đối Tác" icon={<HandHeart size={18} strokeWidth={2.5} />}>
        <PartnerManager />
      </AdminCard>
    </div>
  )
}
