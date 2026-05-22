'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import {
  Pencil, X, Save, Trash2, Plus, Users, Calendar,
  ImageOff, Upload, LayoutGrid, List, Loader2, Search,
} from 'lucide-react'
import { ConfirmDeleteModal } from '@/components/admin/ConfirmDeleteModal'
import {
  AdminCheckbox,
  AdminButton,
  AdminIconButton,
  AdminInput,
  AdminTextarea,
  AdminLabel,
  AdminBadge,
  ModalHeader,
  ModalFooter,
  ModalStatusToggle,
  AdminImagePicker,
  AdminViewToggle,
  AdminStatusBadgeSelect,
  BadgeSelectOption
} from '@/components/admin/ui'
import { ExportPDFButton } from '@/components/admin/ExportPDFButton'
import { cn } from '@/lib/utils'
import { AdminModal } from '@/components/admin/AdminModal'
import { AdminPagination } from '@/components/admin/AdminPagination'
import { AdminSearchInput } from '@/components/admin/AdminSearchInput'
import { EmptyState } from '@/components/admin/EmptyState'

type TripStatus = 'open' | 'completed'

type Trip = {
  id: string
  dates: string
  title: string
  departure: string
  destinations: string[]
  organizer: string
  description: string
  contact: string
  status: TripStatus
  image_url: string | null
  sort_order: number
}

const STATUS_CONFIG: Record<TripStatus, { label: string; dot: string; badge: string; badgeColor: 'green' | 'gray'; toggleLabel: string }> = {
  open:      { label: 'Đang mở',      dot: 'bg-green-400', badge: 'bg-green-500 text-white',  badgeColor: 'green', toggleLabel: 'Hoàn thành' },
  completed: { label: 'Hoàn thành',   dot: 'bg-gray-400',  badge: 'bg-gray-400 text-white',   badgeColor: 'gray',  toggleLabel: 'Mở lại đăng ký' },
}


// -- TripCard (grid) ----------------------------------------------------------
function TripCard({ trip, regCount, isSelected, onToggle, onDeleted, onEdit }: {
  trip: Trip; regCount: number; isSelected: boolean; onToggle: () => void; onDeleted: () => void; onEdit: () => void
}) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [deleting,    setDeleting]    = useState(false)
  const [togglingStatus, setTogglingStatus] = useState(false)
  const [currentStatus, setCurrentStatus] = useState<TripStatus>(trip.status)
  const router = useRouter()

  const s = STATUS_CONFIG[currentStatus]

  const toggleStatus = async () => {
    const next: TripStatus = currentStatus === 'open' ? 'completed' : 'open'
    setTogglingStatus(true)
    setCurrentStatus(next)
    await createClient().from('pilgrimage_trips').update({ status: next, updated_at: new Date().toISOString() }).eq('id', trip.id)
    setTogglingStatus(false)
    router.refresh()
  }

  const remove = async () => {
    setDeleting(true)
    await createClient().from('pilgrimage_trips').delete().eq('id', trip.id)
    onDeleted()
    router.refresh()
  }

  return (
    <div className={`bg-white rounded-lg border-2 overflow-hidden flex flex-col transition-colors ${isSelected ? 'border-vatican-blue' : 'border-gray-200'} ${currentStatus === 'completed' ? 'opacity-60' : ''}`}>
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gray-100 overflow-hidden shrink-0">
        {trip.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={trip.image_url} alt={trip.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-1.5 bg-gradient-to-br from-gray-50 to-gray-100">
            <ImageOff size={24} strokeWidth={1.5} className="text-gray-300" />
            <span className="text-xs font-bold uppercase tracking-widest text-gray-300">Chưa có ảnh</span>
          </div>
        )}
        <span className={`absolute top-2 left-2 text-xs font-bold px-2 py-0.5 rounded-lg ${s.badge}`}>
          {s.label}
        </span>
        <div className="absolute top-2 right-2 bg-white/90 rounded-md p-1 border border-gray-200 flex items-center justify-center shadow-sm">
          <AdminCheckbox checked={isSelected} onChange={onToggle} />
        </div>
      </div>

      {/* Body */}
      <div className="p-3.5 flex flex-col gap-1 flex-1">
        <p className="text-sm font-bold text-vatican-blue">{trip.dates}</p>
        <p className="font-bold text-sm md:text-base text-vatican-dark line-clamp-2 leading-snug">{trip.title}</p>
        <p className="text-xs md:text-sm text-gray-500 truncate">
          {trip.departure}{trip.destinations?.length ? ` → ${trip.destinations.join(' → ')}` : ''}
        </p>
      </div>

      {/* Footer */}
      <div className="px-3.5 pb-3 flex items-center justify-between border-t border-gray-100 pt-2.5">
        <div className="flex items-center gap-1.5">
          {regCount > 0 && (
            <a href={`/admin/dang-ky-hanh-huong?q=${encodeURIComponent(trip.title)}`}
              className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-md border border-blue-200 bg-blue-50 text-vatican-blue hover:bg-blue-100 transition-colors">
              <Users size={11} />{regCount}
            </a>
          )}
          <AdminButton onClick={toggleStatus} disabled={togglingStatus} variant="secondary" size="compact" className="h-8">
            {s.toggleLabel}
          </AdminButton>
        </div>
        <div className="flex gap-1">
          <AdminIconButton onClick={onEdit} variant="edit" title="Chỉnh sửa">
            <Pencil size={13} />
          </AdminIconButton>
          <AdminIconButton onClick={() => setShowConfirm(true)} disabled={deleting} variant="danger" title="Xóa">
            <Trash2 size={13} />
          </AdminIconButton>
        </div>
      </div>

      {showConfirm && (
        <ConfirmDeleteModal title="Xóa chuyến hành hương?" description={trip.title}
          onConfirm={remove} onCancel={() => setShowConfirm(false)} loading={deleting} />
      )}
    </div>
  )
}

