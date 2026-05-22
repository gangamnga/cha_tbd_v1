'use client'

import { useState, useMemo, useRef, useEffect, memo } from 'react'
import { format } from 'date-fns'
import {
  Plus, Pencil, Trash2, X, Scale,
  ChevronDown, Check, Loader2, ExternalLink, Eye, Printer,
} from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { ConfirmDeleteModal } from '@/components/admin/ConfirmDeleteModal'
import { ExportPDFButton } from '@/components/admin/ExportPDFButton'
import { AdminModal } from '@/components/admin/AdminModal'
import { AdminCheckbox, AdminButton, AdminIconButton, AdminInput, AdminLabel, ModalHeader, ModalFooter, AdminSelect, AdminBadge } from '@/components/admin/ui'
import dynamic from 'next/dynamic'
import type { BqtLegalDoc } from './constants'
import { EmptyState } from '@/components/admin/EmptyState'
import { AdminSearchInput } from '@/components/admin/AdminSearchInput'

const RichTextEditor = dynamic(() => import('@/components/admin/RichTextEditor'), {
  ssr: false,
  loading: () => (
    <div className="h-40 flex items-center justify-center border border-dashed border-gray-200 rounded-lg text-gray-400 bg-gray-50/50">
      Đang tải trình soạn thảo...
    </div>
  )
})

// -- Constants -----------------------------------------------------------------

export const LEGAL_DOC_TYPES = [
  { key: 'thanh-lap',  label: 'Thành lập & công nhận',  color: 'blue' },
  { key: 'dieu-le',    label: 'Điều lệ & quy chế',      color: 'blue' },
  { key: 'ton-giao',   label: 'Hoạt động tôn giáo',     color: 'amber' },
  { key: 'tu-thien',   label: 'Từ thiện & quyên góp',   color: 'amber' },
  { key: 'su-kien',    label: 'Tổ chức sự kiện',        color: 'green' },
  { key: 'bao-cao',    label: 'Báo cáo định kỳ',        color: 'gray' },
  { key: 'hop-dong',   label: 'Hợp đồng & thỏa thuận', color: 'amber' },
  { key: 'khac',       label: 'Khác',                   color: 'gray' },
] as const

const LEGAL_STATUSES = [
  { value: 'active',  label: 'Còn hiệu lực', color: 'green' },
  { value: 'pending', label: 'Đang chờ xét', color: 'amber' },
  { value: 'expired', label: 'Hết hiệu lực', color: 'red' },
] as const

// -- Helpers -------------------------------------------------------------------

function getDocTypeMeta(key: string) {
  return LEGAL_DOC_TYPES.find(d => d.key === key) ?? { key, label: key, color: 'gray' as const }
}

function getDisplayStatus(doc: BqtLegalDoc): { label: string; color: 'blue' | 'amber' | 'red' | 'green' | 'gray' } {
  if (doc.valid_until) {
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const days  = Math.ceil((new Date(doc.valid_until).getTime() - today.getTime()) / 86_400_000)
    if (days < 0)                              return { label: 'Hết hiệu lực', color: 'red' }
    if (days <= 30 && doc.status === 'active') return { label: 'Sắp hết hạn',  color: 'amber' }
  }
  return (LEGAL_STATUSES.find(s => s.value === doc.status) ?? LEGAL_STATUSES[0]) as any
}

function getExpiryColor(validUntil: string | null): string {
  if (!validUntil) return 'text-gray-400 italic'
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const days  = Math.ceil((new Date(validUntil).getTime() - today.getTime()) / 86_400_000)
  if (days < 0)   return 'text-red-500 font-semibold'
  if (days <= 30) return 'text-orange-500 font-semibold'
  return 'text-gray-600'
}

function fmtDate(d: string | null) {
  if (!d) return '–'
  try { return format(new Date(d), 'dd/MM/yyyy') } catch { return d }
}

function sortPriority(doc: BqtLegalDoc): number {
  const s = getDisplayStatus(doc).label
  if (s === 'Sắp hết hạn')  return 1
  if (s === 'Đang chờ xét') return 2
  if (s === 'Hết hiệu lực') return 3
  return 4
}

