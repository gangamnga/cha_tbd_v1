'use client'

import { useState, useEffect, memo } from 'react'
import {
  Plus, Pencil, Trash2, X, AlertCircle, CalendarDays,
  Users, CheckSquare, Square, Loader2, Printer, Eye,
} from 'lucide-react'
import { AdminSearchInput } from '@/components/admin/AdminSearchInput'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { createClient } from '@/utils/supabase/client'
import { ConfirmDeleteModal } from '@/components/admin/ConfirmDeleteModal'
import { ExportPDFButton } from '@/components/admin/ExportPDFButton'
import dynamic from 'next/dynamic'
import { AdminModal } from '@/components/admin/AdminModal'

const RichTextEditor = dynamic(() => import('@/components/admin/RichTextEditor'), {
  ssr: false,
  loading: () => (
    <div className="h-40 flex items-center justify-center border border-dashed border-gray-200 rounded-lg text-gray-400 bg-gray-50/50">
      Đang tải trình soạn thảo...
    </div>
  )
})
import {
  AdminCheckbox,
  AdminLabel,
  AdminButton,
  AdminInput,
  AdminIconButton,
  ModalHeader,
} from '@/components/admin/ui'
import { AdminTabs } from '@/components/admin/AdminTabs'
import type { BqtMeeting, MeetingTask } from './constants'
import { EmptyState } from '@/components/admin/EmptyState'

// -- Helpers -------------------------------------------------------------------

function formatDate(dateStr: string) {
  try { return format(new Date(dateStr), 'EEEE, dd/MM/yyyy', { locale: vi }) }
  catch { return dateStr }
}

// -- HTML in biên bản ----------------------------------------------------------

function buildPrintHTML(meeting: BqtMeeting): string {
  const date  = formatDate(meeting.meeting_date)
  const tasks = meeting.tasks.filter(t => t.text.trim())
  const [y, mo, d] = meeting.meeting_date.split('-')

  const roman = ['I', 'II', 'III', 'IV', 'V']
  const toR   = (n: number) => roman[n - 1] ?? String(n)
  let s = 1                                                  // I. THỜI GIAN (luôn có)
  if (meeting.attendees) s++                                 // II. THÀNH PHẦN (nếu có)
  const contentNum = meeting.content    ? toR(++s) : null
  const tasksNum   = tasks.length > 0   ? toR(++s) : null

  const tasksHTML = !tasksNum ? '' : `
    <h3>${tasksNum}. CÔNG VIỆC ĐƯỢC GIAO</h3>
    <table class="tasks">
      <thead><tr><th style="width:40px">STT</th><th>Nội dung</th><th style="width:160px">Phụ trách</th><th style="width:80px">Trạng thái</th></tr></thead>
      <tbody>
        ${tasks.map((t, i) => `
          <tr>
            <td>${i + 1}</td>
            <td>${t.text}</td>
            <td>${t.assignee || '–'}</td>
            <td style="text-align:center">${t.done ? '✓' : ''}</td>
          </tr>`).join('')}
      </tbody>
    </table>`

  return `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="utf-8"/>
<title>Biên bản họp — ${d}/${mo}/${y}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  @page { size:A4 portrait; margin:20mm 20mm 25mm; }
  body { font-family:Arial,Helvetica,sans-serif; font-size:11pt; color:#1a1a1a; line-height:1.6; }

  .header { text-align:center; margin-bottom:24pt; }
  .header .org { font-size:10pt; color:#555; margin-bottom:4pt; }
  .header h1 { font-size:16pt; font-weight:bold; color:#012642; letter-spacing:1px; text-transform:uppercase; margin-bottom:4pt; }
  .header .date { font-size:10pt; color:#555; font-style:italic; }

  .divider { border:none; border-top:2px solid #012642; margin:12pt 0; }

  .meta { margin-bottom:16pt; }
  .meta-row { display:flex; gap:8pt; margin-bottom:4pt; }
  .meta-label { font-weight:bold; min-width:120pt; color:#012642; }
  .meta-value { flex:1; }

  h3 { font-size:11pt; font-weight:bold; color:#012642; text-transform:uppercase;
       letter-spacing:.5px; margin:16pt 0 8pt; border-bottom:1px solid #e5e7eb; padding-bottom:4pt; }

  .content { font-size:11pt; line-height:1.7; }
  .content p { margin-bottom:6pt; }
  .content ul, .content ol { padding-left:20pt; margin-bottom:6pt; }
  .content li { margin-bottom:3pt; }
  .content strong { color:#012642; }

  table.tasks { width:100%; border-collapse:collapse; font-size:10pt; }
  table.tasks th { background:#012642; color:#fff; padding:6pt 8pt; text-align:left; font-size:9pt; }
  table.tasks td { padding:5pt 8pt; border-bottom:1px solid #e5e7eb; vertical-align:top; }
  table.tasks tr:nth-child(even) td { background:#f8f9fb; }

  .footer { margin-top:32pt; display:flex; justify-content:flex-end; text-align:center; }
  .footer-sign { min-width:160pt; }
  .footer-sign .role { font-weight:bold; font-size:10pt; margin-bottom:48pt; }
  .footer-sign .name { font-weight:bold; font-size:11pt; border-top:1px solid #999; padding-top:4pt; }

  @media print {
    * { -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important; }
  }
</style>
<script>window.addEventListener('load',function(){setTimeout(function(){window.print();},400);});</script>
</head>
<body>
  <div class="header">
    <p class="org">Cộng đồng Cha Phanxicô Trương Bửu Diệp</p>
    <h1>Biên bản họp Ban Quản Trị</h1>
    <p class="date">${date}</p>
  </div>
  <hr class="divider"/>

  <div class="meta">
    <div class="meta-row">
      <span class="meta-label">I. THỜI GIAN:</span>
      <span class="meta-value">${date}</span>
    </div>
    ${meeting.attendees ? `
    <div class="meta-row">
      <span class="meta-label">II. THÀNH PHẦN:</span>
      <span class="meta-value">${meeting.attendees}</span>
    </div>` : ''}
  </div>

  ${contentNum ? `<h3>${contentNum}. NỘI DUNG CUỘC HỌP</h3><div class="content">${meeting.content}</div>` : ''}

  ${tasksHTML}

  <div class="footer">
    <div class="footer-sign">
      <p class="role">Thư ký / Người lập biên bản</p>
      <p class="name">&nbsp;</p>
    </div>
  </div>
</body>
</html>`
}

