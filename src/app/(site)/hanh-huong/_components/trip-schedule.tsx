"use client";

import { useState } from "react";
import { Route, CalendarDays, ArrowRight } from "lucide-react";
import type { PilgrimageTrip, TripStatus } from "@/data/pilgrimages";
import { RegisterModal } from "./register-modal";

const STATUS_CONFIG: Record<TripStatus, { label: string; dot: string; text: string }> = {
  open:      { label: "Đang mở đăng ký", dot: "bg-green-400",  text: "text-green-400" },
  completed: { label: "Đã hoàn thành",   dot: "bg-gray-400",   text: "text-gray-400"  },
};

function getMonth(dates: string): number {
  return parseInt(dates.split("/")[1], 10);
}

export function TripSchedule({ year, trips }: { year: number; trips: PilgrimageTrip[] }) {
  const [activeTrip, setActiveTrip] = useState<PilgrimageTrip>(trips[0]);
  const [showModal, setShowModal] = useState(false);

  const [activeMonth, setActiveMonth] = useState<number | null>(null);

  const monthsWithTrips = new Set(
    trips.map((t) => getMonth(t.dates))
  );

  const filtered = trips.filter((t) => {
    if (activeMonth !== null && getMonth(t.dates) !== activeMonth) return false;
    return true;
  });

  const active = filtered.includes(activeTrip) ? activeTrip : filtered[0];

  function handleMonthFilter(month: number | null) {
    setActiveMonth(month);
    const next = trips.filter((t) => {
      if (month !== null && getMonth(t.dates) !== month) return false;
      return true;
    });
    if (next.length > 0 && !next.includes(activeTrip)) setActiveTrip(next[0]);
  }

  const s = active ? STATUS_CONFIG[active.status] : null;

  return (
    <>
      {showModal && active?.status === "open" && (
        <RegisterModal trip={active} onClose={() => setShowModal(false)} />
      )}

      <div className="bg-white lg:border lg:border-gray-200 lg:rounded-lg lg:overflow-hidden">

        {/* ── Hàng 1: Bộ lọc (Mobile & Desktop) ── */}
        <div className="flex border-b border-gray-200 w-full overflow-x-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
          <div className="sticky left-0 shrink-0 flex items-center bg-white z-10">
            <button
              type="button"
              onClick={() => handleMonthFilter(null)}
              className={`shrink-0 flex items-center px-4 py-3 text-[16px] font-black uppercase transition-colors ${
                activeMonth === null ? "text-vatican-blue pointer-events-none" : "text-gray-500 hover:text-vatican-blue"
              }`}
            >
              Năm {year}
            </button>
            <div className="w-px h-4 bg-vatican-blue mr-2 shrink-0 self-center" />
          </div>
          {Array.from(monthsWithTrips).sort((a, b) => a - b).map((m) => {
            const isActive = activeMonth === m;
            return (
              <button
                key={m}
                type="button"
                onClick={() => handleMonthFilter(isActive ? null : m)}
                className={`shrink-0 flex items-center px-3 py-3 text-[16px] font-bold transition-colors ${
                  isActive ? "text-vatican-blue pointer-events-none" : "text-gray-500"
                }`}
              >
                Tháng {m}
              </button>
            );
          })}
        </div>

        {/* ── Hàng 2: Banner chính ── */}
        {active && s && (
          <>
          {/* Ảnh banner */}
          <div className="relative w-full aspect-[16/9] lg:h-[500px] bg-gray-200 overflow-hidden">
            {active.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={active.image_url}
                src={active.image_url}
                alt={active.title}
                className="w-full h-full object-cover transition-opacity duration-500"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200" />
            )}
          </div>

          {/* Thông tin bên dưới ảnh */}
          <div className="px-4 py-4 lg:px-6 lg:py-5 border-t border-gray-200 bg-white">
            <h3 className="font-black text-[18px] text-vatican-dark leading-snug mb-2">
              {active.title}
            </h3>
            <p className="flex items-center gap-2 text-gray-500 text-[16px] lg:text-[16px] mb-4">
              <Route size={15} strokeWidth={2.5} className="shrink-0 text-vatican-blue" />
              <span>{active.departure} → {active.destinations.join(" → ")}</span>
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="inline-flex items-center gap-1.5 text-gray-500 text-[16px] lg:text-[16px] font-semibold">
                <CalendarDays size={16} strokeWidth={2.5} className="text-vatican-blue" />
                {active.dates}
              </span>
              {active.status === "open" ? (
                <button
                  onClick={() => setShowModal(true)}
                  className="inline-flex items-center gap-2 bg-vatican-blue hover:bg-vatican-blue-dark text-white font-bold py-2.5 px-5 rounded-lg text-[16px] lg:text-[16px] transition-colors"
                >
                  Đăng ký tham gia
                  <ArrowRight size={16} strokeWidth={2.5} />
                </button>
              ) : (
                <span className="inline-flex items-center text-gray-400 font-semibold py-2.5 px-5 rounded-lg text-[16px] lg:text-[16px] border border-gray-200 bg-gray-50">
                  Đã hoàn thành
                </span>
              )}
            </div>
          </div>
          </>
        )}

        {/* ── Hàng 3: Cards chọn chuyến ── */}
        {filtered.length > 0 && (
          <div className="flex overflow-x-auto gap-3 p-4 bg-gray-50 border-t border-gray-200 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
            {filtered.map((trip, i) => {
              const isActive = trip === active;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveTrip(trip)}
                  className={`group shrink-0 w-[140px] lg:w-[160px] rounded-lg overflow-hidden border-2 transition-all text-left ${
                    isActive ? "border-vatican-blue" : "border-transparent hover:border-gray-300"
                  }`}
                >
                  <div className="relative w-full aspect-[16/9] bg-gray-200">
                    {trip.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={trip.image_url}
                        alt={trip.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}

      </div>
    </>
  );
}
