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

  const circleColor  = isCenterActive ? "#1a3a8f" : "#334155";
  const textColor    = isCenterActive ? "#1a3a8f" : "#94a3b8";

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

        {/* Center — circle with curved text around bottom */}
        <Link
          href={NAV_CENTER.href}
          className="flex-1 flex items-center justify-center h-full relative overflow-visible"
        >
          {/* Circle button hanging below bar */}
          <div
            className="absolute border-[3px] border-white shadow-lg rounded-full flex items-center justify-center z-10 transition-colors duration-200"
            style={{
              width: 52,
              height: 52,
              bottom: -20,
              left: "50%",
              transform: "translateX(-50%)",
              backgroundColor: circleColor,
            }}
          >
            <Award size={24} strokeWidth={2} className="text-white" />
          </div>

          {/* SVG curved text — arc follows bottom of circle */}
          {/* SVG top aligns with circle center (6px above bar bottom) */}
          <svg
            width="84"
            height="40"
            viewBox="0 0 84 40"
            overflow="visible"
            style={{
              position: "absolute",
              bottom: -22,
              left: "50%",
              transform: "translateX(-50%)",
            }}
          >
            <defs>
              {/* Semicircle arc, radius 36, sweeping clockwise through bottom */}
              <path id="navCurve" d="M 6,0 A 36,36 0 0,1 78,0" />
            </defs>
            <text
              fontSize="8.5"
              fontWeight="700"
              letterSpacing="2"
              fontFamily="system-ui, -apple-system, sans-serif"
              fill={textColor}
            >
              <textPath href="#navCurve" startOffset="50%" textAnchor="middle">
                TIỂU SỬ
              </textPath>
            </text>
          </svg>
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
