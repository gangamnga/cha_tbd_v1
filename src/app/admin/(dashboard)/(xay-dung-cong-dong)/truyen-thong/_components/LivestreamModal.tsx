'use client'

import { useState, useEffect } from 'react'
import { AlertCircle, Printer, Pencil } from 'lucide-react'
import { AdminModal } from '@/components/admin/AdminModal'
import { AdminLabel, AdminInput, AdminNativeSelect, AdminTextarea, AdminButton, AdminIconButton, ModalHeader } from '@/components/admin/ui'
import dynamic from 'next/dynamic'

const RichTextEditor = dynamic(() => import('@/components/admin/RichTextEditor'), {
  ssr: false,
  loading: () => (
    <div className="h-40 flex items-center justify-center border border-dashed border-gray-200 rounded-lg text-gray-400 bg-gray-50/50">
      Đang tải trình soạn thảo...
    </div>
  )
})
import type { KeywordGroup, KeywordItem } from './RoadmapManager'
import {
  STATUS_CONFIG, PLATFORM_ORDER, PLATFORM_CONFIG, TABS,
  type EventStatus, type StreamPlatform, type LivestreamSession, type ModalState,
} from './livestream-types'

// ── Print HTML ────────────────────────────────────────────────────────────────

function buildLivestreamPrintHTML(session: LivestreamSession): string {
  const [y, mo, d] = session.scheduled_date.split('-')
  const dateStr     = `${d}/${mo}/${y} lúc ${session.scheduled_time}`
  const platformStr = session.platforms.map(p => PLATFORM_CONFIG[p].label).join(', ')
  const titleFull   = session.title + (session.episode ? ` — Tập #${session.episode}` : '')

  return `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="utf-8"/>
<title>Nội dung — ${session.title}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  @page { size:A4 portrait; margin:20mm 20mm 25mm; }
  body { font-family:Arial,Helvetica,sans-serif; font-size:11pt; color:#1a1a1a; line-height:1.6; }
  .header { text-align:center; margin-bottom:24pt; }
  .header .org { font-size:10pt; color:#555; margin-bottom:4pt; }
  .header h1 { font-size:16pt; font-weight:bold; color:#012642; letter-spacing:1px; text-transform:uppercase; margin-bottom:6pt; }
  .header .sub { font-size:12pt; color:#012642; font-weight:bold; margin-bottom:3pt; }
  .header .date { font-size:10pt; color:#555; font-style:italic; }
  .divider { border:none; border-top:2px solid #012642; margin:12pt 0; }
  .meta { margin-bottom:16pt; }
  .meta-row { display:flex; gap:8pt; margin-bottom:5pt; }
  .meta-label { font-weight:bold; min-width:130pt; color:#012642; }
  h3 { font-size:11pt; font-weight:bold; color:#012642; text-transform:uppercase; letter-spacing:.5px; margin:18pt 0 8pt; border-bottom:1px solid #e5e7eb; padding-bottom:4pt; }
  .content { font-size:11pt; line-height:1.8; white-space:pre-wrap; color:#333; }
  .note-area { border:1px dashed #ccc; min-height:100pt; margin-top:8pt; border-radius:4pt; }
  @media print { * { -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important; } }
</style>
<script>window.addEventListener('load',function(){setTimeout(function(){window.print();},400);});</script>
</head>
<body>
  <div class="header">
    <p class="org">Cộng đồng Cha Phanxicô Trương Bửu Diệp</p>
    <h1>Nội dung buổi phát sóng</h1>
    <p class="sub">${titleFull}</p>
    <p class="date">${dateStr}</p>
  </div>
  <hr class="divider"/>
  <div class="meta">
    <div class="meta-row"><span class="meta-label">Nền tảng:</span><span>${platformStr}</span></div>
    <div class="meta-row"><span class="meta-label">Thời gian phát sóng:</span><span>${dateStr}</span></div>
    <div class="meta-row"><span class="meta-label">Trạng thái:</span><span>${STATUS_CONFIG[session.status].label}</span></div>
  </div>
  ${session.description ? `<h3>Nội dung / Chủ đề buổi</h3><div class="content">${session.description}</div>` : ''}
  <h3>Ghi chú điều phối</h3>
  <div class="note-area"></div>
</body>
</html>`
}

