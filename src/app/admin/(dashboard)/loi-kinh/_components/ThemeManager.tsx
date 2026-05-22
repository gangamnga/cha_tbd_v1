'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Plus, Pencil, Trash2, Tag, Save, Loader2 } from 'lucide-react'
import { ConfirmDeleteModal } from '@/components/admin/ConfirmDeleteModal'
import { AdminModal } from '@/components/admin/AdminModal'
import { AdminButton, AdminInput, AdminLabel, ModalHeader } from '@/components/admin/ui'

export type Theme = { id: string; label: string; sort_order: number }

export function ThemeManager({
  themes,
  onThemesChange,
}: {
  themes: Theme[]
  onThemesChange: (themes: Theme[]) => void
}) {
  const [isOpen, setIsOpen]           = useState(false)
  const [editing, setEditing]         = useState<Theme | null>(null)
  const [label, setLabel]             = useState('')
  const [saving, setSaving]           = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Theme | null>(null)
  const [deleting, setDeleting]       = useState(false)
  const [err, setErr]                 = useState('')

  const openAdd  = () => { setLabel(''); setEditing(null); setErr(''); setIsOpen(true) }
  const openEdit = (t: Theme) => { setLabel(t.label); setEditing(t); setErr(''); setIsOpen(true) }
  const close    = () => { setIsOpen(false); setEditing(null); setErr('') }

  const handleSave = async () => {
    if (!label.trim()) { setErr('Vui lòng nhập tên chủ đề.'); return }
    setSaving(true); setErr('')
    const supabase = createClient()

    if (editing) {
      const { data, error } = await supabase
        .from('prayer_themes').update({ label: label.trim() })
        .eq('id', editing.id).select().single()
      if (error) { setErr(error.message); setSaving(false); return }
      onThemesChange(themes.map(t => t.id === editing.id ? data : t))
    } else {
      const id = `theme-${Date.now()}`
      const maxOrder = Math.max(0, ...themes.map(t => t.sort_order))
      const { data, error } = await supabase
        .from('prayer_themes')
        .insert({ id, label: label.trim(), sort_order: maxOrder + 1 })
        .select().single()
      if (error) { setErr(error.message); setSaving(false); return }
      onThemesChange([...themes, data])
    }
    setSaving(false); close()
  }

  const remove = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    await createClient().from('prayer_themes').delete().eq('id', deleteTarget.id)
    onThemesChange(themes.filter(t => t.id !== deleteTarget.id))
    setDeleting(false); setDeleteTarget(null)
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-[16px] font-black text-vatican-dark">Chủ đề</h2>
            <p className="text-[16px] text-gray-400 mt-0.5">{themes.length} chủ đề</p>
          </div>
          <AdminButton
            variant="secondary"
            onClick={openAdd}
            className="h-9 px-3 text-[14px]"
          >
            <Plus size={13} strokeWidth={2.5} /> Thêm chủ đề
          </AdminButton>
        </div>

        <div className="flex flex-wrap gap-2">
          {themes.length === 0 ? (
            <p className="text-[16px] text-gray-400">Chưa có chủ đề nào.</p>
          ) : themes.map(t => (
            <div key={t.id} className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 group">
              <Tag size={12} className="text-vatican-blue shrink-0" />
              <span className="text-[16px] font-semibold text-gray-700">{t.label}</span>
              <button
                onClick={() => openEdit(t)}
                className="inline-flex items-center justify-center w-6 h-6 rounded hover:bg-gray-200 text-gray-400 hover:text-vatican-blue transition-colors ml-0.5"
              >
                <Pencil size={11} />
              </button>
              <button
                onClick={() => setDeleteTarget(t)}
                className="inline-flex items-center justify-center w-6 h-6 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
              >
                <Trash2 size={11} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Modal thêm/sửa */}
      {isOpen && (
        <AdminModal onClose={close} maxWidth="max-w-sm" disabled={saving}>
          <ModalHeader
            title={editing ? 'Sửa chủ đề' : 'Thêm chủ đề'}
            onClose={close}
          />
          {/* Body */}
          <div className="px-6 py-6 flex flex-col gap-3">
            <div>
              <AdminLabel>Tên chủ đề</AdminLabel>
              <AdminInput
                value={label}
                onChange={e => setLabel(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSave()}
                autoFocus
                placeholder="Ví dụ: Gia đình bình an..."
              />
            </div>
            {err && <p className="text-[14px] text-red-600 font-semibold">{err}</p>}
          </div>
          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
            <AdminButton variant="secondary" onClick={close}>
              Huỷ
            </AdminButton>
            <AdminButton
              onClick={handleSave}
              disabled={saving || !label.trim()}
            >
              {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
              {saving ? 'Đang lưu...' : 'Lưu'}
            </AdminButton>
          </div>
        </AdminModal>
      )}

      {deleteTarget && (
        <ConfirmDeleteModal
          title="Xóa chủ đề?"
          description={`"${deleteTarget.label}"`}
          onConfirm={remove}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </>
  )
}
