'use client'

import { useState, useEffect, useCallback, memo } from 'react'
import {
  CalendarDays, Plus,
  Radio, Pencil, Trash2, Eye,
} from 'lucide-react'
import { AdminSearchInput } from '@/components/admin/AdminSearchInput'
import { ExportPDFButton } from '@/components/admin/ExportPDFButton'
import { ConfirmDeleteModal } from '@/components/admin/ConfirmDeleteModal'
import { AdminCheckbox, AdminButton, AdminIconButton, AdminStatusBadgeSelect, BadgeSelectOption } from '@/components/admin/ui'
import { AdminTabs } from '@/components/admin/AdminTabs'
import {
  RoadmapManager,
  buildInitialGroups,
  KeywordGroup,
  KeywordItem,
} from './RoadmapManager'
import {
  EventStatus, LivestreamSession, ModalState,
  MOCK_STREAMS, STATUS_CONFIG, PLATFORM_CONFIG, TABS,
} from './livestream-types'
import { DetailViewModal, UnifiedAddModal } from './LivestreamModal'
import { EmptyState } from '@/components/admin/EmptyState'

// -- Helpers -------------------------------------------------------------------

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '')
}

// -- RowStatusToggle -----------------------------------------------------------

const MEDIA_STATUS_OPTIONS: BadgeSelectOption[] = [
  { value: 'pending', label: 'Sắp diễn ra', color: 'amber' },
  { value: 'completed', label: 'Đã hoàn tất', color: 'green' },
]

function RowStatusToggle({ status, onToggle }: { status: EventStatus; onToggle: () => void }) {
  return (
    <AdminStatusBadgeSelect
      value={status}
      onChange={onToggle}
      options={MEDIA_STATUS_OPTIONS}
    />
  )
}

// -- LivestreamRow -------------------------------------------------------------

