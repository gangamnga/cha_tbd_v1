import Link from "next/link";
import { CATEGORIES } from "@/data/testimonies";

export function TestimonyFilters({
  activeCategory,
  categoryCounts,
  totalCount,
}: {
  activeCategory: string;
  categoryCounts: Record<string, number>;
  totalCount: number;
}) {
  const [tatCa, ...restCats] = CATEGORIES;

  return (
    <>
      {/* Mobile: chip ngang cuộn, "Tất cả" ghim trái */}
      <div className="flex lg:hidden w-[calc(100%+16px)] -ml-2 pr-2 sm:w-[calc(100%+40px)] sm:-ml-5 sm:pr-5 overflow-x-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
        <div className="sticky left-0 shrink-0 flex items-center bg-white z-10">
          <Link
            href="/chung-nhan?cat=tat-ca&page=1"
            className={`shrink-0 flex items-center pl-2 sm:pl-5 pr-3 py-3 text-[16px] font-bold transition-colors ${
              activeCategory === "tat-ca"
                ? "text-vatican-blue pointer-events-none"
                : "text-gray-500"
            }`}
          >
            Tất cả
          </Link>
          <div className="w-px h-4 bg-vatican-blue shrink-0 self-center" />
        </div>
        {restCats.map(({ label, value }) => {
          const isActive = activeCategory === value;
          return (
            <Link
              key={value}
              href={`/chung-nhan?cat=${value}&page=1`}
              className={`shrink-0 flex items-center px-3 py-3 text-[16px] font-bold transition-colors ${
                isActive
                  ? "text-vatican-blue pointer-events-none"
                  : "text-gray-500"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </div>

      {/* Desktop: sidebar dọc */}
      <div className="hidden lg:flex lg:flex-col w-[360px] shrink-0 border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-4 h-[40px] flex items-center border-b border-gray-200 bg-gray-50 shrink-0">
          <span className="text-[16px] font-bold uppercase tracking-wide text-gray-400">Danh mục</span>
        </div>
        <div className="flex-1 overflow-y-auto min-h-0 flex flex-col gap-1.5 p-1.5">
          <Link
            href={`/chung-nhan?cat=${tatCa.value}&page=1`}
            className={`w-full flex items-center justify-between gap-2 px-3 py-3 transition-colors rounded-lg shrink-0 ${
              activeCategory === tatCa.value
                ? "bg-vatican-blue text-white pointer-events-none"
                : "bg-white text-vatican-dark hover:bg-gray-50"
            }`}
          >
            <span className={`font-bold text-[16px] leading-snug flex-1 ${activeCategory === tatCa.value ? "text-white" : "text-vatican-dark"}`}>
              {tatCa.label}
            </span>
            <span className={`text-[16px] font-bold px-2 py-0.5 rounded-lg shrink-0 ${
              activeCategory === tatCa.value ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
            }`}>{totalCount}</span>
          </Link>
          {restCats.map(({ label, value }) => {
            const isActive = activeCategory === value;
            const count = categoryCounts[label] ?? 0;
            return (
              <Link
                key={value}
                href={`/chung-nhan?cat=${value}&page=1`}
                className={`w-full flex items-center justify-between gap-2 px-3 py-3 transition-colors rounded-lg shrink-0 ${
                  isActive
                    ? "bg-vatican-blue text-white pointer-events-none"
                    : "bg-white text-vatican-dark hover:bg-gray-50"
                }`}
              >
                <span className={`font-bold text-[16px] leading-snug flex-1 ${isActive ? "text-white" : "text-vatican-dark"}`}>
                  {label}
                </span>
                <span className={`text-[16px] font-bold px-2 py-0.5 rounded-lg shrink-0 ${
                  isActive ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                }`}>{count}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
