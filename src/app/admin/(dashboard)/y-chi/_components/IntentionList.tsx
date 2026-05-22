'use client'

import { useState, useTransition } from 'react'
import { format } from 'date-fns'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Flame, CheckCircle2, Ban } from 'lucide-react'
import { AdminCheckbox, AdminBadge, AdminButton, AdminIconButton } from '@/components/admin/ui'
import { EmptyState } from '@/components/admin/EmptyState'
import { useBulkSelection } from '@/hooks/useBulkSelection'
import {
  INTENTION_STATUS_COLOR,
  INTENTION_STATUS_LABEL,
} from '@/lib/admin-constants'
import type { Intention } from '@/lib/admin-types'

export function IntentionList({ intentions, search }: { intentions: Intention[], search: string }) {
  const [itemLoading, setItemLoading] = useState<Set<string>>(new Set())
  const [bulkLoading, setBulkLoading] = useState(false)
  const router = useRouter()
  const [, startTransition] = useTransition()

  const { selected, selectedCount, allSelected, someSelected, toggleAll, toggleItem, clearSelection } =
    useBulkSelection(intentions, i => i.status === 'pending')

  const refresh = () => startTransition(() => router.refresh())

  const bulkMarkPrayed = async () => {
    setBulkLoading(true)
    const { error } = await createClient()
      .from('prayer_intentions')
      .update({ status: 'prayed' })
      .in('id', Array.from(selected))
    if (!error) clearSelection()
    setBulkLoading(false)
    refresh()
  }

  const bulkCancel = async () => {
    setBulkLoading(true)
    const { error } = await createClient()
      .from('prayer_intentions')
      .update({ status: 'cancelled' })
      .in('id', Array.from(selected))
    if (!error) clearSelection()
    setBulkLoading(false)
    refresh()
  }

  const singleMarkPrayed = async (id: string) => {
    setItemLoading(prev => new Set([...prev, id]))
    await createClient().from('prayer_intentions').update({ status: 'prayed' }).eq('id', id)
    setItemLoading(prev => { const n = new Set(prev); n.delete(id); return n })
    refresh()
  }

  const singleCancel = async (id: string) => {
    setItemLoading(prev => new Set([...prev, id]))
    await createClient().from('prayer_intentions').update({ status: 'cancelled' }).eq('id', id)
    setItemLoading(prev => { const n = new Set(prev); n.delete(id); return n })
    refresh()
  }

  if (!intentions || intentions.length === 0) {
    return (
      <EmptyState
        icon={<Flame size={22} strokeWidth={1.5} className="text-gray-300" />}
        message={search ? `Không tìm thấy kết quả cho "${search}"` : 'Chưa có ý chỉ nào.'}
      />
    )
  }

  const pendingItems = intentions.filter(i => i.status === 'pending')

  return (
    <div className="divide-y divide-gray-100 max-h-[calc(100vh-280px)] overflow-y-auto">

      {pendingItems.length > 0 && (
        <div className={`px-5 py-2.5 flex items-center gap-3 sticky top-0 z-10 border-b transition-colors ${
          selectedCount > 0 ? 'bg-vatican-blue/5 border-vatican-blue/10' : 'bg-gray-50 border-gray-100'
        }`}>
          <AdminCheckbox checked={allSelected} indeterminate={someSelected} onChange={toggleAll} />
          {selectedCount > 0 ? (
            <>
              <span className="text-sm md:text-base font-bold text-vatican-blue">Đã chọn {selectedCount}</span>
              <AdminButton size="compact" variant="confirm" onClick={bulkMarkPrayed} disabled={bulkLoading}>
                <CheckCircle2 size={13} />
                {bulkLoading ? 'Đang cập nhật...' : 'Đã cầu nguyện'}
              </AdminButton>
              <AdminButton size="compact" variant="danger" onClick={bulkCancel} disabled={bulkLoading}>
                <Ban size={13} />
                Hủy ý chỉ
              </AdminButton>
              <button
                onClick={clearSelection}
                className="ml-auto text-sm md:text-base text-gray-400 hover:text-gray-600 transition-colors"
              >
                Bỏ chọn
              </button>
            </>
          ) : (
            <span className="text-sm md:text-base text-gray-400">
              Chọn tất cả {pendingItems.length} ý chỉ đang chờ
            </span>
          )}
        </div>
      )}

      {intentions.map(i => {
        const isPending = i.status === 'pending'
        const isSelected = selected.has(i.id)
        const loading = itemLoading.has(i.id)

        return (
          <div
            key={i.id}
            className={`px-5 py-5 transition-colors ${isSelected ? 'bg-vatican-blue/5' : 'hover:bg-gray-50'}`}
          >
            <div className="flex gap-3">
              <div className="w-4 shrink-0 pt-[3px]">
                {isPending && (
                  <AdminCheckbox checked={isSelected} onChange={() => toggleItem(i.id)} />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 mb-1">
                  <div className="flex items-center gap-2.5 flex-wrap min-w-0">
                    <span className="font-bold text-sm md:text-base text-vatican-dark">
                      {i.name ?? 'Ẩn danh'}
                    </span>
                    {i.location && (
                      <span className="text-sm md:text-base font-medium text-gray-400">· {i.location}</span>
                    )}
                    <AdminBadge color={INTENTION_STATUS_COLOR[i.status] ?? 'gray'}>
                      {INTENTION_STATUS_LABEL[i.status] ?? i.status}
                    </AdminBadge>
                  </div>

                  {isPending && selectedCount === 0 && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <AdminButton
                        size="compact"
                        variant="confirm"
                        onClick={() => singleMarkPrayed(i.id)}
                        disabled={loading}
                      >
                        <CheckCircle2 size={13} />
                        {loading ? '...' : 'Đã cầu nguyện'}
                      </AdminButton>
                      <AdminIconButton
                        variant="danger"
                        onClick={() => singleCancel(i.id)}
                        disabled={loading}
                        title="Hủy ý chỉ này"
                        className="border border-gray-200 hover:border-red-300"
                      >
                        <Ban size={14} />
                      </AdminIconButton>
                    </div>
                  )}
                </div>

                <p className="text-sm font-medium text-gray-400 mb-2.5">
                  {i.created_at ? format(new Date(i.created_at), 'dd/MM/yyyy HH:mm') : ''}
                </p>

                {i.categories && i.categories.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {i.categories.map(c => (
                      <AdminBadge key={c} color="gray">{c}</AdminBadge>
                    ))}
                  </div>
                )}

                <p className="text-sm md:text-base text-gray-700 italic leading-relaxed line-clamp-3">
                  {i.content}
                </p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
