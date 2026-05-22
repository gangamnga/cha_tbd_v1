'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Check, ChevronRight, Pencil, X, Trash2, Plus, GripVertical } from 'lucide-react'
import { ConfirmDeleteModal } from '@/components/admin/ConfirmDeleteModal'
import { AdminButton, AdminIconButton, AdminInput, AdminTextarea } from '@/components/admin/ui'
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
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

type Step = { id: string; year: string; title: string; detail: string; done: boolean; highlight: boolean; sort_order: number }

function StepCard({ step, tableName, onDeleted }: { step: Step; tableName: string; onDeleted: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: step.id })
  const style = { transform: CSS.Transform.toString(transform), transition }

  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ year: step.year, title: step.title, detail: step.detail, done: step.done, highlight: step.highlight })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const router = useRouter()

  const db = () => createClient().from(tableName)

  const save = async () => {
    setSaving(true)
    await db().update({ ...form, updated_at: new Date().toISOString() }).eq('id', step.id)
    setSaving(false)
    setEditing(false)
    router.refresh()
  }

  const remove = async () => {
    setDeleting(true)
    await db().delete().eq('id', step.id)
    onDeleted()
    router.refresh()
  }

  const toggleDone = async () => {
    const newDone = !form.done
    setForm(f => ({ ...f, done: newDone }))
    await db().update({ done: newDone, updated_at: new Date().toISOString() }).eq('id', step.id)
    router.refresh()
  }

  const reset = () => {
    setEditing(false)
    setForm({ year: step.year, title: step.title, detail: step.detail, done: step.done, highlight: step.highlight })
  }

  if (editing) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg px-4 py-4 flex flex-col gap-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm md:text-base font-bold text-gray-700">Chỉnh sửa mốc</span>
          <AdminIconButton onClick={reset}><X size={15} /></AdminIconButton>
        </div>
        {[{ label: 'Ngày / Tháng / Năm', key: 'year' as const }, { label: 'Tiêu đề', key: 'title' as const }].map(({ label, key }) => (
          <label key={key} className="flex flex-col gap-1">
            <span className="text-[13px] font-bold uppercase tracking-widest text-gray-400">{label}</span>
            <AdminInput
              value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
          </label>
        ))}
        <label className="flex flex-col gap-1">
          <span className="text-[13px] font-bold uppercase tracking-widest text-gray-400">Mô tả</span>
          <AdminTextarea rows={3} className="resize-none"
            value={form.detail} onChange={e => setForm(f => ({ ...f, detail: e.target.value }))} />
        </label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.done} onChange={e => setForm(f => ({ ...f, done: e.target.checked }))} className="w-4 h-4 accent-green-500" />
            <span className="text-sm font-bold text-gray-600">Đã hoàn thành</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.highlight} onChange={e => setForm(f => ({ ...f, highlight: e.target.checked }))} className="w-4 h-4 accent-vatican-blue" />
            <span className="text-sm font-bold text-gray-600">Nổi bật</span>
          </label>
        </div>
        <div className="flex gap-2 pt-1">
          <AdminButton onClick={save} disabled={saving} className="text-[14px]">
            {saving ? 'Đang lưu...' : 'Lưu'}
          </AdminButton>
          <AdminButton onClick={reset} variant="secondary" className="text-[14px]">
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
      className={`bg-white border border-gray-200 flex items-start gap-3 px-3 py-3.5 rounded-lg ${isDragging ? 'opacity-40 bg-blue-50' : ''}`}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        suppressHydrationWarning
        className="cursor-grab active:cursor-grabbing shrink-0 mt-1 text-gray-300 hover:text-gray-400 touch-none"
        tabIndex={-1}
      >
        <GripVertical size={14} />
      </button>

      {/* Done toggle */}
      <button onClick={toggleDone} className="shrink-0 mt-0.5">
        {form.done ? (
          <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center hover:opacity-80 transition-opacity">
            <Check size={14} strokeWidth={3} className="text-white" />
          </div>
        ) : (
          <div className="w-6 h-6 rounded-full bg-vatican-blue flex items-center justify-center hover:opacity-80 transition-opacity">
            <ChevronRight size={14} strokeWidth={3} className="text-white" />
          </div>
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-baseline gap-2 mb-1.5">
          <span className={`text-sm md:text-base font-black uppercase tracking-wide ${step.highlight ? 'text-vatican-blue' : 'text-gray-400'}`}>{step.year}</span>
          <span className="text-sm md:text-base font-bold text-vatican-dark">{form.title}</span>
        </div>
        <p className="text-sm text-gray-600 leading-relaxed">{form.detail}</p>
      </div>

      {/* Actions */}
      <div className="flex gap-1 shrink-0">
        <AdminIconButton onClick={() => setEditing(true)} variant="edit">
          <Pencil size={13} />
        </AdminIconButton>
        <AdminIconButton onClick={() => setShowDeleteModal(true)} disabled={deleting} variant="danger">
          <Trash2 size={13} />
        </AdminIconButton>
      </div>

      {showDeleteModal && (
        <ConfirmDeleteModal
          title="Xóa mốc?"
          description={`${step.year ? step.year + ' — ' : ''}${step.title}`}
          onConfirm={remove}
          onCancel={() => setShowDeleteModal(false)}
          loading={deleting}
        />
      )}
    </div>
  )
}