// -- MeetingModal (tạo / sửa) --------------------------------------------------

type ModalMode =
  | { type: 'add' }
  | { type: 'view'; meeting: BqtMeeting }
  | { type: 'edit'; meeting: BqtMeeting }

function MeetingModal({ mode, onClose, onSaved, onChangeMode }: {
  mode: ModalMode
  onClose: () => void
  onSaved: (m: BqtMeeting) => void
  onChangeMode: (newMode: ModalMode) => void
}) {
  const isEdit = mode.type === 'edit'
  const m = mode.type === 'edit' || mode.type === 'view' ? mode.meeting : null

  const [title,     setTitle]     = useState(m?.title ?? '')
  const [date,      setDate]      = useState(m?.meeting_date ?? new Date().toISOString().slice(0, 10))
  const [attendees, setAttendees] = useState(m?.attendees   ?? '')
  const [content,   setContent]   = useState(m?.content     ?? '')
  const [tasks,     setTasks]     = useState<MeetingTask[]>(m?.tasks ?? [])
  const [saving,    setSaving]    = useState(false)
  const [error,     setError]     = useState<string | null>(null)

  useEffect(() => {
    if (mode.type === 'edit' && mode.meeting) {
      const currentMeeting = mode.meeting
      setTitle(currentMeeting.title ?? '')
      setDate(currentMeeting.meeting_date ?? new Date().toISOString().slice(0, 10))
      setAttendees(currentMeeting.attendees ?? '')
      setContent(currentMeeting.content ?? '')
      setTasks(currentMeeting.tasks ?? [])
    } else if (mode.type === 'add') {
      setTitle('')
      setDate(new Date().toISOString().slice(0, 10))
      setAttendees('')
      setContent('')
      setTasks([])
    }
  }, [mode])

  const addTask    = () => setTasks(prev => [...prev, { text: '', assignee: '', done: false }])
  const removeTask = (i: number) => setTasks(prev => prev.filter((_, idx) => idx !== i))
  const updateTask = (i: number, patch: Partial<MeetingTask>) =>
    setTasks(prev => prev.map((t, idx) => idx === i ? { ...t, ...patch } : t))

  const submit = async () => {
    if (!title.trim()) { setError('Vui lòng nhập tiêu đề cuộc họp.'); return }
    if (!date) { setError('Vui lòng chọn ngày họp.'); return }
    setSaving(true); setError(null)

    const payload = {
      title:        title.trim(),
      meeting_date: date,
      attendees:    attendees.trim() || null,
      content:      content          || null,
      tasks:        tasks.filter(t => t.text.trim()),
      updated_at:   new Date().toISOString(),
    }

    let data: BqtMeeting | null = null
    let err: { message: string } | null = null

    if (isEdit && m) {
      const res = await createClient().from('bqt_meetings').update(payload).eq('id', m.id).select('*').single()
      data = res.data; err = res.error
    } else {
      const res = await createClient().from('bqt_meetings').insert([{ ...payload, created_at: new Date().toISOString() }]).select('*').single()
      data = res.data; err = res.error
    }

    setSaving(false)
    if (err) { setError('Lỗi: ' + err.message); return }
    onSaved(data!)
  }


  if (mode.type === 'view') {
    const meeting = mode.meeting
    const dateStr = formatDate(meeting.meeting_date)
    const activeTasks = meeting.tasks.filter(t => t.text.trim())

    const handlePrint = () => {
      const blob = new Blob([buildPrintHTML(meeting)], { type: 'text/html;charset=utf-8' })
      const url  = URL.createObjectURL(blob)
      window.open(url, '_blank', 'width=900,height=860')
      setTimeout(() => URL.revokeObjectURL(url), 10_000)
    }

    return (
      <AdminModal onClose={onClose} maxWidth="max-w-[640px]">
        <ModalHeader
          title="CHI TIẾT BIÊN BẢN CUỘC HỌP"
          subtitle="Thông tin chi tiết về nội dung biên bản cuộc họp"
          onClose={onClose}
        />

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 bg-white">
          <div className="flex flex-col gap-6">
            {/* Title & Date */}
            <div>
              <h4 className="text-[18px] font-black text-vatican-dark leading-snug uppercase tracking-wide">
                {meeting.title || `Biên bản họp ngày ${formatDate(meeting.meeting_date)}`}
              </h4>
              <div className="flex items-center gap-2 mt-2 flex-wrap text-[13px] text-gray-500 font-medium">
                <span className="px-2.5 py-0.5 rounded bg-blue-50 text-vatican-blue border border-blue-200/50 uppercase tracking-wider font-semibold">
                  Ngày họp: {dateStr}
                </span>
              </div>
            </div>

            <div className="border-t border-gray-100/80" />

            {/* Attendees */}
            <div>
              <p className="text-[13px] font-bold uppercase tracking-wider text-gray-400 mb-2">Thành phần tham dự</p>
              {meeting.attendees ? (
                <div className="flex items-start gap-2.5 px-4 py-3 rounded-lg border border-gray-200 bg-gray-50/20">
                  <Users size={16} className="text-gray-400 shrink-0 mt-0.5" />
                  <p className="text-[14px] text-gray-700 leading-relaxed font-semibold">{meeting.attendees}</p>
                </div>
              ) : (
                <p className="text-[13px] text-gray-400 italic font-medium">Chưa cập nhật thành phần tham dự</p>
              )}
            </div>

            <div className="border-t border-gray-100/80" />

            {/* Content */}
            <div>
              <p className="text-[13px] font-bold uppercase tracking-wider text-gray-400 mb-2">Nội dung cuộc họp</p>
              {meeting.content ? (
                <div
                  className="px-4 py-4 rounded-lg border border-gray-200 bg-white max-h-[300px] overflow-y-auto text-[14px] leading-relaxed text-gray-700 [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1 [&_strong]:text-vatican-dark"
                  dangerouslySetInnerHTML={{ __html: meeting.content }}
                />
              ) : (
                <p className="text-[13px] text-gray-400 italic font-medium">Chưa có nội dung cuộc họp</p>
              )}
            </div>

            {activeTasks.length > 0 && (
              <>
                <div className="border-t border-gray-100/80" />
                {/* Tasks */}
                <div>
                  <p className="text-[13px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                    Công việc được giao ({activeTasks.filter(t => t.done).length}/{activeTasks.length} hoàn thành)
                  </p>
                  <div className="flex flex-col gap-2">
                    {activeTasks.map((t, i) => (
                      <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-200 bg-white">
                        <div className={`shrink-0 transition-colors ${t.done ? 'text-green-500' : 'text-gray-300'}`}>
                          {t.done ? <CheckSquare size={17} /> : <Square size={17} />}
                        </div>
                        <p className={`flex-1 text-[14px] ${t.done ? 'text-gray-400 line-through' : 'text-gray-700 font-medium'}`}>
                          {t.text}
                        </p>
                        {t.assignee && (
                          <span className="shrink-0 px-2 py-0.5 rounded text-[12px] font-bold bg-gray-100 text-gray-600 border border-gray-200/50">
                            {t.assignee}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 bg-gray-50/50 px-6 py-4 shrink-0 flex justify-end gap-2">
          <AdminButton onClick={onClose} variant="secondary" className="text-[14px]">
            Đóng
          </AdminButton>
          <AdminButton
            onClick={handlePrint}
            variant="secondary"
            className="text-[14px]"
          >
            <Printer size={14} className="text-vatican-blue" />
            In biên bản
          </AdminButton>
          <AdminButton
            onClick={() => onChangeMode({ type: 'edit', meeting })}
            className="text-[14px]"
          >
            <Pencil size={14} />
            Chỉnh sửa
          </AdminButton>
        </div>
      </AdminModal>
    )
  }

  return (
    <AdminModal onClose={onClose} maxWidth="max-w-[640px]" disabled={saving}>
      <ModalHeader
        title={isEdit ? 'Chỉnh sửa biên bản họp' : 'Tạo biên bản họp mới'}
        onClose={onClose}
      />

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-6 py-6 bg-white flex flex-col gap-4 min-h-0">
        <div>
          <AdminLabel>Tiêu đề cuộc họp <span className="text-red-400">*</span></AdminLabel>
          <AdminInput
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Ví dụ: Họp chuẩn bị đại lễ giỗ Cha Phanxicô 12/3..."
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <AdminLabel>Ngày họp <span className="text-red-400">*</span></AdminLabel>
            <AdminInput type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div>
            <AdminLabel>Thành phần tham dự</AdminLabel>
            <AdminInput type="text" value={attendees} onChange={e => setAttendees(e.target.value)}
              placeholder="Nguyễn A, Trần B, Lê C..." />
          </div>
        </div>

        <div>
          <AdminLabel>Nội dung cuộc họp</AdminLabel>
          <RichTextEditor content={content} onChange={setContent} />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <AdminLabel className="!mb-0">Công việc được giao ({tasks.length})</AdminLabel>
            <button type="button" onClick={addTask}
              className="flex items-center gap-1.5 text-[13px] font-bold text-vatican-blue hover:text-vatican-blue-dark transition-colors py-1">
              <Plus size={12} />Thêm công việc
            </button>
          </div>
          <div className="flex flex-col gap-2">
            {tasks.map((task, i) => (
              <div key={i} className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-lg border border-gray-200">
                <button type="button" onClick={() => updateTask(i, { done: !task.done })}
                  className={`shrink-0 transition-colors ${task.done ? 'text-green-500' : 'text-gray-300 hover:text-gray-400'}`}>
                  {task.done ? <CheckSquare size={16} /> : <Square size={16} />}
                </button>
                <input type="text" value={task.text} onChange={e => updateTask(i, { text: e.target.value })}
                  placeholder="Mô tả công việc..."
                  className="flex-1 text-[14px] bg-transparent outline-none text-vatican-dark placeholder:text-gray-400" />
                <input type="text" value={task.assignee} onChange={e => updateTask(i, { assignee: e.target.value })}
                  placeholder="Người phụ trách"
                  className="w-36 text-[14px] bg-transparent outline-none text-gray-500 placeholder:text-gray-400 border-l border-gray-200 pl-2" />
                <button type="button" onClick={() => removeTask(i)}
                  className="text-gray-300 hover:text-red-400 transition-colors shrink-0">
                  <X size={13} />
                </button>
              </div>
            ))}
            {tasks.length === 0 && (
              <p className="text-[13px] text-gray-400 px-1">Chưa có công việc nào được giao</p>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 bg-gray-50/50 px-6 py-4 shrink-0 flex items-center gap-3">
        {error && (
          <div className="flex items-center gap-1.5 text-[13px] font-semibold text-red-600 flex-1 min-w-0">
            <AlertCircle size={12} className="shrink-0" /><span className="truncate">{error}</span>
          </div>
        )}
        <div className="flex gap-2 ml-auto shrink-0">
          <AdminButton onClick={onClose} disabled={saving} variant="secondary" className="text-[14px]">
            Hủy
          </AdminButton>
          <AdminButton onClick={submit} disabled={saving} className="text-[14px]">
            {saving ? <><Loader2 size={13} className="animate-spin" />Đang lưu...</> : isEdit ? 'Cập nhật' : 'Tạo biên bản'}
          </AdminButton>
        </div>
      </div>
    </AdminModal>
  )
}


// -- MeetingRow ----------------------------------------------------------------

const MeetingRow = memo(function MeetingRow({ meeting, isSelected, onToggle, onView, onEdit, onDelete }: {
  meeting: BqtMeeting
  isSelected: boolean
  onToggle: () => void
  onView: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  const doneTasks  = meeting.tasks.filter(t => t.done).length
  const totalTasks = meeting.tasks.length
  const pct        = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : null
  const dateStr    = formatDate(meeting.meeting_date)

  return (
    <tr className={`transition-colors ${isSelected ? 'bg-vatican-blue/5' : 'hover:bg-gray-50'}`}>
      {/* Checkbox */}
      <td className="px-5 py-3.5 w-10">
        <AdminCheckbox checked={isSelected} onChange={onToggle} />
      </td>

      {/* Tiêu đề cuộc họp & Thành phần tham dự */}
      <td className="px-4 py-3.5">
        <div className="min-w-0 flex flex-col">
          <span className="text-[15px] font-bold text-vatican-dark leading-snug">
            {meeting.title || `Biên bản họp ngày ${dateStr}`}
          </span>
          {meeting.attendees ? (
            <span className="text-[13px] text-gray-500 font-medium truncate max-w-[400px] mt-0.5" title={meeting.attendees}>
              Thành phần: {meeting.attendees}
            </span>
          ) : (
            <span className="text-[13px] text-gray-500 font-medium italic mt-0.5">Chưa cập nhật thành phần tham dự</span>
          )}
        </div>
      </td>

      {/* Ngày họp */}
      <td className="px-4 py-3.5">
        <span className="text-[14px] font-bold text-gray-700 whitespace-nowrap bg-gray-50 border border-gray-200/50 rounded-lg px-2.5 py-1 inline-flex items-center gap-1.5">
          {dateStr}
        </span>
      </td>

      {/* Tiến độ công việc */}
      <td className="px-4 py-3.5 hidden sm:table-cell w-36">
        {totalTasks > 0 ? (
          <div className="flex flex-col gap-1 w-32">
            <div className="flex items-center justify-between text-[13px] font-medium text-gray-500">
              <span>{doneTasks}/{totalTasks} hoàn thành</span>
              <span className={pct === 100 ? 'text-green-600 font-bold' : 'text-vatican-blue font-bold'}>{pct}%</span>
            </div>
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden w-full">
              <div className={`h-full rounded-full transition-all ${pct === 100 ? 'bg-green-500' : 'bg-vatican-blue'}`}
                style={{ width: `${pct}%` }} />
            </div>
          </div>
        ) : (
          <span className="text-[13px] text-gray-500 italic">Không có</span>
        )}
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

// -- MeetingsTab ---------------------------------------------------------------

export function MeetingsTab({ initial }: { initial: BqtMeeting[] }) {
  const [meetings,     setMeetings]     = useState(initial)
  const [modal,        setModal]        = useState<ModalMode | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<BqtMeeting | null>(null)
  const [deleting,     setDeleting]     = useState(false)
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false)
  const [bulkDeleting,      setBulkDeleting]      = useState(false)
  const [searchQuery,  setSearchQuery]  = useState('')
  const [searchOpen,   setSearchOpen]   = useState(false)
  const [filterMode,   setFilterMode]   = useState<'all' | 'done' | 'pending'>('all')

  // Selection
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const selectedCount = selected.size
  const toggleItem = (id: string) => setSelected(prev => {
    const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next
  })

  const handleSaved = (saved: BqtMeeting) => {
    setMeetings(prev => {
      const idx = prev.findIndex(m => m.id === saved.id)
      return idx >= 0
        ? prev.map(m => m.id === saved.id ? saved : m)
        : [saved, ...prev].sort((a, b) => {
            const dateCompare = b.meeting_date.localeCompare(a.meeting_date)
            if (dateCompare !== 0) return dateCompare
            return (b.created_at ?? '').localeCompare(a.created_at ?? '')
          })
    })
    if (modal?.type === 'edit') {
      setModal({ type: 'view', meeting: saved })
    } else {
      setModal(null)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    await createClient().from('bqt_meetings').delete().eq('id', deleteTarget.id)
    setMeetings(prev => prev.filter(m => m.id !== deleteTarget.id))
    setSelected(prev => { const n = new Set(prev); n.delete(deleteTarget.id); return n })
    setDeleting(false); setDeleteTarget(null)
  }

  const displayMeetings = meetings
    .filter(m => {
      const matchSearch = !searchQuery ||
        m.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.attendees?.toLowerCase().includes(searchQuery.toLowerCase())
      if (!matchSearch) return false

      const totalTasks = m.tasks.length
      const doneTasks = m.tasks.filter(t => t.done).length
      const isDone = totalTasks === 0 || (totalTasks > 0 && doneTasks === totalTasks)

      if (filterMode === 'done') return isDone
      if (filterMode === 'pending') return !isDone
      return true
    })
    .sort((a, b) => {
      const dateCompare = b.meeting_date.localeCompare(a.meeting_date)
      if (dateCompare !== 0) return dateCompare
      return (b.created_at ?? '').localeCompare(a.created_at ?? '')
    })

  const allSelected  = displayMeetings.length > 0 && displayMeetings.every(m => selected.has(m.id))
  const someSelected = displayMeetings.some(m => selected.has(m.id)) && !allSelected
  const toggleAll  = () => {
    if (allSelected || someSelected) setSelected(new Set())
    else setSelected(new Set(displayMeetings.map(m => m.id)))
  }

  const bulkDelete = async () => {
    setBulkDeleting(true)
    await createClient().from('bqt_meetings').delete().in('id', Array.from(selected))
    setMeetings(prev => prev.filter(m => !selected.has(m.id)))
    setSelected(new Set())
    setBulkDeleting(false)
    setConfirmBulkDelete(false)
  }

  const toExportRow = (m: BqtMeeting): string[] => {
    const [y, mo, d] = m.meeting_date.split('-')
    const done = m.tasks.filter(t => t.done).length
    return [
      m.title || `Biên bản họp ngày ${d}/${mo}/${y}`,
      `${d}/${mo}/${y}`,
      m.attendees ?? '',
      m.tasks.length > 0 ? `${done}/${m.tasks.length}` : '–'
    ]
  }

  const pdfRows = selectedCount > 0
    ? meetings.filter(m => selected.has(m.id)).map(toExportRow)
    : displayMeetings.map(toExportRow)

  return (
    <div className="flex flex-col">

      {/* Toolbar */}
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between shrink-0">

        <AdminTabs
          tabs={[
            { id: 'all'     as const, label: 'Tất cả',    count: meetings.length },
            { id: 'done'    as const, label: 'Đã xong',   count: meetings.filter(m => m.tasks.length === 0 || m.tasks.every(t => t.done)).length },
            { id: 'pending' as const, label: 'Chưa xong', count: meetings.filter(m => m.tasks.length > 0 && m.tasks.some(t => !t.done)).length },
          ]}
          activeTab={filterMode}
          onChange={setFilterMode}
          className="w-full xl:w-auto pb-2 xl:pb-0"
        />

        <div className="flex items-center gap-2 w-full xl:w-auto justify-end shrink-0">
          <AdminSearchInput
            open={searchOpen}
            value={searchQuery}
            onOpen={() => setSearchOpen(true)}
            onChange={v => setSearchQuery(v)}
            onClear={() => { setSearchQuery(''); setSearchOpen(false) }}
          />

          <div className="h-6 w-px bg-gray-200 hidden xl:block mx-1" />

          <ExportPDFButton
            title="Biên bản họp Ban Quản Trị"
            headers={['Tiêu đề cuộc họp', 'Ngày họp', 'Thành phần tham dự', 'Công việc hoàn thành']}
            rows={pdfRows}
          />

          <div className="h-6 w-px bg-gray-200 hidden xl:block mx-1" />

          <AdminButton onClick={() => setModal({ type: 'add' })} className="px-6 shrink-0 text-[14px]">
            <Plus size={13} />Tạo biên bản
          </AdminButton>
        </div>
      </div>

      {/* Table */}
      {displayMeetings.length === 0 ? (
        <EmptyState
          icon={<CalendarDays size={22} strokeWidth={1.5} className="text-gray-300" />}
          message={searchQuery ? `Không tìm thấy kết quả cho "${searchQuery}"` : 'Chưa có biên bản họp nào.'}
        />
      ) : (
        <div className="max-h-[calc(100vh-280px)] overflow-y-auto overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead className="sticky top-0 z-10">
              <tr className={`border-b transition-colors ${selectedCount > 0 ? 'bg-vatican-blue/5 border-vatican-blue/10' : 'bg-gray-50 border-gray-100'}`}>
                <th className="px-5 py-3 w-10">
                  <AdminCheckbox checked={allSelected} indeterminate={someSelected} onChange={toggleAll} />
                </th>

                {selectedCount > 0 ? (
                  <th colSpan={4} className="px-2 py-3 text-left">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-[14px] font-bold text-vatican-blue">Đã chọn {selectedCount}</span>
                      <AdminButton size="compact" variant="danger" onClick={() => setConfirmBulkDelete(true)}>
                        <Trash2 size={12} />Xóa {selectedCount}
                      </AdminButton>
                      <button onClick={() => setSelected(new Set())}
                        className="ml-auto text-[13px] text-gray-400 hover:text-gray-600 transition-colors mr-4">
                        Bỏ chọn
                      </button>
                    </div>
                  </th>
                ) : (
                  <>
                    <th className="px-4 py-3 text-left text-[13px] font-bold uppercase tracking-wider text-gray-400">Tiêu đề / Thành phần</th>
                    <th className="px-4 py-3 text-left text-[13px] font-bold uppercase tracking-wider text-gray-400">Ngày họp</th>
                    <th className="px-4 py-3 text-left text-[13px] font-bold uppercase tracking-wider text-gray-400 hidden sm:table-cell">Công việc</th>
                    <th className="px-4 py-3 w-28" />
                  </>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {displayMeetings.map(meeting => (
                <MeetingRow
                  key={meeting.id}
                  meeting={meeting}
                  isSelected={selected.has(meeting.id)}
                  onToggle={() => toggleItem(meeting.id)}
                  onView={() => setModal({ type: 'view', meeting })}
                  onEdit={() => setModal({ type: 'edit', meeting })}
                  onDelete={() => setDeleteTarget(meeting)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <MeetingModal
          mode={modal}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
          onChangeMode={setModal}
        />
      )}

      {deleteTarget && (
        <ConfirmDeleteModal
          title="Xóa biên bản họp?"
          description={deleteTarget.title || `Họp ngày ${formatDate(deleteTarget.meeting_date)}`}
          onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleting}
        />
      )}

      {confirmBulkDelete && (
        <ConfirmDeleteModal
          title={`Xóa ${selectedCount} biên bản họp?`}
          description="Hành động này không thể hoàn tác."
          onConfirm={bulkDelete}
          onCancel={() => setConfirmBulkDelete(false)}
          loading={bulkDeleting}
        />
      )}
    </div>
  )
}
