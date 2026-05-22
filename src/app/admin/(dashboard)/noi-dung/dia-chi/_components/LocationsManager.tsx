'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { MapPin, PlayCircle, Info, Save, Pencil, Trash2, X, GripVertical } from 'lucide-react'
import { ConfirmDeleteModal } from '@/components/admin/ConfirmDeleteModal'
import { AdminButton, AdminIconButton, AdminInput, AdminLabel, AdminTextarea } from '@/components/admin/ui'
import { useDndSensors } from '@/hooks/useDndSensors'
import {
  DndContext,
  closestCenter,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { EmptyState } from '@/components/admin/EmptyState'

type Location = {
  id: string
  name: string
  badge: string | null
  note: string | null
  address_new: string | null
  address_old: string | null
  map_url: string | null
  directions_url: string | null
  theme: 'blue' | 'red'
  sort_order: number
}


// ── Edit form ─────────────────────────────────────────────────────────────
function LocationEditForm({ form, theme, onChange }: {
  form: Record<string, string>
  theme: 'blue' | 'red'
  onChange: (k: string, v: string) => void
}) {
  const inp = (label: string, key: string, placeholder?: string) => (
    <div key={key} className="flex flex-col gap-1">
      <AdminLabel>{label}</AdminLabel>
      <AdminInput value={form[key] ?? ''} placeholder={placeholder}
        onChange={e => onChange(key, e.target.value)} />
    </div>
  )

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        {inp('Tên địa điểm *', 'name')}
        {inp('Nhãn phụ', 'badge')}
      </div>
      {inp('Địa chỉ hiện nay *', 'address_new')}
      {inp('Địa chỉ cũ', 'address_old')}
      {theme === 'red' && (
        <div className="flex flex-col gap-1">
          <AdminLabel>Ghi chú lưu ý</AdminLabel>
          <AdminTextarea rows={3}
            value={form.note ?? ''}
            onChange={e => onChange('note', e.target.value)} />
        </div>
      )}
      {theme === 'blue' && (
        <div className="grid grid-cols-2 gap-3">
          {inp('Link bản đồ', 'map_url', 'https://maps.google.com/...')}
          {inp('Link hướng dẫn', 'directions_url', 'https://youtube.com/...')}
        </div>
      )}
    </div>
  )
}