function AddStepForm({ maxOrder, tableName, onAdded }: { maxOrder: number; tableName: string; onAdded: (step: Step) => void }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ year: '', title: '', detail: '', done: false, highlight: false })
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  const save = async () => {
    if (!form.title.trim()) return
    setSaving(true)
    const { data } = await createClient()
      .from(tableName)
      .insert({ ...form, sort_order: maxOrder + 1, updated_at: new Date().toISOString() })
      .select()
      .single()
    setSaving(false)
    if (data) {
      onAdded(data as Step)
      setOpen(false)
      setForm({ year: '', title: '', detail: '', done: false, highlight: false })
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
      {[{ label: 'Ngày / Tháng / Năm', key: 'year' as const }, { label: 'Tiêu đề', key: 'title' as const }].map(({ label, key }) => (
        <label key={key} className="flex flex-col gap-1">
          <span className="text-[13px] font-bold uppercase tracking-widest text-gray-400">{label}</span>
          <AdminInput
            value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
        </label>
      ))}
      <label className="flex flex-col gap-1">
        <span className="text-[13px] font-bold uppercase tracking-widest text-gray-400">Mô tả</span>
        <AdminTextarea rows={2} className="bg-white resize-none"
          value={form.detail} onChange={e => setForm(f => ({ ...f, detail: e.target.value }))} />
      </label>
      <div className="flex gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.done} onChange={e => setForm(f => ({ ...f, done: e.target.checked }))} className="w-4 h-4 accent-green-500" />
          <span className="text-sm font-bold text-gray-600">Đã hoàn thành</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.highlight} onChange={e => setForm(f => ({ ...f, highlight: e.target.checked }))} className="w-4 h-4 accent-vatican-blue" />
          <span className="text-sm font-bold text-gray-600">Nổi bật</span>
        </label>
      </div>
      <div className="flex gap-2">
        <AdminButton onClick={save} disabled={saving || !form.title.trim()} className="text-[14px]">
          <Plus size={14} />{saving ? 'Đang lưu...' : 'Thêm'}
        </AdminButton>
        <AdminButton onClick={() => setOpen(false)} variant="secondary" className="text-[14px]">
          Hủy
        </AdminButton>
      </div>
    </div>
  )
}

export function BeatificationEditor({ steps: initial, tableName = 'beatification_steps' }: { steps: Step[]; tableName?: string }) {
  const [steps, setSteps] = useState(initial)
  const maxOrder = Math.max(0, ...steps.map(s => s.sort_order))

  const sensors = useDndSensors()

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = steps.findIndex(s => s.id === active.id)
    const newIndex = steps.findIndex(s => s.id === over.id)
    const reordered = arrayMove(steps, oldIndex, newIndex)
    setSteps(reordered)

    const supabase = createClient()
    await Promise.all(
      reordered.map((s, i) => supabase.from(tableName).update({ sort_order: i + 1 }).eq('id', s.id))
    )
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 max-h-[calc(100vh-220px)] overflow-y-auto pr-0.5">
          <SortableContext items={steps.map(s => s.id)} strategy={verticalListSortingStrategy}>
            {steps.map(s => (
              <StepCard key={s.id} step={s} tableName={tableName} onDeleted={() => setSteps(prev => prev.filter(x => x.id !== s.id))} />
            ))}
          </SortableContext>
        </div>
        <AddStepForm maxOrder={maxOrder} tableName={tableName} onAdded={newStep => setSteps(prev => [...prev, newStep])} />
      </div>
    </DndContext>
  )
}
