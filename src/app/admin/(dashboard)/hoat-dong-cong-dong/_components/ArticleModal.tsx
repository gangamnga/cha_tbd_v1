'use client'

import { useState, useRef, useEffect } from 'react'
import {
  Newspaper, X, AlertCircle, Upload, Library,
  CalendarCheck, BookOpen, Loader2, ImageOff,
} from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import dynamic from 'next/dynamic'
import { AdminModal } from '@/components/admin/AdminModal'

const RichTextEditor = dynamic(() => import('@/components/admin/RichTextEditor'), {
  ssr: false,
  loading: () => (
    <div className="h-40 flex items-center justify-center border border-dashed border-gray-200 rounded-lg text-gray-400 bg-gray-50/50">
      Đang tải trình soạn thảo...
    </div>
  )
})
import { AdminLabel, AdminInput, AdminButton, ModalHeader } from '@/components/admin/ui'
import { type Article } from './ArticleCard'

export type ModalConfig =
  | { mode: 'add'; prefill?: { title?: string; content?: string; testimony_categories?: string[] } }
  | { mode: 'edit'; articleId: string }

function slugify(text: string) {
  return text.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim().replace(/\s+/g, '-')
}

export function ArticleModal({ config, category, onClose, onSaved }: {
  config: ModalConfig
  category: string
  onClose: () => void
  onSaved: (article: Article) => void
}) {
  const isEdit    = config.mode === 'edit'
  const articleId = isEdit ? (config as { mode: 'edit'; articleId: string }).articleId : null
  const prefill   = !isEdit ? (config as { mode: 'add'; prefill?: { title?: string; content?: string; testimony_categories?: string[] } }).prefill : undefined

  const [loading,      setLoading]      = useState(isEdit)
  const [title,        setTitle]        = useState(prefill?.title ?? '')
  const [slug,         setSlug]         = useState(prefill?.title ? slugify(prefill.title) : '')
  const [thumbnailUrl, setThumbnailUrl] = useState('')
  const [previewUrl,   setPreviewUrl]   = useState('')
  const [urlInput,     setUrlInput]     = useState('')
  const [content,      setContent]      = useState(prefill?.content ?? '')
  const [saving,       setSaving]       = useState(false)
  const [uploading,    setUploading]    = useState(false)
  const [error,        setError]        = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isEdit || !articleId) return
    createClient()
      .from('articles')
      .select('id, title, slug, status, thumbnail_url, content')
      .eq('id', articleId)
      .single()
      .then(({ data }: { data: any }) => {
        if (data) {
          setTitle(data.title ?? '')
          setSlug(data.slug ?? '')
          setContent(data.content ?? '')
          if (data.thumbnail_url) {
            setThumbnailUrl(data.thumbnail_url)
            setPreviewUrl(data.thumbnail_url)
          }
        }
        setLoading(false)
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setTitle(val)
    if (!isEdit) setSlug(slugify(val))
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPreviewUrl(URL.createObjectURL(file))
    setUploading(true)
    setError(null)
    const ext      = file.name.split('.').pop()
    const fileName = `article-${Date.now()}.${ext}`
    const supabase = createClient()
    const { error: uploadErr } = await supabase.storage.from('articles').upload(fileName, file, { upsert: true })
    if (uploadErr) {
      setError('Lỗi tải ảnh: ' + uploadErr.message)
      setPreviewUrl('')
      setUploading(false)
      return
    }
    const { data: { publicUrl } } = supabase.storage.from('articles').getPublicUrl(fileName)
    setThumbnailUrl(publicUrl)
    setUploading(false)
  }

  const clearImage = () => {
    setThumbnailUrl('')
    setPreviewUrl('')
    setUrlInput('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const applyUrlInput = () => {
    const v = urlInput.trim()
    if (v) { setThumbnailUrl(v); setPreviewUrl(v) }
  }

  const submit = async (status: 'draft' | 'published') => {
    if (!title.trim()) { setError('Vui lòng nhập tiêu đề.'); return }
    if (!slug.trim())  { setError('Vui lòng nhập đường dẫn.'); return }
    setSaving(true)
    setError(null)

    const payload: Record<string, unknown> = {
      title:         title.trim(),
      slug:          slug.trim(),
      thumbnail_url: thumbnailUrl || null,
      content,
      status,
      updated_at:    new Date().toISOString(),
    }
    if (!isEdit && prefill?.testimony_categories?.length) {
      payload.testimony_categories = prefill.testimony_categories
    }

    let data, err
    if (isEdit && articleId) {
      const res = await createClient()
        .from('articles').update(payload).eq('id', articleId)
        .select('id, title, slug, status, created_at, thumbnail_url').single()
      data = res.data; err = res.error
    } else {
      const res = await createClient()
        .from('articles')
        .insert([{ ...payload, category, created_at: new Date().toISOString() }])
        .select('id, title, slug, status, created_at, thumbnail_url').single()
      data = res.data; err = res.error
    }

    setSaving(false)
    if (err) { setError('Lỗi: ' + err.message); return }
    onSaved(data!)
  }

  const disabled = saving || uploading || loading

  return (
    <AdminModal onClose={onClose} maxWidth="max-w-[920px]" disabled={disabled}>

      <ModalHeader
        title={isEdit ? 'Chỉnh sửa bài viết' : 'Thêm bài viết mới'}
        icon={<Newspaper size={15} />}
        onClose={onClose}
        disabled={disabled}
      />

      {/* Body */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-gray-300" />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-6 py-6 bg-white flex flex-col gap-5 min-h-0">

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <AdminLabel>Tiêu đề <span className="text-red-400">*</span></AdminLabel>
              <AdminInput type="text" value={title} onChange={handleTitleChange} required
                placeholder="Nhập tiêu đề bài viết..." autoFocus />
            </div>
            <div className="col-span-2">
              <AdminLabel>Đường dẫn (slug)</AdminLabel>
              <AdminInput type="text" value={slug} onChange={(e) => setSlug(e.target.value)} required
                placeholder="duong-dan-bai-viet" />
            </div>
          </div>

          <div>
            <AdminLabel>Ảnh bìa</AdminLabel>
            <div className="flex items-start gap-4 p-4 rounded-xl border border-gray-200 bg-gray-50/60">
              <div className="w-[160px] aspect-video rounded-lg overflow-hidden border border-gray-200 bg-white shrink-0 flex items-center justify-center">
                {previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={previewUrl} alt="" className="w-full h-full object-cover" />
                ) : uploading ? (
                  <Loader2 size={20} className="animate-spin text-gray-300" />
                ) : (
                  <div className="flex flex-col items-center gap-1.5 text-gray-300 px-3 text-center">
                    <ImageOff size={22} strokeWidth={1.5} />
                    <span className="text-[16px] font-medium text-gray-400 leading-tight">Ảnh 16:9</span>
                  </div>
                )}
              </div>

              <div className="flex-1 flex flex-col gap-3">
                <div className="flex gap-2 flex-wrap">
                  <AdminButton type="button" variant="secondary" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                    <Upload size={13} />
                    Tải ảnh lên
                  </AdminButton>
                  <AdminButton type="button" variant="secondary" disabled title="Tính năng sắp ra mắt" className="border-dashed text-gray-300 cursor-not-allowed">
                    <Library size={13} />
                    Chọn thư viện
                  </AdminButton>
                </div>

                {thumbnailUrl && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-gray-200">
                    <span className="text-[16px] text-gray-500 truncate flex-1">{thumbnailUrl}</span>
                    <button type="button" onClick={clearImage}
                      className="text-gray-400 hover:text-red-500 transition-colors shrink-0">
                      <X size={13} />
                    </button>
                  </div>
                )}

                {!previewUrl && (
                  <input type="text" value={urlInput} placeholder="https://..."
                    onChange={(e) => setUrlInput(e.target.value)}
                    onBlur={applyUrlInput}
                    onKeyDown={(e) => e.key === 'Enter' && applyUrlInput()}
                    className="h-8 px-3 rounded-lg border border-gray-200 bg-white text-[16px] text-vatican-dark focus:outline-none focus:ring-2 focus:ring-vatican-blue/30 focus:border-vatican-blue transition-colors" />
                )}
              </div>
            </div>
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileChange} />
          </div>

          <div className="flex flex-col gap-1.5">
            <AdminLabel>Nội dung bài viết</AdminLabel>
            <RichTextEditor content={content} onChange={setContent} />
          </div>

        </div>
      )}

      {/* Footer */}
      <div className="border-t border-gray-100 bg-gray-50/50 px-6 py-4 shrink-0 flex items-center gap-3">
        {error && (
          <div className="flex items-center gap-1.5 text-[13px] font-semibold text-red-500 flex-1 min-w-0">
            <AlertCircle size={14} className="shrink-0" />
            <span className="truncate">{error}</span>
          </div>
        )}
        <div className="flex gap-2 ml-auto shrink-0">
          <AdminButton type="button" onClick={onClose} disabled={disabled} variant="secondary">
            Hủy
          </AdminButton>
          <AdminButton type="button" onClick={() => submit('draft')} disabled={disabled} variant="secondary">
            <BookOpen size={13} />
            Lưu nháp
          </AdminButton>
          <AdminButton type="button" onClick={() => submit('published')} disabled={disabled}>
            <CalendarCheck size={13} />
            {saving ? 'Đang lưu...' : 'Lên lịch đăng'}
          </AdminButton>
        </div>
      </div>
    </AdminModal>
  )
}
