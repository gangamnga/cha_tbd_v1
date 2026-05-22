'use client'

import { useState, useCallback } from 'react'
import { Newspaper, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { type Article, ArticleCard } from './ArticleCard'
import { ArticleRow } from './ArticleRow'
import { ArticleModal, type ModalConfig } from './ArticleModal'
import { AdminButton, AdminViewToggle } from '@/components/admin/ui'
import { AdminSearchInput } from '@/components/admin/AdminSearchInput'
import { AdminPagination } from '@/components/admin/AdminPagination'
import { EmptyState } from '@/components/admin/EmptyState'

export type { Article }
export type { ModalConfig }
export { ArticleModal }

const PER_PAGE_GRID = 6
const PER_PAGE_LIST = 8

export function CommunityAdminGrid({ articles: initial, category = 'cong-dong', label = 'bài viết hoạt động cộng đồng' }: {
  articles: Article[]
  category?: string
  label?: string
}) {
  const [articles,     setArticles]     = useState(initial)
  const [page,         setPage]         = useState(1)
  const [view,         setView]         = useState<'grid' | 'list'>('grid')
  const [search,       setSearch]       = useState('')
  const [searchOpen,   setSearchOpen]   = useState(false)
  const perPage    = view === 'grid' ? PER_PAGE_GRID : PER_PAGE_LIST
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingId,    setEditingId]    = useState<string | null>(null)
  const router = useRouter()

  const handleCreated = (article: Article) => {
    setArticles(prev => [article, ...prev])
    setPage(1)
    setShowAddModal(false)
    router.refresh()
  }

  const handleUpdated = (updated: Article) => {
    setArticles(prev => prev.map(a => a.id === updated.id ? updated : a))
    setEditingId(null)
    router.refresh()
  }

  const clearSearch = useCallback(() => { setSearch(''); setSearchOpen(false); setPage(1) }, [])

  const filtered   = search.trim()
    ? articles.filter(a => a.title.toLowerCase().includes(search.trim().toLowerCase()))
    : articles
  const totalPages = Math.ceil(filtered.length / perPage)
  const paged      = filtered.slice((page - 1) * perPage, page * perPage)

  return (
    <div className="flex flex-col">

      {/* Action bar */}
      <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between gap-4 shrink-0">
        <p className="text-[14px] text-gray-500 font-medium">
          Hiện có <strong className="text-vatican-dark">{articles.length}</strong> {label}
          {search.trim() && filtered.length !== articles.length && (
            <span className="ml-1 text-gray-400">— tìm thấy <strong className="text-vatican-dark">{filtered.length}</strong></span>
          )}
        </p>
        <div className="flex items-center gap-2">
          <AdminSearchInput
            open={searchOpen}
            value={search}
            onOpen={() => setSearchOpen(true)}
            onChange={v => { setSearch(v); setPage(1) }}
            onClear={clearSearch}
            width="w-[200px]"
          />
          <AdminViewToggle view={view} onChange={v => { setView(v); setPage(1); }} />
          <AdminButton onClick={() => setShowAddModal(true)} className="shrink-0 text-[14px]">
            <Plus size={13} />Thêm bài viết
          </AdminButton>
        </div>
      </div>

      {/* Content */}
      <div className={view === 'grid' ? 'p-6' : 'px-0 py-0'}>
        {!filtered.length ? (
          <EmptyState
            icon={<Newspaper size={22} strokeWidth={1.5} className="text-gray-300" />}
            message={search.trim() ? `Không tìm thấy bài viết nào với "${search}"` : 'Chưa có bài viết nào'}
          />
        ) : view === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-5">
            {paged.map((article) => (
              <ArticleCard key={article.id} article={article}
                onEdit={() => setEditingId(article.id)}
                onDeleted={() => {
                  const next = articles.filter(a => a.id !== article.id)
                  setArticles(next)
                  const newTotal = Math.ceil(next.length / perPage)
                  if (page > newTotal) setPage(Math.max(1, newTotal))
                }} />
            ))}
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-2.5 w-[110px]" />
                <th className="px-4 py-2.5 text-left text-[13px] font-bold uppercase tracking-wider text-gray-400">Tiêu đề</th>
                <th className="px-4 py-2.5 text-center text-[13px] font-bold uppercase tracking-wider text-gray-400 w-[80px]">Trạng thái</th>
                <th className="px-4 py-2.5 text-right text-[13px] font-bold uppercase tracking-wider text-gray-400 w-[100px]">Ngày tạo</th>
                <th className="px-4 py-2.5 w-[72px]" />
              </tr>
            </thead>
            <tbody>
              {paged.map((article) => (
                <ArticleRow key={article.id} article={article}
                  onEdit={() => setEditingId(article.id)}
                  onDeleted={() => {
                    const next = articles.filter(a => a.id !== article.id)
                    setArticles(next)
                    const newTotal = Math.ceil(next.length / perPage)
                    if (page > newTotal) setPage(Math.max(1, newTotal))
                  }} />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {filtered.length > 0 && (
        <AdminPagination
          currentPage={page}
          totalPages={totalPages}
          totalCount={filtered.length}
          itemName="bài viết"
          from={(page - 1) * perPage}
          to={page * perPage - 1}
          onPageChange={setPage}
        />
      )}

      {showAddModal && (
        <ArticleModal config={{ mode: 'add' }} category={category} onClose={() => setShowAddModal(false)} onSaved={handleCreated} />
      )}
      {editingId && (
        <ArticleModal config={{ mode: 'edit', articleId: editingId }} category={category} onClose={() => setEditingId(null)} onSaved={handleUpdated} />
      )}
    </div>
  )
}
