'use client'

import { useState, useEffect } from 'react'
import {
  Hash, ChevronRight, CheckCircle2, Plus, Pencil, Trash2,
  X, AlertCircle, FileText,
} from 'lucide-react'
import { AdminModal } from '@/components/admin/AdminModal'
import { ConfirmDeleteModal } from '@/components/admin/ConfirmDeleteModal'
import {
  AdminButton,
  AdminIconButton,
  AdminInput,
  AdminTextarea,
  AdminLabel,
  ModalHeader
} from '@/components/admin/ui'
import { KEYWORD_CONTENT_BANK } from './keyword-data'

// ── Types ─────────────────────────────────────────────────────────────────────

export type KeywordItem = { id: string; text: string; titles: string[] }
export type KeywordGroup = { id: string; name: string; volume: string; intent: string; keywords: KeywordItem[] }

// ── Seed từ static data ───────────────────────────────────────────────────────

const SEED_CATEGORIES = [
  { name: 'Nhóm 1: Thương Hiệu & Tiểu sử',      volume: 'Rất Cao',         intent: 'Tìm hiểu chung',                   keywords: ['cha phanxicô trương bửu diệp', 'linh mục trương bửu diệp', 'cha diệp tắc sậy', 'tiểu sử cha trương bửu diệp', 'cuộc đời cha diệp', 'ngày giỗ cha diệp'] },
  { name: 'Nhóm 2: Hành hương & Du lịch',        volume: 'Cao',             intent: 'Lên kế hoạch đi (Chuyển đổi cao)', keywords: ['nhà thờ tắc sậy', 'nhà thờ cha diệp', 'trung tâm hành hương tắc sậy', 'địa chỉ nhà thờ cha diệp', 'đường đi nhà thờ tắc sậy', 'kinh nghiệm đi hành hương cha diệp', 'xe đi cha diệp', 'giờ lễ nhà thờ tắc sậy'] },
  { name: 'Nhóm 3: Tâm linh, Xin ơn & Phép lạ', volume: 'Cạnh tranh Thấp', intent: 'Tìm điểm tựa (Mỏ vàng SEO)',        keywords: ['xin ơn cha diệp', 'phép lạ cha trương bửu diệp', 'chuyện lạ cha diệp', 'lời chứng ơn lành cha diệp', 'bài ca tạ ơn cha diệp', 'kinh xin ơn cha trương bửu diệp', 'cách khấn xin cha diệp'] },
  { name: 'Nhóm 4: Cộng đồng',                   volume: 'Tiềm năng cao',   intent: 'Lan tỏa giá trị',                  keywords: ['cộng đồng cha trương bửu diệp', 'hoạt động cộng đồng cha diệp', 'nhóm cầu nguyện cha diệp', 'tin tức cha trương bửu diệp'] },
]

export function buildInitialGroups(): KeywordGroup[] {
  return SEED_CATEGORIES.map((cat, gi) => ({
    id: `g${gi}`,
    name: cat.name,
    volume: cat.volume,
    intent: cat.intent,
    keywords: cat.keywords.map((kw, ki) => ({
      id: `g${gi}k${ki}`,
      text: kw,
      titles: KEYWORD_CONTENT_BANK.find(k => k.keyword === kw)?.titles ?? [],
    })),
  }))
}

// ── Shared modal style tokens ─────────────────────────────────────────────────


// Local ModalHeader & ModalFooter removed. Standard UI components are imported instead.

// ── GroupModal ────────────────────────────────────────────────────────────────

