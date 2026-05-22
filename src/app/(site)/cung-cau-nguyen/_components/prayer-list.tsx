"use client";

import { useState, useMemo } from "react";
import { Plus, ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { getPageNumbers } from "@/utils/pagination";

export interface Prayer {
  id: string;
  title: string;
  content: string;
  themes?: string[];
}

export interface PrayerTheme {
  id: string;
  label: string;
  description?: string;
}

interface PrayerListProps {
  prayers: Prayer[];
  themes?: PrayerTheme[];
  perPage?: number;
}

export function PrayerList({ prayers, themes = [], perPage = 8 }: PrayerListProps) {
  const [search, setSearch] = useState("");
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let result = prayers;
    if (selectedTheme) result = result.filter((p) => p.themes?.includes(selectedTheme));
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((p) => p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q));
    }
    return result;
  }, [prayers, search, selectedTheme]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const reset = (keepTheme = false) => {
    setPage(1);
    setOpenIndex(null);
    if (!keepTheme) setSelectedTheme(null);
  };

  const handleSearch = (value: string) => { setSearch(value); reset(true); };
  const handleTheme = (id: string | null) => { setSelectedTheme(id); setSearch(""); reset(true); };
  const themeCount = (id: string) => prayers.filter((p) => p.themes?.includes(id)).length;

  return (
    <div className="flex flex-col gap-0 lg:gap-[20px] lg:grid lg:grid-cols-3 lg:h-[540px] px-2 sm:px-5 pt-[12px] pb-[20px] lg:p-[20px]">

      {/* Mobile: chip ngang cuộn */}
        <div className="flex lg:hidden w-[calc(100%+16px)] -ml-2 pr-2 sm:w-[calc(100%+40px)] sm:-ml-5 sm:pr-5 overflow-x-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
          <div className="sticky left-0 shrink-0 flex items-center bg-white z-10">
            <button
              onClick={() => handleTheme(null)}
              className={`shrink-0 flex items-center pl-2 sm:pl-5 pr-3 py-3 text-[16px] font-bold transition-colors ${
                !selectedTheme ? "text-vatican-blue pointer-events-none" : "text-gray-500"
              }`}
            >
              Tất cả
            </button>
            <div className="w-px h-4 bg-vatican-blue shrink-0 self-center" />
          </div>
          {themes.map((theme) => {
            const isActive = selectedTheme === theme.id;
            return (
              <button
                key={theme.id}
                onClick={() => handleTheme(theme.id)}
                className={`shrink-0 flex items-center px-3 py-3 text-[16px] font-bold transition-colors ${
                  isActive ? "text-vatican-blue pointer-events-none" : "text-gray-500"
                }`}
              >
                {theme.label}
              </button>
            );
          })}
        </div>

      {/* Desktop: sidebar dọc */}
        <div className="hidden lg:flex lg:flex-col lg:col-span-1 lg:h-[500px] border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-4 h-[40px] flex items-center border-b border-gray-200 bg-gray-50 shrink-0">
            <span className="text-[16px] font-bold uppercase tracking-wide text-gray-400">Chủ đề</span>
          </div>
          <div className="flex-1 overflow-y-auto min-h-0 flex flex-col gap-1.5 p-1.5 bg-white">
            <button
              onClick={() => handleTheme(null)}
              className={`w-full flex items-center justify-between gap-2 px-3 py-3 text-left transition-colors rounded-lg shrink-0 ${
                !selectedTheme ? "bg-vatican-blue text-white" : "bg-white text-vatican-dark hover:bg-gray-50"
              }`}
            >
              <span className={`font-bold text-[16px] leading-snug flex-1 text-left ${!selectedTheme ? "text-white" : "text-vatican-dark"}`}>
                Tất cả
              </span>
              <span className={`text-[16px] font-bold px-2 py-0.5 rounded-lg shrink-0 ${
                !selectedTheme ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
              }`}>{prayers.length}</span>
            </button>
            {themes.length === 0 ? (
              <div className="px-4 py-10 text-center flex flex-col items-center gap-3">
                <p className="text-gray-400 text-[18px]">Chưa có chủ đề.</p>
              </div>
            ) : (
              themes.map((theme) => {
              const count = themeCount(theme.id);
              const isActive = selectedTheme === theme.id;
              return (
                <button
                  key={theme.id}
                  onClick={() => handleTheme(theme.id)}
                  className={`w-full flex items-center justify-between gap-2 px-3 py-3 text-left transition-colors rounded-lg shrink-0 ${
                    isActive ? "bg-vatican-blue text-white" : "bg-white text-vatican-dark hover:bg-gray-50"
                  }`}
                >
                  <span className={`font-bold text-[16px] leading-snug flex-1 text-left ${isActive ? "text-white" : "text-vatican-dark"}`}>
                    {theme.label}
                  </span>
                  <span className={`text-[16px] font-bold px-2 py-0.5 rounded-lg shrink-0 ${
                    isActive ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                  }`}>{count}</span>
                </button>
              );
            })
            )}
          </div>
        </div>

      {/* Cột phải: Tìm kiếm + Danh sách */}
      <div className="lg:col-span-2 min-w-0 h-[500px] lg:h-[500px] flex flex-col">

        {/* Search + filter chip */}
        <div className="px-3 py-3 border-b border-gray-200 bg-white shrink-0">
          <div className="relative">
            <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Tìm kiếm lời kinh..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-[16px] text-vatican-dark placeholder:text-gray-400 outline-none focus:border-vatican-blue transition-colors"
            />
          </div>
          {selectedTheme && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-[16px] text-gray-500">Đang lọc:</span>
              <span className="bg-vatican-blue text-white text-[16px] font-bold px-3 py-1 rounded-lg flex items-center gap-2">
                {themes.find((t) => t.id === selectedTheme)?.label}
                <button onClick={() => handleTheme(null)} className="opacity-80 hover:opacity-100">
                  <X size={13} strokeWidth={3} />
                </button>
              </span>
            </div>
          )}
        </div>

        {/* Danh sách */}
        <div className="flex-1 overflow-y-auto min-h-0 flex flex-col divide-y divide-gray-100 bg-white">
          {paged.length === 0 ? (
            <div className="px-4 py-10 text-center flex flex-col items-center gap-3">
              <p className="text-gray-400 text-[18px]">Không tìm thấy lời kinh phù hợp.</p>
              {(search || selectedTheme) && (
                <button
                  onClick={() => { setSearch(""); setSelectedTheme(null); setPage(1); setOpenIndex(null); }}
                  className="text-[16px] font-bold text-vatican-blue hover:underline transition-colors"
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>
          ) : (
            paged.map((prayer, i) => {
              const idx = (page - 1) * perPage + i;
              const isOpen = openIndex === idx;
              return (
                <div key={prayer.id}>
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    className="w-full flex items-center gap-4 px-4 py-4 text-left hover:bg-gray-50 transition-colors group min-h-[60px]"
                  >
                    <div className="text-vatican-blue shrink-0">
                      {isOpen ? <X size={18} strokeWidth={2.5} /> : <Plus size={18} strokeWidth={2.5} />}
                    </div>
                    <span className="flex-1 font-bold text-[18px] text-vatican-dark group-hover:text-vatican-blue transition-colors leading-snug">
                      {prayer.title}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-5 pl-[52px]">
                      <p className="text-[18px] text-gray-600 leading-loose border-l-2 border-vatican-blue/30 pl-4">
                        {prayer.content}
                      </p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {filtered.length > 0 && (
          <div className="border-t border-gray-200 px-4 py-3 flex flex-col sm:flex-row items-center sm:justify-between gap-2 bg-white shrink-0">
            <p className="text-[16px] text-gray-500">
              {filtered.length === prayers.length ? (
                <>Hiển thị <span className="font-bold text-vatican-dark">{(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)}</span> trong tổng số <span className="font-bold text-vatican-dark">{prayers.length}</span> lời kinh</>
              ) : (
                <>Hiển thị <span className="font-bold text-vatican-dark">{(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)}</span> trong <span className="font-bold text-vatican-dark">{filtered.length}</span> kết quả lọc</>
              )}
            </p>
            {totalPages > 1 && (
              <div className="flex items-center gap-1 shrink-0">
                {page > 1 ? (
                  <button aria-label="Trang trước" onClick={() => { setPage((p) => p - 1); setOpenIndex(null); }} className="w-9 h-9 flex items-center justify-center border border-gray-200 rounded-lg bg-white hover:border-vatican-blue hover:text-vatican-blue transition-colors">
                    <ChevronLeft size={16} strokeWidth={2.5} />
                  </button>
                ) : (
                  <span className="w-9 h-9 flex items-center justify-center border border-gray-100 rounded-lg bg-gray-50 text-gray-300 cursor-not-allowed">
                    <ChevronLeft size={16} strokeWidth={2.5} />
                  </span>
                )}
                {getPageNumbers(page, totalPages).map((p, i) =>
                  p === "..." ? (
                    <span key={`e${i}`} className="w-9 h-9 flex items-center justify-center text-gray-400 text-[16px]">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => { setPage(p as number); setOpenIndex(null); }}
                      className={`w-9 h-9 flex items-center justify-center font-bold text-[16px] border rounded-lg transition-colors ${
                        page === p ? "bg-vatican-blue text-white border-vatican-blue pointer-events-none" : "bg-white text-vatican-dark border-gray-200 hover:border-vatican-blue hover:text-vatican-blue"
                      }`}
                    >{p}</button>
                  )
                )}
                {page < totalPages ? (
                  <button aria-label="Trang sau" onClick={() => { setPage((p) => p + 1); setOpenIndex(null); }} className="w-9 h-9 flex items-center justify-center border border-gray-200 rounded-lg bg-white hover:border-vatican-blue hover:text-vatican-blue transition-colors">
                    <ChevronRight size={16} strokeWidth={2.5} />
                  </button>
                ) : (
                  <span className="w-9 h-9 flex items-center justify-center border border-gray-100 rounded-lg bg-gray-50 text-gray-300 cursor-not-allowed">
                    <ChevronRight size={16} strokeWidth={2.5} />
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
