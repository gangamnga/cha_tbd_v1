import { ArticleCard } from "./article-card";
import { HeroCard } from "./hero-card";
import { Megaphone } from "lucide-react";

interface NewsGridProps {
  articles?: { title: string; thumbnail_url: string | null; slug: string }[] | null;
}

export function NewsGrid({ articles }: NewsGridProps) {
  const combinedData = (articles || []).map((a) => ({
    title: a.title,
    imageUrl: a.thumbnail_url || '',
    href: `/tin-tuc/${a.slug}`,
  })).slice(0, 3);

  if (combinedData.length === 0) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center gap-3 p-6 text-gray-300 min-h-[200px]">
        <Megaphone size={36} strokeWidth={1.5} />
        <p className="text-gray-400 text-[16px] text-center">Chưa có tin nhanh nào được cập nhật.</p>
      </div>
    );
  }

  const heroArticle = combinedData[0];
  const featuredArticles = [combinedData[1], combinedData[2]].filter(Boolean);

  return (
    <div className="px-3 md:px-4 lg:px-5 py-3 md:py-4 lg:py-[18px] flex-1 flex flex-col">
      <div className="flex flex-col lg:flex-row gap-5 lg:gap-6">
        {/* Featured: 2 stacked cards, 1/3 width */}
        {featuredArticles.length > 0 && (
          <div className="lg:w-1/3 flex flex-col gap-5 lg:gap-6 order-last lg:order-first">
            {featuredArticles[0] && (
              <ArticleCard
                title={featuredArticles[0].title}
                imageUrl={featuredArticles[0].imageUrl}
                href={featuredArticles[0].href}
                imageClassName="aspect-video"
              />
            )}
            {featuredArticles[1] && (
              <ArticleCard
                title={featuredArticles[1].title}
                imageUrl={featuredArticles[1].imageUrl}
                href={featuredArticles[1].href}
                imageClassName="aspect-video"
              />
            )}
          </div>
        )}

        {/* Hero: 2/3 width — LCP image, priority=true */}
        {heroArticle && (
          <div className={`order-first lg:order-last ${featuredArticles.length > 0 ? "lg:w-2/3" : "w-full"}`}>
            <HeroCard
              title={heroArticle.title}
              imageUrl={heroArticle.imageUrl}
              href={heroArticle.href}
            />
          </div>
        )}
      </div>
    </div>
  );
}
