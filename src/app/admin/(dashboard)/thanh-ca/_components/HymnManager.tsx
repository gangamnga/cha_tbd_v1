'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Plus, Pencil, Trash2, X, Music, Check, Loader2, ImagePlus, Eye, EyeOff } from 'lucide-react'
import { ConfirmDeleteModal } from '@/components/admin/ConfirmDeleteModal'
import { AdminModal } from '@/components/admin/AdminModal'
import Image from 'next/image'
import { AdminButton, AdminIconButton, AdminInput, AdminLabel, AdminBadge, ModalHeader, AdminCheckbox, ModalFooter, ModalStatusToggle, AdminImagePicker } from '@/components/admin/ui'
import { AdminSearchInput } from '@/components/admin/AdminSearchInput'
import { EmptyState } from '@/components/admin/EmptyState'
import { useAdminSearch } from '@/hooks/useAdminSearch'
import { MODAL_WIDTHS } from '@/lib/admin-constants'

type Hymn = {
  id: string
  title: string
  artist: string
  youtube_url: string | null
  image_url: string | null
  playlists: string[]
  sort_order: number
  is_active: boolean
}

type Playlist = { id: string; label: string; cover_image: string | null; sort_order: number }

type Form = {
  title: string
  artist: string
  youtube_url: string
  image_url: string
  playlists: string[]
  sort_order: number
  is_active: boolean
}

const EMPTY: Form = {
  title: '', artist: '', youtube_url: '', image_url: '',
  playlists: [], sort_order: 0, is_active: true,
}

