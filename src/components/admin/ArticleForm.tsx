'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import dynamic from 'next/dynamic'
import { ConfirmDeleteModal } from './ConfirmDeleteModal'

const RichTextEditor = dynamic(() => import('./RichTextEditor'), {
  ssr: false,
  loading: () => (
    <div className="h-40 flex items-center justify-center border border-dashed border-gray-200 rounded-lg text-gray-400 bg-gray-50/50">
      Đang tải trình soạn thảo...
    </div>
  )
})
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Trash2, Save, CheckCircle, AlertCircle } from 'lucide-react'

const CATEGORIES = [
  { value: 'cam-nang',  label: 'Góc hành hương' },
  { value: 'cong-dong', label: 'Cộng đồng' },
]

const selectCls = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-[16px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"

function slugify(text: string) {
  return text.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim().replace(/\s+/g, '-')
}

type Msg = { type: 'success' | 'error'; text: string } | null

export default function ArticleForm({ initialData, returnHref }: { initialData?: any; returnHref?: string }) {
  const isEdit = !!initialData?.id
  const [title,        setTitle]        = useState(initialData?.title        ?? '')
  const [slug,         setSlug]         = useState(initialData?.slug         ?? '')
  const [category,     setCategory]     = useState(initialData?.category     ?? 'cam-nang')
  const [summary,      setSummary]      = useState(initialData?.summary      ?? '')
  const [thumbnailUrl, setThumbnailUrl] = useState(initialData?.thumbnail_url ?? '')
  const [iconType,     setIconType]     = useState(initialData?.icon_type    ?? 'text')
  const [content,      setContent]      = useState(initialData?.content      ?? '')
  const [status,       setStatus]       = useState(initialData?.status       ?? 'draft')
  const [saving,         setSaving]         = useState(false)
  const [deleting,       setDeleting]       = useState(false)
  const [showDeleteConf, setShowDeleteConf] = useState(false)
  const [msg,            setMsg]            = useState<Msg>(null)

  const router  = useRouter()
  const supabase = createClient()

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setTitle(val)
    if (!isEdit) setSlug(slugify(val))
  }

  const flash = (type: 'success' | 'error', text: string) => {
    setMsg({ type, text })
    setTimeout(() => setMsg(null), 4000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const payload = {
      title, slug, category, summary,
      thumbnail_url: thumbnailUrl || null,
      icon_type: iconType,
      content, status,
      updated_at: new Date().toISOString(),
    }
    let error
    if (isEdit) {
      const { error: e } = await supabase.from('articles').update(payload).eq('id', initialData.id)
      error = e
    } else {
      const { error: e } = await supabase.from('articles').insert([{ ...payload, created_at: new Date().toISOString() }])
      error = e
    }
    setSaving(false)
    if (error) {
      flash('error', 'Lỗi: ' + error.message)
    } else {
      flash('success', isEdit ? 'Đã lưu thay đổi.' : 'Đã tạo bài viết.')
      if (!isEdit) setTimeout(() => router.push(returnHref ?? '/admin/trang-chu'), 1200)
      else router.refresh()
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    const { error } = await supabase.from('articles').delete().eq('id', initialData.id)
    setDeleting(false)
    if (error) { flash('error', 'Lỗi khi xóa: ' + error.message) }
    else { router.push(returnHref ?? '/admin/trang-chu'); router.refresh() }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 pb-10">

      {/* Thông tin cơ bản */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h3 className="text-[16px] font-bold uppercase tracking-widest text-gray-400">Thông tin cơ bản</h3>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Tiêu đề <span className="text-red-500">*</span></Label>
            <Input id="title" value={title} onChange={handleTitleChange} required placeholder="Nhập tiêu đề bài viết..." />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="slug">Đường dẫn (slug) <span className="text-red-500">*</span></Label>
            <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} required placeholder="duong-dan-bai-viet" />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="category">Danh mục</Label>
            <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} className={selectCls}>
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="iconType">Loại nội dung</Label>
            <select id="iconType" value={iconType} onChange={(e) => setIconType(e.target.value)} className={selectCls}>
              <option value="text">Bài viết</option>
              <option value="video">Video</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="status">Trạng thái</Label>
            <select id="status" value={status} onChange={(e) => setStatus(e.target.value)} className={selectCls}>
              <option value="draft">Bản nháp</option>
              <option value="published">Xuất bản</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="summary">Tóm tắt</Label>
          <Textarea id="summary" value={summary} onChange={(e) => setSummary(e.target.value)} rows={2} placeholder="Mô tả ngắn hiển thị ở trang danh sách..." />
        </div>
      </div>

      {/* Ảnh bìa */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
        <h3 className="text-[16px] font-bold uppercase tracking-widest text-gray-400">Ảnh bìa</h3>
        <div className="flex gap-4 items-start">
          <div className="flex-1 space-y-1.5">
            <Label htmlFor="thumbnail">URL ảnh bìa</Label>
            <Input id="thumbnail" value={thumbnailUrl} onChange={(e) => setThumbnailUrl(e.target.value)} placeholder="https://..." />
          </div>
          {thumbnailUrl && (
            <div className="w-[120px] aspect-video rounded-lg overflow-hidden border border-gray-200 shrink-0 bg-gray-100">
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
          {isEdit && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowDeleteConf(true)}
              disabled={deleting}
              className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
            >
              <Trash2 size={14} className="mr-1.5" />
              {deleting ? 'Đang xóa...' : 'Xóa bài'}
            </Button>
          )}
          <Button
            type="submit"
            disabled={saving}
            className="bg-vatican-blue hover:bg-vatican-blue-dark text-white px-6"
          >
            <Save size={14} className="mr-1.5" />
            {saving ? 'Đang lưu...' : 'Lưu bài viết'}
          </Button>
        </div>
      </div>

      {showDeleteConf && (
        <ConfirmDeleteModal
          title="Xóa bài viết?"
          description={initialData?.title}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConf(false)}
          loading={deleting}
        />
      )}
    </form>
  )
}
