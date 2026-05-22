import ArticleForm from '@/components/admin/ArticleForm'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

const CAT_BACK: Record<string, string> = {
  'cong-dong': '/admin/hoat-dong-cong-dong',
  'cam-nang':  '/admin/goc-hanh-huong',
}

export default async function NewArticlePage({ searchParams }: { searchParams: Promise<{ cat?: string }> }) {
  const { cat } = await searchParams
  const validCats = ['cam-nang', 'cong-dong']
  const defaultCategory = validCats.includes(cat ?? '') ? cat! : 'cam-nang'
  const returnHref = CAT_BACK[defaultCategory] ?? '/admin/trang-chu'

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href={returnHref} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-200 transition-colors text-gray-600">
          <ChevronLeft size={18} />
        </Link>
        <div>
          <h1 className="text-[16px] font-black text-vatican-dark">Thêm bài viết mới</h1>
          <p className="text-[16px] text-gray-500 mt-0.5">Viết và xuất bản bài viết mới</p>
        </div>
      </div>
      <ArticleForm initialData={{ category: defaultCategory }} returnHref={returnHref} />
    </div>
  )
}
