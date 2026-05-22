'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2, ImageOff } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { ConfirmDeleteModal } from '@/components/admin/ConfirmDeleteModal'
import { AdminIconButton } from '@/components/admin/ui'

export type Article = {
  id: string
  title: string
  slug: string
  status: string
  created_at: string | null
  thumbnail_url: string | null
}

export const STATUS_BADGE: Record<string, string> = {
  published: 'bg-green-500 text-white',
  draft:     'bg-orange-400 text-white',
}

export const STATUS_LABEL: Record<string, string> = {
  published: 'Đã đăng',
  draft:     'Bản nháp',
}

export function ArticleCard({ article, onDeleted, onEdit }: {
  article: Article
  onDeleted: () => void
  onEdit: () => void
}) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [deleting,    setDeleting]    = useState(false)
  const router = useRouter()

  const date = article.created_at
    ? format(new Date(article.created_at), 'dd/MM/yyyy HH:mm')
    : '—'
  const badgeCls   = STATUS_BADGE[article.status] ?? 'bg-gray-500 text-white'
  const badgeLabel = STATUS_LABEL[article.status] ?? article.status

  const remove = async () => {
    setDeleting(true)
    await createClient().from('articles').delete().eq('id', article.id)
    onDeleted()
    router.refresh()
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col group">
      <div className="relative aspect-video bg-gray-100 overflow-hidden shrink-0">
        {article.thumbnail_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={article.thumbnail_url} alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-1.5 bg-gradient-to-br from-gray-50 to-gray-100">
            <ImageOff size={24} strokeWidth={1.5} className="text-gray-300" />
            <span className="text-[16px] font-bold uppercase tracking-widest text-gray-300">Chưa có ảnh</span>
          </div>
        )}
        <span className={`absolute top-2 left-2 text-[16px] font-bold px-2 py-0.5 rounded-lg ${badgeCls}`}>
          {badgeLabel}
        </span>
      </div>

      <div className="p-3.5 flex flex-col gap-1 flex-1">
        <p className="font-bold text-[16px] text-vatican-dark line-clamp-2 leading-snug">{article.title}</p>
        <p className="text-[16px] text-gray-400 truncate">{article.slug}</p>
      </div>

      <div className="px-3.5 pb-3 flex items-center justify-between border-t border-gray-100 pt-2.5">
        <span className="text-[16px] text-gray-400 font-medium">{date}</span>
        <div className="flex gap-1">
          <AdminIconButton variant="edit" onClick={onEdit}>
            <Pencil size={14} />
          </AdminIconButton>
          <AdminIconButton variant="danger" onClick={() => setShowConfirm(true)} disabled={deleting}>
            <Trash2 size={14} />
          </AdminIconButton>
        </div>
      </div>

      {showConfirm && (
        <ConfirmDeleteModal title="Xóa bài viết?" description={article.title}
          onConfirm={remove} onCancel={() => setShowConfirm(false)} loading={deleting} />
      )}
    </div>
  )
}
