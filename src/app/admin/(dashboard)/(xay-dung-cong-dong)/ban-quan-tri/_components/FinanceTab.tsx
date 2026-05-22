'use client'

import { useState, useMemo, memo } from 'react'
import {
  Plus, Pencil, Trash2, AlertCircle, TrendingUp,
  TrendingDown, Wallet, Loader2,
} from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { ConfirmDeleteModal } from '@/components/admin/ConfirmDeleteModal'
import { ExportPDFButton } from '@/components/admin/ExportPDFButton'
import { AdminModal } from '@/components/admin/AdminModal'
import { AdminSearchInput } from '@/components/admin/AdminSearchInput'
import {
  AdminLabel,
  AdminButton,
  AdminInput,
  AdminTextarea,
  AdminIconButton,
  AdminSelect,
  ModalHeader,
} from '@/components/admin/ui'
import type { BqtFinance } from './constants'
import { EmptyState } from '@/components/admin/EmptyState'

// ── Constants ─────────────────────────────────────────────────────────────────

const formatVND = (n: number) => new Intl.NumberFormat('vi-VN').format(n) + ' ₫'

// ── FinanceModal ──────────────────────────────────────────────────────────────

function FinanceModal({ entry, onClose, onSaved }: {
  entry: BqtFinance | null
  onClose: () => void
  onSaved: (e: BqtFinance) => void
}) {
  const isEdit = !!entry

  const [type,        setType]        = useState<'thu' | 'chi'>(entry?.type ?? 'thu')
  const [date,        setDate]        = useState(entry?.entry_date ?? new Date().toISOString().slice(0, 10))
  const [amount,      setAmount]      = useState(
    entry ? new Intl.NumberFormat('vi-VN').format(entry.amount) : ''
  )
  const [description, setDescription] = useState(entry?.description ?? '')
  const [saving,      setSaving]      = useState(false)
  const [error,       setError]       = useState<string | null>(null)

  const amountNum = parseFloat(amount.replace(/\./g, '').replace(/,/g, '.')) || 0

  const submit = async () => {
    if (!date)         { setError('Vui lòng chọn ngày.'); return }
    if (amountNum <= 0) { setError('Vui lòng nhập số tiền hợp lệ.'); return }
    setSaving(true)
    setError(null)

    const payload = {
      type,
      entry_date:   date,
      amount:       amountNum,
      category:     '',
      description:  description.trim() || null,
      partner_name: null,
    }

    let data: BqtFinance | null = null
    let err: { message: string } | null = null

    if (isEdit && entry) {
      const res = await createClient()
        .from('bqt_finances').update(payload).eq('id', entry.id)
        .select('*').single()
      data = res.data; err = res.error
    } else {
      const res = await createClient()
        .from('bqt_finances')
        .insert([{ ...payload, created_at: new Date().toISOString() }])
        .select('*').single()
      data = res.data; err = res.error
    }

    setSaving(false)
    if (err) { setError('Lỗi: ' + err.message); return }
    onSaved(data!)
  }


  return (
    <AdminModal onClose={onClose} maxWidth="max-w-[640px]" disabled={saving}>

        <ModalHeader
          title={isEdit ? 'Chỉnh sửa khoản tài chính' : 'Thêm khoản tài chính'}
          onClose={onClose}
        />

        {/* Phân loại dạng Tab phẳng */}
        <div className="px-6 pt-5 shrink-0 bg-white">
          <div className={`flex items-center gap-2 select-none w-full ${isEdit ? 'opacity-50 pointer-events-none' : ''}`}>
            <button type="button" onClick={() => setType('thu')}
              className={`flex-1 h-9 rounded-lg text-[14px] font-bold transition-all whitespace-nowrap flex items-center justify-center gap-1.5 ${
                type === 'thu'
                  ? 'bg-white text-vatican-blue border border-gray-200 font-extrabold'
                  : 'bg-gray-100 text-gray-500 hover:text-gray-700'
              }`}>
              <TrendingUp size={14} />
              Thu
            </button>
            <button type="button" onClick={() => setType('chi')}
              className={`flex-1 h-9 rounded-lg text-[14px] font-bold transition-all whitespace-nowrap flex items-center justify-center gap-1.5 ${
                type === 'chi'
                  ? 'bg-white text-vatican-blue border border-gray-200 font-extrabold'
                  : 'bg-gray-100 text-gray-500 hover:text-gray-700'
              }`}>
              <TrendingDown size={14} />
              Chi
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 bg-white flex flex-col gap-4 min-h-0">

          <div className="grid grid-cols-2 gap-3">
            <div>
              <AdminLabel>Ngày <span className="text-red-400">*</span></AdminLabel>
              <AdminInput type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div>
              <AdminLabel>Số tiền (VND) <span className="text-red-400">*</span></AdminLabel>
              <AdminInput
                type="text"
                value={amount}
                onChange={e => {
                  const raw = e.target.value.replace(/\D/g, '')
                  setAmount(raw ? new Intl.NumberFormat('vi-VN').format(parseInt(raw)) : '')
                }}
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <AdminLabel>Diễn giải</AdminLabel>
            <AdminTextarea value={description} onChange={e => setDescription(e.target.value)} rows={2}
              placeholder="Ghi chú chi tiết..." />
          </div>
        </div>

        <div className="border-t border-gray-100 bg-gray-50/50 px-6 py-4 shrink-0 flex items-center gap-3">
          {error && (
            <div className="flex items-center gap-1.5 text-[13px] font-semibold text-red-600 flex-1 min-w-0">
              <AlertCircle size={12} className="shrink-0" />
              <span className="truncate">{error}</span>
            </div>
          )}
          <div className="flex gap-2 ml-auto shrink-0">
            <AdminButton onClick={onClose} disabled={saving} variant="secondary" className="text-[14px]">
              Hủy
            </AdminButton>
            <AdminButton onClick={submit} disabled={saving} className="text-[14px]">
              {saving
                ? <><Loader2 size={13} className="animate-spin" />Đang lưu...</>
                : isEdit ? 'Cập nhật' : 'Thêm khoản'}
            </AdminButton>
          </div>
        </div>
    </AdminModal>
  )
}

