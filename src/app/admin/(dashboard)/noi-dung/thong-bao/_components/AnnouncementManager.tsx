'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { ConfirmDeleteModal } from '@/components/admin/ConfirmDeleteModal'
import { Bell, Plus, Pencil, Trash2, Radio, X, ImagePlus, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import Image from 'next/image'
import { AdminModal } from '@/components/admin/AdminModal'
import { AdminButton, AdminIconButton, AdminInput, AdminLabel, ModalHeader, ModalFooter, AdminImagePicker } from '@/components/admin/ui'
import { EmptyState } from '@/components/admin/EmptyState'
import { MODAL_WIDTHS } from '@/lib/admin-constants'

type Announcement = {
  id: string
  title: string
  image_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

type FormState = {
  title: string
  imageUrl: string
}

const EMPTY_FORM: FormState = { title: '', imageUrl: '' }

export function AnnouncementManager({ initial }: { initial: Announcement[] }) {
  // Image upload is self-contained in AdminImagePicker

  const [items, setItems]           = useState(initial)
  const [isOpen, setIsOpen]         = useState(false)
  const [editing, setEditing]       = useState<Announcement | null>(null)
  const [form, setForm]             = useState<FormState>(EMPTY_FORM)
  const [saving, setSaving]         = useState(false)
  const [err, setErr]               = useState('')
  const [activating, setActivating] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Announcement | null>(null)
  const [deleting, setDeleting]     = useState(false)

  const openAdd = () => {
    setForm(EMPTY_FORM); setEditing(null); setErr(''); setIsOpen(true)
  }

  const openEdit = (item: Announcement) => {
    setForm({ title: item.title, imageUrl: item.image_url || '' })
    setEditing(item); setErr(''); setIsOpen(true)
  }

  const close = () => { setIsOpen(false); setEditing(null); setErr('') }

  const handleSave = async () => {
    if (!form.title.trim()) { setErr('Vui lòng nhập tên thông báo.'); return }
    setSaving(true); setErr('')
    const supabase = createClient()
    const finalImageUrl = form.imageUrl || null

    const now = new Date().toISOString()
    if (editing) {
      const { data, error } = await supabase
        .from('announcements')
        .update({ title: form.title.trim(), image_url: finalImageUrl, updated_at: now })
        .eq('id', editing.id).select().single()
      if (error) { setErr(error.message); setSaving(false); return }
      setItems(prev => prev.map(x => x.id === editing.id ? data : x))
    } else {
      const { data, error } = await supabase
        .from('announcements')
        .insert({ title: form.title.trim(), image_url: finalImageUrl, is_active: false })
        .select().single()
      if (error) { setErr(error.message); setSaving(false); return }
      setItems(prev => [...prev, data])
    }
    setSaving(false); close()
  }

  const activate = async (id: string) => {
    setActivating(id)
    const supabase = createClient()
    await supabase.from('announcements').update({ is_active: false }).neq('id', id)
    const { data } = await supabase
      .from('announcements')
      .update({ is_active: true, updated_at: new Date().toISOString() })
      .eq('id', id).select().single()
    setItems(prev => prev.map(x => x.id === id ? { ...x, is_active: true, updated_at: data?.updated_at ?? x.updated_at } : { ...x, is_active: false }))
    setActivating(null)
  }

  const remove = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    await createClient().from('announcements').delete().eq('id', deleteTarget.id)
    setItems(prev => prev.filter(x => x.id !== deleteTarget.id))
    setDeleting(false); setDeleteTarget(null)
  }

  return (
    <>
      {/* Action Bar */}
      <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
        <div>
          <p className="text-[14px] text-gray-500 font-medium">Hiện có <strong className="text-vatican-dark">{items.length}</strong> thông báo</p>
        </div>
        <AdminButton onClick={openAdd}>
          <Plus size={13} strokeWidth={2.5} /> Thêm thông báo
        </AdminButton>
      </div>

      {/* Grid */}
      <div className="p-4 bg-white">
        {items.length === 0 ? (
          <EmptyState
            icon={<Bell size={22} strokeWidth={1.5} className="text-gray-300" />}
            message={<><span>Chưa có thông báo nào.</span>{' '}<button onClick={openAdd} className="text-vatican-blue font-bold hover:underline">Thêm ngay</button></>}
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          {items.map(item => (
            <div key={item.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col group">

              {/* Image */}
              <div className="relative w-full bg-gray-100" style={{ aspectRatio: '3/4' }}>
                {item.image_url
                  ? <Image src={item.image_url} alt={item.title || 'Thông báo'} fill className="object-contain" unoptimized />
                  : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-300">
                      <Bell size={28} strokeWidth={1.5} />
                      <span className="text-sm text-gray-400">Chưa có ảnh</span>
                    </div>
                  )
                }
                <div className="absolute top-2 left-2">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${
                    item.is_active ? 'bg-green-500 text-white' : 'bg-black/50 text-white'
                  }`}>
                    {item.is_active ? 'Đang hiện' : 'Ẩn'}
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div className="p-3.5 pb-2 flex-1">
                <p className="font-bold text-sm md:text-base text-vatican-dark leading-snug line-clamp-2">
                  {item.title || '(Chưa đặt tên)'}
                </p>
              </div>

              <div className="px-3.5 pb-3 flex items-center justify-between border-t border-gray-100 pt-2.5">
                <span className="text-xs md:text-sm text-gray-400 font-medium">
                  {item.updated_at ? format(new Date(item.updated_at), 'dd/MM/yyyy HH:mm', { locale: vi }) : '—'}
                </span>
                <div className="flex gap-1">
                  {!item.is_active && (
                    <AdminIconButton
                      onClick={() => activate(item.id)}
                      disabled={activating === item.id}
                      title="Kích hoạt"
                      variant="edit"
                    >
                      {activating === item.id ? <Loader2 size={14} className="animate-spin" /> : <Radio size={14} />}
                    </AdminIconButton>
                  )}
                  <AdminIconButton
                    onClick={() => openEdit(item)}
                    variant="edit"
                    title="Chỉnh sửa"
                  >
                    <Pencil size={13} />
                  </AdminIconButton>
                  <AdminIconButton
                    onClick={() => setDeleteTarget(item)}
                    variant="danger"
                    title="Xóa"
                  >
                    <Trash2 size={13} />
                  </AdminIconButton>
                </div>
              </div>

            </div>
          ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {isOpen && (
        <AdminModal onClose={close} maxWidth={MODAL_WIDTHS.lg} disabled={saving}>

          {/* Modal header */}
          <ModalHeader
            title={editing ? 'Chỉnh sửa thông báo' : 'Thêm thông báo'}
            onClose={close}
          />

          {/* Modal body */}
          <div className="px-6 py-6 flex flex-col gap-5">

              {/* Title */}
              <div>
                <AdminLabel>
                  Tên thông báo <span className="font-normal text-gray-300 normal-case tracking-normal">(chỉ dùng để quản lý)</span>
                </AdminLabel>
                <AdminInput
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Ví dụ: Buổi cầu nguyện tháng 6..."
                />
              </div>

              {/* Image upload */}
              <div>
                <AdminLabel className="mb-3">
                  Hình ảnh <span className="font-normal text-gray-300 normal-case tracking-normal">(tỷ lệ 3:4)</span>
                </AdminLabel>
                <AdminImagePicker
                  value={form.imageUrl}
                  onChange={url => setForm(f => ({ ...f, imageUrl: url }))}
                  bucket="announcements"
                  aspectRatio="3:4"
                  disabled={saving}
                />
              </div>


          </div>

          {/* Modal footer */}
          <ModalFooter error={err || null} onCancel={close} submitting={saving}>
              <AdminButton
                onClick={handleSave}
                disabled={saving || !form.title.trim()}
              >
                {saving ? 'Đang lưu...' : 'Lưu'}
              </AdminButton>
          </ModalFooter>

        </AdminModal>
      )}

      {deleteTarget && (
        <ConfirmDeleteModal
          title="Xóa thông báo?"
          description={`"${deleteTarget.title}"`}
          onConfirm={remove}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </>
  )
}
