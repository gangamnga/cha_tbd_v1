import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getPageNumbers } from "@/utils/pagination";

interface SitePaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string; // e.g. "/chung-nhan?cat=all" — page param appended as &page=N
}

export function SitePagination({ currentPage, totalPages, baseUrl }: SitePaginationProps) {
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(currentPage, totalPages);
  const href = (p: number) => `${baseUrl}&page=${p}`;

  const btnBase = "w-9 h-9 flex items-center justify-center border rounded-lg transition-colors";
  const btnActive = "bg-vatican-blue text-white border-vatican-blue pointer-events-none";
  const btnIdle = "bg-white text-vatican-dark border-gray-200 hover:border-vatican-blue hover:text-vatican-blue";
  const btnDisabled = "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed";

  return (
    <div className="flex items-center justify-center gap-1">
      {currentPage > 1 ? (
        <Link href={href(currentPage - 1)} className={`${btnBase} ${btnIdle}`} aria-label="Trang trước">
          <ChevronLeft size={16} strokeWidth={2.5} />
        </Link>
      ) : (
        <span className={`${btnBase} ${btnDisabled}`}>
          <ChevronLeft size={16} strokeWidth={2.5} />
        </span>
      )}

      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`e${i}`} className="w-9 h-9 flex items-center justify-center text-gray-400 text-[16px]">…</span>
        ) : (
          <Link
            key={p}
            href={href(p as number)}
            className={`${btnBase} text-[16px] font-bold ${p === currentPage ? btnActive : btnIdle}`}
            aria-current={p === currentPage ? "page" : undefined}
          >
            {p}
          </Link>
        )
      )}

      {currentPage < totalPages ? (
        <Link href={href(currentPage + 1)} className={`${btnBase} ${btnIdle}`} aria-label="Trang sau">
          <ChevronRight size={16} strokeWidth={2.5} />
        </Link>
      ) : (
        <span className={`${btnBase} ${btnDisabled}`}>
          <ChevronRight size={16} strokeWidth={2.5} />
        </span>
      )}
    </div>
  );
}
