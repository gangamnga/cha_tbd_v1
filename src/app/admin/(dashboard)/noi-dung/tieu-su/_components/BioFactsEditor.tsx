'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Pencil, X, Trash2, Plus, GripVertical } from 'lucide-react'
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

type BioFact = { id: string; label: string; value: string; sort_order: number }

// ── Sortable existing row ───────────────────────────────────────────────
function FactRow({ fact, onDeleted }: { fact: BioFact; onDeleted: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: fact.id })
  const style = { transform: CSS.Transform.toString(transform), transition }

  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ label: fact.label, value: fact.value })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const router = useRouter()

  const save = async () => {
    setSaving(true)
    await createClient().from('bio_facts').update(form).eq('id', fact.id)
    setSaving(false)
    setEditing(false)
    router.refresh()
  }

  const remove = async () => {
    setDeleting(true)
    await createClient().from('bio_facts').delete().eq('id', fact.id)
    onDeleted()
    router.refresh()
  }

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`border-b border-gray-100 ${isDragging ? 'opacity-40 bg-blue-50' : ''}`}
    >
      {/* Drag handle */}
      <td className="pl-2 pr-1 w-7 align-middle">
        <button
          {...attributes}
          {...listeners}
          suppressHydrationWarning
          className="cursor-grab active:cursor-grabbing flex items-center justify-center text-gray-300 hover:text-gray-400 py-3 touch-none"
          tabIndex={-1}
        >
          <GripVertical size={14} />
        </button>
      </td>

      <td className="py-3 pr-3 align-middle w-[140px] shrink-0">
        {editing ? (
          <AdminInput
            className="w-full"
            value={form.label}
            onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
          />
        ) : (
          <span className="text-xs md:text-sm font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">{fact.label}</span>
        )}
      </td>

      <td className="py-3 pr-4 align-middle">
        {editing ? (
          <div className="flex flex-col gap-2">
            <AdminTextarea rows={2}
              className="w-full resize-none"
              value={form.value}
              onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
            />
            <div className="flex gap-2">
              <AdminButton onClick={save} disabled={saving} className="text-[14px]">
                {saving ? 'Đang lưu...' : 'Lưu'}
              </AdminButton>
              <AdminButton onClick={() => { setEditing(false); setForm({ label: fact.label, value: fact.value }) }}
                variant="secondary" className="text-[14px]">
                Hủy
              </AdminButton>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm md:text-base text-vatican-dark font-bold leading-snug whitespace-pre-line flex-1">{fact.value}</span>
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
          </div>
        )}
      </td>

      {showDeleteModal && (
        <ConfirmDeleteModal
          title="Xóa dòng thông tin?"
          description={`"${fact.label}"`}
          onConfirm={remove}
          onCancel={() => setShowDeleteModal(false)}
          loading={deleting}
        />
      )}
    </tr>
  )
}

// ── New inline row ──────────────────────────────────────────────────────
function NewFactRow({ maxOrder, onSaved, onCancel }: {
  maxOrder: number
  onSaved: (fact: BioFact) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState({ label: '', value: '' })
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  const save = async () => {
    if (!form.label.trim() || !form.value.trim()) return
    setSaving(true)
    const { data } = await createClient()
      .from('bio_facts')
      .insert({ ...form, sort_order: maxOrder + 1 })
      .select()
      .single()
    setSaving(false)
    if (data) onSaved(data as BioFact)
    router.refresh()
  }

  return (
    <tr className="bg-blue-50/40 border-t border-blue-100">
      <td className="pl-2 pr-1 w-7 align-middle">
        <GripVertical size={14} className="text-gray-200 mx-auto" />
      </td>
      <td className="py-3 pr-3 align-top w-[130px]">
        <AdminInput
          placeholder="Nhãn"
          autoFocus
          className="w-full bg-white"
          value={form.label}
          onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
        />
      </td>
      <td className="py-3 pr-4 align-top">
        <div className="flex items-start gap-2">
          <AdminTextarea
            rows={2}
            placeholder="Nội dung"
            className="flex-1 resize-none bg-white"
            value={form.value}
            onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
          />
          <div className="flex flex-col gap-1 shrink-0">
            <AdminButton onClick={save} disabled={saving || !form.label.trim() || !form.value.trim()}
              size="compact" className="text-[14px]">
              {saving ? '...' : 'Lưu'}
            </AdminButton>
            <AdminButton onClick={onCancel} variant="secondary"
              size="compact" className="text-[14px]">
              <X size={12} />Hủy
            </AdminButton>
          </div>
        </div>
      </td>
    </tr>
  )
}

// ── Main export ──────────────────────────────────────────────────────────
export function BioFactsEditor({ facts: initial }: { facts: BioFact[] }) {
  const [facts, setFacts] = useState(initial)
  const [addingNew, setAddingNew] = useState(false)

  const maxOrder = Math.max(0, ...facts.map(f => f.sort_order))

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = facts.findIndex(f => f.id === active.id)
    const newIndex = facts.findIndex(f => f.id === over.id)
    const reordered = arrayMove(facts, oldIndex, newIndex)
    setFacts(reordered)

    const supabase = createClient()
    await Promise.all(
      reordered.map((f, i) => supabase.from('bio_facts').update({ sort_order: i + 1 }).eq('id', f.id))
    )
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="flex-1 min-w-0 bg-white rounded-lg border border-gray-100 flex flex-col">
        <div className="overflow-y-auto max-h-[calc(100vh-280px)]">
          <table className="w-full">
            <tbody>
              <SortableContext items={facts.map(f => f.id)} strategy={verticalListSortingStrategy}>
                {facts.map(f => (
                  <FactRow
                    key={f.id}
                    fact={f}
                    onDeleted={() => setFacts(prev => prev.filter(x => x.id !== f.id))}
                  />
                ))}
              </SortableContext>
              {addingNew && (
                <NewFactRow
                  maxOrder={maxOrder}
                  onSaved={newFact => { setFacts(prev => [...prev, newFact]); setAddingNew(false) }}
                  onCancel={() => setAddingNew(false)}
                />
              )}
            </tbody>
          </table>
        </div>
        {!addingNew && (
          <button
            onClick={() => setAddingNew(true)}
            className="flex items-center gap-1.5 w-full justify-center py-2.5 border-t border-dashed border-gray-300 text-[14px] font-bold text-gray-500 hover:text-vatican-blue hover:border-vatican-blue transition-colors rounded-b-lg"
          >
            <Plus size={14} />Thêm mốc mới
          </button>
        )}
      </div>
    </DndContext>
  )
}
