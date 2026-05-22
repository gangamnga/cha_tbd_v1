'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Newspaper, ImageOff } from 'lucide-react'
import { ClientPagination } from '@/app/_components/client-pagination'

type Article = {
  id: string
  title: string
  slug: string
  thumbnail_url: string | null
}

const PER_PAGE = 6

export function CommunityArticlesGrid({ articles, emptyMessage = 'Chưa có bài viết nào.' }: { articles: Article[]; emptyMessage?: string }) {
  const [page, setPage] = useState(1)

  if (!articles.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-gray-400 border border-dashed border-gray-200 rounded-lg min-h-[300px]">
        <Newspaper size={48} strokeWidth={1} className="mb-4 text-gray-300" />
        <p className="text-[16px] text-gray-500 text-center max-w-md">
          {emptyMessage}
        </p>
      </div>
    )
  }

  const totalPages = Math.ceil(articles.length / PER_PAGE)
  const paged = articles.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  return (
    <div className="flex flex-col gap-4">
      {/* Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {paged.map((article) => (
          <Link key={article.id} href={`/tin-tuc/${article.slug}`}
            className="group block cursor-pointer">
            {/* Thumbnail */}
            <div className="relative w-full aspect-video bg-gray-100 rounded-lg overflow-hidden shrink-0">
              {article.thumbnail_url ? (
                <Image
                  src={article.thumbnail_url}
                  alt={article.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 1024px) 50vw, 33vw"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-1.5 bg-gradient-to-br from-gray-100 to-gray-200">
                  <ImageOff size={24} strokeWidth={1.5} className="text-gray-300" />
                  <span className="text-[16px] font-bold uppercase tracking-widest text-gray-300">Chưa có ảnh</span>
                </div>
              )}
            </div>
            {/* Title */}
            <h3 className="font-bold text-[16px] lg:text-[18px] text-vatican-dark line-clamp-3 leading-snug group-hover:text-vatican-blue transition-colors mt-3">
              {article.title}
            </h3>
          </Link>
        ))}
      </div>

      <ClientPagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  )
}
