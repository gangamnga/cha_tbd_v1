import Link from "next/link";
import Image from "next/image";

type HeroCardProps = {
  title: string;
  imageUrl: string;
  href?: string;
  className?: string;
};

export function HeroCard({ title, imageUrl, href = "#", className = "" }: HeroCardProps) {
  return (
    <Link href={href} className={`block cursor-pointer group w-full ${className}`}>
      <div className="relative aspect-video w-full overflow-hidden bg-gray-200 rounded-md">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 1024px) 100vw, 75vw"
        />
      </div>
      <h3 className="text-[16px] lg:text-[18px] font-bold leading-snug text-vatican-dark group-hover:text-vatican-blue transition-colors line-clamp-3 mt-3">
        {title}
      </h3>
    </Link>
  );
}