function GroupModal({ group, onClose, onSaved }: {
  group: KeywordGroup
  onClose: () => void
  onSaved: (g: KeywordGroup) => void
}) {
  const [name,   setName]   = useState(group.name)
  const [volume, setVolume] = useState(group.volume)
  const [intent, setIntent] = useState(group.intent)
  const [error,  setError]  = useState<string | null>(null)

  const handleSave = () => {
    if (!name.trim()) { setError('Vui lòng nhập tên nhóm.'); return }
    onSaved({ ...group, name: name.trim(), volume: volume.trim(), intent: intent.trim() })
  }

  return (
    <AdminModal onClose={onClose} maxWidth="max-w-[480px]">
      <ModalHeader title="Chỉnh sửa nhóm" onClose={onClose} />
      <div className="px-6 py-5 flex flex-col gap-4">
        <div>
          <AdminLabel>Tên nhóm <span className="text-red-500">*</span></AdminLabel>
          <AdminInput type="text" value={name} onChange={e => setName(e.target.value)} placeholder="VD: Nhóm 5: Long-tail & Câu hỏi" autoFocus />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <AdminLabel>Lượng tìm kiếm</AdminLabel>
            <AdminInput type="text" value={volume} onChange={e => setVolume(e.target.value)} placeholder="Cao / Thấp / Tiềm năng..." />
          </div>
          <div>
            <AdminLabel>Ý định tìm kiếm</AdminLabel>
            <AdminInput type="text" value={intent} onChange={e => setIntent(e.target.value)} placeholder="Tìm hiểu / Chuyển đổi..." />
          </div>
        </div>
        {error && <div className="flex items-center gap-1.5 text-[13px] text-red-600 font-semibold"><AlertCircle size={13} />{error}</div>}
      </div>
      <div className="border-t border-gray-100 bg-gray-50/50 px-6 py-4 shrink-0 flex items-center justify-end gap-2">
        <AdminButton type="button" variant="secondary" onClick={onClose}>Hủy</AdminButton>
        <AdminButton type="button" variant="primary" onClick={handleSave}>Cập nhật</AdminButton>
      </div>
    </AdminModal>
  )
}

// ── KeywordModal ──────────────────────────────────────────────────────────────

function KeywordModal({ keyword, onClose, onSaved }: {
  keyword: KeywordItem | null
  onClose: () => void
  onSaved: (k: KeywordItem) => void
}) {
  const [text,  setText]  = useState(keyword?.text ?? '')
  const [error, setError] = useState<string | null>(null)

  const handleSave = () => {
    if (!text.trim()) { setError('Vui lòng nhập từ khóa.'); return }
    onSaved({ id: keyword?.id ?? Date.now().toString(), text: text.trim(), titles: keyword?.titles ?? [] })
  }

  return (
    <AdminModal onClose={onClose} maxWidth="max-w-[440px]">
      <ModalHeader title={keyword ? 'Chỉnh sửa từ khóa' : 'Thêm từ khóa mới'} onClose={onClose} />
      <div className="px-6 py-5 flex flex-col gap-4">
        <div>
          <AdminLabel>Từ khóa <span className="text-red-500">*</span></AdminLabel>
          <AdminInput type="text" value={text} onChange={e => setText(e.target.value)} placeholder="VD: hành hương tắc sậy 2025" autoFocus
            onKeyDown={e => e.key === 'Enter' && handleSave()} />
        </div>
        {error && <div className="flex items-center gap-1.5 text-[13px] text-red-600 font-semibold"><AlertCircle size={13} />{error}</div>}
      </div>
      <div className="border-t border-gray-100 bg-gray-50/50 px-6 py-4 shrink-0 flex items-center justify-end gap-2">
        <AdminButton type="button" variant="secondary" onClick={onClose}>Hủy</AdminButton>
        <AdminButton type="button" variant="primary" onClick={handleSave}>{keyword ? 'Cập nhật' : 'Thêm từ khóa'}</AdminButton>
      </div>
    </AdminModal>
  )
}

// ── TitleModal (chỉnh sửa) ────────────────────────────────────────────────────

function TitleModal({ title, onClose, onSaved }: {
  title: string
  onClose: () => void
  onSaved: (t: string) => void
}) {
  const [text, setText] = useState(title)
  const [error, setError] = useState<string | null>(null)

  const handleSave = () => {
    if (!text.trim()) { setError('Vui lòng nhập tiêu đề.'); return }
    onSaved(text.trim())
  }

  return (
    <AdminModal onClose={onClose} maxWidth="max-w-[520px]">
      <ModalHeader title="Chỉnh sửa tiêu đề" onClose={onClose} />
      <div className="px-6 py-5 flex flex-col gap-4">
        <div>
          <AdminLabel>Tiêu đề <span className="text-red-500">*</span></AdminLabel>
          <AdminTextarea value={text} onChange={e => setText(e.target.value)} rows={3}
            placeholder="Nhập tiêu đề bài viết SEO..." autoFocus />
        </div>
        {error && <div className="flex items-center gap-1.5 text-[13px] text-red-600 font-semibold"><AlertCircle size={13} />{error}</div>}
      </div>
      <div className="border-t border-gray-100 bg-gray-50/50 px-6 py-4 shrink-0 flex items-center justify-end gap-2">
        <AdminButton type="button" variant="secondary" onClick={onClose}>Hủy</AdminButton>
        <AdminButton type="button" variant="primary" onClick={handleSave}>Cập nhật</AdminButton>
      </div>
    </AdminModal>
  )
}