// ── Location card (view / edit, draggable) ────────────────────────────────
function LocationRow({ loc, onDeleted }: { loc: Location; onDeleted: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: loc.id })
  const style = { transform: CSS.Transform.toString(transform), transition }

  const [editing,         setEditing]         = useState(false)
  const [form,            setForm]            = useState<Record<string, string>>({
    name:           loc.name,
    badge:          loc.badge          ?? '',
    note:           loc.note           ?? '',
    address_new:    loc.address_new    ?? '',
    address_old:    loc.address_old    ?? '',
    map_url:        loc.map_url        ?? '',
    directions_url: loc.directions_url ?? '',
  })
  const [saving,          setSaving]          = useState(false)
  const [deleting,        setDeleting]        = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const router = useRouter()

  const isBlue = loc.theme === 'blue'
  const colorBorder        = isBlue ? 'border-vatican-blue/30' : 'border-red-800/20'
  const colorBg            = isBlue ? 'bg-vatican-blue/5'      : 'bg-red-50'
  const colorBorderHeader  = isBlue ? 'border-vatican-blue/20' : 'border-red-800/10'
  const colorText          = isBlue ? 'text-vatican-blue'      : 'text-red-800'
  const colorBadgeBorder   = isBlue ? 'border-vatican-blue/30' : 'border-red-800/30'
  const colorPin           = isBlue ? 'text-vatican-blue'      : 'text-red-800'
  const colorNoteDivider   = isBlue ? 'border-vatican-blue/10' : 'border-red-800/10'

  const save = async () => {
    setSaving(true)
    await createClient().from('locations').update({
      name:           form.name || null,
      badge:          form.badge || null,
      note:           form.note || null,
      address_new:    form.address_new || null,
      address_old:    form.address_old || null,
      map_url:        isBlue ? (form.map_url || null) : null,
      directions_url: isBlue ? (form.directions_url || null) : null,
      updated_at: new Date().toISOString(),
    }).eq('id', loc.id)
    setSaving(false)
    setEditing(false)
    router.refresh()
  }

  const remove = async () => {
    setDeleting(true)
    await createClient().from('locations').delete().eq('id', loc.id)
    onDeleted()
    router.refresh()
  }

  if (editing) return (
    <div className={`bg-white border ${colorBorder} rounded-lg overflow-hidden flex flex-col`}>
      <div className={`${colorBg} border-b ${colorBorderHeader} px-4 py-3 flex items-center justify-between`}>
        <span className={`text-[14px] font-bold ${colorText}`}>Chỉnh sửa · {loc.name}</span>
        <button onClick={() => setEditing(false)} className="text-gray-400 hover:text-gray-600">
          <X size={15} />
        </button>
      </div>
      <div className="p-4 flex flex-col gap-4">
        <LocationEditForm form={form} theme={loc.theme} onChange={(k, v) => setForm(f => ({ ...f, [k]: v }))} />
        <div className="flex gap-2">
          <AdminButton onClick={save} disabled={saving} size="compact">
            <Save size={13} />{saving ? 'Đang lưu...' : 'Lưu'}
          </AdminButton>
          <AdminButton onClick={() => setEditing(false)} variant="secondary" size="compact">
            Hủy
          </AdminButton>
        </div>
      </div>
    </div>
  )

  return (
    <div ref={setNodeRef} style={style}
      className={`bg-white border ${colorBorder} rounded-lg overflow-hidden flex flex-col ${isDragging ? 'opacity-60' : ''}`}>

      {/* Header — drag handle + tên + nhãn + note (inline) + edit/delete */}
      <div className={`${colorBg} border-b ${colorBorderHeader} px-4 py-3 flex flex-col justify-center min-h-[48px]`}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <button {...attributes} {...listeners} suppressHydrationWarning
              className="cursor-grab active:cursor-grabbing shrink-0 text-gray-300 hover:text-gray-400 touch-none" tabIndex={-1}>
              <GripVertical size={14} />
            </button>
            <div className="flex items-center gap-2 flex-wrap flex-1">
              <p className={`text-[14px] font-bold ${colorText} uppercase tracking-wide leading-tight`}>{loc.name}</p>
              {loc.badge && (
                <span className={`text-[13px] font-bold uppercase tracking-wide ${colorText} border ${colorBadgeBorder} bg-white px-2 py-0.5 rounded-lg whitespace-nowrap`}>
                  {loc.badge}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-1 shrink-0">
            <AdminIconButton onClick={() => setEditing(true)} variant="edit" title="Chỉnh sửa">
              <Pencil size={13} />
            </AdminIconButton>
            <AdminIconButton onClick={() => setShowDeleteModal(true)} disabled={deleting} variant="danger" title="Xóa">
              <Trash2 size={13} />
            </AdminIconButton>
          </div>
        </div>
        {loc.note && (
          <div className={`mt-2.5 border-t ${colorNoteDivider} pt-2.5 flex gap-2.5 items-start`}>
            <Info size={16} strokeWidth={2.5} className={`${colorPin} shrink-0 mt-0.5`} />
            <p className="text-[14px] text-gray-700 font-normal italic leading-relaxed">
              {loc.note.replace(/^\*?Lưu ý:\s*/i, '')}
            </p>
          </div>
        )}
      </div>

      {/* Body — địa chỉ */}
      <div className="flex items-start gap-3 px-4 py-4 flex-1">
        <div className="h-[18px] flex items-center shrink-0">
          <MapPin size={16} strokeWidth={2.5} className={colorPin} />
        </div>
        <div className="flex flex-col gap-1.5 flex-1">
          <div>
            <p className="text-[13px] font-bold text-gray-400 uppercase tracking-wide">Địa chỉ hiện nay</p>
            <p className="text-[14px] text-gray-800 font-medium leading-snug mt-0.5">{loc.address_new}</p>
          </div>
          {loc.address_old && (
            <div className="pt-2.5 mt-1 border-t border-gray-100">
              <p className="text-[13px] font-bold text-gray-400 uppercase tracking-wide">Địa chỉ cũ</p>
              <p className="text-[14px] text-gray-600 font-medium leading-snug mt-0.5">{loc.address_old}</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer — nút bản đồ / hướng dẫn */}
      {(loc.map_url || loc.directions_url) && (
        <div className="px-4 pb-4 flex gap-2">
          {loc.map_url && (
            <a href={loc.map_url} target="_blank" rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 bg-vatican-blue text-white font-bold px-4 h-9 text-[14px] rounded-lg hover:bg-vatican-blue-dark transition-colors">
              <MapPin size={15} strokeWidth={2.5} />Bản đồ
            </a>
          )}
          {loc.directions_url && (
            <a href={loc.directions_url}
              target={loc.directions_url !== '#' ? '_blank' : undefined}
              rel={loc.directions_url !== '#' ? 'noopener noreferrer' : undefined}
              className="flex-1 inline-flex items-center justify-center gap-2 border border-vatican-blue text-vatican-blue font-bold px-4 h-9 text-[14px] rounded-lg hover:bg-vatican-blue hover:text-white transition-colors">
              <PlayCircle size={15} strokeWidth={2.5} />Hướng dẫn
            </a>
          )}
        </div>
      )}

      {showDeleteModal && (
        <ConfirmDeleteModal title="Xóa địa điểm?" description={loc.name}
          onConfirm={remove} onCancel={() => setShowDeleteModal(false)} loading={deleting} />
      )}
    </div>
  )
}

// ── Main export ──────────────────────────────────────────────────────────
export function LocationsManager({ locations: initial }: { locations: Location[] }) {
  const [locations, setLocations] = useState(initial)

  const sensors = useDndSensors()

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = locations.findIndex(l => l.id === active.id)
    const newIndex  = locations.findIndex(l => l.id === over.id)
    const reordered = arrayMove(locations, oldIndex, newIndex)
    setLocations(reordered)
    const supabase = createClient()
    await Promise.all(reordered.map((l, i) =>
      supabase.from('locations').update({ sort_order: i + 1 }).eq('id', l.id)
    ))
  }

  return (
    <div className="bg-white rounded-lg flex flex-col border border-gray-100">

      {/* Header */}
      <div className="bg-white border-b-[3px] border-vatican-yellow flex items-center gap-2 px-5 h-[48px] shrink-0 rounded-t-lg">
        <MapPin size={18} strokeWidth={2.5} className="text-vatican-blue/80 shrink-0" />
        <span className="text-[14px] font-bold uppercase tracking-wide text-vatican-blue">Địa chỉ</span>
      </div>

      {/* Action bar */}
      <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50 shrink-0">
        <p className="text-[14px] text-gray-500 font-medium">
          Địa điểm hành hương hiển thị trên trang Cần Biết — kéo để sắp xếp thứ tự
        </p>
      </div>

      {/* Cards grid */}
      <div className="p-6">
        {locations.length === 0 ? (
          <EmptyState
            icon={<MapPin size={22} strokeWidth={1.5} className="text-gray-300" />}
            message="Chưa có địa điểm nào"
          />
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={locations.map(l => l.id)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-2 gap-5">
                {locations.map(loc => (
                  <LocationRow key={loc.id} loc={loc}
                    onDeleted={() => setLocations(prev => prev.filter(x => x.id !== loc.id))} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  )
}