// -- Print ---------------------------------------------------------------------

function buildPrintHTML(doc: BqtLegalDoc): string {
  const typeMeta   = getDocTypeMeta(doc.doc_type)
  const statusMeta = getDisplayStatus(doc)

  const metaRows = [
    ['Số hiệu văn bản',  doc.doc_number  || '–'],
    ['Cơ quan ban hành', doc.issued_by    || '–'],
    ['Ngày ban hành',    fmtDate(doc.issued_date)],
    ['Hiệu lực đến',     doc.valid_until ? fmtDate(doc.valid_until) : 'Vô thời hạn'],
    ['Loại văn bản',     typeMeta.label],
    ['Trạng thái',       statusMeta.label],
  ]

  return `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="utf-8"/>
<title>${doc.title}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  @page { size:A4 portrait; margin:20mm 20mm 25mm; }
  body { font-family:Arial,Helvetica,sans-serif; font-size:11pt; color:#1a1a1a; line-height:1.6; }

  .header { text-align:center; margin-bottom:24pt; }
  .header .org { font-size:10pt; color:#555; margin-bottom:4pt; }
  .header .type { font-size:10pt; font-weight:bold; color:#012642; text-transform:uppercase; letter-spacing:1px; margin-bottom:6pt; }
  .header h1 { font-size:15pt; font-weight:bold; color:#1a1a1a; margin-bottom:4pt; line-height:1.4; }

  .divider { border:none; border-top:2px solid #012642; margin:12pt 0; }

  table.meta { width:100%; border-collapse:collapse; margin-bottom:16pt; }
  table.meta td { padding:5pt 8pt; border-bottom:1px solid #e5e7eb; font-size:10.5pt; }
  table.meta td:first-child { font-weight:bold; color:#012642; width:160pt; }

  h3 { font-size:11pt; font-weight:bold; color:#012642; text-transform:uppercase;
       letter-spacing:.5px; margin:16pt 0 8pt; border-bottom:1px solid #e5e7eb; padding-bottom:4pt; }

  .content { font-size:11pt; line-height:1.7; }
  .content p { margin-bottom:6pt; }
  .content ul { list-style:disc; padding-left:20pt; margin-bottom:6pt; }
  .content ol { list-style:decimal; padding-left:20pt; margin-bottom:6pt; }
  .content li { margin-bottom:3pt; }
  .content strong { color:#012642; }

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
    <p class="type">${typeMeta.label}</p>
    <h1>${doc.title}</h1>
  </div>
  <hr class="divider"/>

  <table class="meta">
    ${metaRows.map(([label, value]) => `<tr><td>${label}</td><td>${value}</td></tr>`).join('')}
  </table>

  ${doc.notes ? `<h3>Nội dung</h3><div class="content">${doc.notes}</div>` : ''}

  <div class="footer">
    <div class="footer-sign">
      <p class="role">Trưởng Ban Quản Trị</p>
      <p class="name">&nbsp;</p>
    </div>
  </div>
</body>
</html>`
}

// -- ModalMode -----------------------------------------------------------------

type ModalMode =
  | { type: 'add' }
  | { type: 'view'; doc: BqtLegalDoc }
  | { type: 'edit'; doc: BqtLegalDoc }

// -- LegalModal ----------------------------------------------------------------

