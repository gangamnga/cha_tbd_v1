import { ArticleCard } from "./news-grid/article-card";
import { BookHeart } from "lucide-react";

interface TestimonySectionProps {
  articles?: { id: string; title: string; slug: string; thumbnail_url: string | null }[] | null;
}

export function TestimonySection({ articles }: TestimonySectionProps) {
  if (!articles?.length) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center gap-3 p-6 text-gray-300 min-h-[200px]">
        <BookHeart size={36} strokeWidth={1.5} />
        <p className="text-gray-400 text-[16px] text-center">Chưa có nhật ký chứng nhân.</p>
      </div>
    );
  }

  return (
    <div className="px-4 lg:px-5 py-4 lg:py-5 grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
      {articles.slice(0, 6).map((item) => (
        <ArticleCard
          key={item.id}
          title={item.title}
          imageUrl={item.thumbnail_url}
          href={`/tin-tuc/${item.slug}`}
          noClamp
          imageClassName="aspect-video"
        />
      ))}
    </div>
  );
}
