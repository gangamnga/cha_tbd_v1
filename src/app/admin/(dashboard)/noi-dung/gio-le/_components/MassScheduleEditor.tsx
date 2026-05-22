'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Clock, Save, Plus, Pencil, Trash2, X, CheckCircle, GripVertical } from 'lucide-react'
import { ConfirmDeleteModal } from '@/components/admin/ConfirmDeleteModal'
import { AdminButton, AdminIconButton, AdminInput, AdminLabel } from '@/components/admin/ui'
import { EmptyState } from '@/components/admin/EmptyState'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

type MassMeta = { id: string; location_name: string; note: string }
type MassSlot = { id: string; day_label: string; times: string[]; sort_order: number }


// ── Meta panel (fields only, save is in action bar) ──────────────────────
function MetaPanel({
  form,
  onChange,
}: {
  form: { location_name: string; note: string }
  onChange: (f: { location_name: string; note: string }) => void
}) {
  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex flex-col gap-1.5">
        <AdminLabel>Tên địa điểm</AdminLabel>
        <AdminInput value={form.location_name}
          placeholder="Thánh đường Tắc Sậy"
          onChange={e => onChange({ ...form, location_name: e.target.value })} />
      </div>
      <div className="flex flex-col gap-1.5">
        <AdminLabel>Ghi chú lưu ý</AdminLabel>
        <AdminInput value={form.note}
          placeholder="Lịch có thể thay đổi theo thông báo."
          onChange={e => onChange({ ...form, note: e.target.value })} />
      </div>
    </div>
  )
}

