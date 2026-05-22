'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Plus, Pencil, Trash2, X, BookOpen, Check, Loader2, Eye, EyeOff } from 'lucide-react'
import { ConfirmDeleteModal } from '@/components/admin/ConfirmDeleteModal'
import { AdminModal } from '@/components/admin/AdminModal'
import { AdminSearchInput } from '@/components/admin/AdminSearchInput'
import {
  AdminButton,
  AdminIconButton,
  AdminInput,
  AdminTextarea,
  AdminLabel,
  AdminBadge,
  AdminCheckbox,
  ModalHeader,
  ModalFooter,
  ModalStatusToggle,
} from '@/components/admin/ui'
import { EmptyState } from '@/components/admin/EmptyState'
import { useAdminSearch } from '@/hooks/useAdminSearch'
import { MODAL_WIDTHS } from '@/lib/admin-constants'

type Prayer = {
  id: string
  title: string
  content: string
  themes: string[]
  sort_order: number
  is_active: boolean
}

type Theme = { id: string; label: string; sort_order: number }

const EMPTY_PRAYER = { title: '', content: '', themes: [] as string[], sort_order: 0, is_active: true }

export function PrayerManager({
  initialPrayers,
  initialThemes,
}: {
  initialPrayers: Prayer[]
  initialThemes: Theme[]
}) {
  const [prayers, setPrayers] = useState(initialPrayers)
  const [themes, setThemes]   = useState<Theme[]>(initialThemes)

  const { search, setSearch, searchOpen, setSearchOpen, clearSearch } = useAdminSearch()
  const filtered = search.trim()
    ? prayers.filter(p => p.title.toLowerCase().includes(search.trim().toLowerCase()))
    : prayers

  const [isOpen, setIsOpen]             = useState(false)
  const [editing, setEditing]           = useState<Prayer | null>(null)
  const [form, setForm]                 = useState(EMPTY_PRAYER)
  const [saving, setSaving]             = useState(false)
  const [error, setError]               = useState('')
  const [deleteTarget, setDeleteTarget] = useState<Prayer | null>(null)
  const [deleting, setDeleting]         = useState(false)

  const [editingTheme, setEditingTheme]   = useState<Theme | null>(null)
  const [newThemeLabel, setNewThemeLabel] = useState('')
  const [themeLoading, setThemeLoading]   = useState(false)

  const openAdd = useCallback(() => { setForm(EMPTY_PRAYER); setEditing(null); setError(''); setIsOpen(true) }, [])
  const openEdit = useCallback((p: Prayer) => {
    setForm({ title: p.title, content: p.content, themes: p.themes ?? [], sort_order: p.sort_order, is_active: p.is_active })
    setEditing(p); setError(''); setIsOpen(true)
  }, [])
  const close = useCallback(() => { setIsOpen(false); setEditing(null); setEditingTheme(null); setNewThemeLabel('') }, [])

  const toggleTheme = useCallback((id: string) =>
    setForm(f => ({ ...f, themes: f.themes.includes(id) ? f.themes.filter(t => t !== id) : [...f.themes, id] })), [])

  const handleSave = useCallback(async () => {
    if (!form.title.trim() || !form.content.trim()) { setError('Vui lòng điền tiêu đề và nội dung.'); return }
    setSaving(true); setError('')
    const supabase = createClient()
    if (editing) {
      const { data, error: saveErr } = await supabase
        .from('prayers').update({ ...form, updated_at: new Date().toISOString() })
        .eq('id', editing.id).select().single()
      if (saveErr) { setError(saveErr.message); setSaving(false); return }
      setPrayers(prev => prev.map(p => p.id === editing.id ? data : p))
    } else {
      const { data, error: saveErr } = await supabase.from('prayers').insert(form).select().single()
      if (saveErr) { setError(saveErr.message); setSaving(false); return }
      setPrayers(prev => [...prev, data])
    }
    setSaving(false); close()
  }, [form, editing, close])

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return
    setDeleting(true)
    const { error: deleteErr } = await createClient().from('prayers').delete().eq('id', deleteTarget.id)
    if (!deleteErr) setPrayers(prev => prev.filter(p => p.id !== deleteTarget.id))
    setDeleting(false)
    setDeleteTarget(null)
  }, [deleteTarget])

  const toggleActive = useCallback(async (p: Prayer) => {
    const { error: toggleErr } = await createClient().from('prayers').update({ is_active: !p.is_active }).eq('id', p.id)
    if (!toggleErr) setPrayers(prev => prev.map(x => x.id === p.id ? { ...x, is_active: !x.is_active } : x))
  }, [])

  // --- Theme CRUD inside modal ---
  const addTheme = useCallback(async () => {
    const label = newThemeLabel.trim()
    if (!label) return
    setThemeLoading(true)
    const id = `theme-${Date.now()}`
    const maxOrder = Math.max(0, ...themes.map(t => t.sort_order))
    const { data, error: addErr } = await createClient()
      .from('prayer_themes').insert({ id, label, sort_order: maxOrder + 1 }).select().single()
    if (!addErr && data) { setThemes(prev => [...prev, data]); setNewThemeLabel('') }
    setThemeLoading(false)
  }, [newThemeLabel, themes])

  const saveTheme = useCallback(async () => {
    if (!editingTheme || !editingTheme.label.trim()) return
    setThemeLoading(true)
    const { data, error: saveErr } = await createClient()
      .from('prayer_themes').update({ label: editingTheme.label.trim() })
      .eq('id', editingTheme.id).select().single()
    if (!saveErr && data) setThemes(prev => prev.map(t => t.id === data.id ? data : t))
    setEditingTheme(null)
    setThemeLoading(false)
  }, [editingTheme])

  const deleteTheme = useCallback(async (id: string) => {
    setThemeLoading(true)
    const { error: deleteErr } = await createClient().from('prayer_themes').delete().eq('id', id)
    if (!deleteErr) {
      setThemes(prev => prev.filter(t => t.id !== id))
      setForm(f => ({ ...f, themes: f.themes.filter(t => t !== id) }))
    }
    setThemeLoading(false)
  }, [])

  return (
    <>
      <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between gap-4 bg-gray-50/50">
        <p className="text-[14px] text-gray-500 font-medium">
          Hiện có <strong className="text-vatican-dark">{prayers.length}</strong> lời kinh
          {search.trim() && filtered.length !== prayers.length && (
            <span className="ml-1 text-gray-400">— tìm thấy <strong className="text-vatican-dark">{filtered.length}</strong></span>
          )}
        </p>
        <div className="flex items-center gap-2">
          <AdminSearchInput
            open={searchOpen}
            value={search}
            onOpen={() => setSearchOpen(true)}
            onChange={v => setSearch(v)}
            onClear={clearSearch}
          />
          <AdminButton onClick={openAdd}>
            <Plus size={13} strokeWidth={2.5} /> Thêm lời kinh
          </AdminButton>
        </div>
      </div>

      <div className="bg-white overflow-hidden divide-y divide-gray-100 max-h-[calc(100vh-280px)] overflow-y-auto">
        {!filtered.length ? (
          <EmptyState
            icon={<BookOpen size={22} strokeWidth={1.5} className="text-gray-300" />}
            message={search.trim()
              ? `Không tìm thấy lời kinh nào với "${search}"`
              : <>Chưa có lời kinh nào.{' '}<button onClick={openAdd} className="text-vatican-blue font-bold hover:underline">Thêm ngay</button></>
            }
          />
        ) : filtered.map(p => (
          <div key={p.id} className="flex items-start gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
            <div className="flex-1 min-w-0">
              <p className="font-bold text-[15px] text-vatican-dark leading-snug">{p.title}</p>
              <p className="text-[14px] text-gray-400 mt-0.5 line-clamp-1">{p.content}</p>
              {(p.themes ?? []).length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {(p.themes ?? []).map(t => (
                    <AdminBadge key={t} color="amber">
                      {themes.find(x => x.id === t)?.label ?? t}
                    </AdminBadge>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <AdminIconButton
                variant="ghost"
                onClick={() => toggleActive(p)}
                title={p.is_active ? 'Đang hiện trên trang — bấm để ẩn' : 'Đang ẩn — bấm để hiện trên trang'}
                className={p.is_active ? 'text-green-600 hover:text-green-700 hover:bg-green-50' : 'text-gray-300 hover:text-gray-500 hover:bg-gray-100'}
              >
                {p.is_active ? <Eye size={13} /> : <EyeOff size={13} />}
              </AdminIconButton>
              <AdminIconButton variant="edit" onClick={() => openEdit(p)} title="Sửa">
                <Pencil size={13} />
              </AdminIconButton>
              <AdminIconButton variant="danger" onClick={() => setDeleteTarget(p)} title="Xóa">
                <Trash2 size={13} />
              </AdminIconButton>
            </div>
          </div>
        ))}
      </div>

      {isOpen && (
        <AdminModal onClose={close} maxWidth={MODAL_WIDTHS.lg} disabled={saving}>
          <ModalHeader
            title={editing ? 'Chỉnh sửa lời kinh' : 'Thêm lời kinh'}
            onClose={close}
          />

          <div className="px-6 py-6 grid grid-cols-2 gap-6 max-h-[75vh] overflow-y-auto">

            {/* Cột trái: Tiêu đề + Nội dung + Toggle */}
            <div className="flex flex-col gap-4">
              <div>
                <AdminLabel>Tiêu đề</AdminLabel>
                <AdminInput
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Tên lời kinh..."
                />
              </div>

              <div className="flex-1 flex flex-col">
                <AdminLabel>Nội dung</AdminLabel>
                <AdminTextarea
                  value={form.content}
                  onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                  rows={8}
                  className="flex-1 resize-none"
                  placeholder="Nội dung lời kinh..."
                />
              </div>

              <div>
                <AdminLabel>Trạng thái hiển thị</AdminLabel>
                <ModalStatusToggle
                  active={form.is_active}
                  onChange={v => setForm(f => ({ ...f, is_active: v }))}
                  activeLabel="Hiển thị"
                  inactiveLabel="Ẩn"
                />
              </div>
            </div>

            {/* Cột phải: Chủ đề */}
            <div className="flex flex-col">
              <AdminLabel className="mb-2">Chủ đề</AdminLabel>
              <div className="border border-gray-200 rounded-lg overflow-hidden flex-1">
                {themes.length === 0 && (
                  <p className="px-3 py-2.5 text-[15px] text-gray-400">Chưa có chủ đề nào.</p>
                )}
                {themes.map((t, i) => (
                  <div key={t.id} className={`flex items-center gap-2 px-3 py-2 group ${i < themes.length - 1 ? 'border-b border-gray-100' : ''}`}>
                    {editingTheme?.id === t.id ? (
                      <>
                        <AdminInput
                          autoFocus
                          value={editingTheme.label}
                          onChange={e => setEditingTheme({ ...editingTheme, label: e.target.value })}
                          onKeyDown={e => { if (e.key === 'Enter') saveTheme(); if (e.key === 'Escape') setEditingTheme(null) }}
                          className="flex-1 px-2 h-7 text-[14px]"
                        />
                        <AdminIconButton variant="ghost" onClick={saveTheme} disabled={themeLoading} className="hover:bg-green-50 hover:text-green-600">
                          {themeLoading ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                        </AdminIconButton>
                        <AdminIconButton variant="ghost" onClick={() => setEditingTheme(null)}>
                          <X size={13} />
                        </AdminIconButton>
                      </>
                    ) : (
                      <>
                        <AdminCheckbox checked={form.themes.includes(t.id)} onChange={() => toggleTheme(t.id)} />
                        <span className="flex-1 text-[15px] text-gray-700 cursor-pointer select-none" onClick={() => toggleTheme(t.id)}>
                          {t.label}
                        </span>
                        <AdminIconButton variant="edit" onClick={() => setEditingTheme(t)} className="opacity-0 group-hover:opacity-100">
                          <Pencil size={12} />
                        </AdminIconButton>
                        <AdminIconButton variant="danger" onClick={() => deleteTheme(t.id)} className="opacity-0 group-hover:opacity-100">
                          <Trash2 size={12} />
                        </AdminIconButton>
                      </>
                    )}
                  </div>
                ))}
                <div className="flex items-center gap-2 px-3 py-2 border-t border-dashed border-gray-200 bg-gray-50">
                  <input
                    value={newThemeLabel}
                    onChange={e => setNewThemeLabel(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addTheme()}
                    placeholder="Thêm chủ đề mới..."
                    className="flex-1 text-[15px] bg-transparent outline-none text-gray-700 placeholder:text-gray-400"
                  />
                  <AdminIconButton
                    variant="ghost"
                    onClick={addTheme}
                    disabled={!newThemeLabel.trim() || themeLoading}
                    className="hover:bg-gray-200 hover:text-vatican-blue"
                  >
                    {themeLoading ? <Loader2 size={13} className="animate-spin" /> : <Plus size={14} strokeWidth={2.5} />}
                  </AdminIconButton>
                </div>
              </div>
            </div>

          </div>

          <ModalFooter error={error || null} onCancel={close} submitting={saving}>
            <AdminButton onClick={handleSave} disabled={saving}>
              {saving ? 'Đang lưu...' : 'Lưu'}
            </AdminButton>
          </ModalFooter>
        </AdminModal>
      )}

      {deleteTarget && (
        <ConfirmDeleteModal
          title="Xóa lời kinh?"
          description={`"${deleteTarget.title}"`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </>
  )
}
