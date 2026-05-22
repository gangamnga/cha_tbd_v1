'use client'

import { ChevronLeft, ChevronRight } from "lucide-react";
import { getPageNumbers } from "@/utils/pagination";

interface ClientPaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}

export function ClientPagination({ page, totalPages, onPageChange }: ClientPaginationProps) {
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(page, totalPages);
  const btnBase = "w-9 h-9 flex items-center justify-center border rounded-lg transition-colors";
  const btnActive = "bg-vatican-blue text-white border-vatican-blue pointer-events-none";
  const btnIdle = "bg-white text-vatican-dark border-gray-200 hover:border-vatican-blue hover:text-vatican-blue";
  const btnDisabled = "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed";

  return (
    <div className="flex items-center justify-center gap-1">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        aria-label="Trang trước"
        className={`${btnBase} ${page === 1 ? btnDisabled : btnIdle}`}
      >
        <ChevronLeft size={16} strokeWidth={2.5} />
      </button>

      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`e${i}`} className="w-9 h-9 flex items-center justify-center text-gray-400 text-[16px]">…</span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p as number)}
            className={`${btnBase} text-[16px] font-bold ${page === p ? btnActive : btnIdle}`}
            aria-current={page === p ? "page" : undefined}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        aria-label="Trang sau"
        className={`${btnBase} ${page === totalPages ? btnDisabled : btnIdle}`}
      >
        <ChevronRight size={16} strokeWidth={2.5} />
      </button>
    </div>
  );
}
