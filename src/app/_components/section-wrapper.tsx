"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

interface SectionWrapperProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  theme?: "red" | "yellow";
  className?: string;
  contentClassName?: string;
  id?: string;
}

export function SectionWrapper({
  title,
  icon: _icon,
  children,
  theme = "yellow",
  className = "",
  contentClassName = "flex-1 flex flex-col",
  id,
}: SectionWrapperProps) {
  const [isOpen, setIsOpen] = useState(true);

  const accentBar = theme === "red" ? "bg-white/30" : "bg-amber-300";
  const headerText = theme === "red" ? "text-white" : "text-vatican-blue";
  const headerBg = theme === "red" ? "bg-vatican-blue" : "bg-white";
  const hoverBg = theme === "red" ? "hover:bg-vatican-blue/95" : "hover:bg-gray-50/80";
  const btnBg = theme === "red" ? "bg-black/10 text-white" : "bg-vatican-blue/5 text-vatican-blue";

  return (
    <div id={id} className={`bg-white rounded-lg overflow-hidden flex flex-col ${className}`}>
      <div className={`flex items-stretch shrink-0 ${headerBg}`}>
        <div className={`w-1 shrink-0 ${accentBar}`} />
        <button
          type="button"
          aria-expanded={isOpen}
          className={`flex-1 ${headerText} text-[15px] lg:text-[16px] font-bold px-3 sm:px-5 h-[46px] flex items-center gap-2 cursor-pointer select-none transition-colors ${hoverBg} group`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="flex-1 text-left">{title}</span>
          <div className={`rounded p-0.5 ml-auto transition-transform duration-300 ease-in-out ${isOpen ? 'rotate-180' : 'rotate-0'} ${btnBg}`}>
            <ChevronDown size={20} strokeWidth={2.5} />
          </div>
        </button>
      </div>
      <div
        className={`grid transition-all duration-300 ease-in-out flex-1 ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className="overflow-hidden min-h-0 w-full flex flex-col">
          <div className={`w-full flex-1 flex flex-col ${contentClassName}`}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