// ── Slot row (view / edit, draggable) ────────────────────────────────────
function SlotRow({ slot, onDeleted }: { slot: MassSlot; onDeleted: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: slot.id })
  const style = { transform: CSS.Transform.toString(transform), transition }

  const [editing,         setEditing]         = useState(false)
  const [dayLabel,        setDayLabel]        = useState(slot.day_label)
  const [times,           setTimes]           = useState<string[]>(slot.times ?? [])
  const [newTime,         setNewTime]         = useState('')
  const [saving,          setSaving]          = useState(false)
  const [deleting,        setDeleting]        = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const router = useRouter()

  const addTime = () => {
    const t = newTime.trim()
    if (t && !times.includes(t)) { setTimes(prev => [...prev, t].sort()); setNewTime('') }
  }

  const save = async () => {
    setSaving(true)
    await createClient().from('mass_schedule')
      .update({ day_label: dayLabel, times, updated_at: new Date().toISOString() })
      .eq('id', slot.id)
    setSaving(false)
    setEditing(false)
    router.refresh()
  }

  const cancel = () => { setEditing(false); setDayLabel(slot.day_label); setTimes(slot.times ?? []) }

  const remove = async () => {
    setDeleting(true)
    await createClient().from('mass_schedule').delete().eq('id', slot.id)
    onDeleted()
    router.refresh()
  }

  if (editing) return (
    <div className="bg-white border border-gray-200 rounded-lg px-4 py-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-[14px] font-bold text-gray-700">Chỉnh sửa buổi lễ</span>
        <button onClick={cancel} className="text-gray-400 hover:text-gray-600"><X size={15} /></button>
      </div>
      <div className="flex flex-col gap-1.5">
        <AdminLabel>Ngày</AdminLabel>
        <AdminInput value={dayLabel} placeholder="VD: Thứ Hai – Thứ Sáu"
          onChange={e => setDayLabel(e.target.value)} />
      </div>
      <div className="flex flex-col gap-2">
        <AdminLabel>Giờ lễ</AdminLabel>
        {times.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {times.map(t => (
              <span key={t} className="flex items-center gap-1.5 bg-gray-100 text-vatican-dark font-bold text-[13px] px-2.5 py-1 rounded-lg">
                {t}
                <button onClick={() => setTimes(p => p.filter(x => x !== t))}
                  className="text-gray-400 hover:text-red-500 transition-colors"><X size={10} /></button>
              </span>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <AdminInput type="time" className="py-1 h-8 text-[14px]"
            value={newTime} onChange={e => setNewTime(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTime()} />
          <AdminButton onClick={addTime} variant="secondary" size="compact" className="border-dashed border-gray-300 h-auto">
            <Plus size={13} />Thêm
          </AdminButton>
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <AdminButton onClick={save} disabled={saving} size="compact">
          <Save size={13} />{saving ? 'Đang lưu...' : 'Lưu'}
        </AdminButton>
        <AdminButton onClick={cancel} variant="secondary" size="compact">
          Hủy
        </AdminButton>
      </div>
    </div>
  )

  return (
    <div ref={setNodeRef} style={style}
      className={`flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-3 ${isDragging ? 'opacity-40' : ''}`}>
      <button {...attributes} {...listeners} suppressHydrationWarning
        className="cursor-grab active:cursor-grabbing shrink-0 text-gray-300 hover:text-gray-400 touch-none" tabIndex={-1}>
        <GripVertical size={14} />
      </button>
      <div className="flex-1 min-w-0 flex items-center gap-3 flex-wrap">
        <p className="font-bold text-[14px] text-vatican-blue shrink-0">{slot.day_label}</p>
        <div className="flex flex-wrap gap-2">
          {(slot.times ?? []).map(t => (
            <span key={t} className="bg-gray-100 text-vatican-dark font-bold text-[13px] px-2.5 py-1 rounded-lg">{t}</span>
          ))}
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
      {showDeleteModal && (
        <ConfirmDeleteModal title="Xóa buổi lễ?" description={slot.day_label}
          onConfirm={remove} onCancel={() => setShowDeleteModal(false)} loading={deleting} />
      )}
    </div>
  )
}

function AddSlotForm({ maxOrder, onAdded }: { maxOrder: number; onAdded: (slot: MassSlot) => void }) {
  const [open,     setOpen]     = useState(false)
  const [dayLabel, setDayLabel] = useState('')
  const [times,    setTimes]    = useState<string[]>([])
  const [newTime,  setNewTime]  = useState('')
  const [saving,   setSaving]   = useState(false)
  const router = useRouter()

  const addTime = () => {
    const t = newTime.trim()
    if (t && !times.includes(t)) { setTimes(prev => [...prev, t].sort()); setNewTime('') }
  }

  const reset = () => { setOpen(false); setDayLabel(''); setTimes([]); setNewTime('') }

  const save = async () => {
    if (!dayLabel.trim()) return
    setSaving(true)
    const { data } = await createClient().from('mass_schedule').insert({
      day_label: dayLabel, times, sort_order: maxOrder + 1,
      updated_at: new Date().toISOString(),
    }).select().single()
    setSaving(false)
    if (data) { onAdded(data as MassSlot); reset(); router.refresh() }
  }

  if (!open) return (
    <AdminButton onClick={() => setOpen(true)} variant="secondary" className="w-full justify-center border-dashed border-gray-300 py-2.5 h-auto text-[14px]">
      <Plus size={13} />Thêm buổi lễ mới
    </AdminButton>
  )

  return (
    <div className="bg-blue-50/50 border border-blue-200 rounded-lg px-4 py-4 flex flex-col gap-3">
      <span className="text-[14px] font-bold text-vatican-blue">Thêm buổi lễ mới</span>
      <div className="flex flex-col gap-1.5">
        <AdminLabel>Ngày *</AdminLabel>
        <AdminInput placeholder="VD: Thứ Hai – Thứ Sáu"
          value={dayLabel} onChange={e => setDayLabel(e.target.value)} />
      </div>
      <div className="flex flex-col gap-2">
        <AdminLabel>Giờ lễ</AdminLabel>
        {times.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {times.map(t => (
              <span key={t} className="flex items-center gap-1.5 bg-white text-vatican-dark font-bold text-[13px] px-2.5 py-1 rounded-lg border border-gray-200">
                {t}
                <button onClick={() => setTimes(p => p.filter(x => x !== t))}
                  className="text-gray-400 hover:text-red-500 transition-colors"><X size={10} /></button>
              </span>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <AdminInput type="time" className="py-1 h-8 text-[14px]"
            value={newTime} onChange={e => setNewTime(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTime()} />
          <AdminButton onClick={addTime} variant="secondary" size="compact" className="border-dashed border-gray-300 h-auto">
            <Plus size={13} />Thêm giờ
          </AdminButton>
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <AdminButton onClick={save} disabled={saving || !dayLabel.trim()} size="compact">
          <Plus size={13} />{saving ? 'Đang lưu...' : 'Thêm'}
        </AdminButton>
        <AdminButton onClick={reset} variant="secondary" size="compact">
          Hủy
        </AdminButton>
      </div>
    </div>
  )
}

// ── Main export ──────────────────────────────────────────────────────────
export function MassScheduleEditor({ meta, slots: initial }: { meta: MassMeta; slots: MassSlot[] }) {
  const [slots,   setSlots]   = useState(initial)
  const [form,    setForm]    = useState({ location_name: meta.location_name, note: meta.note })
  const [saving,  setSaving]  = useState(false)
  const [saved,   setSaved]   = useState(false)
  const router = useRouter()
  const maxOrder = Math.max(0, ...slots.map(s => s.sort_order))

  const saveMeta = async () => {
    setSaving(true)
    await createClient().from('mass_schedule_meta')
      .update({ ...form, updated_at: new Date().toISOString() })
      .eq('id', meta.id)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
    router.refresh()
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = slots.findIndex(s => s.id === active.id)
    const newIndex  = slots.findIndex(s => s.id === over.id)
    const reordered = arrayMove(slots, oldIndex, newIndex)
    setSlots(reordered)
    const supabase = createClient()
    await Promise.all(reordered.map((s, i) =>
      supabase.from('mass_schedule').update({ sort_order: i + 1 }).eq('id', s.id)
    ))
  }

  return (
    <>
      {/* Action bar */}
      <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between gap-4 shrink-0">
        <p className="text-[14px] text-gray-500 font-medium">Lịch giờ lễ và thông tin địa điểm hiển thị trên trang Cần Biết</p>
        <div className="flex items-center gap-3 shrink-0">
          {saved && (
            <span className="flex items-center gap-1.5 text-[14px] text-green-600 font-semibold">
              <CheckCircle size={13} />Đã lưu
            </span>
          )}
          <AdminButton onClick={saveMeta} disabled={saving}>
            <Save size={13} />{saving ? 'Đang lưu...' : 'Lưu'}
          </AdminButton>
        </div>
      </div>

      {/* Body — 2 cột */}
      <div className="flex divide-x divide-gray-100 min-h-[400px]">

        {/* Cột trái: Meta */}
        <div className="flex flex-col w-2/5 shrink-0">
          <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/60">
            <p className="text-[13px] font-bold uppercase tracking-widest text-gray-500">Địa điểm &amp; ghi chú</p>
          </div>
          <div className="p-6 flex-1">
            <MetaPanel form={form} onChange={setForm} />
          </div>
        </div>

        {/* Cột phải: Danh sách buổi lễ */}
        <div className="flex flex-col flex-1">
          <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/60">
            <p className="text-[13px] font-bold uppercase tracking-widest text-gray-500">Lịch buổi lễ</p>
          </div>
          <div className="p-6 flex flex-col gap-3">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <div className="flex flex-col gap-2">
                <SortableContext items={slots.map(s => s.id)} strategy={verticalListSortingStrategy}>
                  {slots.length === 0 ? (
                    <EmptyState
                      icon={<Clock size={22} strokeWidth={1.5} className="text-gray-300" />}
                      message="Chưa có buổi lễ nào"
                    />
                  ) : slots.map(slot => (
                    <SlotRow key={slot.id} slot={slot}
                      onDeleted={() => setSlots(prev => prev.filter(x => x.id !== slot.id))} />
                  ))}
                </SortableContext>
              </div>
            </DndContext>
            <AddSlotForm maxOrder={maxOrder} onAdded={slot => setSlots(prev => [...prev, slot])} />
          </div>
        </div>
      </div>
    </>
  )
}
