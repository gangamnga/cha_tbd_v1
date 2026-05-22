"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Container from "./container";
import Image from "next/image";
import { Search, Menu, X, Star, Award, Crown, Milestone, Bell, Flame, BookText, Music, MessageSquare, NotebookText, Calendar, MapPin, Clock, BookHeart, CalendarDays, HeartHandshake, Newspaper } from "lucide-react";

// Map section → pathname tương ứng, dùng để validate ref tránh stale
const SECTION_PATH: Record<string, string> = {
  "lich-hanh-huong": "/hanh-huong",
  "goc-hanh-huong":  "/hanh-huong",
  "gui-loi-chung":   "/chung-nhan",
  "nhat-ky-chung-nhan": "/chung-nhan",
  "dia-chi":              "/can-biet",
  "cong-dong":            "/can-biet",
  "hoat-dong-cong-dong":  "/can-biet",
  "loi-kinh":        "/cung-cau-nguyen",
  "luoc-su":         "/tieu-su",
};


const socialLinksMobile = [
  { name: "YouTube",   href: "https://www.youtube.com/@chatruongbuudiep",  logo: "/platforms/youtube - MXH.svg" },
  { name: "TikTok",    href: "https://www.tiktok.com/@chatruongbuudiep",   logo: "/platforms/tiktok - MXH.svg" },
  { name: "Facebook",  href: "https://www.facebook.com/chatruongbuudiep",  logo: "/platforms/facebook - MXH.svg" },
];

const socialLinksDesktop = [
  { name: "YouTube",   href: "https://www.youtube.com/@chatruongbuudiep",  logo: "/platforms/youtube.svg" },
  { name: "TikTok",    href: "https://www.tiktok.com/@chatruongbuudiep",   logo: "/platforms/tiktok.svg" },
  { name: "Facebook",  href: "https://www.facebook.com/chatruongbuudiep",  logo: "/platforms/facebook.svg" },
];

const subMenuLinks = [
  { label: "Địa Chỉ", href: "/can-biet#dia-chi", section: "dia-chi" },
  { label: "Nhật Ký Chứng Nhân", href: "/chung-nhan#nhat-ky-chung-nhan", section: "nhat-ky-chung-nhan" },
  { label: "Tham Gia Cộng Đồng", href: "/can-biet#cong-dong", section: "cong-dong" },
  { label: "Lược Sử", href: "/tieu-su#luoc-su", section: "luoc-su" },
  { label: "Lời Kinh", href: "/cung-cau-nguyen#loi-kinh", section: "loi-kinh" },
  { label: "Lịch Hành Hương", href: "/hanh-huong#lich-hanh-huong", section: "lich-hanh-huong" },
];

