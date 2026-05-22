import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { PublishForm } from './_components/PublishForm'

export default async function PublishTestimonyPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: testimony } = await supabase
    .from('testimonies')
    .select('*')
    .eq('id', id)
    .eq('status', 'approved')
    .maybeSingle()

  if (!testimony) notFound()

  const authorLine = [testimony.name ?? 'Ẩn danh', testimony.location]
    .filter(Boolean)
    .join(' — ')

  const categoryLine = testimony.categories?.length
    ? `<p><em>Loại ơn lành: ${(testimony.categories as string[]).join(', ')}</em></p>`
    : ''

  const initialContent = `<blockquote><p><strong>${authorLine}</strong></p>${categoryLine}</blockquote><p>${testimony.content.replace(/\n/g, '</p><p>')}</p>`

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin/loi-chung/new"
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-200 transition-colors text-gray-600"
        >
          <ChevronLeft size={18} />
        </Link>
        <div>
          <h1 className="text-[16px] font-black text-vatican-dark">Đăng lời chứng</h1>
          <p className="text-[16px] text-gray-500 mt-0.5">Soạn thảo và xuất bản lời chứng thành bài viết</p>
        </div>
      </div>

      {/* Thông tin nguồn */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-5 py-4 mb-6 flex flex-col gap-1">
        <p className="text-[16px] font-bold uppercase tracking-widest text-yellow-600 mb-1">Lời chứng gốc</p>
        <p className="text-[16px] font-bold text-vatican-dark">{testimony.title}</p>
        <p className="text-[16px] text-gray-500">
          {[testimony.name ?? 'Ẩn danh', testimony.location].filter(Boolean).join(' · ')}
          {testimony.categories?.length ? ` · ${(testimony.categories as string[]).join(', ')}` : ''}
        </p>
      </div>

      <PublishForm
        testimonyId={testimony.id}
        initialTitle={testimony.title}
        initialContent={initialContent}
        testimonyCategories={(testimony.categories as string[]) ?? []}
      />
    </div>
  )
}
