import ArticleForm from '@/components/admin/ArticleForm'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'

const CAT_BACK: Record<string, string> = {
  'cong-dong': '/admin/hoat-dong-cong-dong',
  'cam-nang':  '/admin/goc-hanh-huong',
}

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: article } = await supabase
    .from('articles')
    .select('*')
    .eq('id', id)
    .single()

  if (!article) notFound()

  const returnHref = CAT_BACK[article.category] ?? '/admin/trang-chu'

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href={returnHref} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-200 transition-colors text-gray-600">
          <ChevronLeft size={18} />
        </Link>
        <div>
          <h1 className="text-[16px] font-black text-vatican-dark">Chỉnh sửa bài viết</h1>
          <p className="text-[16px] text-gray-500 mt-0.5">Cập nhật nội dung và xuất bản</p>
        </div>
      </div>
      <ArticleForm initialData={article} returnHref={returnHref} />
    </div>
  )
}