const navLinks = [
  { name: "Trang Chủ", href: "/" },
  {
    name: "Tiểu Sử",
    href: "/tieu-su",
    subItems: [
      { label: "Sơ Lược", href: "/tieu-su#luoc-su", icon: Star },
      { label: "Phong Chân Phước", href: "/tieu-su#phong-chan-phuoc", icon: Award },
      { label: "Phong Thánh", href: "/tieu-su#phong-thanh", icon: Crown },
      { label: "Hành Trình", href: "/tieu-su#hanh-trinh", icon: Milestone }
    ]
  },
  {
    name: "Cùng Cầu Nguyện",
    href: "/cung-cau-nguyen",
    subItems: [
      { label: "Thông Báo", href: "/cung-cau-nguyen#thong-bao", icon: Bell },
      { label: "Gửi Ý Chỉ Cầu Nguyện", href: "/cung-cau-nguyen#gui-y-chi", icon: Flame },
      { label: "Lời Kinh", href: "/cung-cau-nguyen#loi-kinh", icon: BookText },
      { label: "Thánh Ca", href: "/cung-cau-nguyen#thanh-ca", icon: Music }
    ]
  },
  {
    name: "Chứng Nhân",
    href: "/chung-nhan",
    subItems: [
      { label: "Nhật Ký Chứng Nhân", href: "/chung-nhan#nhat-ky-chung-nhan", icon: BookHeart },
      { label: "Gửi Lời Chứng", href: "/chung-nhan#gui-loi-chung", icon: MessageSquare }
    ]
  },
  {
    name: "Hành Hương",
    href: "/hanh-huong",
    subItems: [
      { label: "Góc Hành Hương", href: "/hanh-huong#goc-hanh-huong", icon: NotebookText },
      { label: "Lịch Hành Hương", href: "/hanh-huong#lich-hanh-huong", icon: Calendar }
    ]
  },
  {
    name: "Cần Biết",
    href: "/can-biet",
    subItems: [
      { label: "Địa Chỉ",              href: "/can-biet#dia-chi",              icon: MapPin },
      { label: "Giờ Lễ",               href: "/can-biet#gio-le",               icon: Clock },
      { label: "Liên Hệ Cộng Đồng",   href: "/can-biet#cong-dong",            icon: HeartHandshake },
      { label: "Hoạt Động Cộng Đồng", href: "/can-biet#hoat-dong-cong-dong",  icon: Newspaper },
      { label: "Lịch Công Giáo",       href: "/can-biet#lich-cong-giao",       icon: CalendarDays }
    ]
  },
];

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();
  const [activeSection, setActiveSection] = useState("");
  // Lưu section của sub-link vừa được click để tránh race condition với Next.js:
  // Next.js App Router cập nhật pathname trước rồi mới set hash (để scroll to anchor),
  // nên nếu đọc window.location.hash ngay trong useEffect sẽ ra "" → sai thành "dia-chi".
  const pendingSubSection = useRef<string | null>(null);

  // Khóa scroll body khi mobile menu hoặc search modal mở
  useEffect(() => {
    if (isMobileMenuOpen || isSearchOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen, isSearchOpen]);

  // Rule: sub-link chỉ active khi người dùng bấm trực tiếp vào nó (pendingSubSection),
  // KHÔNG tự động active khi bấm menu mẹ.
  // Ngoại lệ: direct URL /can-biet#hash → active sub-link tương ứng (share link, refresh).
  useEffect(() => {
    const pending = pendingSubSection.current;
    pendingSubSection.current = null; // luôn clear sau khi đọc

    if (pending !== null && SECTION_PATH[pending] === pathname) {
      // User vừa bấm sub-link và đã navigate đến đúng trang → active nó
      setActiveSection(pending);
    } else {
      // Bấm menu mẹ, back/forward, direct URL → không auto-active sub-link
      // Ngoại lệ: direct URL với hash rõ ràng (vd: share link /can-biet#cong-dong)
      const hash = window.location.hash.replace("#", "");
      if (hash && SECTION_PATH[hash] === pathname) {
        setActiveSection(hash);
      } else if (pathname === "/tieu-su") {
        setActiveSection("tieu-su");
      } else {
        setActiveSection("");
      }
    }

    // hashchange: back/forward browser, đọc hash trực tiếp
    const onHashChange = () => {
      const h = window.location.hash.replace("#", "");
      if (h && SECTION_PATH[h] === pathname) {
        setActiveSection(h);
      } else if (pathname === "/tieu-su") {
        setActiveSection("tieu-su");
      } else {
        setActiveSection("");
      }
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [pathname]);

  // Đóng search modal khi nhấn Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setIsSearchOpen(false); setSearchQuery(""); }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  // Focus input ngay khi modal mở
  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [isSearchOpen]);

  const openSearch = () => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(true);
  };

  const closeSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery("");
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    closeSearch();
    // TODO: điều hướng đến trang kết quả tìm kiếm khi có
  };


  return (
    <>
      <header className="w-full sticky top-0 z-50 flex flex-col">

        {/* Desktop Top Sub-bar */}
        <div className="hidden md:block bg-gray-100 border-b border-gray-200">
          <Container>
            <div className="hidden md:flex justify-center items-center py-2.5 gap-12">
              <div className="flex items-center gap-8">
                {subMenuLinks.map(({ label, href, section }) => (
                  <Link
                    key={section}
                    href={href}
                    onClick={() => { pendingSubSection.current = section; setActiveSection(section); setIsMobileMenuOpen(false); }}
                    className={`text-[16px] font-bold transition-colors ${
                      activeSection === section ? 'text-vatican-blue' : 'text-gray-500 hover:text-vatican-blue'
                    }`}
                  >
                    {label}
                  </Link>
                ))}
              </div>

              {/* Social icons */}
              <div className="flex items-center gap-3">
                <div className="w-[1px] h-4 bg-gray-300 mr-2" /> {/* Divider */}
                {socialLinksDesktop.map(({ name, href, logo }) => (
                  <a
                    key={name}
                    href={href}
                    title={name}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:scale-110 flex items-center justify-center transition-transform duration-200"
                  >
                    <img src={logo} alt={name} className="w-[18px] h-[18px] object-contain opacity-80 hover:opacity-100" />
                  </a>
                ))}
              </div>
            </div>
          </Container>
        </div>

        {/* Main Header Row */}
        <div className="w-full bg-vatican-blue text-white border-b border-white/10 relative z-20">
          <Container>
            <div className="flex items-center justify-between h-[70px] lg:h-[80px] relative">

              {/* Desktop: Logo left */}
              <div className="hidden lg:flex items-center justify-start lg:w-[250px] xl:w-[300px] shrink-0">
                <Link href="/" className="flex items-center transition-opacity hover:opacity-90">
                  <Image
                    src="/images/logo.png"
                    alt="Cha Trương Bửu Diệp"
                    width={200}
                    height={50}
                    priority
                    className="h-[46px] lg:h-[50px] w-auto object-contain"
                  />
                </Link>
              </div>

              {/* Mobile: Logo (left side) */}
              <div className="lg:hidden flex items-center shrink-0">
                <Link href="/" className="flex items-center transition-opacity hover:opacity-90">
                  <Image
                    src="/images/logo.png"
                    alt="Cha Trương Bửu Diệp"
                    width={150}
                    height={38}
                    priority
                    className="h-[36px] w-auto object-contain max-w-[130px] sm:max-w-none"
                  />
                </Link>
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center justify-center gap-6 xl:gap-10 text-[16px] xl:text-[16px] font-bold uppercase tracking-wide flex-1 h-full min-w-0 px-2">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href));
                  return (
                    <div key={link.name} className="relative group h-full flex items-center">
                      <Link
                        href={link.href}
                        onClick={() => setActiveSection("")}
                        className={`flex items-center h-full border-b-[4px] transition-colors pt-[4px] whitespace-nowrap ${
                          isActive ? 'border-white text-white' : 'border-transparent text-white/85 hover:border-white/50 hover:text-white'
                        }`}
                      >
                        <span>{link.name}</span>
                      </Link>

                      {/* Sub-menu Dropdown */}
                      {link.subItems && (
                        <div className="absolute top-[100%] left-1/2 -translate-x-1/2 w-max min-w-[220px] bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 flex flex-col border border-gray-100 mt-0 before:absolute before:content-[''] before:-top-4 before:left-0 before:w-full before:h-4 origin-top scale-95 group-hover:scale-100">
                          {link.subItems.map((subItem) => {
                            const SubIcon = subItem.icon;
                            return (
                              <Link
                                key={subItem.label}
                                href={subItem.href}
                                onClick={() => {
                                  const section = subItem.href.split('#')[1]
                                  if (section && SECTION_PATH[section]) {
                                    pendingSubSection.current = section
                                    setActiveSection(section)
                                  }
                                }}
                                className="px-5 py-2.5 text-[16px] normal-case tracking-normal font-semibold text-vatican-dark hover:bg-gray-50 hover:text-vatican-blue transition-colors flex items-center gap-3 whitespace-nowrap"
                              >
                                {SubIcon && <SubIcon size={16} strokeWidth={2.5} className="text-vatican-blue/70 shrink-0" />}
                                <span>{subItem.label}</span>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </nav>

              {/* Desktop: Search button right */}
              <div className="hidden lg:flex items-center justify-end lg:w-[250px] xl:w-[300px] shrink-0">
                <button
                  onClick={openSearch}
                  className="flex items-center justify-center w-[44px] h-[44px] rounded-md hover:bg-white/20 transition-colors text-white mr-[20px]"
                  aria-label="Tìm kiếm"
                >
                  <Search size={22} strokeWidth={2} />
                </button>
              </div>

              {/* Mobile: Socials + Hamburger (right side) */}
              <div className="lg:hidden flex items-center justify-end shrink-0">
                {socialLinksMobile.map(({ name, href, logo }) => (
                  <a
                    key={name}
                    href={href}
                    title={name}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-[34px] sm:w-[40px] h-[44px] flex items-center justify-center transition-transform duration-200 active:scale-95"
                  >
                    <img src={logo} alt={name} className="w-[20px] h-[20px] object-contain" />
                  </a>
                ))}
                <div className="w-[1px] h-4 bg-white/20 mx-1 sm:mx-2" />
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="w-[40px] h-[44px] flex items-center justify-center rounded-md transition-colors hover:bg-white/20 active:bg-white/20"
                  aria-label="Toggle Menu"
                >
                  {isMobileMenuOpen ? <X size={26} strokeWidth={2.5} /> : <Menu size={28} strokeWidth={2.5} />}
                </button>
              </div>

            </div>
          </Container>
        </div>

        {/* Mobile Tab Bar */}
        <div className="md:hidden bg-white border-b border-gray-200 shadow-sm relative z-10">
          <div className="flex overflow-x-auto no-scrollbar">
            {subMenuLinks.map(({ label, href, section }) => (
              <Link
                key={section}
                href={href}
                onClick={() => { pendingSubSection.current = section; setActiveSection(section); setIsMobileMenuOpen(false); }}
                className={`shrink-0 py-3 px-4 flex justify-center items-center text-[16px] font-semibold transition-colors ${
                  activeSection === section 
                    ? 'text-vatican-blue' 
                    : 'text-gray-500 hover:text-vatican-dark'
                }`}
              >
                <span>{label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-[100%] left-0 w-full bg-vatican-blue text-white z-10 flex flex-col h-[calc(100dvh-114px)] overflow-y-auto overscroll-none pb-20">
            <Container>
              <nav className="flex flex-col w-full py-4 gap-1">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href));
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setActiveSection("");
                      }}
                      className={`flex items-center px-4 py-3.5 rounded-xl transition-colors ${
                        isActive 
                          ? 'bg-white/10 font-semibold text-white' 
                          : 'font-semibold text-white/80 hover:bg-white/5 active:bg-white/5 hover:text-white'
                      }`}
                    >
                      <span className="text-[16px]">{link.name}</span>
                    </Link>
                  );
                })}

                {/* Search Bar at the bottom of Mobile Menu */}
                <div className="h-[1px] w-full bg-white/10 my-3" />
                <button
                  onClick={() => { setIsMobileMenuOpen(false); openSearch(); }}
                  className="w-full bg-white/10 text-white/70 px-5 py-3.5 rounded-xl flex items-center justify-between transition-colors hover:bg-white/20 active:bg-white/20 border border-white/10 mb-4"
                >
                  <span className="text-[16px] font-medium">Tìm kiếm...</span>
                  <Search size={20} strokeWidth={2.5} className="text-white/70" />
                </button>

              </nav>
            </Container>
          </div>
        )}

      </header>

      {/* Search Modal — overlay toàn màn hình, z-[100] để nằm trên header sticky */}
      {isSearchOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/50 flex items-start justify-center pt-[15vh] px-4"
          onClick={closeSearch}
        >
          <div
            className="w-full max-w-[600px] bg-white rounded-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleSearch} className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
              <Search size={20} strokeWidth={2.5} className="text-gray-400 shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm bài viết, hành hương, chứng nhân..."
                className="flex-1 text-[16px] text-vatican-dark placeholder:text-gray-400 outline-none py-0.5"
              />
              <button
                type="button"
                onClick={closeSearch}
                className="text-gray-400 hover:text-vatican-dark transition-colors shrink-0"
                aria-label="Đóng tìm kiếm"
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </form>
            <div className="px-5 py-3">
              <p className="hidden sm:block text-[16px] text-gray-400">Nhấn <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-[16px] font-mono">Enter</kbd> để tìm kiếm · <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-[16px] font-mono">Esc</kbd> để đóng</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