// ── PlatformPicker ────────────────────────────────────────────────────────────

function PlatformPicker({ value, onChange }: { value: StreamPlatform[]; onChange: (v: StreamPlatform[]) => void }) {
  const toggle = (p: StreamPlatform) =>
    onChange(value.includes(p) ? value.filter(x => x !== p) : [...value, p])
  return (
    <div className="flex flex-wrap gap-2">
      {PLATFORM_ORDER.map(key => {
        const cfg = PLATFORM_CONFIG[key]; const on = value.includes(key)
        return (
          <button key={key} type="button" onClick={() => toggle(key)}
            className={`px-3.5 h-9 rounded-lg text-[13px] font-bold border transition-colors ${
              on ? 'bg-vatican-blue text-white border-vatican-blue'
                 : 'bg-white text-gray-600 border-gray-200 hover:border-vatican-blue hover:text-vatican-blue'
            }`}>
            {cfg.label}
          </button>
        )
      })}
    </div>
  )
}

// ── StatusToggle ──────────────────────────────────────────────────────────────

function StatusToggle<T extends string>({
  value, onChange, pendingLabel, completedLabel,
}: { value: T; onChange: (v: T) => void; pendingLabel: string; completedLabel: string }) {
  return (
    <div className="flex bg-gray-100 rounded-lg p-0.5 gap-0.5 select-none shrink-0 border border-gray-200 w-full">
      {(['pending', 'completed'] as T[]).map(s => {
        const active = value === s
        const label = s === 'pending' ? pendingLabel : completedLabel
        const bg = s === 'pending' ? 'bg-amber-100' : 'bg-emerald-100'
        const text = s === 'pending' ? 'text-amber-700' : 'text-emerald-700'
        return (
          <button key={s} type="button" onClick={() => onChange(s)}
            className={`flex-1 py-1.5 rounded-md text-[12px] font-bold transition-all ${
              active
                ? `${bg} ${text} border border-black/5`
                : 'bg-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-200/30 border border-transparent'
            }`}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}

// ── DetailViewModal ───────────────────────────────────────────────────────────

export function DetailViewModal({
  state, onClose, onChangeMode,
}: {
  state: { kind: 'view-stream'; session: LivestreamSession }
  onClose: () => void
  onChangeMode: (newMode: ModalState) => void
}) {
  const session = state.session
  const [y, mo, d] = session.scheduled_date.split('-')
  const dateStr    = `${d}/${mo}/${y} lúc ${session.scheduled_time}`
  const titleFull  = session.title + (session.episode ? ` — Tập #${session.episode}` : '')
  const status     = STATUS_CONFIG[session.status]

  const handlePrint = () => {
    const blob = new Blob([buildLivestreamPrintHTML(session)], { type: 'text/html;charset=utf-8' })
    const url  = URL.createObjectURL(blob)
    window.open(url, '_blank', 'width=900,height=860')
    setTimeout(() => URL.revokeObjectURL(url), 10_000)
  }

  return (
    <AdminModal onClose={onClose} maxWidth="max-w-[640px]">
      <ModalHeader
        title="CHI TIẾT BUỔI PHÁT SÓNG"
        subtitle="Thông tin chi tiết nội dung phát sóng truyền thông"
        onClose={onClose}
      />

      <div className="flex-1 overflow-y-auto px-6 py-6 bg-white">
        <div className="flex flex-col gap-6">
          <div>
            <h4 className="text-[18px] font-black text-vatican-dark leading-snug uppercase tracking-wide">{titleFull}</h4>
            <div className="flex items-center gap-2 mt-2 flex-wrap text-[13px] text-gray-500 font-medium">
              <span className="px-2.5 py-0.5 rounded bg-blue-50 text-vatican-blue border border-blue-200/50 font-semibold">
                Lịch phát: {dateStr}
              </span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[12px] font-bold border ${status.bg} ${status.text} ${status.border}`}>
                {status.label}
              </span>
            </div>
          </div>
          <div className="border-t border-gray-100/80" />
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400 mb-2">Nền tảng phát sóng</p>
            <div className="flex flex-wrap gap-2">
              {session.platforms.map(p => (
                <span key={p} className={`px-3 py-1 rounded-lg border bg-gray-50 border-gray-200 text-[13px] font-bold ${PLATFORM_CONFIG[p].color}`}>
                  {PLATFORM_CONFIG[p].label}
                </span>
              ))}
            </div>
          </div>
          <div className="border-t border-gray-100/80" />
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400 mb-2">Chủ đề / Nội dung chi tiết</p>
            {session.description ? (
              <div
                className="px-4 py-4 rounded-lg border border-gray-200 bg-white max-h-[300px] overflow-y-auto text-[14px] leading-relaxed text-gray-700 prose max-w-none"
                dangerouslySetInnerHTML={{ __html: session.description }}
              />
            ) : (
              <p className="text-[13px] text-gray-400 italic font-medium">Chưa có nội dung mô tả chi tiết</p>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 bg-gray-50/50 px-6 py-4 shrink-0 flex justify-end gap-2">
        <AdminButton onClick={onClose} variant="secondary">Đóng</AdminButton>
        <AdminButton onClick={handlePrint} variant="secondary">
          <Printer size={14} className="text-vatican-blue" />In nội dung
        </AdminButton>
        <AdminButton onClick={() => onChangeMode({ kind: 'edit-stream', session })}>
          <Pencil size={14} />Chỉnh sửa
        </AdminButton>
      </div>
    </AdminModal>
  )
}

// ── UnifiedAddModal ───────────────────────────────────────────────────────────

export function UnifiedAddModal({
  state, onClose, onSavedStream, onSavedTitle, groups, activeTab, activeKwId,
}: {
  state: Exclude<ModalState, null>
  onClose: () => void
  onSavedStream: (s: LivestreamSession) => void
  onSavedTitle: (result: {
    groupId: string; newGroupName?: string; newGroupVolume?: string; newGroupIntent?: string
    kwId: string; newKwText?: string; title: string
  }) => void
  groups: KeywordGroup[]
  activeTab: 'phat-song' | 'tu-khoa-seo'
  activeKwId: string
}) {
  const isEdit = state.kind === 'edit-stream'
  const [modalTab, setModalTab] = useState<'phat-song' | 'tu-khoa-seo'>(isEdit ? 'phat-song' : activeTab)

  // Stream form state
  const [title,     setTitle]     = useState(isEdit ? state.session.title : '')
  const [date,      setDate]      = useState(isEdit ? state.session.scheduled_date : new Date().toISOString().slice(0, 10))
  const [time,      setTime]      = useState(isEdit ? state.session.scheduled_time : '20:00')
  const [desc,      setDesc]      = useState(isEdit ? state.session.description : '')
  const [status,    setStatus]    = useState<EventStatus>(isEdit ? state.session.status : 'pending')
  const [platforms, setPlatforms] = useState<StreamPlatform[]>(isEdit ? state.session.platforms : ['youtube'])
  const [episode,   setEpisode]   = useState(isEdit ? state.session.episode?.toString() ?? '' : '')

  // SEO title form state
  const [selectedGroupId,  setSelectedGroupId]  = useState<string>('')
  const [newGroupName,     setNewGroupName]      = useState('')
  const [newGroupVolume,   setNewGroupVolume]    = useState('Trung bình')
  const [newGroupIntent,   setNewGroupIntent]    = useState('Tìm hiểu')
  const [selectedKwId,     setSelectedKwId]      = useState<string>('')
  const [newKwText,        setNewKwText]         = useState('')
  const [seoTitle,         setSeoTitle]          = useState('')
  const [error,            setError]             = useState<string | null>(null)

  useEffect(() => {
    if (groups.length > 0) {
      const activeGroup = groups.find(g => g.keywords.some(k => k.id === activeKwId))
      const defaultGroup = activeGroup || groups[0]
      setSelectedGroupId(defaultGroup.id)
      const activeKw = defaultGroup.keywords.find(k => k.id === activeKwId)
      const defaultKw = activeKw || defaultGroup.keywords[0]
      setSelectedKwId(defaultKw ? defaultKw.id : 'new')
    } else {
      setSelectedGroupId('new')
      setSelectedKwId('new')
    }
  }, [groups, activeKwId])

  const handleSave = () => {
    setError(null)
    if (modalTab === 'phat-song') {
      if (!title.trim())       { setError('Vui lòng nhập tên buổi phát sóng.'); return }
      if (!date)               { setError('Vui lòng chọn ngày.'); return }
      if (!platforms.length)   { setError('Vui lòng chọn ít nhất 1 nền tảng.'); return }
      onSavedStream({
        id: isEdit ? state.session.id : Date.now().toString(),
        title: title.trim(), platforms, scheduled_date: date, scheduled_time: time,
        description: desc.trim(), status, episode: episode ? Number(episode) : undefined,
      })
    } else {
      if (selectedGroupId === 'new' && !newGroupName.trim()) { setError('Vui lòng nhập tên nhóm từ khóa mới.'); return }
      if ((selectedGroupId === 'new' || selectedKwId === 'new') && !newKwText.trim()) { setError('Vui lòng nhập từ khóa mới.'); return }
      if (!seoTitle.trim()) { setError('Vui lòng nhập tiêu đề bài viết SEO.'); return }
      onSavedTitle({
        groupId: selectedGroupId,
        newGroupName:   selectedGroupId === 'new' ? newGroupName.trim()   : undefined,
        newGroupVolume: selectedGroupId === 'new' ? newGroupVolume.trim() : undefined,
        newGroupIntent: selectedGroupId === 'new' ? newGroupIntent.trim() : undefined,
        kwId:     selectedGroupId === 'new' ? 'new' : selectedKwId,
        newKwText: (selectedGroupId === 'new' || selectedKwId === 'new') ? newKwText.trim() : undefined,
        title: seoTitle.trim(),
      })
    }
  }

  return (
    <AdminModal onClose={onClose} maxWidth="max-w-[640px]">
      <ModalHeader
        title={isEdit ? 'Chỉnh sửa buổi phát sóng' : 'Thêm mới truyền thông'}
        onClose={onClose}
      />

      {!isEdit && (
        <div className="px-6 pt-5 pb-1 flex justify-center shrink-0">
          <div className="flex items-center gap-2 select-none w-full max-w-[480px]">
            {TABS.map(tab => (
              <button key={tab.key} type="button"
                onClick={() => { setModalTab(tab.key); setError(null) }}
                className={`flex-1 h-9 rounded-lg text-[14px] font-bold transition-all ${
                  modalTab === tab.key
                    ? 'bg-white text-vatican-blue border border-gray-200 font-extrabold'
                    : 'bg-gray-100 text-gray-600 border border-transparent hover:text-gray-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="overflow-y-auto px-6 py-6 flex flex-col gap-4 max-h-[62vh]">
        {/* Stream form */}
        <div className={modalTab === 'phat-song' ? 'flex flex-col gap-4' : 'hidden'}>
          <div>
            <AdminLabel>Tên buổi phát sóng <span className="text-red-400">*</span></AdminLabel>
            <AdminInput type="text" value={title} onChange={e => setTitle(e.target.value)}
              placeholder="VD: Cầu nguyện tối Chúa Nhật, Podcast tập 13..."
              />
          </div>
          <div>
            <AdminLabel>Nền tảng phát sóng <span className="text-red-400">*</span></AdminLabel>
            <PlatformPicker value={platforms} onChange={setPlatforms} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <AdminLabel>Ngày lên sóng <span className="text-red-400">*</span></AdminLabel>
              <AdminInput type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div>
              <AdminLabel>Số tập</AdminLabel>
              <AdminInput type="number" min={1} value={episode} onChange={e => setEpisode(e.target.value)}
                placeholder="Nếu có" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <AdminLabel>Giờ phát sóng</AdminLabel>
              <AdminInput type="time" value={time} onChange={e => setTime(e.target.value)} />
            </div>
            <div>
              <AdminLabel>Trạng thái</AdminLabel>
              <StatusToggle value={status} onChange={setStatus} pendingLabel="Sắp diễn ra" completedLabel="Đã hoàn tất" />
            </div>
          </div>
          <div>
            <AdminLabel>Nội dung chi tiết</AdminLabel>
            <RichTextEditor content={desc} onChange={setDesc} />
          </div>
        </div>

        {/* SEO title form */}
        <div className={modalTab === 'tu-khoa-seo' ? 'flex flex-col gap-4' : 'hidden'}>
          <div>
            <AdminLabel>Nhóm từ khóa <span className="text-red-400">*</span></AdminLabel>
            <AdminNativeSelect value={selectedGroupId}
              onChange={e => {
                setSelectedGroupId(e.target.value); setError(null)
                if (e.target.value !== 'new') {
                  const g = groups.find(x => x.id === e.target.value)
                  setSelectedKwId(g?.keywords[0]?.id || 'new')
                } else {
                  setSelectedKwId('new')
                }
              }}
            >
              {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              <option value="new" className="text-vatican-blue font-bold">+ Tạo nhóm mới...</option>
            </AdminNativeSelect>
          </div>

          {selectedGroupId === 'new' && (
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 flex flex-col gap-3">
              <p className="text-[12px] font-bold text-gray-500 uppercase tracking-wide">Thông tin nhóm mới</p>
              <div>
                <AdminLabel>Tên nhóm mới <span className="text-red-400">*</span></AdminLabel>
                <AdminInput type="text" value={newGroupName} onChange={e => setNewGroupName(e.target.value)}
                  placeholder="VD: Nhóm 5: Long-tail & Câu hỏi" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <AdminLabel>Lượng tìm kiếm</AdminLabel>
                  <AdminInput type="text" value={newGroupVolume} onChange={e => setNewGroupVolume(e.target.value)}
                    placeholder="VD: Cao, Rất Cao, Thấp..." />
                </div>
                <div>
                  <AdminLabel>Ý định tìm kiếm</AdminLabel>
                  <AdminInput type="text" value={newGroupIntent} onChange={e => setNewGroupIntent(e.target.value)}
                    placeholder="VD: Tìm hiểu, Mua hàng..." />
                </div>
              </div>
            </div>
          )}

          {selectedGroupId !== 'new' && (
            <div>
              <AdminLabel>Từ khóa <span className="text-red-400">*</span></AdminLabel>
              <AdminNativeSelect value={selectedKwId}
                onChange={e => { setSelectedKwId(e.target.value); setError(null) }}
              >
                {groups.find(g => g.id === selectedGroupId)?.keywords.map(k => (
                  <option key={k.id} value={k.id}>{k.text}</option>
                ))}
                <option value="new" className="text-vatican-blue font-bold">+ Tạo từ khóa mới...</option>
              </AdminNativeSelect>
            </div>
          )}

          {(selectedGroupId === 'new' || selectedKwId === 'new') && (
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 flex flex-col gap-3">
              <p className="text-[12px] font-bold text-gray-500 uppercase tracking-wide">Thông tin từ khóa mới</p>
              <div>
                <AdminLabel>Từ khóa mới <span className="text-red-400">*</span></AdminLabel>
                <AdminInput type="text" value={newKwText} onChange={e => setNewKwText(e.target.value)}
                  placeholder="VD: cách khấn xin cha diệp" />
              </div>
            </div>
          )}

          <div>
            <AdminLabel>Tiêu đề bài viết SEO <span className="text-red-400">*</span></AdminLabel>
            <AdminTextarea value={seoTitle} onChange={e => setSeoTitle(e.target.value)} rows={3}
              placeholder="Nhập tiêu đề bài viết SEO cần thêm..."
            />
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-1.5 text-[13px] font-semibold text-red-600">
            <AlertCircle size={13} />{error}
          </div>
        )}
      </div>

      <div className="border-t border-gray-100 bg-gray-50/50 px-6 py-4 shrink-0 flex justify-end gap-2">
        <AdminButton onClick={onClose} variant="secondary">Hủy</AdminButton>
        <AdminButton onClick={handleSave}>Lưu</AdminButton>
      </div>
    </AdminModal>
  )
}
