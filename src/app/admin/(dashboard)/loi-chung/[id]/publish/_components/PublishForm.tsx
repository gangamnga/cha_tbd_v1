'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import dynamic from 'next/dynamic'
import { Save, Send, AlertCircle, CheckCircle } from 'lucide-react'

const RichTextEditor = dynamic(() => import('@/components/admin/RichTextEditor'), {
  ssr: false,
  loading: () => (
    <div className="h-40 flex items-center justify-center border border-dashed border-gray-200 rounded-lg text-gray-400 bg-gray-50/50">
      Đang tải trình soạn thảo...
    </div>
  )
})
import { AdminLabel, AdminInput, AdminButton, AdminSelect } from '@/components/admin/ui'

const CATEGORIES = [
  { value: 'cam-nang',  label: 'Cẩm nang' },
  { value: 'cong-dong', label: 'Cộng đồng' },
  { value: 'loi-chung', label: 'Lời chứng' },
]

function slugify(text: string) {
  return text.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim().replace(/\s+/g, '-')
    + '-' + Date.now().toString(36)
}

type Msg = { type: 'success' | 'error'; text: string } | null

export function PublishForm({
  testimonyId,
  initialTitle,
  initialContent,
  testimonyCategories,
}: {
  testimonyId: string
  initialTitle: string
  initialContent: string
  testimonyCategories: string[]
}) {
  const router = useRouter()
  const [title,        setTitle]        = useState(initialTitle)
  const [slug,         setSlug]         = useState(slugify(initialTitle))
  const [category,     setCategory]     = useState('loi-chung')
  const [summary,      setSummary]      = useState('')
  const [thumbnailUrl, setThumbnailUrl] = useState('')
  const [content,      setContent]      = useState(initialContent)
  const [saving,       setSaving]       = useState(false)
  const [msg,          setMsg]          = useState<Msg>(null)

  const flash = (type: 'success' | 'error', text: string) => {
    setMsg({ type, text })
    if (type === 'error') setTimeout(() => setMsg(null), 5000)
  }

  const save = async (status: 'draft' | 'published') => {
    setSaving(true)
    setMsg(null)
    const supabase = createClient()
    const now = new Date().toISOString()

    const { error: articleErr } = await supabase.from('articles').insert([{
      title: title.trim(),
      slug: slug.trim(),
      category,
      summary: summary.trim() || null,
      thumbnail_url: thumbnailUrl.trim() || null,
      icon_type: 'text',
      content,
      status,
      testimony_categories: testimonyCategories,
      created_at: now,
      updated_at: now,
    }])

    if (articleErr) {
      setSaving(false)
      flash('error', 'Lỗi tạo bài viết: ' + articleErr.message)
      return
    }

    const { error: testimonyErr } = await supabase
      .from('testimonies')
      .update({ status: 'published' })
      .eq('id', testimonyId)

    setSaving(false)

    if (testimonyErr) {
      flash('error', 'Bài viết đã tạo nhưng lỗi cập nhật lời chứng: ' + testimonyErr.message)
      return
    }

    flash('success', status === 'published' ? 'Đã đăng bài viết!' : 'Đã lưu bản nháp.')
    setTimeout(() => router.push('/admin/loi-chung/new'), 1500)
  }

  return (
    <div className="space-y-5 pb-10">

      {/* Thông tin cơ bản */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h3 className="text-[16px] font-bold uppercase tracking-widest text-gray-400">Thông tin bài viết</h3>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <AdminLabel>Tiêu đề <span className="text-red-500">*</span></AdminLabel>
            <AdminInput value={title} onChange={e => setTitle(e.target.value)} placeholder="Tiêu đề bài viết..." />
          </div>
          <div className="space-y-1.5">
            <AdminLabel>Slug <span className="text-red-500">*</span></AdminLabel>
            <AdminInput value={slug} onChange={e => setSlug(e.target.value)} placeholder="duong-dan-bai-viet" />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <AdminLabel>Danh mục</AdminLabel>
            <AdminSelect
              value={category}
              onChange={setCategory}
              options={CATEGORIES}
            />
          </div>
          <div className="space-y-1.5">
            <AdminLabel>Tóm tắt</AdminLabel>
            <AdminInput value={summary} onChange={e => setSummary(e.target.value)} placeholder="Mô tả ngắn hiển thị ở danh sách..." />
          </div>
        </div>
      </div>

      {/* Ảnh bìa */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
        <h3 className="text-[16px] font-bold uppercase tracking-widest text-gray-400">Ảnh bìa</h3>
        <div className="flex gap-4 items-start">
          <AdminInput value={thumbnailUrl} onChange={e => setThumbnailUrl(e.target.value)} placeholder="https://..." />
          {thumbnailUrl && (
            <div className="w-[100px] aspect-video rounded-lg overflow-hidden border border-gray-200 shrink-0 bg-gray-100">
              <img src={thumbnailUrl} alt="preview" className="w-full h-full object-cover" />
            </div>
          )}
        </div>
      </div>

      {/* Nội dung */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
        <h3 className="text-[16px] font-bold uppercase tracking-widest text-gray-400">Nội dung bài viết</h3>
        <RichTextEditor content={content} onChange={setContent} />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          {msg && (
            <div className={`flex items-center gap-2 text-[16px] font-semibold px-3 py-2 rounded-lg ${
              msg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              {msg.type === 'success'
                ? <CheckCircle size={14} className="shrink-0" />
                : <AlertCircle size={14} className="shrink-0" />}
              {msg.text}
            </div>
          )}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <AdminButton type="button" disabled={saving} onClick={() => save('draft')} variant="secondary">
            <Save size={14} />
            Lưu nháp
          </AdminButton>
          <AdminButton type="button" disabled={saving || !title.trim()} onClick={() => save('published')}>
            <Send size={14} />
            {saving ? 'Đang đăng...' : 'Đăng bài viết'}
          </AdminButton>
        </div>
      </div>

    </div>
  )
}
