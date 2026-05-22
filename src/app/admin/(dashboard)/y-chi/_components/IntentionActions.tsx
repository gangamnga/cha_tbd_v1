'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Flame } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function IntentionActions({ id }: { id: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const markPrayed = async () => {
    setLoading(true)
    const supabase = createClient()
    await supabase.from('prayer_intentions').update({ status: 'prayed' }).eq('id', id)
    setLoading(false)
    router.refresh()
  }

  return (
    <button
      onClick={markPrayed}
      disabled={loading}
      title="Đánh dấu đã cầu nguyện"
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[16px] font-bold bg-orange-50 text-orange-700 hover:bg-orange-100 transition-colors disabled:opacity-50 shrink-0"
    >
      <Flame size={14} />
      {loading ? '...' : 'Đã cầu nguyện'}
    </button>
  )
}
