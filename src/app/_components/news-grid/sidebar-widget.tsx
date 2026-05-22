import Link from "next/link";
import Image from "next/image";
import { NotebookText } from "lucide-react";

interface SidebarWidgetProps {
  articles?: { title: string; thumbnail_url: string | null; slug: string }[] | null;
}

export function SidebarWidget({ articles }: SidebarWidgetProps) {
  if (!articles?.length) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center gap-3 p-6 text-gray-300 min-h-[200px]">
        <NotebookText size={36} strokeWidth={1.5} />
        <p className="text-gray-400 text-[16px] text-center">Chưa có bài viết nào ở mục Góc hành hương.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 px-4 lg:px-5 py-4 lg:py-5">
      <div className="flex flex-col flex-1 justify-between">
        {articles.map((article, idx) => (
          <Link
            key={idx}
            href={`/tin-tuc/${article.slug}`}
            className={`
              ${idx >= 4 ? "hidden lg:flex" : "flex"}
              items-center gap-3 py-3 group flex-1 border-gray-100
              ${idx === 3 ? "border-b-0 lg:border-b" : "border-b last:border-0"}
            `}
          >
            <div className="flex flex-col flex-1 min-w-0">
              <h4 className="text-[16px] lg:text-[18px] font-semibold text-vatican-dark leading-snug group-hover:text-vatican-blue transition-colors">
                {article.title}
              </h4>
            </div>

            <div className="w-[100px] aspect-video bg-gray-200 flex-shrink-0 overflow-hidden relative rounded-md">
              {article.thumbnail_url ? (
                <Image
                  src={article.thumbnail_url}
                  alt={article.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="100px"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200" />
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