function LegalModal({ mode, onClose, onSaved, onChangeMode }: {
  mode: ModalMode
  onClose: () => void
  onSaved: (d: BqtLegalDoc) => void
  onChangeMode: (m: ModalMode) => void
}) {
  const isView = mode.type === 'view'
  const isEdit = mode.type === 'edit'
  const doc    = mode.type !== 'add' ? mode.doc : null

  const [title,      setTitle]      = useState(doc?.title       ?? '')
  const [docType,    setDocType]    = useState(doc?.doc_type    ?? '')
  const [docNumber,  setDocNumber]  = useState(doc?.doc_number  ?? '')
  const [issuedBy,   setIssuedBy]   = useState(doc?.issued_by   ?? '')
  const [issuedDate, setIssuedDate] = useState(doc?.issued_date ?? '')
  const [validUntil, setValidUntil] = useState(doc?.valid_until ?? '')
  const [status,     setStatus]     = useState(doc?.status      ?? 'active')
  const [fileUrl,    setFileUrl]    = useState(doc?.file_url    ?? '')
  const [notes,      setNotes]      = useState(doc?.notes       ?? '')
  const [saving,     setSaving]     = useState(false)
  const [error,      setError]      = useState<string | null>(null)

  useEffect(() => {
    if (mode.type === 'edit') {
      const d = mode.doc
      setTitle(d.title ?? ''); setDocType(d.doc_type ?? '')
      setDocNumber(d.doc_number ?? ''); setIssuedBy(d.issued_by ?? '')
      setIssuedDate(d.issued_date ?? ''); setValidUntil(d.valid_until ?? '')
      setStatus(d.status ?? 'active'); setFileUrl(d.file_url ?? '')
      setNotes(d.notes ?? ''); setError(null)
    } else if (mode.type === 'add') {
      setTitle(''); setDocType(''); setDocNumber(''); setIssuedBy('')
      setIssuedDate(''); setValidUntil(''); setStatus('active')
      setFileUrl(''); setNotes(''); setError(null)
    }
  }, [mode])


  const submit = async () => {
    if (!title.trim()) { setError('Vui lòng nhập tên văn bản.'); return }
    if (!docType)      { setError('Vui lòng chọn loại văn bản.'); return }
    setSaving(true); setError(null)

    const payload = {
      title:       title.trim(),
      doc_type:    docType,
      doc_number:  docNumber.trim()  || null,
      issued_by:   issuedBy.trim()   || null,
      issued_date: issuedDate        || null,
      valid_until: validUntil        || null,
      status,
      file_url:    fileUrl.trim()    || null,
      notes:       notes.trim()      || null,
    }

    let data, err
    if (isEdit && doc) {
      const res = await createClient()
        .from('bqt_legal_docs').update(payload).eq('id', doc.id).select('*').single()
      data = res.data; err = res.error
    } else {
      const res = await createClient()
        .from('bqt_legal_docs')
        .insert([{ ...payload, created_at: new Date().toISOString() }])
        .select('*').single()
      data = res.data; err = res.error
    }

    setSaving(false)
    if (err) { setError('Lỗi: ' + err.message); return }
    onSaved(data!)
  }

  const typeOptions   = LEGAL_DOC_TYPES.map(d => ({ value: d.key, label: d.label }))
  const statusOptions = LEGAL_STATUSES.map(s => ({ value: s.value, label: s.label }))

  // -- VIEW ------------------------------------------------------------------
  if (isView && doc) {
    const typeMeta   = getDocTypeMeta(doc.doc_type)
    const statusMeta = getDisplayStatus(doc)
    const expColor   = getExpiryColor(doc.valid_until)

    const handlePrint = () => {
      const blob = new Blob([buildPrintHTML(doc)], { type: 'text/html;charset=utf-8' })
      const url  = URL.createObjectURL(blob)
      window.open(url, '_blank', 'width=900,height=860')
      setTimeout(() => URL.revokeObjectURL(url), 10_000)
    }

    return (
      <AdminModal onClose={onClose} maxWidth="max-w-[640px]">
        <ModalHeader title="Chi tiết văn bản pháp lý" subtitle="Thông tin chi tiết về trạng thái hiệu lực" onClose={onClose} />

        <div className="flex-1 overflow-y-auto px-6 py-6 bg-white">
          <div className="flex flex-col gap-6">
            <div>
              <h4 className="text-[18px] font-black text-vatican-dark leading-snug">{doc.title}</h4>
              <div className="mt-2.5 flex items-center gap-2 flex-wrap">
                <AdminBadge color={typeMeta.color}>
                  {typeMeta.label}
                </AdminBadge>
                <AdminBadge color={statusMeta.color}>
                  {statusMeta.label}
                </AdminBadge>
              </div>
            </div>

            <div className="border-t border-gray-100/80" />

            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <AdminLabel>Số hiệu</AdminLabel>
                <p className="text-[14px] text-vatican-dark font-medium">{doc.doc_number || '–'}</p>
              </div>
              <div>
                <AdminLabel>Cơ quan ban hành</AdminLabel>
                <p className="text-[14px] text-vatican-dark font-medium">{doc.issued_by || '–'}</p>
              </div>
              <div>
                <AdminLabel>Ngày ban hành</AdminLabel>
                <p className="text-[14px] text-vatican-dark font-medium">{fmtDate(doc.issued_date)}</p>
              </div>
              <div>
                <AdminLabel>Hiệu lực đến</AdminLabel>
                <p className={`text-[14px] font-medium ${expColor}`}>
                  {doc.valid_until ? fmtDate(doc.valid_until) : 'Vô thời hạn'}
                </p>
              </div>
            </div>

            {doc.notes && (
              <>
                <div className="border-t border-gray-100/80" />
                <div>
                  <AdminLabel>Nội dung</AdminLabel>
                  <div
                    className="px-4 py-4 rounded-lg border border-gray-200 bg-white max-h-[300px] overflow-y-auto text-[14px] leading-relaxed text-gray-700 [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1 [&_strong]:text-vatican-dark"
                    dangerouslySetInnerHTML={{ __html: doc.notes }}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        <div className="border-t border-gray-100 bg-gray-50/50 px-6 py-4 shrink-0 flex justify-end gap-2">
          <AdminButton variant="secondary" onClick={onClose} className="text-[14px] px-5">
            Đóng
          </AdminButton>
          {doc.file_url && (
            <a href={doc.file_url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 h-9 px-5 rounded-lg border border-gray-200 bg-white text-gray-600 text-[14px] font-bold hover:bg-gray-50 hover:border-gray-300 transition-colors">
              <ExternalLink size={14} />Xem tệp
            </a>
          )}
          <AdminButton variant="secondary" onClick={handlePrint} className="text-[14px] px-5">
            <Printer size={14} className="text-vatican-blue" />In văn bản
          </AdminButton>
          <AdminButton variant="primary" onClick={() => onChangeMode({ type: 'edit', doc })} className="text-[14px] px-5">
            <Pencil size={14} />Chỉnh sửa
          </AdminButton>
        </div>
      </AdminModal>
    )
  }

  // -- ADD / EDIT ------------------------------------------------------------
  return (
    <AdminModal onClose={onClose} maxWidth="max-w-[640px]" disabled={saving}>
      <ModalHeader title={isEdit ? 'Chỉnh sửa văn bản' : 'Thêm văn bản pháp lý'} onClose={onClose} />

      <div className="flex-1 overflow-y-auto px-6 py-6 bg-white flex flex-col gap-4 min-h-0">
        <div>
          <AdminLabel>Tên văn bản <span className="text-red-400">*</span></AdminLabel>
          <AdminInput type="text" value={title} onChange={e => setTitle(e.target.value)}
            placeholder="Ví dụ: Điều lệ hoạt động cộng đồng Cha Trương Bửu Diệp" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <AdminLabel>Số hiệu văn bản</AdminLabel>
            <AdminInput type="text" value={docNumber} onChange={e => setDocNumber(e.target.value)}
              placeholder="VD: 12/2024/QĐ-UBND" />
          </div>
          <div>
            <AdminLabel>Cơ quan ban hành</AdminLabel>
            <AdminInput type="text" value={issuedBy} onChange={e => setIssuedBy(e.target.value)}
              placeholder="VD: UBND Quận 10, TP.HCM" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <AdminLabel>Loại văn bản <span className="text-red-400">*</span></AdminLabel>
            <AdminSelect value={docType} onChange={setDocType} options={typeOptions} placeholder="Chọn loại..." />
          </div>
          <div>
            <AdminLabel>Trạng thái <span className="text-red-400">*</span></AdminLabel>
            <AdminSelect value={status} onChange={setStatus} options={statusOptions} placeholder="Chọn trạng thái..." />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <AdminLabel>Ngày ban hành</AdminLabel>
            <AdminInput type="date" value={issuedDate} onChange={e => setIssuedDate(e.target.value)} />
          </div>
          <div>
            <AdminLabel>
              Hiệu lực đến
              <span className="ml-1.5 text-[11px] normal-case tracking-normal text-gray-300 font-normal">(để trống = vô thời hạn)</span>
            </AdminLabel>
            <AdminInput type="date" value={validUntil} onChange={e => setValidUntil(e.target.value)} />
          </div>
        </div>

        <div>
          <AdminLabel>Link tệp đính kèm</AdminLabel>
          <AdminInput type="url" value={fileUrl} onChange={e => setFileUrl(e.target.value)}
            placeholder="https://drive.google.com/..." />
        </div>

        <div>
          <AdminLabel>Nội dung</AdminLabel>
          <RichTextEditor content={notes} onChange={setNotes} />
        </div>
      </div>

      <ModalFooter error={error} onCancel={onClose} submitting={saving}>
          <AdminButton variant="primary" onClick={submit} disabled={saving} className="text-[14px] px-5">
            {saving
              ? <><Loader2 size={13} className="animate-spin" />Đang lưu...</>
              : isEdit ? 'Lưu thay đổi' : 'Thêm văn bản'}
          </AdminButton>
      </ModalFooter>
    </AdminModal>
  )
}

// -- LegalRow ------------------------------------------------------------------

const LegalRow = memo(function LegalRow({ doc, isSelected, onToggle, onView, onEdit, onDelete }: {
  doc: BqtLegalDoc
  isSelected: boolean
  onToggle: () => void
  onView: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  const typeMeta  = getDocTypeMeta(doc.doc_type)
  const expColor  = getExpiryColor(doc.valid_until)
  const secondary = [doc.doc_number, doc.issued_by].filter(Boolean).join(' · ')

  return (
    <tr className={`transition-colors ${isSelected ? 'bg-vatican-blue/5' : 'hover:bg-gray-50'}`}>

      {/* Checkbox */}
      <td className="px-5 py-3.5 w-10">
        <AdminCheckbox checked={isSelected} onChange={onToggle} />
      </td>

      {/* Tên + số hiệu / cơ quan */}
      <td className="px-4 py-3.5">
        <p className="text-[14px] font-bold text-vatican-dark">{doc.title}</p>
        {secondary && (
          <p className="text-[12px] text-gray-400 mt-0.5">{secondary}</p>
        )}
      </td>

      {/* Loại */}
      <td className="px-4 py-3.5 w-[170px]">
        <AdminBadge color={typeMeta.color} className="whitespace-nowrap">
          {typeMeta.label}
        </AdminBadge>
      </td>

      {/* Ngày ban hành */}
      <td className="px-4 py-3.5 w-[130px] text-[13px] text-gray-500 tabular-nums whitespace-nowrap">
        {fmtDate(doc.issued_date)}
      </td>

      {/* Hiệu lực đến */}
      <td className={`px-4 py-3.5 w-[120px] text-[13px] tabular-nums whitespace-nowrap ${expColor}`}>
        {doc.valid_until ? fmtDate(doc.valid_until) : 'Vô thời hạn'}
      </td>

      {/* Hành động */}
      <td className="px-4 py-3.5 w-[130px]">
        <div className="flex items-center gap-0.5">
          <AdminIconButton variant="ghost" onClick={onView} title="Xem">
            <Eye size={13} />
          </AdminIconButton>
          <AdminIconButton variant="edit" onClick={onEdit} title="Sửa">
            <Pencil size={13} />
          </AdminIconButton>
          <AdminIconButton variant="danger" onClick={onDelete} title="Xóa">
            <Trash2 size={13} />
          </AdminIconButton>
          {doc.file_url && (
            <a href={doc.file_url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-8 h-8 rounded-lg transition-colors text-gray-400 hover:text-vatican-blue hover:bg-gray-100" title="Xem tệp">
              <ExternalLink size={13} />
            </a>
          )}
        </div>
      </td>

    </tr>
  )
})

// -- LegalTab ------------------------------------------------------------------

export function LegalTab({ initial }: { initial: BqtLegalDoc[] }) {
  const [docs,              setDocs]              = useState(initial)
  const [modal,             setModal]             = useState<ModalMode | null>(null)
  const [deleteTarget,      setDeleteTarget]      = useState<BqtLegalDoc | null>(null)
  const [deleting,          setDeleting]          = useState(false)
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false)
  const [bulkDeleting,      setBulkDeleting]      = useState(false)
  const [filterType,        setFilterType]        = useState<string>('all')
  const [search,            setSearch]            = useState('')
  const [searchOpen,        setSearchOpen]        = useState(false)
  const [selected,          setSelected]          = useState<Set<string>>(new Set())
  const searchRef      = useRef<HTMLInputElement>(null)

  useEffect(() => { if (searchOpen) searchRef.current?.focus() }, [searchOpen])

  const filterOptions = useMemo(() => [
    { value: 'all', label: 'Tất cả loại' },
    ...LEGAL_DOC_TYPES.map(t => ({ value: t.key, label: t.label }))
  ], [])

  const displayed = useMemo(() => {
    let list = docs
    if (filterType !== 'all') list = list.filter(d => d.doc_type === filterType)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(d =>
        d.title.toLowerCase().includes(q) ||
        (d.doc_number ?? '').toLowerCase().includes(q) ||
        (d.issued_by  ?? '').toLowerCase().includes(q)
      )
    }
    return [...list].sort((a, b) => {
      const pd = sortPriority(a) - sortPriority(b)
      if (pd !== 0) return pd
      return (b.issued_date ?? '').localeCompare(a.issued_date ?? '')
    })
  }, [docs, filterType, search])

  const selectedCount = selected.size
  const allSelected   = displayed.length > 0 && displayed.every(d => selected.has(d.id))
  const someSelected  = displayed.some(d => selected.has(d.id)) && !allSelected
  const toggleAll     = () => {
    if (allSelected || someSelected) setSelected(new Set())
    else setSelected(new Set(displayed.map(d => d.id)))
  }
  const toggleItem = (id: string) => setSelected(prev => {
    const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next
  })

  const handleSaved = (saved: BqtLegalDoc) => {
    setDocs(prev => {
      const idx = prev.findIndex(d => d.id === saved.id)
      return idx >= 0 ? prev.map(d => d.id === saved.id ? saved : d) : [saved, ...prev]
    })
    setModal(modal?.type === 'edit' ? { type: 'view', doc: saved } : null)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    await createClient().from('bqt_legal_docs').delete().eq('id', deleteTarget.id)
    setDocs(prev => prev.filter(d => d.id !== deleteTarget.id))
    setSelected(prev => { const n = new Set(prev); n.delete(deleteTarget.id); return n })
    setDeleting(false); setDeleteTarget(null)
  }

  const bulkDelete = async () => {
    setBulkDeleting(true)
    await createClient().from('bqt_legal_docs').delete().in('id', Array.from(selected))
    setDocs(prev => prev.filter(d => !selected.has(d.id)))
    setSelected(new Set()); setBulkDeleting(false); setConfirmBulkDelete(false)
  }

  const exportRows = (selectedCount > 0 ? docs.filter(d => selected.has(d.id)) : displayed).map(d => [
    d.title,
    getDocTypeMeta(d.doc_type).label,
    d.doc_number  ?? '–',
    d.issued_by   ?? '–',
    fmtDate(d.issued_date),
    d.valid_until ? fmtDate(d.valid_until) : 'Vô thời hạn',
    getDisplayStatus(d).label,
  ])

  return (
    <div className="flex flex-col">

      {/* Toolbar */}
      <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50 flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between shrink-0">
        {/* Filter — left */}
        <div className="w-full xl:w-[240px] shrink-0">
          <AdminSelect
            value={filterType}
            onChange={setFilterType}
            options={filterOptions}
            placeholder="Tất cả loại"
          />
        </div>

        <div className="flex items-center gap-2 w-full xl:w-auto justify-end shrink-0">
          {/* Search */}
          <AdminSearchInput
            open={searchOpen}
            value={search}
            onOpen={() => setSearchOpen(true)}
            onChange={v => setSearch(v)}
            onClear={() => { setSearch(''); setSearchOpen(false) }}
          />

          <div className="h-6 w-px bg-gray-200 hidden xl:block mx-1" />

          <ExportPDFButton
            title="Hành lang pháp lý — Cộng đồng Cha Phanxicô Trương Bửu Diệp"
            headers={['Tên văn bản', 'Loại', 'Số hiệu', 'Cơ quan ban hành', 'Ngày ban hành', 'Hiệu lực đến', 'Trạng thái']}
            rows={exportRows}
          />

          <div className="h-6 w-px bg-gray-200 hidden xl:block mx-1" />

          <AdminButton variant="primary" onClick={() => setModal({ type: 'add' })} className="text-[14px] px-6 shrink-0">
            <Plus size={13} />Thêm văn bản
          </AdminButton>
        </div>
      </div>

      {/* Table */}
      {displayed.length === 0 ? (
        <EmptyState
          icon={<Scale size={22} strokeWidth={1.5} className="text-gray-300" />}
          message={search.trim() ? `Không tìm thấy kết quả cho "${search}"` : 'Chưa có văn bản pháp lý nào.'}
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
                  <th colSpan={5} className="px-2 py-3 text-left">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-[14px] font-bold text-vatican-blue">Đã chọn {selectedCount}</span>
                      <button onClick={() => setConfirmBulkDelete(true)}
                        className="flex items-center gap-1.5 px-3 h-7 rounded-lg text-[13px] font-bold bg-white border border-red-200 text-red-600 hover:bg-red-50 transition-colors">
                        <Trash2 size={12} />Xóa {selectedCount}
                      </button>
                      <button onClick={() => setSelected(new Set())}
                        className="ml-auto text-[13px] text-gray-400 hover:text-gray-600 transition-colors mr-4">
                        Bỏ chọn
                      </button>
                    </div>
                  </th>
                ) : (
                  <>
                    <th className="px-4 py-3 text-left text-[13px] font-bold uppercase tracking-wider text-gray-400">Văn bản</th>
                    <th className="px-4 py-3 w-[170px] text-left text-[13px] font-bold uppercase tracking-wider text-gray-400 whitespace-nowrap">Loại</th>
                    <th className="px-4 py-3 w-[130px] text-left text-[13px] font-bold uppercase tracking-wider text-gray-400 whitespace-nowrap">Ngày ban hành</th>
                    <th className="px-4 py-3 w-[120px] text-left text-[13px] font-bold uppercase tracking-wider text-gray-400 whitespace-nowrap">Hiệu lực đến</th>
                    <th className="px-4 py-3 w-[130px]" />
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {displayed.map(doc => (
                <LegalRow key={doc.id} doc={doc}
                  isSelected={selected.has(doc.id)}
                  onToggle={() => toggleItem(doc.id)}
                  onView={() => setModal({ type: 'view', doc })}
                  onEdit={() => setModal({ type: 'edit', doc })}
                  onDelete={() => setDeleteTarget(doc)} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      {modal && (
        <LegalModal mode={modal} onClose={() => setModal(null)} onSaved={handleSaved} onChangeMode={setModal} />
      )}
      {deleteTarget && (
        <ConfirmDeleteModal title="Xóa văn bản pháp lý?" description={deleteTarget.title}
          onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleting} />
      )}
      {confirmBulkDelete && (
        <ConfirmDeleteModal
          title={`Xóa ${selectedCount} văn bản?`}
          description="Hành động này không thể hoàn tác."
          onConfirm={bulkDelete} onCancel={() => setConfirmBulkDelete(false)} loading={bulkDeleting} />
      )}

    </div>
  )
}