export function HymnManager({
  initialHymns,
  initialPlaylists,
}: {
  initialHymns: Hymn[]
  initialPlaylists: Playlist[]
}) {
  const playlistCoverRef = useRef<HTMLInputElement>(null)

  const [hymns, setHymns]         = useState(initialHymns)
  const [playlists, setPlaylists] = useState<Playlist[]>(initialPlaylists)

  const { search, setSearch, searchOpen, setSearchOpen, clearSearch } = useAdminSearch()
  const searchRef = useRef<HTMLInputElement>(null)
  useEffect(() => { if (searchOpen) searchRef.current?.focus() }, [searchOpen])

  const filtered = search.trim()
    ? hymns.filter(h =>
        h.title.toLowerCase().includes(search.trim().toLowerCase()) ||
        h.artist.toLowerCase().includes(search.trim().toLowerCase())
      )
    : hymns

  const [isOpen, setIsOpen]             = useState(false)
  const [editing, setEditing]           = useState<Hymn | null>(null)
  const [form, setForm]                 = useState<Form>(EMPTY)
  const [saving, setSaving]             = useState(false)
  const [error, setError]               = useState('')
  const [deleteTarget, setDeleteTarget] = useState<Hymn | null>(null)
  const [deleting, setDeleting]         = useState(false)

  const [editingPlaylist, setEditingPlaylist]   = useState<Playlist | null>(null)
  const [newPlaylistLabel, setNewPlaylistLabel] = useState('')
  const [playlistLoading, setPlaylistLoading]   = useState(false)

  const openAdd = () => { setForm(EMPTY); setEditing(null); setError(''); setIsOpen(true) }
  const openEdit = (h: Hymn) => {
    setForm({
      title: h.title, artist: h.artist, youtube_url: h.youtube_url ?? '',
      image_url: h.image_url ?? '', playlists: h.playlists ?? [],
      sort_order: h.sort_order, is_active: h.is_active,
    })
    setEditing(h); setError(''); setIsOpen(true)
  }
  const close = () => {
    setIsOpen(false); setEditing(null); setEditingPlaylist(null); setNewPlaylistLabel('')
  }

  const togglePlaylist = (id: string) =>
    setForm(f => ({
      ...f,
      playlists: f.playlists.includes(id)
        ? f.playlists.filter(p => p !== id)
        : [...f.playlists, id],
    }))

  // Image handling is now encapsulated within AdminImagePicker

  const handleSave = async () => {
    if (!form.title.trim() || !form.artist.trim()) { setError('Vui lòng điền tiêu đề và ca sĩ.'); return }
    setSaving(true); setError('')
    const supabase = createClient()

    const payload = {
      title: form.title.trim(), artist: form.artist.trim(),
      youtube_url: form.youtube_url || null, image_url: form.image_url || null,
      playlists: form.playlists, sort_order: form.sort_order, is_active: form.is_active,
    }

    if (editing) {
      const { data, error: saveErr } = await supabase
        .from('hymns').update({ ...payload, updated_at: new Date().toISOString() })
        .eq('id', editing.id).select().single()
      if (saveErr) { setError(saveErr.message); setSaving(false); return }
      setHymns(prev => prev.map(h => h.id === editing.id ? data : h))
    } else {
      const { data, error: saveErr } = await supabase.from('hymns').insert(payload).select().single()
      if (saveErr) { setError(saveErr.message); setSaving(false); return }
      setHymns(prev => [...prev, data])
    }
    setSaving(false); close()
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    const { error: deleteErr } = await createClient().from('hymns').delete().eq('id', deleteTarget.id)
    if (!deleteErr) setHymns(prev => prev.filter(h => h.id !== deleteTarget.id))
    setDeleting(false)
    setDeleteTarget(null)
  }

  const toggleActive = async (h: Hymn) => {
    const { error: toggleErr } = await createClient().from('hymns').update({ is_active: !h.is_active }).eq('id', h.id)
    if (!toggleErr) setHymns(prev => prev.map(x => x.id === h.id ? { ...x, is_active: !x.is_active } : x))
  }

  // --- Playlist CRUD ---
  const addPlaylist = async () => {
    const label = newPlaylistLabel.trim()
    if (!label) return
    setPlaylistLoading(true)
    const id = `playlist-${Date.now()}`
    const maxOrder = Math.max(0, ...playlists.map(p => p.sort_order))
    const { data, error: addErr } = await createClient()
      .from('hymn_playlists').insert({ id, label, cover_image: null, sort_order: maxOrder + 1 }).select().single()
    if (!addErr && data) { setPlaylists(prev => [...prev, data]); setNewPlaylistLabel('') }
    setPlaylistLoading(false)
  }

  const savePlaylist = async () => {
    if (!editingPlaylist || !editingPlaylist.label.trim()) return
    setPlaylistLoading(true)
    const { data, error: saveErr } = await createClient()
      .from('hymn_playlists').update({ label: editingPlaylist.label.trim(), cover_image: editingPlaylist.cover_image || null })
      .eq('id', editingPlaylist.id).select().single()
    if (!saveErr && data) setPlaylists(prev => prev.map(p => p.id === data.id ? data : p))
    setEditingPlaylist(null)
    setPlaylistLoading(false)
  }

  const deletePlaylist = async (id: string) => {
    setPlaylistLoading(true)
    const { error: deleteErr } = await createClient().from('hymn_playlists').delete().eq('id', id)
    if (!deleteErr) {
      setPlaylists(prev => prev.filter(p => p.id !== id))
      setForm(f => ({ ...f, playlists: f.playlists.filter(p => p !== id) }))
    }
    setPlaylistLoading(false)
  }

  const handlePlaylistCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f || !editingPlaylist) return
    setPlaylistLoading(true)
    const ext = f.name.split('.').pop() ?? 'jpg'
    const fileName = `playlist-${Date.now()}.${ext}`
    const supabase = createClient()
    const { error: uploadErr } = await supabase.storage.from('hymns').upload(fileName, f, { upsert: true })
    if (!uploadErr) {
      const { data: { publicUrl } } = supabase.storage.from('hymns').getPublicUrl(fileName)
      setEditingPlaylist(prev => prev ? { ...prev, cover_image: publicUrl } : null)
    }
    if (playlistCoverRef.current) playlistCoverRef.current.value = ''
    setPlaylistLoading(false)
  }

  return (
    <>
      <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between gap-4 bg-gray-50/50">
        <p className="text-[14px] text-gray-500 font-medium">
          Hiện có <strong className="text-vatican-dark">{hymns.length}</strong> bài thánh ca
          {search.trim() && filtered.length !== hymns.length && (
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
            <Plus size={13} strokeWidth={2.5} /> Thêm thánh ca
          </AdminButton>
        </div>
      </div>

      <div className="bg-white overflow-hidden divide-y divide-gray-100 max-h-[calc(100vh-280px)] overflow-y-auto">
        {!filtered.length ? (
          <EmptyState
            icon={<Music size={22} strokeWidth={1.5} className="text-gray-300" />}
            message={search.trim()
              ? `Không tìm thấy bài nào với "${search}"`
              : <><span>Chưa có bài thánh ca nào.</span>{' '}<button onClick={openAdd} className="text-vatican-blue font-bold hover:underline">Thêm ngay</button></>
            }
          />
        ) : filtered.map(h => (
          <div key={h.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors">
            <div className="relative w-[80px] aspect-video shrink-0 rounded-lg overflow-hidden bg-gray-100">
              {h.image_url
                ? <Image src={h.image_url} alt={h.title} fill className="object-cover" unoptimized />
                : <div className="absolute inset-0 flex items-center justify-center"><Music size={16} className="text-gray-300" /></div>
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm md:text-base text-vatican-dark leading-snug line-clamp-1">{h.title}</p>
              <p className="text-sm text-gray-400 mt-0.5">{h.artist}</p>
              {(h.playlists ?? []).length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {(h.playlists ?? []).map(p => (
                    <AdminBadge key={p} color="blue">
                      {playlists.find(x => x.id === p)?.label ?? p}
                    </AdminBadge>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <AdminIconButton
                onClick={() => toggleActive(h)}
                title={h.is_active ? 'Đang hiện trên trang — bấm để ẩn' : 'Đang ẩn — bấm để hiện trên trang'}
                variant="ghost"
                className={h.is_active ? 'text-green-600 hover:bg-green-50' : 'text-gray-300 hover:bg-gray-100 hover:text-gray-500'}
              >
                {h.is_active ? <Eye size={13} /> : <EyeOff size={13} />}
              </AdminIconButton>
              <AdminIconButton onClick={() => openEdit(h)} variant="edit" title="Sửa">
                <Pencil size={13} />
              </AdminIconButton>
              <AdminIconButton onClick={() => setDeleteTarget(h)} variant="danger" title="Xóa">
                <Trash2 size={13} />
              </AdminIconButton>
            </div>
          </div>
        ))}
      </div>

      {isOpen && (
        <AdminModal onClose={close} maxWidth={MODAL_WIDTHS.lg} disabled={saving}>
          <ModalHeader title={editing ? 'Chỉnh sửa thánh ca' : 'Thêm thánh ca'} onClose={close} />

          <div className="px-6 py-6 grid grid-cols-2 gap-6 max-h-[75vh] overflow-y-auto">

            {/* Cột trái: Ảnh + Fields + Toggle */}
            <div className="flex flex-col gap-4">
              <div>
                <AdminLabel>
                  Ảnh bài thánh ca <span className="font-normal text-gray-300 normal-case tracking-normal">(16:9)</span>
                </AdminLabel>
                <AdminImagePicker
                  value={form.image_url}
                  onChange={url => setForm(f => ({ ...f, image_url: url }))}
                  bucket="hymns"
                  aspectRatio="16:9"
                  disabled={saving}
                />
              </div>

              <div>
                <AdminLabel>Tiêu đề bài</AdminLabel>
                <AdminInput value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Tên bài thánh ca..." />
              </div>
              <div>
                <AdminLabel>Ca sĩ / Ca đoàn</AdminLabel>
                <AdminInput value={form.artist} onChange={e => setForm(f => ({ ...f, artist: e.target.value }))} placeholder="Ca sĩ hoặc ca đoàn..." />
              </div>
              <div>
                <AdminLabel>Link YouTube</AdminLabel>
                <AdminInput value={form.youtube_url} onChange={e => setForm(f => ({ ...f, youtube_url: e.target.value }))} placeholder="https://youtube.com/watch?v=..." />
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

            {/* Cột phải: Album */}
            <div className="flex flex-col">
              <AdminLabel>Album</AdminLabel>
              <div className="border border-gray-200 rounded-lg overflow-hidden flex-1">
                {playlists.length === 0 && (
                  <p className="px-3 py-2.5 text-[15px] text-gray-400">Chưa có album nào.</p>
                )}
                {playlists.map((pl, i) => (
                  <div key={pl.id} className={`flex items-start gap-2 px-3 py-2 group ${i < playlists.length - 1 ? 'border-b border-gray-100' : ''}`}>
                    {editingPlaylist?.id === pl.id ? (
                      <div className="flex-1 flex flex-col gap-1.5">
                        <AdminInput
                          autoFocus
                          value={editingPlaylist.label}
                          onChange={e => setEditingPlaylist({ ...editingPlaylist, label: e.target.value })}
                          placeholder="Tên album..."
                          className="h-8 px-2.5 rounded-md"
                        />
                        <div className="flex items-center gap-1">
                          <AdminInput
                            value={editingPlaylist.cover_image ?? ''}
                            onChange={e => setEditingPlaylist({ ...editingPlaylist, cover_image: e.target.value })}
                            placeholder="Link ảnh bìa..."
                            className="flex-1 h-8 px-2.5 rounded-md"
                          />
                          <AdminIconButton variant="edit" type="button" onClick={() => playlistCoverRef.current?.click()} title="Upload ảnh">
                            {playlistLoading ? <Loader2 size={12} className="animate-spin" /> : <ImagePlus size={13} />}
                          </AdminIconButton>
                        </div>
                        <div className="flex gap-1">
                          <AdminIconButton variant="ghost" onClick={savePlaylist} disabled={playlistLoading} className="hover:bg-green-50 hover:text-green-600">
                            <Check size={13} />
                          </AdminIconButton>
                          <AdminIconButton variant="ghost" onClick={() => setEditingPlaylist(null)}>
                            <X size={13} />
                          </AdminIconButton>
                        </div>
                      </div>
                    ) : (
                      <>
                        <AdminCheckbox checked={form.playlists.includes(pl.id)} onChange={() => togglePlaylist(pl.id)} />
                        {pl.cover_image && (
                          <div className="relative w-7 h-7 rounded shrink-0 overflow-hidden bg-gray-100">
                            <Image src={pl.cover_image} alt={pl.label} fill className="object-cover" unoptimized />
                          </div>
                        )}
                        <span className="flex-1 text-[15px] text-gray-700 cursor-pointer select-none" onClick={() => togglePlaylist(pl.id)}>
                          {pl.label}
                        </span>
                        <AdminIconButton variant="edit" onClick={() => setEditingPlaylist(pl)} className="opacity-0 group-hover:opacity-100">
                          <Pencil size={12} />
                        </AdminIconButton>
                        <AdminIconButton variant="danger" onClick={() => deletePlaylist(pl.id)} className="opacity-0 group-hover:opacity-100">
                          <Trash2 size={12} />
                        </AdminIconButton>
                      </>
                    )}
                  </div>
                ))}
                <div className="flex items-center gap-2 px-3 py-2 border-t border-dashed border-gray-200 bg-gray-50">
                  <input
                    value={newPlaylistLabel}
                    onChange={e => setNewPlaylistLabel(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addPlaylist()}
                    placeholder="Thêm album mới..."
                    className="flex-1 text-[15px] bg-transparent outline-none text-gray-700 placeholder:text-gray-400"
                  />
                  <AdminIconButton
                    variant="ghost"
                    onClick={addPlaylist}
                    disabled={!newPlaylistLabel.trim() || playlistLoading}
                    className="hover:bg-gray-200 hover:text-vatican-blue"
                  >
                    {playlistLoading ? <Loader2 size={13} className="animate-spin" /> : <Plus size={14} strokeWidth={2.5} />}
                  </AdminIconButton>
                </div>
              </div>
              <input ref={playlistCoverRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePlaylistCoverChange} className="hidden" />
            </div>

          </div>

          <ModalFooter error={error || null} onCancel={close} submitting={saving}>
            <AdminButton onClick={handleSave} disabled={saving} variant="primary">
              {saving ? 'Đang lưu...' : 'Lưu'}
            </AdminButton>
          </ModalFooter>
        </AdminModal>
      )}

      {deleteTarget && (
        <ConfirmDeleteModal
          title="Xóa bài thánh ca?"
          description={`"${deleteTarget.title}"`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </>
  )
}
