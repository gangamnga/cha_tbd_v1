'use client'

import { useState, useTransition } from 'react'
import { Plus, MessageSquare } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { AdminModal } from '@/components/admin/AdminModal'
import { AdminLabel, AdminButton, AdminInput, AdminTextarea, ModalHeader, ModalFooter } from '@/components/admin/ui'

const CATEGORIES = [
  'Bệnh tật & chữa lành', 'Gia đình & hôn nhân', 'Công việc & nghề nghiệp',
  'Tài chính & kinh tế', 'Học hành & thi cử', 'Tai nạn & hiểm nguy',
  'Tâm hồn & hoán cải', 'Ơn gọi & đời tu', 'Định cư & di dân',
  'Người đã qua đời', 'Khác',
]

export function AddTestimonyButton() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [selected, setSelected] = useState<string[]>([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const [, startTransition] = useTransition()

  const toggle = (cat: string) =>
    setSelected(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat])

  const reset = () => { setName(''); setLocation(''); setSelected([]); setTitle(''); setContent(''); setError(null) }
  const close = () => { reset(); setOpen(false) }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true); setError(null)
    const supabase = createClient()
    const { error: err } = await supabase.from('testimonies').insert([{
      name: name.trim() || null,
      location: location.trim() || null,
      categories: selected,
      title: title.trim(),
      content: content.trim(),
      status: 'approved',
    }])
    setSubmitting(false)
    if (err) { setError('Có lỗi xảy ra. Vui lòng thử lại.') }
    else { close(); startTransition(() => router.refresh()) }
  }


  return (
    <>
      <AdminButton onClick={() => setOpen(true)} className="px-6 shrink-0 text-[14px]">
        <Plus size={15} />
        Nhập thủ công
      </AdminButton>

      {open && (
        <AdminModal onClose={close} maxWidth="max-w-lg" disabled={submitting}>
          <ModalHeader
            title="Thêm lời chứng"
            onClose={close}
          />

          {/* Body */}
          <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-4 max-h-[70vh]">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <AdminLabel>Họ và tên</AdminLabel>
                  <AdminInput type="text" value={name} onChange={e => setName(e.target.value)}
                    placeholder="Ẩn danh nếu bỏ trống" />
                </div>
                <div className="flex flex-col gap-1">
                  <AdminLabel>Địa phương</AdminLabel>
                  <AdminInput type="text" value={location} onChange={e => setLocation(e.target.value)}
                    placeholder="Tỉnh / Thành phố" />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <AdminLabel>Loại ơn lành</AdminLabel>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  {CATEGORIES.map(cat => (
                    <label key={cat} className="flex items-center gap-2 cursor-pointer group py-0.5">
                      <input type="checkbox" checked={selected.includes(cat)} onChange={() => toggle(cat)}
                        className="w-4 h-4 accent-vatican-blue cursor-pointer shrink-0" />
                      <span className="text-[16px] text-vatican-dark group-hover:text-vatican-blue transition-colors">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <AdminLabel>Tiêu đề <span className="text-red-500">*</span></AdminLabel>
                <AdminInput type="text" required value={title} onChange={e => setTitle(e.target.value)}
                  placeholder="Tóm tắt ngắn gọn" />
              </div>
              <div className="flex flex-col gap-1">
                <AdminLabel>Nội dung <span className="text-red-500">*</span></AdminLabel>
                <AdminTextarea required rows={5} value={content} onChange={e => setContent(e.target.value)}
                  placeholder="Nội dung lời chứng..." />
              </div>
            </div>

            <ModalFooter error={error} onCancel={close} submitting={submitting}>
              <AdminButton type="submit" disabled={submitting}>
                <MessageSquare size={14} />
                {submitting ? 'Đang lưu...' : 'Lưu (đã duyệt)'}
              </AdminButton>
            </ModalFooter>
          </form>
        </AdminModal>
      )}
    </>
  )
}