// ── AddTitleModal (gộp: chọn/tạo nhóm + nhập tiêu đề) ────────────────────────

export type AddTitleResult =
  | { mode: 'existing'; kwId: string; title: string }
  | { mode: 'new-group'; group: KeywordGroup }



// ── RoadmapManager ────────────────────────────────────────────────────────────

export function RoadmapManager({
  groups,
  setGroups,
  activeKwId,
  setActiveKwId,
  onAddTitle
}: {
  groups: KeywordGroup[]
  setGroups: React.Dispatch<React.SetStateAction<KeywordGroup[]>>
  activeKwId: string
  setActiveKwId: React.Dispatch<React.SetStateAction<string>>
  onAddTitle: () => void
}) {
  // Modals
  const [groupModal,     setGroupModal]     = useState<KeywordGroup | null>(null)
  const [kwModal,        setKwModal]        = useState<{ groupId: string; kw: KeywordItem | null } | null>(null)
  const [editTitleModal, setEditTitleModal] = useState<{ kwId: string; title: string; idx: number } | null>(null)

  // Confirm delete
  const [delGroup, setDelGroup] = useState<KeywordGroup | null>(null)
  const [delKw,    setDelKw]    = useState<{ groupId: string; kw: KeywordItem } | null>(null)
  const [delTitle, setDelTitle] = useState<{ kwId: string; idx: number; text: string } | null>(null)

  // Helpers
  const activeKw    = groups.flatMap(g => g.keywords).find(k => k.id === activeKwId) ?? null
  const activeGroup = groups.find(g => g.keywords.some(k => k.id === activeKwId)) ?? null
  const totalKw     = groups.reduce((s, g) => s + g.keywords.length, 0)

  // ── Group CRUD ──
  const handleGroupSaved = (g: KeywordGroup) => {
    setGroups(prev => prev.map(x => x.id === g.id ? { ...x, name: g.name, volume: g.volume, intent: g.intent } : x))
    setGroupModal(null)
  }
  const handleGroupDelete = () => {
    if (!delGroup) return
    setGroups(prev => prev.filter(g => g.id !== delGroup.id))
    if (delGroup.keywords.some(k => k.id === activeKwId))
      setActiveKwId(groups.find(g => g.id !== delGroup.id)?.keywords[0]?.id ?? '')
    setDelGroup(null)
  }

  // ── Keyword CRUD ──
  const handleKwSaved = (kw: KeywordItem) => {
    if (!kwModal) return
    setGroups(prev => prev.map(g => {
      if (g.id !== kwModal.groupId) return g
      const idx = g.keywords.findIndex(k => k.id === kw.id)
      return { ...g, keywords: idx >= 0 ? g.keywords.map(k => k.id === kw.id ? kw : k) : [...g.keywords, kw] }
    }))
    if (!kwModal.kw) setActiveKwId(kw.id)
    setKwModal(null)
  }
  const handleKwDelete = () => {
    if (!delKw) return
    setGroups(prev => prev.map(g =>
      g.id !== delKw.groupId ? g : { ...g, keywords: g.keywords.filter(k => k.id !== delKw.kw.id) }
    ))
    if (activeKwId === delKw.kw.id) {
      const g = groups.find(x => x.id === delKw.groupId)!
      const remaining = g.keywords.filter(k => k.id !== delKw.kw.id)
      setActiveKwId(remaining[0]?.id ?? groups.find(x => x.id !== delKw.groupId)?.keywords[0]?.id ?? '')
    }
    setDelKw(null)
  }


  const handleEditTitle = (text: string) => {
    if (!editTitleModal) return
    setGroups(prev => prev.map(g => ({
      ...g,
      keywords: g.keywords.map(k => {
        if (k.id !== editTitleModal.kwId) return k
        const titles = [...k.titles]
        titles[editTitleModal.idx] = text
        return { ...k, titles }
      }),
    })))
    setEditTitleModal(null)
  }
  const handleTitleDelete = () => {
    if (!delTitle) return
    setGroups(prev => prev.map(g => ({
      ...g,
      keywords: g.keywords.map(k =>
        k.id !== delTitle.kwId ? k : { ...k, titles: k.titles.filter((_, i) => i !== delTitle.idx) }
      ),
    })))
    setDelTitle(null)
  }

  // ── Shared button classes ──
  const iconBtn = 'w-8 h-8 flex items-center justify-center rounded-lg transition-colors'

  return (
    <div className="flex flex-col gap-4">

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[75vh]">

        {/* ── LEFT: Keywords ── */}
        <div className="lg:col-span-4 flex flex-col gap-3 overflow-y-auto scrollbar-hide pr-1">
          {groups.map(group => (
            <div key={group.id} className="flex flex-col">

              {/* Group header */}
              <div className="sticky top-0 bg-gray-50/95 backdrop-blur-sm z-10 pt-3 pb-2 border-b border-gray-200 mb-1.5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-[13px] font-black text-gray-800 uppercase tracking-wide leading-snug flex-1">{group.name}</h3>
                  <div className="flex items-center gap-0.5 shrink-0">
                    <AdminIconButton onClick={() => setGroupModal(group)} title="Sửa nhóm" variant="edit">
                      <Pencil size={13} />
                    </AdminIconButton>
                    <AdminIconButton onClick={() => setKwModal({ groupId: group.id, kw: null })} title="Thêm từ khóa vào nhóm" variant="ghost" className="hover:text-green-600 hover:bg-green-50">
                      <Plus size={13} />
                    </AdminIconButton>
                    <AdminIconButton onClick={() => setDelGroup(group)} title="Xóa nhóm" variant="danger">
                      <Trash2 size={13} />
                    </AdminIconButton>
                  </div>
                </div>
                <div className="flex gap-1.5 mt-1 flex-wrap">
                  {group.volume && <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md border border-red-100">{group.volume}</span>}
                  {group.intent && <span className="text-[10px] font-bold text-vatican-blue bg-vatican-blue/10 px-2 py-0.5 rounded-md">{group.intent}</span>}
                </div>
              </div>

              {/* Keywords */}
              <div className="flex flex-col gap-1">
                {group.keywords.length === 0 && (
                  <p className="text-[13px] text-gray-400 px-3 py-2 italic">Chưa có từ khóa nào</p>
                )}
                {group.keywords.map(kw => {
                  const isActive = activeKwId === kw.id
                  return (
                    <div key={kw.id}
                      className={`flex items-center gap-1 px-3 py-2.5 rounded-xl border transition-all group ${
                        isActive ? 'bg-vatican-blue border-vatican-blue' : 'bg-white border-gray-100 hover:border-vatican-blue/30 hover:bg-blue-50/50'
                      }`}>
                      <button onClick={() => setActiveKwId(kw.id)} className="flex items-center gap-2 flex-1 min-w-0 text-left">
                        <Hash size={13} className={isActive ? 'text-white/70 shrink-0' : 'text-gray-400 shrink-0'} />
                        <span className={`text-[14px] font-bold truncate ${isActive ? 'text-white' : 'text-gray-700'}`}>{kw.text}</span>
                        <span className={`text-[11px] ml-auto shrink-0 ${isActive ? 'text-white/60' : 'text-gray-400'}`}>{kw.titles.length}</span>
                        <ChevronRight size={14} className={isActive ? 'text-white/70 shrink-0' : 'text-gray-300 shrink-0'} />
                      </button>
                      <div className="flex gap-0.5 shrink-0">
                        <AdminIconButton onClick={() => setKwModal({ groupId: group.id, kw })} title="Sửa"
                          variant={isActive ? 'ghost' : 'edit'}
                          className={isActive ? 'text-white/70 hover:text-white hover:bg-white/20' : ''}>
                          <Pencil size={13} />
                        </AdminIconButton>
                        <AdminIconButton onClick={() => setDelKw({ groupId: group.id, kw })} title="Xóa"
                          variant={isActive ? 'ghost' : 'danger'}
                          className={isActive ? 'text-white/70 hover:text-white hover:bg-white/20' : ''}>
                          <Trash2 size={13} />
                        </AdminIconButton>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* ── RIGHT: Titles ── */}
        <div className="lg:col-span-8 flex flex-col bg-white border border-gray-200 rounded-2xl overflow-hidden h-full">

          {activeKw ? (
            <>
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between gap-3 shrink-0">
                <div>
                  <h3 className="text-[18px] font-black text-vatican-dark leading-snug">
                    <span className="text-vatican-blue">"{activeKw.text}"</span>
                  </h3>
                  <p className="text-[13px] text-gray-500 mt-0.5">{activeKw.titles.length} tiêu đề · Tick khi hoàn thành</p>
                </div>
              </div>

              {/* List */}
              <div className="flex flex-col overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 flex-1">
                {activeKw.titles.length === 0 ? (
                  <div className="flex flex-col items-center justify-center flex-1 gap-2 text-gray-400">
                    <FileText size={28} strokeWidth={1} />
                    <p className="text-[14px]">Chưa có tiêu đề nào</p>
                    <AdminButton
                      onClick={onAddTitle}
                      variant="secondary"
                      size="compact"
                      className="mt-1 text-[13px]"
                    >
                      <Plus size={12} />Thêm tiêu đề đầu tiên
                    </AdminButton>
                  </div>
                ) : (
                  activeKw.titles.map((title, idx) => (
                    <div key={idx}
                      className="flex items-start gap-3 px-5 py-3.5 border-b border-gray-50 hover:bg-gray-50 transition-colors group">
                      <button className="mt-0.5 shrink-0 text-gray-300 hover:text-green-500 transition-colors">
                        <CheckCircle2 size={18} strokeWidth={2} />
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className="text-[15px] font-semibold text-vatican-dark leading-snug">{title}</p>
                        <p className="text-[12px] text-gray-400 mt-0.5">Bản thảo #{idx + 1}</p>
                      </div>
                      <div className="flex gap-0.5 shrink-0 mt-0.5">
                        <AdminIconButton onClick={() => setEditTitleModal({ kwId: activeKw.id, title, idx })}
                          variant="edit" title="Sửa">
                          <Pencil size={13} />
                        </AdminIconButton>
                        <AdminIconButton onClick={() => setDelTitle({ kwId: activeKw.id, idx, text: title })}
                          variant="danger" title="Xóa">
                          <Trash2 size={13} />
                        </AdminIconButton>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 text-gray-400 gap-2">
              <Hash size={28} strokeWidth={1} />
              <p className="text-[14px]">Chọn một từ khóa để xem tiêu đề</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Modals ── */}
      {groupModal && (
        <GroupModal group={groupModal} onClose={() => setGroupModal(null)} onSaved={handleGroupSaved} />
      )}
      {kwModal && (
        <KeywordModal keyword={kwModal.kw} onClose={() => setKwModal(null)} onSaved={handleKwSaved} />
      )}
      {editTitleModal && (
        <TitleModal title={editTitleModal.title} onClose={() => setEditTitleModal(null)} onSaved={handleEditTitle} />
      )}
      {delGroup && (
        <ConfirmDeleteModal
          title={`Xóa nhóm "${delGroup.name}"?`}
          description={`Sẽ xóa ${delGroup.keywords.length} từ khóa trong nhóm này.`}
          onConfirm={handleGroupDelete} onCancel={() => setDelGroup(null)}
        />
      )}
      {delKw && (
        <ConfirmDeleteModal
          title="Xóa từ khóa?" description={delKw.kw.text}
          onConfirm={handleKwDelete} onCancel={() => setDelKw(null)}
        />
      )}
      {delTitle && (
        <ConfirmDeleteModal
          title="Xóa tiêu đề này?" description={delTitle.text}
          onConfirm={handleTitleDelete} onCancel={() => setDelTitle(null)}
        />
      )}
    </div>
  )
}
