"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Award, Flame, Heart, MapPin } from "lucide-react";

const NAV_ITEMS = [
  { label: "Trang Chủ", href: "/", icon: Home },
  { label: "Tiểu Sử", href: "/tieu-su", icon: Award },
  { label: "Cầu Nguyện", href: "/cung-cau-nguyen", icon: Flame },
  { label: "Chứng Nhân", href: "/chung-nhan", icon: Heart },
  { label: "Cần Biết", href: "/can-biet", icon: MapPin },
];

export default function MobileNav() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="sticky top-[70px] left-0 right-0 z-40 lg:hidden bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-[0_4px_16px_rgba(0,0,0,0.04)] py-2.5 px-4">
      <div className="flex items-center justify-between max-w-md mx-auto">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          const IconComponent = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-center rounded-full transition-all duration-300 ease-out select-none ${
                isActive
                  ? "bg-[#E6F3FF] text-[#0083F5] px-4 py-2 shadow-sm shadow-blue-100/50"
                  : "text-slate-400 hover:text-slate-600 p-2.5"
              }`}
            >
              <IconComponent
                className={`w-5.5 h-5.5 transition-transform duration-300 ${
                  isActive ? "scale-105 stroke-[2.5]" : "stroke-[2]"
                }`}
              />
              <span
                className={`text-[14px] font-bold tracking-wide transition-all duration-300 ease-out overflow-hidden whitespace-nowrap ${
                  isActive
                    ? "max-w-[100px] ml-2.5 opacity-100"
                    : "max-w-0 opacity-0 ml-0"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