// -- TripRow (list) -----------------------------------------------------------
function TripRow({ trip, regCount, isSelected, onToggle, onDeleted, onEdit }: {
  trip: Trip; regCount: number; isSelected: boolean; onToggle: () => void; onDeleted: () => void; onEdit: () => void
}) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [deleting,    setDeleting]    = useState(false)
  const [togglingStatus, setTogglingStatus] = useState(false)
  const [currentStatus, setCurrentStatus] = useState<TripStatus>(trip.status)
  const router = useRouter()

  const s = STATUS_CONFIG[currentStatus]

  const changeStatus = async (newStatus: TripStatus) => {
    setTogglingStatus(true)
    setCurrentStatus(newStatus)
    await createClient()
      .from('pilgrimage_trips')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', trip.id)
    setTogglingStatus(false)
    router.refresh()
  }

  const remove = async () => {
    setDeleting(true)
    await createClient().from('pilgrimage_trips').delete().eq('id', trip.id)
    onDeleted()
    router.refresh()
  }

  return (
    <div className={`flex items-center gap-4 px-4 py-3 border-b border-gray-100 last:border-0 transition-colors group ${isSelected ? 'bg-vatican-blue/5' : 'hover:bg-gray-50'} ${currentStatus === 'completed' ? 'opacity-60' : ''}`}>
      <AdminCheckbox checked={isSelected} onChange={onToggle} />
      {/* Thumbnail */}
      <div className="w-[96px] aspect-video rounded-lg overflow-hidden bg-gray-100 shrink-0">
        {trip.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={trip.image_url} alt={trip.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
            <ImageOff size={16} strokeWidth={1.5} className="text-gray-300" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm md:text-base text-vatican-dark truncate leading-snug">{trip.title}</p>
        <p className="text-sm text-vatican-blue font-semibold mt-0.5">{trip.dates}</p>
        <p className="text-xs md:text-sm text-gray-400 truncate mt-0.5">
          {trip.departure}{trip.destinations?.length ? ` → ${trip.destinations.join(' → ')}` : ''}
        </p>
      </div>

      {/* Registration Column */}
      <div className="w-[120px] shrink-0 flex justify-center">
        <a
          href={`/admin/dang-ky-hanh-huong?q=${encodeURIComponent(trip.title)}`}
          className={cn(
            "inline-flex items-center gap-1.5 text-[13px] font-bold px-2.5 py-1 rounded-lg border transition-all select-none hover:brightness-95",
            regCount > 0
              ? "border-blue-200 bg-blue-50 text-vatican-blue hover:bg-blue-100"
              : "border-gray-200 bg-gray-50 text-gray-400 hover:bg-gray-100"
          )}
        >
          <Users size={13} className="shrink-0" />
          <span>{regCount}</span>
        </a>
      </div>

      {/* Status Column */}
      <div className="w-[160px] shrink-0 flex justify-center">
        <AdminStatusBadgeSelect
          value={currentStatus}
          disabled={togglingStatus}
          onChange={(val) => changeStatus(val as TripStatus)}
          options={[
            { value: 'open', label: 'Đang mở', color: 'green' },
            { value: 'completed', label: 'Hoàn thành', color: 'gray' },
          ]}
        />
      </div>

      {/* Actions */}
      <div className="w-24 shrink-0 flex items-center justify-end gap-1">
        <AdminIconButton onClick={onEdit} variant="edit" title="Chỉnh sửa">
          <Pencil size={13} />
        </AdminIconButton>
        <AdminIconButton onClick={() => setShowConfirm(true)} disabled={deleting} variant="danger" title="Xóa">
          <Trash2 size={13} />
        </AdminIconButton>
      </div>

      {showConfirm && (
        <ConfirmDeleteModal title="Xóa chuyến hành hương?" description={trip.title}
          onConfirm={remove} onCancel={() => setShowConfirm(false)} loading={deleting} />
      )}
    </div>
  )
}

// -- TripModal (add / edit) ---------------------------------------------------
type ModalConfig = { mode: 'add' } | { mode: 'edit'; trip: Trip }

function TripModal({ config, maxOrder, onClose, onSaved }: {
  config: ModalConfig
  maxOrder: number
  onClose: () => void
  onSaved: (trip: Trip) => void
}) {
  const isEdit = config.mode === 'edit'
  const src    = isEdit ? (config as { mode: 'edit'; trip: Trip }).trip : null

  const [form, setForm] = useState({
    dates:        src?.dates        ?? '',
    title:        src?.title        ?? '',
    departure:    src?.departure    ?? '',
    destinations: src?.destinations.join(', ') ?? '',
    organizer:    src?.organizer    ?? '',
    description:  src?.description  ?? '',
    contact:      src?.contact      ?? '',
    status:       (src?.status      ?? 'open') as TripStatus,
    image_url:    src?.image_url    ?? '',
  })
  const [saving,     setSaving]     = useState(false)
  const [error,      setError]      = useState<string | null>(null)
  const router = useRouter()

  const set = (key: keyof typeof form) => (v: string) => setForm(p => ({ ...p, [key]: v }))

  const save = async () => {
    if (!form.dates.trim() || !form.title.trim()) { setError('Vui lòng nhập ngày và tiêu đề.'); return }
    setSaving(true)
    setError(null)
    const payload = {
      ...form,
      destinations: form.destinations.split(',').map(s => s.trim()).filter(Boolean),
      image_url: form.image_url || null,
      updated_at: new Date().toISOString(),
    }
    let data, err
    if (isEdit && src) {
      const res = await createClient().from('pilgrimage_trips').update(payload).eq('id', src.id).select().single()
      data = res.data; err = res.error
    } else {
      const res = await createClient().from('pilgrimage_trips').insert({ ...payload, sort_order: maxOrder + 1 }).select().single()
      data = res.data; err = res.error
    }
    setSaving(false)
    if (err) { setError('Lỗi: ' + err.message); return }
    onSaved(data as Trip)
    onClose()
    router.refresh()
  }

  const disabled = saving

  return (
    <AdminModal onClose={onClose} maxWidth="max-w-[860px]" disabled={disabled}>

        {/* Header */}
        <ModalHeader
          title={isEdit ? 'Chỉnh sửa chuyến hành hương' : 'Thêm chuyến hành hương mới'}
          onClose={onClose}
        />

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-4 min-h-0">

          {/* Ngày + Khởi hành */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <AdminLabel>Ngày / Thời gian <span className="text-red-500">*</span></AdminLabel>
              <AdminInput value={form.dates} placeholder="VD: 15–17/08/2026"
                onChange={e => set('dates')(e.target.value)} />
            </div>
            <div>
              <AdminLabel>Điểm khởi hành <span className="text-red-500">*</span></AdminLabel>
              <AdminInput value={form.departure} placeholder="VD: TP. Hồ Chí Minh"
                onChange={e => set('departure')(e.target.value)} />
            </div>
          </div>

          {/* Tiêu đề */}
          <div>
            <AdminLabel>Tiêu đề chuyến <span className="text-red-500">*</span></AdminLabel>
            <AdminInput value={form.title} placeholder="VD: Hành hương Tắc Sậy mùa hè 2026"
              onChange={e => set('title')(e.target.value)} autoFocus={!isEdit} />
          </div>

          {/* Điểm đến */}
          <div>
            <AdminLabel>Điểm đến (cách nhau bằng dấu phẩy)</AdminLabel>
            <AdminInput value={form.destinations} placeholder="Tắc Sậy, Bạc Liêu"
              onChange={e => set('destinations')(e.target.value)} />
          </div>

          {/* Mô tả */}
          <div>
            <AdminLabel>Mô tả chi tiết</AdminLabel>
            <AdminTextarea rows={3}
              value={form.description} placeholder="Nội dung chi tiết về chuyến đi..."
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
          </div>

          {/* Ảnh đại diện */}
          <div>
            <AdminLabel>Ảnh đại diện</AdminLabel>
            <AdminImagePicker
              value={form.image_url}
              onChange={set('image_url')}
              bucket="articles"
              aspectRatio="16:9"
              disabled={disabled}
            />
          </div>

          {/* Trạng thái */}
          <div>
            <AdminLabel>Trạng thái</AdminLabel>
            <ModalStatusToggle
              active={form.status === 'open'}
              onChange={v => setForm(p => ({ ...p, status: v ? 'open' : 'completed' }))}
              activeLabel={STATUS_CONFIG.open.label}
              inactiveLabel={STATUS_CONFIG.completed.label}
            />
          </div>

        </div>

        <ModalFooter error={error} onCancel={onClose} submitting={disabled}>
            <AdminButton onClick={save} disabled={disabled}>
              <Save size={13} />
              {saving ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi' : 'Thêm chuyến'}
            </AdminButton>
        </ModalFooter>

    </AdminModal>
  )
}

// -- Main export --------------------------------------------------------------
const PER_PAGE_GRID = 6  // 3 cột × 2 hàng
const PER_PAGE_LIST = 8

export function TripsEditor({ trips: initial, regCounts }: { trips: Trip[]; regCounts: Record<string, number> }) {
  const [trips,        setTrips]        = useState(initial)
  const [view,         setView]         = useState<'grid' | 'list'>('list')
  const [page,         setPage]         = useState(1)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingTrip,  setEditingTrip]  = useState<Trip | null>(null)
  const [search,       setSearch]       = useState('')
  const [searchOpen,   setSearchOpen]   = useState(false)
  const [selected,     setSelected]     = useState<Set<string>>(new Set())
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => { if (searchOpen) searchRef.current?.focus() }, [searchOpen])
  const clearSearch = useCallback(() => { setSearch(''); setSearchOpen(false); setPage(1) }, [])

  const perPage  = view === 'grid' ? PER_PAGE_GRID : PER_PAGE_LIST
  const maxOrder = Math.max(0, ...trips.map(t => t.sort_order))

  const filtered   = search.trim()
    ? trips.filter(t => t.title.toLowerCase().includes(search.trim().toLowerCase()) || t.dates.toLowerCase().includes(search.trim().toLowerCase()))
    : trips
  const totalPages = Math.ceil(filtered.length / perPage)
  const paged      = filtered.slice((page - 1) * perPage, page * perPage)

  const allSelected  = filtered.length > 0 && filtered.every(t => selected.has(t.id))
  const someSelected = filtered.some(t => selected.has(t.id)) && !allSelected
  const toggleAll    = () => {
    if (allSelected || someSelected) setSelected(new Set())
    else setSelected(new Set(filtered.map(t => t.id)))
  }
  const toggleItem = (id: string) => setSelected(prev => {
    const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next
  })

  const handleSaved = (saved: Trip) => {
    setTrips(prev => {
      const idx = prev.findIndex(t => t.id === saved.id)
      return idx >= 0 ? prev.map(t => t.id === saved.id ? saved : t) : [saved, ...prev]
    })
    setPage(1)
  }

  const handleDeleted = (id: string) => {
    const next = trips.filter(t => t.id !== id)
    setTrips(next)
    const newTotal = Math.ceil(next.length / perPage)
    if (page > newTotal) setPage(Math.max(1, newTotal))
  }

  return (
    <div className="flex flex-col">

      {/* Action bar */}
      <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between gap-4 shrink-0">
        <p className="text-[14px] text-gray-500 font-medium">
          Hiện có <strong className="text-vatican-dark">{trips.length}</strong> chuyến –{' '}
          <strong className="text-green-600">{trips.filter(t => t.status === 'open').length}</strong> đang mở
        </p>
        <div className="flex items-center gap-2">
          {/* Search */}
          <AdminSearchInput
            open={searchOpen}
            value={search}
            onOpen={() => setSearchOpen(true)}
            onChange={v => { setSearch(v); setPage(1) }}
            onClear={clearSearch}
          />
          {/* Export PDF */}
          <ExportPDFButton
            title="Lịch hành hương"
            label={selected.size > 0 ? `Xuất PDF (${selected.size})` : 'Xuất PDF'}
            headers={['Ngày chuyến', 'Tên chuyến', 'Xuất phát', 'Điểm đến', 'Trạng thái', 'Đăng ký']}
            rows={(selected.size > 0 ? filtered.filter(t => selected.has(t.id)) : filtered).map(t => [
              t.dates,
              t.title,
              t.departure,
              t.destinations.join(', '),
              STATUS_CONFIG[t.status].label,
              String(regCounts[t.id] ?? 0),
            ])}
          />
          {/* View toggle */}
          <AdminViewToggle view={view} onChange={v => { setView(v); setPage(1) }} />
          <AdminButton onClick={() => setShowAddModal(true)}>
            <Plus size={13} />Thêm chuyến
          </AdminButton>
        </div>
      </div>

      {/* Content */}
      <div className={view === 'grid' ? 'p-6' : 'px-0 py-0'}>
        {!filtered.length ? (
          <EmptyState
            icon={<Calendar size={22} strokeWidth={1.5} className="text-gray-300" />}
            message={search.trim() ? `Không tìm thấy chuyến nào với "${search}"` : 'Chưa có chuyến hành hương nào'}
          />
        ) : view === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-5">
            {paged.map(trip => (
              <TripCard key={trip.id} trip={trip} regCount={regCounts[trip.id] ?? 0}
                isSelected={selected.has(trip.id)} onToggle={() => toggleItem(trip.id)}
                onEdit={() => setEditingTrip(trip)}
                onDeleted={() => handleDeleted(trip.id)} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col">
            <div className="flex items-center gap-4 px-4 py-2.5 border-b border-gray-100 bg-gray-50/50">
              <AdminCheckbox checked={allSelected} indeterminate={someSelected} onChange={toggleAll} />
              <div className="w-[96px] shrink-0" />
              <p className="flex-1 text-[13px] font-bold uppercase tracking-wider text-gray-400">Chuyến / Lộ trình</p>
              <p className="text-[13px] font-bold uppercase tracking-wider text-gray-400 w-[120px] text-center">Đăng ký</p>
              <p className="text-[13px] font-bold uppercase tracking-wider text-gray-400 w-[160px] text-center">Trạng thái</p>
              <div className="w-24 shrink-0" />
            </div>
            {paged.map(trip => (
              <TripRow key={trip.id} trip={trip} regCount={regCounts[trip.id] ?? 0}
                isSelected={selected.has(trip.id)} onToggle={() => toggleItem(trip.id)}
                onEdit={() => setEditingTrip(trip)}
                onDeleted={() => handleDeleted(trip.id)} />
            ))}
          </div>
        )}
      </div>

      {filtered.length > 0 && (
        <AdminPagination
          currentPage={page}
          totalPages={totalPages}
          totalCount={filtered.length}
          itemName="chuyến"
          from={(page - 1) * perPage}
          to={page * perPage - 1}
          onPageChange={setPage}
        />
      )}

      {/* Modals */}
      {showAddModal && (
        <TripModal config={{ mode: 'add' }} maxOrder={maxOrder}
          onClose={() => setShowAddModal(false)} onSaved={handleSaved} />
      )}
      {editingTrip && (
        <TripModal config={{ mode: 'edit', trip: editingTrip }} maxOrder={maxOrder}
          onClose={() => setEditingTrip(null)} onSaved={handleSaved} />
      )}
    </div>
  )
}
