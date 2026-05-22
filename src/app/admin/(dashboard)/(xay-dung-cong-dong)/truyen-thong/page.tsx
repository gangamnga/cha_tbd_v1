import { Radio } from 'lucide-react'
import { AdminCard } from '@/components/admin/AdminCard'
import { MediaManager } from './_components/MediaManager'

export default function TruyennThongPage() {
  return (
    <div className="p-4 md:p-8 w-full max-w-[1400px] mx-auto">
      <AdminCard title="Truyền Thông" icon={<Radio size={18} strokeWidth={2.5} />}>
        <MediaManager />
      </AdminCard>
    </div>
  )
}
