'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Pencil, X, Save, Trash2, Plus, GripVertical } from 'lucide-react'
import { ConfirmDeleteModal } from '@/components/admin/ConfirmDeleteModal'
import { AdminButton, AdminInput, AdminTextarea } from '@/components/admin/ui'
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

type Milestone = { id: string; year: string; title: string; description: string; sort_order: number }

function MilestoneRow({ m, onDeleted }: { m: Milestone; onDeleted: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: m.id })
  const style = { transform: CSS.Transform.toString(transform), transition }

  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ year: m.year, title: m.title, description: m.description })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const router = useRouter()

  const reset = () => {
    setEditing(false)
    setForm({ year: m.year, title: m.title, description: m.description })
  }

  const save = async () => {
    setSaving(true)
    await createClient().from('biography_milestones').update(form).eq('id', m.id)
    setSaving(false)
    setEditing(false)
    router.refresh()
  }

  const remove = async () => {
    setDeleting(true)
    await createClient().from('biography_milestones').delete().eq('id', m.id)
    onDeleted()
    router.refresh()
  }

  if (editing) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg px-4 py-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-sm md:text-base font-bold text-gray-700">Chỉnh sửa mốc</span>
          <button onClick={reset} className="text-gray-400 hover:text-gray-600"><X size={15} /></button>
        </div>
        {[{ label: 'Năm', key: 'year' as const }, { label: 'Tiêu đề', key: 'title' as const }].map(({ label, key }) => (
          <label key={key} className="flex flex-col gap-1">
            <span className="text-[13px] font-bold uppercase tracking-widest text-gray-400">{label}</span>
            <AdminInput
              value={form[key]}
              onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
            />
          </label>
        ))}
        <label className="flex flex-col gap-1">
          <span className="text-[13px] font-bold uppercase tracking-widest text-gray-400">Mô tả</span>
          <AdminTextarea
            rows={3}
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          />
        </label>
        <div className="flex gap-2">
          <AdminButton onClick={save} disabled={saving} className="text-[14px]">
            <Save size={14} />{saving ? 'Đang lưu...' : 'Lưu'}
          </AdminButton>
          <AdminButton onClick={reset} variant="secondary">
            Hủy
          </AdminButton>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 bg-white border border-gray-100 rounded-lg px-3 py-3 ${isDragging ? 'opacity-40 bg-blue-50' : ''}`}
    >
      <button
        {...attributes}
        {...listeners}
        suppressHydrationWarning
        className="cursor-grab active:cursor-grabbing shrink-0 text-gray-300 hover:text-gray-400 touch-none"
        tabIndex={-1}
      >
        <GripVertical size={14} />
      </button>
      <span className="text-vatican-blue font-black text-sm md:text-base leading-none tracking-tight shrink-0 w-[85px]">{form.year}</span>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm md:text-base text-vatican-dark leading-snug">{form.title}</p>
        <p className="text-sm text-gray-500 leading-relaxed mt-0.5 line-clamp-2">{form.description}</p>
      </div>
      <div className="flex gap-1 shrink-0">
        <button onClick={() => setEditing(true)}
          className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-vatican-blue transition-colors">
          <Pencil size={13} />
        </button>
        <button onClick={() => setShowDeleteModal(true)} disabled={deleting}
          className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50">
          <Trash2 size={13} />
        </button>
      </div>
      {showDeleteModal && (
        <ConfirmDeleteModal
          title="Xóa mốc hành trình?"
          description={`${m.year} — ${m.title}`}
          onConfirm={remove}
          onCancel={() => setShowDeleteModal(false)}
          loading={deleting}
        />
      )}
    </div>
  )
}

function AddMilestoneForm({ maxOrder, onAdded }: { maxOrder: number; onAdded: (m: Milestone) => void }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ year: '', title: '', description: '' })
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  const save = async () => {
    if (!form.year.trim() || !form.title.trim()) return
    setSaving(true)
    const { data } = await createClient()
      .from('biography_milestones')
      .insert({ ...form, sort_order: maxOrder + 1 })
      .select()
      .single()
    setSaving(false)
    if (data) {
      onAdded(data as Milestone)
      setOpen(false)
      setForm({ year: '', title: '', description: '' })
      router.refresh()
    }
  }

  if (!open) return (
    <button onClick={() => setOpen(true)}
      className="flex items-center gap-1.5 w-full justify-center py-2.5 rounded-lg border border-dashed border-gray-300 text-[14px] font-bold text-gray-500 hover:border-vatican-blue hover:text-vatican-blue transition-colors">
      <Plus size={14} />Thêm mốc mới
    </button>
  )

  return (
    <div className="bg-blue-50/50 border border-blue-200 rounded-lg px-4 py-4 flex flex-col gap-3">
      <span className="text-sm md:text-base font-bold text-vatican-blue">Thêm mốc mới</span>
      {[{ label: 'Năm', key: 'year' as const }, { label: 'Tiêu đề', key: 'title' as const }].map(({ label, key }) => (
        <label key={key} className="flex flex-col gap-1">
          <span className="text-[13px] font-bold uppercase tracking-widest text-gray-400">{label}</span>
          <AdminInput
            value={form[key]}
            onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          />
        </label>
      ))}
      <label className="flex flex-col gap-1">
        <span className="text-[13px] font-bold uppercase tracking-widest text-gray-400">Mô tả</span>
        <AdminTextarea
          rows={2}
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
        />
      </label>
      <div className="flex gap-2">
        <AdminButton onClick={save} disabled={saving || !form.year.trim() || !form.title.trim()} className="text-[14px]">
          <Plus size={14} />{saving ? 'Đang lưu...' : 'Thêm'}
        </AdminButton>
        <AdminButton onClick={() => setOpen(false)} variant="secondary" className="text-[14px]">
          Hủy
        </AdminButton>
      </div>
    </div>
  )
}

export function MilestonesEditor({ milestones: initial }: { milestones: Milestone[] }) {
  const [milestones, setMilestones] = useState(initial)
  const maxOrder = Math.max(0, ...milestones.map(m => m.sort_order))

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = milestones.findIndex(m => m.id === active.id)
    const newIndex = milestones.findIndex(m => m.id === over.id)
    const reordered = arrayMove(milestones, oldIndex, newIndex)
    setMilestones(reordered)

    const supabase = createClient()
    await Promise.all(
      reordered.map((m, i) => supabase.from('biography_milestones').update({ sort_order: i + 1 }).eq('id', m.id))
    )
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 max-h-[calc(100vh-220px)] overflow-y-auto pr-0.5">
          <SortableContext items={milestones.map(m => m.id)} strategy={verticalListSortingStrategy}>
            {milestones.map(m => (
              <MilestoneRow key={m.id} m={m} onDeleted={() => setMilestones(prev => prev.filter(x => x.id !== m.id))} />
            ))}
          </SortableContext>
        </div>
        <AddMilestoneForm maxOrder={maxOrder} onAdded={newM => setMilestones(prev => [...prev, newM])} />
      </div>
    </DndContext>
  )
}
