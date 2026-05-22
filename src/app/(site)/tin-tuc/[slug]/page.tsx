import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import Container from '@/app/_components/container'

export const revalidate = 3600
import Link from 'next/link'
import { ImageOff, Home } from 'lucide-react'
import { ShareButtons } from './_components/ShareButtons'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: article } = await supabase
    .from('articles')
    .select('title, summary, thumbnail_url')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (!article) return {}

  const title = article.title
  const description = article.summary || article.title
  const image = article.thumbnail_url || '/images/cha-truong-buu-diep.jpg'

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `/tin-tuc/${slug}`,
      type: 'article',
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  }
}

type BreadcrumbItem = { label: string; href: string }
const CATEGORY_CONFIG: Record<string, { breadcrumbs: BreadcrumbItem[] }> = {
  'cam-nang':  { breadcrumbs: [{ label: 'Trang Chủ', href: '/' }, { label: 'Hành Hương', href: '/hanh-huong' }, { label: 'Góc Hành Hương', href: '/hanh-huong#goc-hanh-huong' }] },
  'cong-dong': { breadcrumbs: [{ label: 'Trang Chủ', href: '/' }, { label: 'Cần Biết',   href: '/can-biet'   }, { label: 'Hoạt Động Cộng Đồng', href: '/can-biet#hoat-dong-cong-dong' }] },
  'loi-chung': { breadcrumbs: [{ label: 'Trang Chủ', href: '/' }, { label: 'Chứng Nhân', href: '/chung-nhan'    }, { label: 'Lời Chứng', href: '/chung-nhan#nhat-ky-chung-nhan' }] },
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: article } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (!article) {
    notFound()
  }

  const catConfig = CATEGORY_CONFIG[article.category] ?? {
    breadcrumbs: [{ label: 'Trang Chủ', href: '/' }],
  }

  const { data: relatedArticles } = await supabase
    .from('articles')
    .select('id, title, slug, thumbnail_url')
    .eq('category', article.category)
    .eq('status', 'published')
    .neq('slug', slug)
    .order('created_at', { ascending: false })
    .limit(6)

  return (
    <main className="mt-[9px] lg:mt-[18px] mb-16">
      <Container>
        <div className="max-w-4xl mx-auto">

          {/* Breadcrumb */}
          <nav className="sticky md:static top-[118px] z-10 bg-white md:bg-transparent border-b border-gray-100 md:border-b-0 -mx-2 px-2 md:mx-0 md:px-0 py-2.5 md:py-0 mb-0 md:mb-3 flex items-center flex-wrap gap-1">
            {catConfig.breadcrumbs.map((crumb, i) => {
              const isLast = i === catConfig.breadcrumbs.length - 1
              return (
                <span key={crumb.href} className="flex items-center gap-1">
                  {i > 0 && <span className="text-gray-300 text-[16px]">›</span>}
                  {isLast ? (
                    <span className="text-[16px] font-bold text-vatican-blue">{crumb.label}</span>
                  ) : (
                    <Link href={crumb.href} className="text-[16px] font-semibold text-gray-400 hover:text-vatican-blue transition-colors flex items-center">
                      {i === 0 ? <Home size={14} strokeWidth={2.5} /> : crumb.label}
                    </Link>
                  )}
                </span>
              )
            })}
          </nav>

          {/* Main card */}
          <div className="bg-white px-2 sm:px-6 md:p-10 py-5 md:py-10 md:rounded-xl md:border md:border-gray-200">
            <header className="mb-6 md:mb-8">
              <h1 className="text-[18px] font-bold text-vatican-dark leading-tight mb-3 md:mb-4">
                {article.title}
              </h1>
              <div className="flex items-center text-gray-500 text-[16px] gap-2">
                <span>Đăng ngày: {format(new Date(article.created_at), 'dd/MM/yyyy HH:mm', { locale: vi })}</span>
              </div>
            </header>

            {article.thumbnail_url && (
              <div className="relative w-full aspect-video md:aspect-auto md:h-[500px] mb-6 md:mb-10 rounded-lg overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={article.thumbnail_url}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {article.summary && (
              <div className="text-[18px] font-medium text-gray-700 mb-8 px-3 sm:px-4 py-3.5 sm:py-4 bg-gray-50 border-l-4 border-vatican-blue rounded-r-lg">
                {article.summary}
              </div>
            )}

            <div
              className="prose max-w-none prose-headings:text-[18px] prose-img:rounded-xl prose-headings:text-vatican-dark prose-a:text-vatican-blue hover:prose-a:text-vatican-blue-dark"
              dangerouslySetInnerHTML={{ __html: article.content || '' }}
            />

            <ShareButtons title={article.title} />
          </div>

          {/* Related articles */}
          {relatedArticles && relatedArticles.length > 0 && (
            <div className="mt-8 px-2 md:px-0">
              <h2 className="text-[18px] font-bold text-vatican-dark mb-4">Bài viết liên quan</h2>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {relatedArticles.map(item => (
                  <Link key={item.id} href={`/tin-tuc/${item.slug}`} className="group block">
                    <div className="relative w-full aspect-video bg-gray-100 rounded-lg overflow-hidden mb-2.5">
                      {item.thumbnail_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.thumbnail_url}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                          <ImageOff size={20} strokeWidth={1.5} className="text-gray-300" />
                        </div>
                      )}
                    </div>
                    <h3 className="text-[16px] font-bold text-vatican-dark line-clamp-3 leading-snug group-hover:text-vatican-blue transition-colors">
                      {item.title}
                    </h3>
                  </Link>
                ))}
              </div>
            </div>
          )}

        </div>
      </Container>
    </main>
  )
}
