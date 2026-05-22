import Link from "next/link";
import Image from "next/image";

interface ArticleCardProps {
  title: string;
  imageUrl?: string | null;
  href?: string;
  desc?: string;
  noClamp?: boolean;
  imageClassName?: string;
}

export function ArticleCard({ title, imageUrl, href = "#", desc, noClamp = false, imageClassName }: ArticleCardProps) {
  return (
    <Link href={href} className="block cursor-pointer group">
      <div className={`relative w-full overflow-hidden bg-gray-100 rounded-lg ${imageClassName ?? "aspect-video"}`}>
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200" />
        )}
      </div>
      <h3 className={`text-[16px] lg:text-[18px] font-bold leading-snug text-vatican-dark group-hover:text-vatican-blue transition-colors mt-3 ${noClamp ? "" : "line-clamp-3"}`}>
        {title}
      </h3>
      {desc && (
        <p className="text-[16px] leading-relaxed text-gray-500 line-clamp-2 mt-1 px-1">
          {desc}
        </p>
      )}
    </Link>
  );
}
