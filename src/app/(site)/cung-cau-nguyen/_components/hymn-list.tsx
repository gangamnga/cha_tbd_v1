"use client";

import { useState, useMemo, useEffect } from "react";
import { Music, Search, PlayCircle, ChevronLeft, ChevronRight, X, Play } from "lucide-react";
import { getPageNumbers } from "@/utils/pagination";

export interface Hymn {
  id: string;
  title: string;
  artist: string;
  youtube_url?: string | null;
  image_url: string | null;
  playlists?: string[];
}

export interface HymnPlaylist {
  id: string;
  label: string;
  cover_image: string | null;
}

interface HymnListProps {
  hymns: Hymn[];
  playlists?: HymnPlaylist[];
  perPage?: number;
}

function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/)
  return match?.[1] ?? null
}

export function HymnList({ hymns, playlists = [], perPage = 8 }: HymnListProps) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null);
  const [playingHymn, setPlayingHymn] = useState<Hymn | null>(null);

  const filtered = useMemo(() => {
    let result = hymns;
    if (selectedPlaylist) result = result.filter((h) => h.playlists?.includes(selectedPlaylist));
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((h) => h.title.toLowerCase().includes(q) || h.artist.toLowerCase().includes(q));
    }
    return result;
  }, [hymns, search, selectedPlaylist]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  useEffect(() => {
    if (!playingHymn) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setPlayingHymn(null); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [playingHymn]);

  const handleSearch = (value: string) => { setSearch(value); setPage(1); };
  const handlePlaylist = (id: string | null) => { setSelectedPlaylist(id); setSearch(""); setPage(1); };
  const playlistCount = (id: string) => hymns.filter((h) => h.playlists?.includes(id)).length;

  return (
    <>
      <div className="flex flex-col gap-0 lg:gap-[20px] lg:grid lg:grid-cols-3 lg:h-[680px] px-[20px] pt-[12px] pb-[20px] lg:p-[20px]">

        {/* Mobile: chip ngang cuộn */}
          <div className="flex lg:hidden w-[calc(100%+40px)] -ml-[20px] pr-[20px] overflow-x-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
            <div className="sticky left-0 shrink-0 flex items-center bg-white z-10">
              <button
                onClick={() => handlePlaylist(null)}
                className={`shrink-0 flex items-center pl-[20px] pr-3 py-3 text-[16px] font-bold transition-colors ${
                  !selectedPlaylist ? "text-vatican-blue pointer-events-none" : "text-gray-500"
                }`}
              >
                Tất cả
              </button>
              <div className="w-px h-4 bg-vatican-blue shrink-0 self-center" />
            </div>
            {playlists.map((pl) => {
              const isActive = selectedPlaylist === pl.id;
              return (
                <button
                  key={pl.id}
                  onClick={() => handlePlaylist(pl.id)}
                  className={`shrink-0 flex items-center px-3 py-3 text-[16px] font-bold transition-colors ${
                    isActive ? "text-vatican-blue pointer-events-none" : "text-gray-500"
                  }`}
                >
                  {pl.label}
                </button>
              );
            })}
          </div>

        {/* Desktop: sidebar dọc */}
          <div className="hidden lg:flex lg:flex-col lg:col-span-1 lg:h-[640px] border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-4 h-[40px] flex items-center border-b border-gray-200 bg-gray-50 shrink-0">
              <span className="text-[16px] font-bold uppercase tracking-wide text-gray-400">Album</span>
            </div>
            <div className="flex-1 overflow-y-auto min-h-0 flex flex-col gap-1.5 p-1.5 bg-white">
              <button
                onClick={() => handlePlaylist(null)}
                className={`w-full flex items-center gap-3 px-3 py-3 text-left transition-colors rounded-lg shrink-0 ${
                  !selectedPlaylist ? "bg-vatican-blue text-white" : "bg-white text-vatican-dark hover:bg-gray-50"
                }`}
              >
                <div className="relative w-[40px] aspect-[4/3] rounded-lg shrink-0 overflow-hidden bg-gray-200 flex items-center justify-center">
                  <Music size={14} className={!selectedPlaylist ? 'text-white/60' : 'text-gray-400'} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-bold text-[16px] leading-snug ${!selectedPlaylist ? "text-white" : "text-vatican-dark"}`}>Tất cả</p>
                  <p className={`text-[16px] ${!selectedPlaylist ? "text-white/80" : "text-gray-500"}`}>{hymns.length} bài</p>
                </div>
              </button>
              {playlists.length === 0 ? (
                <div className="px-4 py-10 text-center flex flex-col items-center gap-3">
                  <p className="text-gray-400 text-[18px]">Chưa có album.</p>
                </div>
              ) : (
                playlists.map((pl) => {
                const count = playlistCount(pl.id);
                const isActive = selectedPlaylist === pl.id;
                return (
                  <button
                    key={pl.id}
                    onClick={() => handlePlaylist(pl.id)}
                    className={`w-full flex items-center gap-3 px-3 py-3 text-left transition-colors rounded-lg shrink-0 ${
                      isActive ? "bg-vatican-blue text-white" : "bg-white text-vatican-dark hover:bg-gray-50"
                    }`}
                  >
                    <div className="relative w-[40px] aspect-[4/3] rounded-lg shrink-0 overflow-hidden bg-gray-200 flex items-center justify-center">
                      {pl.cover_image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={pl.cover_image} alt={pl.label} className="w-full h-full object-cover" />
                      ) : (
                        <Music size={14} className={isActive ? 'text-white/60' : 'text-gray-400'} />
                      )}
                      {isActive && (
                        <div className="absolute inset-0 bg-vatican-blue/40 flex items-center justify-center">
                          <PlayCircle size={16} className="text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-bold text-[16px] leading-snug ${isActive ? "text-white" : "text-vatican-dark"}`}>{pl.label}</p>
                      <p className={`text-[16px] ${isActive ? "text-white/80" : "text-gray-500"}`}>{count} bài</p>
                    </div>
                  </button>
                );
              })
              )}
            </div>
          </div>

        {/* Cột phải: Tìm kiếm + Danh sách */}
        <div className="lg:col-span-2 min-w-0 h-[640px] lg:h-[640px] flex flex-col">

          <div className="px-3 py-3 border-b border-gray-200 bg-white shrink-0">
            <div className="relative">
              <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Tìm kiếm thánh ca, ca sĩ..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-[16px] text-vatican-dark placeholder:text-gray-400 outline-none focus:border-vatican-blue transition-colors"
              />
            </div>
            {selectedPlaylist && (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-[16px] text-gray-500">Đang lọc:</span>
                <span className="bg-vatican-blue text-white text-[16px] font-bold px-3 py-1 rounded-lg flex items-center gap-2">
                  {playlists.find((p) => p.id === selectedPlaylist)?.label}
                  <button onClick={() => handlePlaylist(null)} className="opacity-80 hover:opacity-100">
                    <X size={13} strokeWidth={3} />
                  </button>
                </span>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto min-h-0 flex flex-col divide-y divide-gray-100 bg-white">
            {paged.length === 0 ? (
              <div className="px-4 py-10 text-center text-gray-400 text-[18px]">
                Không tìm thấy bài thánh ca phù hợp.
              </div>
            ) : (
              paged.map((hymn) => {
                const hasYoutube = !!hymn.youtube_url && !!getYouTubeId(hymn.youtube_url)
                return (
                  <button
                    key={hymn.id}
                    type="button"
                    disabled={!hasYoutube}
                    onClick={() => hasYoutube && setPlayingHymn(hymn)}
                    className={`flex items-center gap-4 px-4 py-3.5 text-left w-full min-h-[72px] transition-colors group ${
                      hasYoutube ? "hover:bg-gray-50 cursor-pointer" : "cursor-default"
                    }`}
                  >
                    <div className="relative w-[80px] aspect-video bg-gray-200 shrink-0 overflow-hidden flex items-center justify-center rounded-md">
                      {hymn.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={hymn.image_url} alt={hymn.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <Music size={24} className="text-gray-400" />
                      )}
                      {hasYoutube && (
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play size={24} className="text-white fill-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className={`font-bold text-[18px] leading-snug line-clamp-2 transition-colors ${
                        hasYoutube ? "text-vatican-dark group-hover:text-vatican-blue" : "text-vatican-dark"
                      }`}>{hymn.title}</p>
                      <p className="flex items-center gap-1.5 text-[16px] text-gray-500 mt-1">
                        <Music size={13} className="text-vatican-blue shrink-0" />
                        {hymn.artist}
                      </p>
                    </div>
                    {hasYoutube && (
                      <PlayCircle size={20} className="shrink-0 text-gray-300 group-hover:text-vatican-blue transition-colors" />
                    )}
                  </button>
                )
              })
            )}
          </div>

          {filtered.length > 0 && (
            <div className="border-t border-gray-200 px-4 py-3 flex flex-col sm:flex-row items-center sm:justify-between gap-2 bg-white shrink-0">
              <p className="text-[16px] text-gray-500">
                {filtered.length === hymns.length ? (
                  <>Hiển thị <span className="font-bold text-vatican-dark">{(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)}</span> trong tổng số <span className="font-bold text-vatican-dark">{hymns.length}</span> bài thánh ca</>
                ) : (
                  <>Hiển thị <span className="font-bold text-vatican-dark">{(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)}</span> trong <span className="font-bold text-vatican-dark">{filtered.length}</span> kết quả lọc</>
                )}
              </p>
              {totalPages > 1 && (
                <div className="flex items-center gap-1 shrink-0">
                  {page > 1 ? (
                    <button aria-label="Trang trước" onClick={() => setPage((p) => p - 1)} className="w-9 h-9 flex items-center justify-center border border-gray-200 rounded-lg bg-white hover:border-vatican-blue hover:text-vatican-blue transition-colors">
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
                        onClick={() => setPage(p as number)}
                        className={`w-9 h-9 flex items-center justify-center font-bold text-[16px] border rounded-lg transition-colors ${
                          page === p ? "bg-vatican-blue text-white border-vatican-blue pointer-events-none" : "bg-white text-vatican-dark border-gray-200 hover:border-vatican-blue hover:text-vatican-blue"
                        }`}
                      >{p}</button>
                    )
                  )}
                  {page < totalPages ? (
                    <button aria-label="Trang sau" onClick={() => setPage((p) => p + 1)} className="w-9 h-9 flex items-center justify-center border border-gray-200 rounded-lg bg-white hover:border-vatican-blue hover:text-vatican-blue transition-colors">
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

      {/* YouTube Player Modal */}
      {playingHymn && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setPlayingHymn(null)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100">
              <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                {playingHymn.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={playingHymn.image_url} alt={playingHymn.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center"><Music size={16} className="text-gray-400" /></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[16px] text-vatican-dark leading-snug line-clamp-1">{playingHymn.title}</p>
                <p className="text-[16px] text-gray-500">{playingHymn.artist}</p>
              </div>
              <button
                onClick={() => setPlayingHymn(null)}
                className="inline-flex items-center justify-center w-9 h-9 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors shrink-0"
              >
                <X size={18} />
              </button>
            </div>
            {(() => {
              const ytId = getYouTubeId(playingHymn.youtube_url ?? '')
              return ytId ? (
                <div style={{ aspectRatio: '16/9' }}>
                  <iframe
                    src={`https://www.youtube.com/embed/${ytId}?autoplay=1`}
                    className="w-full h-full"
                    allow="autoplay; encrypted-media; fullscreen"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="aspect-video flex items-center justify-center text-gray-400 bg-gray-50">
                  <p className="text-[16px]">Không tìm thấy video YouTube hợp lệ.</p>
                </div>
              )
            })()}
          </div>
        </div>
      )}
    </>
  );
}
