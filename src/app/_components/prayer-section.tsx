"use client";

import Link from "next/link";
import { BookText, Plus, X, Music, Bell, ArrowRight } from "lucide-react";
import { useState } from "react";
import { PrayerMeetingSchedule } from "@/app/_components/prayer-meeting-schedule";
import { SectionWrapper } from "./section-wrapper";

interface Prayer { title: string; content: string }
interface Hymn  { title: string; artist: string; image_url: string | null }

export function ThongBaoWidget({ announcementImageUrl }: { announcementImageUrl: string | null }) {
  return (
    <SectionWrapper
      title="THÔNG BÁO"
      icon={<Bell size={18} strokeWidth={2.5} />}
      theme="yellow"
      className="h-full"
    >
      <div className="flex flex-col flex-1">
        <PrayerMeetingSchedule imageUrl={announcementImageUrl} />
      </div>
    </SectionWrapper>
  );
}

export function LoiKinhWidget({ prayers }: { prayers: Prayer[] }) {
  const [openPrayerIndex, setOpenPrayerIndex] = useState<number | null>(0);

  return (
    <SectionWrapper
      title="LỜI KINH"
      icon={<BookText size={18} strokeWidth={2.5} />}
      theme="yellow"
      className="h-full"
    >
      <div className="flex flex-col flex-1">
        {prayers.length === 0 ? (
          <div className="flex flex-col flex-1 items-center justify-center gap-3 p-6 text-gray-300 min-h-[150px]">
            <BookText size={36} strokeWidth={1.5} />
            <p className="text-[16px] text-center text-gray-400">Chưa có lời kinh.</p>
          </div>
        ) : (
          <div className="flex flex-col flex-1 px-4 py-2">
            {prayers.map((prayer, i) => (
              <div key={i} className="flex flex-col group border-b border-gray-200 last:border-0 cursor-default">
                <button
                  type="button"
                  className="flex items-center gap-3 py-3.5 cursor-pointer w-full text-left"
                  onClick={() => setOpenPrayerIndex(openPrayerIndex === i ? null : i)}
                >
                  <div className="text-vatican-blue shrink-0">
                    {openPrayerIndex === i
                      ? <X size={18} strokeWidth={2.5} />
                      : <Plus size={18} strokeWidth={2.5} />}
                  </div>
                  <h4 className={`font-bold transition-colors text-[18px] leading-snug ${openPrayerIndex === i ? "text-vatican-blue" : "text-vatican-dark group-hover:text-vatican-blue"}`}>
                    {prayer.title}
                  </h4>
                </button>
                {openPrayerIndex === i && (
                  <div className="pl-[30px] pr-2 pb-4">
                    <p className="text-gray-600 text-[18px] leading-relaxed border-l-2 border-vatican-blue/[30%] pl-3">
                      {prayer.content.length > 180 ? prayer.content.slice(0, 180) + "…" : prayer.content}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="shrink-0 mt-auto p-4 flex justify-center">
        <Link
          href="/cung-cau-nguyen#loi-kinh"
          className="inline-flex items-center justify-center gap-1.5 text-vatican-blue hover:bg-vatican-blue hover:text-white transition-all font-semibold text-[16px] py-2 px-6 rounded-lg bg-gray-50"
        >
          Xem tất cả <ArrowRight size={16} strokeWidth={2.5} />
        </Link>
      </div>
    </SectionWrapper>
  );
}

export function ThanhCaWidget({ hymns }: { hymns: Hymn[] }) {
  return (
    <SectionWrapper
      title="THÁNH CA"
      icon={<Music size={18} strokeWidth={2.5} />}
      theme="yellow"
      className="h-full"
    >
      <div className="flex flex-col flex-1">
        {hymns.length === 0 ? (
          <div className="flex flex-col flex-1 items-center justify-center gap-3 p-6 text-gray-300 min-h-[150px]">
            <Music size={36} strokeWidth={1.5} />
            <p className="text-[16px] text-center text-gray-400">Chưa có bài thánh ca nào.</p>
          </div>
        ) : (
          <div className="flex flex-col flex-1 px-4 py-2">
            {hymns.map((hymn, i) => (
              <button
                key={i}
                type="button"
                className="flex items-start gap-3 group cursor-pointer border-b border-gray-200 py-3 last:border-0 text-left w-full"
              >
                <div className="relative w-[80px] aspect-video overflow-hidden bg-gray-200 shrink-0 flex items-center justify-center rounded-md">
                  {hymn.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={hymn.image_url} alt={hymn.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <Music size={24} className="text-gray-400" />
                  )}
                </div>
                <div className="flex flex-col flex-1 min-w-0 gap-1 pt-0.5">
                  <h4 className="font-bold text-vatican-dark group-hover:text-vatican-blue transition-colors text-[18px] leading-snug w-full line-clamp-2">
                    {hymn.title}
                  </h4>
                  <div className="flex items-center w-full text-gray-500 text-[16px] font-medium">
                    <span className="flex items-center gap-1.5 truncate">
                      <Music size={14} className="text-vatican-blue opacity-80 shrink-0" />
                      <span className="truncate">{hymn.artist}</span>
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="shrink-0 mt-auto p-4 flex justify-center">
        <Link
          href="/cung-cau-nguyen#thanh-ca"
          className="inline-flex items-center justify-center gap-1.5 text-vatican-blue hover:bg-vatican-blue hover:text-white transition-all font-semibold text-[16px] py-2 px-6 rounded-lg bg-gray-50"
        >
          Xem tất cả <ArrowRight size={16} strokeWidth={2.5} />
        </Link>
      </div>
    </SectionWrapper>
  );
}
