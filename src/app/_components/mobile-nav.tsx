"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Flame, Heart, MapPin, Award } from "lucide-react";

const NAV_LEFT = [
  { label: "Trang Chủ",  href: "/",                icon: Home },
  { label: "Cầu Nguyện", href: "/cung-cau-nguyen", icon: Flame },
];

const NAV_CENTER = { label: "Tiểu Sử", href: "/tieu-su" };

const NAV_RIGHT = [
  { label: "Chứng Nhân", href: "/chung-nhan", icon: Heart },
  { label: "Cần Biết",   href: "/can-biet",   icon: MapPin },
];

export default function MobileNav() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  const isCenterActive =
    pathname === NAV_CENTER.href || pathname.startsWith(NAV_CENTER.href);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 lg:hidden bg-white border-b border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.07)] overflow-visible">
      <div className="flex items-center justify-around h-[60px] px-2 relative overflow-visible">

        {/* Left items */}
        {NAV_LEFT.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors duration-200 ${
                isActive ? "text-vatican-blue" : "text-slate-400"
              }`}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
              <span className="text-[10px] font-semibold leading-none tracking-wide">
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* Center — FAB style: label in bar, circle overlaps bar bottom */}
        <Link
          href={NAV_CENTER.href}
          className="flex-1 h-full relative flex items-center justify-center overflow-visible"
        >
          {/* Label inside bar */}
          <span
            className={`absolute top-[8px] text-[10px] font-semibold leading-none tracking-wide transition-colors duration-200 ${
              isCenterActive ? "text-vatican-blue" : "text-slate-400"
            }`}
          >
            {NAV_CENTER.label}
          </span>

          {/* FAB circle — overlaps bar bottom edge */}
          <div
            className={`absolute w-[52px] h-[52px] rounded-full flex items-center justify-center border-[3px] border-white z-20 transition-colors duration-200 shadow-[0_4px_16px_rgba(0,0,0,0.20)]  ${
              isCenterActive ? "bg-vatican-blue" : "bg-slate-700"
            }`}
            style={{ top: 20 }}
          >
            {/* Placeholder — thay bằng <Image> avatar sau */}
            <Award size={24} strokeWidth={2} className="text-white" />
          </div>
        </Link>

        {/* Right items */}
        {NAV_RIGHT.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors duration-200 ${
                isActive ? "text-vatican-blue" : "text-slate-400"
              }`}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
              <span className="text-[10px] font-semibold leading-none tracking-wide">
                {item.label}
              </span>
            </Link>
          );
        })}

      </div>
    </div>
  );
}
