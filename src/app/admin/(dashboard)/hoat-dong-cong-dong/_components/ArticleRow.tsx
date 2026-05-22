'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2, ImageOff } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { ConfirmDeleteModal } from '@/components/admin/ConfirmDeleteModal'
import { AdminIconButton } from '@/components/admin/ui'
import { type Article, STATUS_BADGE, STATUS_LABEL } from './ArticleCard'

export function ArticleRow({ article, onDeleted, onEdit }: {
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
    <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors group">
      <td className="px-4 py-3 w-[110px]">
        <div className="w-[96px] aspect-video rounded-lg overflow-hidden bg-gray-100">
          {article.thumbnail_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={article.thumbnail_url} alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
              <ImageOff size={16} strokeWidth={1.5} className="text-gray-300" />
            </div>
          )}
        </div>
      </td>

      <td className="px-4 py-3">
        <p className="font-bold text-[15px] text-vatican-dark truncate leading-snug">{article.title}</p>
        <p className="text-[13px] text-gray-400 truncate mt-0.5">{article.slug}</p>
      </td>

      <td className="px-4 py-3 w-[80px] text-center">
        <span className={`text-[13px] font-bold px-2 py-0.5 rounded-lg ${badgeCls}`}>
          {badgeLabel}
        </span>
      </td>

      <td className="px-4 py-3 w-[100px] text-right">
        <span className="text-[13px] text-gray-400 font-medium whitespace-nowrap">{date}</span>
      </td>

      <td className="px-4 py-3 w-[72px]">
        <div className="flex gap-1 justify-end">
          <AdminIconButton onClick={onEdit} variant="edit" title="Sửa">
            <Pencil size={14} />
          </AdminIconButton>
          <AdminIconButton onClick={() => setShowConfirm(true)} disabled={deleting} variant="danger" title="Xóa">
            <Trash2 size={14} />
          </AdminIconButton>
        </div>
        {showConfirm && (
          <ConfirmDeleteModal title="Xóa bài viết?" description={article.title}
            onConfirm={remove} onCancel={() => setShowConfirm(false)} loading={deleting} />
        )}
      </td>
    </tr>
  )
}
