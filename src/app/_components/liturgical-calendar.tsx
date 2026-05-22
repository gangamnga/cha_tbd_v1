"use client";

import { useState, useMemo } from "react";
import { generateCalendar, getEasterInfo } from "@/utils/liturgical-calendar";

export function LiturgicalCalendar() {
  const thisYear = new Date().getFullYear();
  const [year, setYear] = useState(thisYear);
  const [activeMonth, setActiveMonth] = useState(new Date().getMonth() + 1);

  const calendar = useMemo(() => generateCalendar(year), [year]);
  const easter = useMemo(() => getEasterInfo(year), [year]);

  const monthData = calendar.find((m) => m.number === activeMonth) ?? calendar[0];

  return (
    <div className="bg-white px-2 sm:px-4 lg:px-5 py-2.5 sm:py-4 lg:py-5">

      {/* Navigation Bar */}
      <div className="flex border-b border-gray-200 w-full overflow-x-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none] mb-4">
        <div className="sticky left-0 shrink-0 flex items-center bg-white z-10 pl-1">
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => setYear((y) => y - 1)}
              className="px-2 py-3 text-[18px] font-bold text-gray-400 hover:text-vatican-blue transition-colors"
              aria-label="Năm trước"
            >
              ‹
            </button>
            <span className="text-[16px] font-black text-vatican-dark uppercase px-1">
              Năm {year}
            </span>
            <button
              type="button"
              onClick={() => setYear((y) => y + 1)}
              className="px-2 py-3 text-[18px] font-bold text-gray-400 hover:text-vatican-blue transition-colors"
              aria-label="Năm sau"
            >
              ›
            </button>
          </div>
          <div className="w-px h-4 bg-vatican-blue ml-2 mr-1 shrink-0 self-center" />
        </div>
        
        {calendar.map((m) => {
          const isActive = activeMonth === m.number;
          return (
            <button
              key={m.number}
              type="button"
              onClick={() => setActiveMonth(m.number)}
              className={`shrink-0 flex items-center px-3 py-3 text-[16px] font-bold transition-colors ${
                isActive ? "text-vatican-blue pointer-events-none" : "text-gray-500 hover:text-vatican-blue"
              }`}
            >
              Tháng {m.number}
            </button>
          );
        })}
      </div>

      {/* Month heading */}
      <div className="bg-white border-l-4 border-vatican-blue px-3 sm:px-4 py-2.5 mb-3 flex flex-col lg:flex-row lg:items-center justify-between gap-1 lg:gap-4">
        <h3 className="text-[16px] lg:text-[18px] font-bold text-vatican-dark uppercase tracking-wide">
          {monthData.name} năm {year} — {monthData.feasts.length} lễ
        </h3>
        <p className="text-[16px] lg:text-[16px] font-bold text-vatican-dark">
          Phục Sinh: <span className="text-vatican-blue">{easter.date}</span>
        </p>
      </div>

      {/* Feast list */}
      <div className="flex flex-col gap-2">
        {monthData.feasts.map((feast, i) => (
          <div key={i} className="bg-white flex items-start gap-3 px-3 sm:px-4 py-3">
            <div className={`shrink-0 flex flex-col items-center justify-center border rounded-lg px-2 py-1.5 min-w-[56px] ${
              feast.level === 'solemnity' ? 'bg-vatican-blue border-vatican-blue' : 'bg-gray-100 border-gray-200'
            }`}>
              <span className={`text-[16px] font-black leading-none ${feast.level === 'solemnity' ? 'text-white' : 'text-vatican-blue'}`}>{String(feast.day).padStart(2, "0")}</span>
              <span className={`text-[16px] font-bold leading-none mt-0.5 ${feast.level === 'solemnity' ? 'text-white/60' : 'text-gray-500'}`}>{String(monthData.number).padStart(2, "0")}/{year}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-[16px] lg:text-[16px] font-semibold leading-snug ${feast.level === 'solemnity' ? 'text-vatican-blue' : 'text-vatican-text'}`}>
                {feast.name}
                {feast.level === 'solemnity' && <span className="text-vatican-blue ml-1.5 text-[16px]" title="Lễ Trọng">★</span>}
              </p>
              {feast.note && (
                <p className="text-[16px] text-gray-500 mt-0.5 leading-snug italic">{feast.note}</p>
              )}
            </div>
          </div>
        ))}
        {monthData.feasts.length === 0 && (
          <p className="text-[16px] text-gray-500 italic text-center py-8">
            Không có lễ nào được ghi chú trong tháng này.
          </p>
        )}
      </div>

    </div>
  );
}