// ── FinanceRow ────────────────────────────────────────────────────────────────

const FinanceRow = memo(function FinanceRow({ entry, onEdit, onDelete }: {
  entry: BqtFinance
  onEdit: () => void
  onDelete: () => void
}) {
  const dateStr = (() => {
    const [y, m, d] = entry.entry_date.split('-')
    return `${d}/${m}/${y}`
  })()

  return (
    <tr className="transition-colors hover:bg-gray-50">
      {/* Ngày */}
      <td className="px-5 py-3.5 text-[14px] text-gray-500 w-28 whitespace-nowrap font-medium">
        {dateStr}
      </td>

      {/* Loại */}
      <td className="px-4 py-3.5 w-24">
        <span className={`inline-flex items-center gap-1.5 text-[12px] font-bold px-2.5 h-6 rounded-lg whitespace-nowrap ${
          entry.type === 'thu' ? 'bg-green-50 text-green-700 border border-green-200/50' : 'bg-red-50 text-red-600 border border-red-200/50'
        }`}>
          {entry.type === 'thu' ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
          {entry.type === 'thu' ? 'Thu' : 'Chi'}
        </span>
      </td>

      {/* Số tiền */}
      <td className="px-4 py-3.5 w-40 whitespace-nowrap">
        <span className={`text-[15px] font-black ${entry.type === 'thu' ? 'text-green-600' : 'text-red-600'}`}>
          {entry.type === 'chi' ? '−' : '+'}{formatVND(entry.amount)}
        </span>
      </td>

      {/* Diễn giải */}
      <td className="px-4 py-3.5 min-w-[200px]">
        {entry.description ? (
          <p className="text-[14px] text-gray-700 leading-relaxed font-semibold truncate max-w-[400px] xl:max-w-[600px]" title={entry.description}>
            {entry.description}
          </p>
        ) : (
          <span className="text-[13px] text-gray-400 italic">Không có diễn giải</span>
        )}
      </td>

      {/* Hành động */}
      <td className="px-4 py-3.5 w-24">
        <div className="flex items-center gap-0.5">
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


// ── FinanceTab ────────────────────────────────────────────────────────────────

export function FinanceTab({ initial }: { initial: BqtFinance[] }) {
  const [entries,   setEntries]   = useState(initial)
  const [showAdd,   setShowAdd]   = useState(false)
  const [editEntry, setEditEntry] = useState<BqtFinance | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<BqtFinance | null>(null)
  const [deleting,     setDeleting]     = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchOpen,  setSearchOpen]  = useState(false)

  const years = useMemo(() => {
    const set = new Set(entries.map(e => e.entry_date.slice(0, 4)))
    const list = Array.from(set).sort((a, b) => b.localeCompare(a))
    return list.length > 0 ? list : [new Date().getFullYear().toString()]
  }, [entries])

  const [selectedYear,  setSelectedYear]  = useState(() => years[0] ?? new Date().getFullYear().toString())
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null)

  const filtered = useMemo(() => entries
    .filter(e => {
      if (!e.entry_date.startsWith(selectedYear)) return false
      if (selectedMonth !== null && parseInt(e.entry_date.slice(5, 7)) !== selectedMonth) return false
      if (searchQuery && !e.description?.toLowerCase().includes(searchQuery.toLowerCase())) return false
      return true
    })
    .sort((a, b) => b.entry_date.localeCompare(a.entry_date))
  , [entries, selectedYear, selectedMonth, searchQuery])

  const totalThu  = filtered.filter(e => e.type === 'thu').reduce((s, e) => s + e.amount, 0)
  const totalChi  = filtered.filter(e => e.type === 'chi').reduce((s, e) => s + e.amount, 0)
  const soDu      = totalThu - totalChi

  const monthsInYear = useMemo(() => {
    const set = new Set(
      entries
        .filter(e => e.entry_date.startsWith(selectedYear))
        .map(e => parseInt(e.entry_date.slice(5, 7)))
    )
    return Array.from(set).sort((a, b) => a - b)
  }, [entries, selectedYear])

  const handleSaved = (saved: BqtFinance) => {
    setEntries(prev => {
      const idx = prev.findIndex(e => e.id === saved.id)
      return idx >= 0
        ? prev.map(e => e.id === saved.id ? saved : e)
        : [saved, ...prev].sort((a, b) => b.entry_date.localeCompare(a.entry_date))
    })
    setShowAdd(false)
    setEditEntry(null)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    await createClient().from('bqt_finances').delete().eq('id', deleteTarget.id)
    setEntries(prev => prev.filter(e => e.id !== deleteTarget.id))
    setDeleting(false)
    setDeleteTarget(null)
  }

  return (
    <div className="flex flex-col">

      {/* Toolbar */}
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between shrink-0">
        <div className="flex items-center gap-3 flex-wrap w-full xl:w-auto">
          {/* Year filter */}
          <div className="w-[130px] shrink-0">
            <AdminSelect
              value={selectedYear}
              onChange={val => { setSelectedYear(val); setSelectedMonth(null) }}
              options={years.map(y => ({ value: y, label: `Năm ${y}` }))}
              placeholder=""
            />
          </div>

          <div className="h-6 w-px bg-gray-200 hidden xl:block mx-2" />

          {/* Month filter as Flat Standalone Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1 xl:pb-0">
            <button onClick={() => setSelectedMonth(null)}
              className={`relative flex items-center px-4 h-9 rounded-lg text-[14px] transition-colors whitespace-nowrap shrink-0 ${
                selectedMonth === null
                  ? 'bg-white text-vatican-blue border border-gray-200 font-extrabold'
                  : 'bg-gray-100 text-gray-600 border border-transparent font-bold'
              }`}>
              Cả năm
            </button>
            {monthsInYear.map(m => (
              <button key={m} onClick={() => setSelectedMonth(selectedMonth === m ? null : m)}
                className={`relative flex items-center px-4 h-9 rounded-lg text-[14px] transition-colors whitespace-nowrap shrink-0 ${
                  selectedMonth === m
                    ? 'bg-white text-vatican-blue border border-gray-200 font-extrabold'
                    : 'bg-gray-100 text-gray-600 border border-transparent font-bold'
                }`}>
                Tháng {m}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 w-full xl:w-auto justify-end shrink-0">
          {/* Search */}
          <AdminSearchInput
            open={searchOpen}
            value={searchQuery}
            onOpen={() => setSearchOpen(true)}
            onChange={v => setSearchQuery(v)}
            onClear={() => { setSearchQuery(''); setSearchOpen(false) }}
          />

          <div className="h-6 w-px bg-gray-200 hidden xl:block mx-1" />

          <ExportPDFButton
            title={`Tài chính Ban Quản Trị — Năm ${selectedYear}${selectedMonth ? ` · Tháng ${selectedMonth}` : ''}`}
            headers={['Ngày', 'Loại', 'Số tiền', 'Diễn giải']}
            rows={filtered.map(e => {
              const [y, mo, d] = e.entry_date.split('-')
              return [
                `${d}/${mo}/${y}`,
                e.type === 'thu' ? 'Thu' : 'Chi',
                (e.type === 'thu' ? '+' : '−') + formatVND(e.amount),
                e.description ?? '',
              ]
            })}
          />

          <div className="h-6 w-px bg-gray-200 hidden xl:block mx-1" />

          <AdminButton onClick={() => setShowAdd(true)} className="px-6 shrink-0 text-[14px]">
            <Plus size={13} />Thêm khoản
          </AdminButton>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3 p-4">
        <div className="bg-green-50 border border-green-200 rounded-xl p-3.5 flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-green-700">
            <TrendingUp size={14} strokeWidth={2.5} />
            <span className="text-[16px] font-bold uppercase tracking-wide">Tổng thu</span>
          </div>
          <p className="text-[18px] font-black text-green-700 leading-snug">{formatVND(totalThu)}</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-red-600">
            <TrendingDown size={14} strokeWidth={2.5} />
            <span className="text-[16px] font-bold uppercase tracking-wide">Tổng chi</span>
          </div>
          <p className="text-[18px] font-black text-red-600 leading-snug">{formatVND(totalChi)}</p>
        </div>
        <div className={`border rounded-xl p-3.5 flex flex-col gap-1 ${soDu >= 0 ? 'bg-vatican-blue/5 border-vatican-blue/20' : 'bg-orange-50 border-orange-200'}`}>
          <div className={`flex items-center gap-1.5 ${soDu >= 0 ? 'text-vatican-blue' : 'text-orange-600'}`}>
            <Wallet size={14} strokeWidth={2.5} />
            <span className="text-[16px] font-bold uppercase tracking-wide">Số dư</span>
          </div>
          <p className={`text-[18px] font-black leading-snug ${soDu >= 0 ? 'text-vatican-blue' : 'text-orange-600'}`}>
            {soDu >= 0 ? '+' : '−'}{formatVND(Math.abs(soDu))}
          </p>
        </div>
      </div>

      {/* Entries list */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<Wallet size={22} strokeWidth={1.5} className="text-gray-300" />}
          message="Không tìm thấy khoản thu/chi nào."
        />
      ) : (
        <div className="max-h-[calc(100vh-280px)] overflow-y-auto overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead className="sticky top-0 z-10">
              <tr className="bg-gray-50 border-b border-gray-100 transition-colors">
                <th className="px-5 py-3 text-left text-[13px] font-bold uppercase tracking-wider text-gray-400 w-28">Ngày</th>
                <th className="px-4 py-3 text-left text-[13px] font-bold uppercase tracking-wider text-gray-400 w-24">Loại</th>
                <th className="px-4 py-3 text-left text-[13px] font-bold uppercase tracking-wider text-gray-400 w-40">Số tiền</th>
                <th className="px-4 py-3 text-left text-[13px] font-bold uppercase tracking-wider text-gray-400">Diễn giải</th>
                <th className="px-4 py-3 w-24" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(entry => (
                <FinanceRow
                  key={entry.id}
                  entry={entry}
                  onEdit={() => setEditEntry(entry)}
                  onDelete={() => setDeleteTarget(entry)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAdd && (
        <FinanceModal entry={null} onClose={() => setShowAdd(false)} onSaved={handleSaved} />
      )}
      {editEntry && (
        <FinanceModal entry={editEntry} onClose={() => setEditEntry(null)} onSaved={handleSaved} />
      )}

      {deleteTarget && (
        <ConfirmDeleteModal
          title="Xóa khoản tài chính?"
          description={`${deleteTarget.type === 'thu' ? 'Thu' : 'Chi'} ${formatVND(deleteTarget.amount)}`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  )
}
