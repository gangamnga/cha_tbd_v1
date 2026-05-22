'use client'

import { useState, useTransition } from 'react'
import { format } from 'date-fns'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { CheckCircle, XCircle, BookOpen, Loader2, MessageSquare } from 'lucide-react'
import { ArticleModal } from '../../hoat-dong-cong-dong/_components/CommunityAdminGrid'
import { AdminCheckbox, AdminBadge, AdminButton } from '@/components/admin/ui'
import { EmptyState } from '@/components/admin/EmptyState'
import { useBulkSelection } from '@/hooks/useBulkSelection'
import {
  TESTIMONY_STATUS_COLOR,
  TESTIMONY_STATUS_LABEL,
} from '@/lib/admin-constants'
import type { Testimony } from '@/lib/admin-types'

export function TestimonyList({ testimonies, search }: { testimonies: Testimony[], search: string }) {
  const [items, setItems] = useState<Testimony[]>(testimonies)
  const [bulkLoading, setBulkLoading] = useState<'approve' | 'reject' | null>(null)
  const [itemLoading, setItemLoading] = useState<Record<string, string>>({})
  const [publishingTestimony, setPublishingTestimony] = useState<Testimony | null>(null)
  const router = useRouter()
  const [, startTransition] = useTransition()

  const { selected, selectedCount, allSelected, someSelected, toggleAll, toggleItem, clearSelection } =
    useBulkSelection(items, t => t.status === 'pending')

  const refresh = () => startTransition(() => router.refresh())

  const bulkUpdate = async (status: 'approved' | 'rejected') => {
    const ids = Array.from(selected)
    setBulkLoading(status === 'approved' ? 'approve' : 'reject')
    setItems(prev => prev.map(t => ids.includes(t.id) ? { ...t, status } : t))
    clearSelection()
    await createClient().from('testimonies').update({ status }).in('id', ids)
    setBulkLoading(null)
    refresh()
  }

  const singleUpdate = async (id: string, status: 'approved' | 'rejected') => {
    setItemLoading(prev => ({ ...prev, [id]: status === 'approved' ? 'approve' : 'reject' }))
    setItems(prev => prev.map(t => t.id === id ? { ...t, status } : t))
    await createClient().from('testimonies').update({ status }).eq('id', id)
    setItemLoading(prev => { const n = { ...prev }; delete n[id]; return n })
    refresh()
  }

  const handleArticleSaved = async (t: Testimony) => {
    setItems(prev => prev.map(item => item.id === t.id ? { ...item, status: 'published' } : item))
    await createClient().from('testimonies').update({ status: 'published' }).eq('id', t.id)
    setPublishingTestimony(null)
    refresh()
  }

  if (!items.length) {
    return (
      <EmptyState
        icon={<MessageSquare size={22} strokeWidth={1.5} className="text-gray-300" />}
        message={search ? `Không tìm thấy kết quả cho "${search}"` : 'Chưa có lời chứng nào.'}
      />
    )
  }

  const pendingItems = items.filter(t => t.status === 'pending')

  return (
    <div className="max-h-[calc(100vh-280px)] overflow-y-auto divide-y divide-gray-100">

      {pendingItems.length > 0 && (
        <div className={`px-5 py-2.5 flex items-center gap-3 sticky top-0 z-10 transition-colors ${
          selectedCount > 0 ? 'bg-vatican-blue/5 border-b border-vatican-blue/10' : 'bg-gray-50/80 border-b border-gray-100'
        }`}>
          <AdminCheckbox checked={allSelected} indeterminate={someSelected} onChange={toggleAll} />
          {selectedCount > 0 ? (
            <>
              <span className="text-[14px] font-bold text-vatican-blue">Đã chọn {selectedCount}</span>
              <div className="flex items-center gap-1.5">
                <AdminButton
                  size="compact"
                  variant="confirm"
                  onClick={() => bulkUpdate('approved')}
                  disabled={!!bulkLoading}
                >
                  {bulkLoading === 'approve' ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle size={13} />}
                  {bulkLoading === 'approve' ? 'Đang duyệt...' : `Duyệt ${selectedCount}`}
                </AdminButton>
                <AdminButton
                  size="compact"
                  variant="danger"
                  onClick={() => bulkUpdate('rejected')}
                  disabled={!!bulkLoading}
                >
                  {bulkLoading === 'reject' ? <Loader2 size={13} className="animate-spin" /> : <XCircle size={13} />}
                  {bulkLoading === 'reject' ? 'Đang từ chối...' : `Từ chối ${selectedCount}`}
                </AdminButton>
              </div>
              <button
                onClick={clearSelection}
                className="ml-auto text-[13px] text-gray-400 hover:text-gray-600 transition-colors"
              >
                Bỏ chọn
              </button>
            </>
          ) : (
            <span className="text-[14px] text-gray-400">
              Chọn tất cả {pendingItems.length} lời chứng chờ duyệt
            </span>
          )}
        </div>
      )}

      {items.map(t => {
        const isPending  = t.status === 'pending'
        const isApproved = t.status === 'approved'
        const isSelected = selected.has(t.id)
        const loading    = itemLoading[t.id]

        const date = t.created_at
          ? format(new Date(t.created_at), 'dd/MM/yyyy HH:mm')
          : ''

        return (
          <div key={t.id}
            className={`px-5 py-4 transition-colors ${isSelected ? 'bg-vatican-blue/5' : 'hover:bg-gray-50'}`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 shrink-0 w-4">
                {isPending && (
                  <AdminCheckbox checked={isSelected} onChange={() => toggleItem(t.id)} />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <AdminBadge color={TESTIMONY_STATUS_COLOR[t.status] ?? 'gray'} className="shrink-0">
                        {TESTIMONY_STATUS_LABEL[t.status] ?? t.status}
                      </AdminBadge>
                      <p className="text-[15px] font-bold text-vatican-dark leading-snug">{t.title}</p>
                    </div>

                    <p className="text-[13px] text-gray-400 mb-2">
                      {t.name ?? 'Ẩn danh'}{t.location ? ` · ${t.location}` : ''}
                      {date ? ` · ${date}` : ''}
                    </p>

                    {t.categories && t.categories.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {t.categories.map(c => (
                          <AdminBadge key={c} color="blue">{c}</AdminBadge>
                        ))}
                      </div>
                    )}

                    <p className="text-[14px] text-gray-600 leading-relaxed line-clamp-2">{t.content}</p>
                  </div>

                  {isPending && selectedCount === 0 && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <AdminButton
                        size="compact"
                        variant="confirm"
                        onClick={() => singleUpdate(t.id, 'approved')}
                        disabled={!!loading}
                      >
                        {loading === 'approve' ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle size={13} />}
                        {loading === 'approve' ? '...' : 'Duyệt'}
                      </AdminButton>
                      <AdminButton
                        size="compact"
                        variant="danger"
                        onClick={() => singleUpdate(t.id, 'rejected')}
                        disabled={!!loading}
                      >
                        {loading === 'reject' ? <Loader2 size={13} className="animate-spin" /> : <XCircle size={13} />}
                        {loading === 'reject' ? '...' : 'Từ chối'}
                      </AdminButton>
                    </div>
                  )}
                  {isApproved && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <AdminButton
                        size="compact"
                        variant="publish"
                        onClick={() => setPublishingTestimony(t)}
                        disabled={!!loading}
                      >
                        <BookOpen size={13} />
                        Đăng bài viết
                      </AdminButton>
                      <AdminButton
                        size="compact"
                        variant="danger"
                        onClick={() => singleUpdate(t.id, 'rejected')}
                        disabled={!!loading}
                      >
                        {loading === 'reject' ? <Loader2 size={13} className="animate-spin" /> : <XCircle size={13} />}
                        {loading === 'reject' ? '...' : 'Từ chối'}
                      </AdminButton>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      })}

      {publishingTestimony && (
        <ArticleModal
          config={{
            mode: 'add',
            prefill: {
              title: publishingTestimony.title,
              content: publishingTestimony.content
                ? `<p>${publishingTestimony.content.replace(/\n{2,}/g, '</p><p>').replace(/\n/g, '<br/>')}</p>`
                : '',
              testimony_categories: publishingTestimony.categories ?? [],
            },
          }}
          category="loi-chung"
          onClose={() => setPublishingTestimony(null)}
          onSaved={() => handleArticleSaved(publishingTestimony)}
        />
      )}
    </div>
  )
}