const LivestreamRow = memo(function LivestreamRow({
  session,
  isSelected,
  onToggle,
  onToggleStatus,
  onView,
  onEdit,
  onDelete,
}: {
  session: LivestreamSession
  isSelected: boolean
  onToggle: () => void
  onToggleStatus: () => void
  onView: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  const [y, m, d] = session.scheduled_date.split('-')

  return (
    <tr className={`transition-colors ${isSelected ? 'bg-vatican-blue/5' : 'hover:bg-gray-50'}`}>
      {/* Checkbox */}
      <td className="px-5 py-3.5 w-10">
        <AdminCheckbox checked={isSelected} onChange={onToggle} />
      </td>

      {/* Info */}
      <td className="px-4 py-3.5">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-[15px] font-bold text-vatican-dark">
              {session.title}
              {session.episode && <span className="ml-1.5 text-[13px] font-semibold text-gray-400">#{session.episode}</span>}
            </p>
            {session.platforms.map(p => (
              <span key={p} className={`text-[11px] font-bold px-2 py-0.5 rounded-full border bg-gray-50 border-gray-200 ${PLATFORM_CONFIG[p].color}`}>
                {PLATFORM_CONFIG[p].label}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-3 mt-0.5 text-[13px] text-gray-500">
            <span className="flex items-center gap-1"><CalendarDays size={12} className="text-gray-400" /> {d}/{m}/{y} lúc {session.scheduled_time}</span>
          </div>
          {session.description && (
            <p className="text-[13px] text-gray-400 mt-0.5 truncate max-w-lg">{stripHtml(session.description)}</p>
          )}
        </div>
      </td>

      {/* Trạng thái */}
      <td className="px-4 py-3.5 w-[140px] hidden sm:table-cell">
        <RowStatusToggle status={session.status} onToggle={onToggleStatus} />
      </td>

      {/* Hành động */}
      <td className="px-4 py-3.5 w-28">
        <div className="flex items-center gap-0.5">
          <AdminIconButton onClick={onView} variant="ghost" title="Xem">
            <Eye size={13} />
          </AdminIconButton>
          <AdminIconButton onClick={onEdit} variant="edit" title="Sửa">
            <Pencil size={13} />
          </AdminIconButton>
          <AdminIconButton onClick={onDelete} variant="danger" title="Xóa">
            <Trash2 size={13} />
          </AdminIconButton>
        </div>
      </td>
    </tr>
  )
})

// -- Main MediaManager ---------------------------------------------------------

export function MediaManager() {
  const [activeTab, setActiveTab] = useState<'phat-song' | 'tu-khoa-seo'>('phat-song')
  const [sessions,    setSessions]    = useState<LivestreamSession[]>(MOCK_STREAMS)
  const [modal,       setModal]       = useState<ModalState>(null)
  const [deleteTarget,setDeleteTarget]= useState<LivestreamSession | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchOpen,  setSearchOpen]  = useState(false)

  // Lifted States for SEO keywords roadmap
  const [groups, setGroups] = useState<KeywordGroup[]>(() => buildInitialGroups())
  const [activeKwId, setActiveKwId] = useState<string>(() => {
    const initialGroups = buildInitialGroups()
    return initialGroups[0]?.keywords[0]?.id ?? ''
  })

  const handleSavedTitle = useCallback((result: {
    groupId: string
    newGroupName?: string
    newGroupVolume?: string
    newGroupIntent?: string
    kwId: string
    newKwText?: string
    title: string
  }) => {
    setGroups(prev => {
      let targetGroupId = result.groupId
      let targetKwId = result.kwId
      let nextGroups = [...prev]

      if (result.groupId === 'new') {
        const newGroupId = 'g_' + Date.now().toString()
        const newGroup: KeywordGroup = {
          id: newGroupId,
          name: result.newGroupName || 'Nhóm mới',
          volume: result.newGroupVolume || '',
          intent: result.newGroupIntent || '',
          keywords: []
        }
        nextGroups.push(newGroup)
        targetGroupId = newGroupId
      }

      if (result.kwId === 'new') {
        const newKwId = 'k_' + Date.now().toString()
        const newKw: KeywordItem = {
          id: newKwId,
          text: result.newKwText || 'Từ khóa mới',
          titles: [result.title]
        }
        nextGroups = nextGroups.map(g =>
          g.id === targetGroupId ? { ...g, keywords: [...g.keywords, newKw] } : g
        )
        targetKwId = newKwId
      } else {
        nextGroups = nextGroups.map(g =>
          g.id === targetGroupId
            ? { ...g, keywords: g.keywords.map(k => k.id === targetKwId ? { ...k, titles: [...k.titles, result.title] } : k) }
            : g
        )
      }

      setTimeout(() => { setActiveKwId(targetKwId) }, 0)
      return nextGroups
    })
  }, [])

  // Selection
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false)

  useEffect(() => { setSearchQuery(''); setSearchOpen(false) }, [activeTab])

  const q = searchQuery.toLowerCase()

  const filteredSessions = sessions.filter(s =>
    q === '' ||
    s.title.toLowerCase().includes(q) ||
    s.platforms.some(p => PLATFORM_CONFIG[p].label.toLowerCase().includes(q))
  )

  const sortedSessions = [...filteredSessions].sort((a, b) => {
    const dc = b.scheduled_date.localeCompare(a.scheduled_date)
    return dc !== 0 ? dc : b.scheduled_time.localeCompare(a.scheduled_time)
  })

  const displayItems  = sortedSessions
  const selectedCount = selected.size
  const allSelected   = displayItems.length > 0 && displayItems.every(item => selected.has(item.id))
  const someSelected  = displayItems.some(item => selected.has(item.id)) && !allSelected

  const toggleAll  = () => {
    if (allSelected || someSelected) setSelected(new Set())
    else setSelected(new Set(displayItems.map(item => item.id)))
  }

  const toggleItem = (id: string) => setSelected(prev => {
    const next = new Set(prev)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    return next
  })

  const bulkDelete = () => {
    setSessions(prev => prev.filter(s => !selected.has(s.id)))
    setSelected(new Set())
    setConfirmBulkDelete(false)
  }

  const handleSavedStream = (saved: LivestreamSession) => {
    setSessions(prev => {
      const idx = prev.findIndex(s => s.id === saved.id)
      return idx >= 0
        ? prev.map(s => s.id === saved.id ? saved : s)
        : [saved, ...prev].sort((a, b) => b.scheduled_date.localeCompare(a.scheduled_date))
    })
    if (modal?.kind === 'edit-stream') {
      setModal({ kind: 'view-stream', session: saved })
    } else {
      setModal(null)
    }
  }

  const handleToggleStreamStatus = (id: string) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, status: s.status === 'completed' ? 'pending' : 'completed' } : s))
  }

  const handleConfirmDelete = () => {
    if (!deleteTarget) return
    setSessions(prev => prev.filter(s => s.id !== deleteTarget.id))
    setSelected(prev => { const n = new Set(prev); n.delete(deleteTarget.id); return n })
    setDeleteTarget(null)
  }

  return (
    <div className="flex flex-col">

      {/* -- Toolbar -- */}
      <div className="px-6 py-4 border-b border-gray-100 flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between bg-gray-50/50">
        <div className="flex-1 min-w-0 w-full">
          <AdminTabs
            tabs={TABS.map(tab => ({
              id: tab.key,
              label: tab.label,
            }))}
            activeTab={activeTab}
            onChange={setActiveTab}
          />
        </div>

        <div className="flex items-center gap-4 shrink-0 flex-wrap w-full xl:w-auto justify-end">
          {activeTab === 'phat-song' && (
            <>
              {/* Search */}
              <AdminSearchInput
                open={searchOpen}
                value={searchQuery}
                onOpen={() => setSearchOpen(true)}
                onChange={setSearchQuery}
                onClear={() => { setSearchQuery(''); setSearchOpen(false) }}
              />

              <div className="h-6 w-px bg-gray-200 hidden xl:block mx-1" />

              {/* Export PDF */}
              <ExportPDFButton
                title="Danh sách Truyền thông"
                headers={['Tên buổi', 'Nền tảng', 'Ngày', 'Giờ', 'Trạng thái']}
                rows={(selectedCount > 0 ? sortedSessions.filter(s => selected.has(s.id)) : sortedSessions).map(s => {
                  const [y, mo, d] = s.scheduled_date.split('-')
                  return [
                    s.title + (s.episode ? ` #${s.episode}` : ''),
                    s.platforms.map(p => PLATFORM_CONFIG[p].label).join(', '),
                    `${d}/${mo}/${y}`, s.scheduled_time,
                    STATUS_CONFIG[s.status].label,
                  ]
                })}
              />

              <div className="h-6 w-px bg-gray-200 hidden xl:block mx-1" />
            </>
          )}

          <AdminButton onClick={() => setModal({ kind: 'new' })} className="shrink-0">
            <Plus size={13} />
            Thêm mới
          </AdminButton>
        </div>
      </div>

      {/* -- Content -- */}
      {activeTab === 'tu-khoa-seo' ? (
        <div className="flex-1 bg-white p-4">
          <RoadmapManager
            groups={groups}
            setGroups={setGroups}
            activeKwId={activeKwId}
            setActiveKwId={setActiveKwId}
            onAddTitle={() => setModal({ kind: 'new' })}
          />
        </div>
      ) : displayItems.length === 0 ? (
        <EmptyState
          icon={<Radio size={22} strokeWidth={1.5} className="text-gray-300" />}
          message={searchQuery ? `Không tìm thấy kết quả cho "${searchQuery}"` : 'Chưa có buổi phát sóng nào.'}
        />
      ) : (
        <div className="max-h-[calc(100vh-280px)] overflow-y-auto overflow-x-auto bg-white rounded-b-xl">
          <table className="w-full min-w-[640px]">
            <thead className="sticky top-0 z-10">
              <tr className={`border-b transition-colors ${selectedCount > 0 ? 'bg-vatican-blue/5 border-vatican-blue/10' : 'bg-gray-50/50 border-gray-100'}`}>
                <th className="px-5 py-3 w-10 text-left">
                  <AdminCheckbox checked={allSelected} indeterminate={someSelected} onChange={toggleAll} />
                </th>

                {selectedCount > 0 ? (
                  <th colSpan={3} className="px-2 py-3 text-left">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-[14px] font-bold text-vatican-blue">Đã chọn {selectedCount}</span>
                      <AdminButton onClick={() => setConfirmBulkDelete(true)}
                        variant="danger"
                        size="compact">
                        <Trash2 size={12} />Xóa {selectedCount}
                      </AdminButton>
                      <AdminButton onClick={() => setSelected(new Set())}
                        variant="secondary"
                        size="compact"
                        className="ml-auto mr-4 text-[13px]">
                        Bỏ chọn
                      </AdminButton>
                    </div>
                  </th>
                ) : (
                  <>
                    <th className="px-4 py-3 text-left text-[13px] font-bold uppercase tracking-wider text-gray-400">Thông tin buổi phát</th>
                    <th className="px-4 py-3 text-left text-[13px] font-bold uppercase tracking-wider text-gray-400 hidden sm:table-cell w-[140px]">Trạng thái</th>
                    <th className="px-4 py-3 w-28" />
                  </>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {sortedSessions.map(s => (
                <LivestreamRow key={s.id} session={s}
                  isSelected={selected.has(s.id)}
                  onToggle={() => toggleItem(s.id)}
                  onToggleStatus={() => handleToggleStreamStatus(s.id)}
                  onView={() => setModal({ kind: 'view-stream', session: s })}
                  onEdit={() => setModal({ kind: 'edit-stream', session: s })}
                  onDelete={() => setDeleteTarget(s)} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (modal.kind === 'new' || modal.kind === 'edit-stream') && (
        <UnifiedAddModal
          state={modal}
          onClose={() => setModal(null)}
          onSavedStream={handleSavedStream}
          onSavedTitle={handleSavedTitle}
          groups={groups}
          activeTab={activeTab}
          activeKwId={activeKwId}
        />
      )}

      {modal && modal.kind === 'view-stream' && (
        <DetailViewModal
          state={modal}
          onClose={() => setModal(null)}
          onChangeMode={setModal}
        />
      )}

      {deleteTarget && (
        <ConfirmDeleteModal
          title="Xóa buổi phát sóng"
          description={`Bạn có chắc chắn muốn xóa "${deleteTarget.title}"? Hành động này không thể hoàn tác.`}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {confirmBulkDelete && (
        <ConfirmDeleteModal
          title={`Xóa ${selectedCount} buổi phát sóng?`}
          description="Hành động này không thể hoàn tác và sẽ xóa tất cả các mục đã chọn."
          onConfirm={bulkDelete}
          onCancel={() => setConfirmBulkDelete(false)}
        />
      )}
    </div>
  )
}
