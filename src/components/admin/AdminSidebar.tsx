'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { 
  Users, FileSignature, Wallet, Target, Palette, Flag, HandHeart, ShieldCheck, BookOpen,
  BookText, Music, Flame, MessageSquare, MapPin, NotebookText, ScrollText, Bell, Clock, Calendar, CalendarDays, UserPlus, Bot, ClipboardList, Shield, LogOut, Star, Award, Milestone, Crown, HeartHandshake, Newspaper, ChevronDown, Home, LucideIcon, BookHeart, Fingerprint, Menu, X, Images,
  Compass, Wifi, Zap, Mic, Tag, Scale, Radio, UserCheck, CalendarRange
} from 'lucide-react'

type NavChild = { label: string; href: string; icon: LucideIcon; exact?: boolean }
type NavItem  = { label: string; href: string; icon?: LucideIcon; exact?: boolean; children?: NavChild[] }

const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: 'Xây dựng cộng đồng',
    items: [
      {
        label: 'Ban quản trị',
        href: '/admin/ban-quan-tri',
        children: [
          { label: 'Thành viên BQT',     href: '/admin/ban-quan-tri/thanh-vien',          icon: UserCheck },
          { label: 'Biên bản họp',       href: '/admin/ban-quan-tri/bien-ban',            icon: FileSignature },
          { label: 'Tài chính',          href: '/admin/ban-quan-tri/tai-chinh',           icon: Wallet },
          { label: 'Hành lang pháp lý',  href: '/admin/ban-quan-tri/hanh-lang-phap-ly',  icon: Scale },
        ]
      },
      {
        label: 'Vận hành cộng đồng',
        href: '/admin/van-hanh-cong-dong',
        children: [
          { label: 'Truyền thông',         href: '/admin/truyen-thong',         icon: Radio },
          { label: 'Lịch trình',           href: '/admin/lich-trinh',           icon: CalendarRange },
          { label: 'Nội quy & Quy chế',   href: '/admin/quy-dinh-quy-tac',     icon: ShieldCheck },
          { label: 'Bộ nhận diện',         href: '/admin/nhan-dien-cong-dong',  icon: Palette },
        ]
      },
      {
        label: 'Tham gia cộng đồng',
        href: '/admin/thanh-vien-cong-dong',
        children: [
          { label: 'Ý chỉ cầu nguyện',   href: '/admin/y-chi',              icon: Flame },
          { label: 'Đăng ký hành hương', href: '/admin/dang-ky-hanh-huong', icon: UserPlus },
          { label: 'Đối tác',            href: '/admin/thanh-vien-cong-dong/doi-tac', icon: HandHeart },
          { label: 'Nguồn tham gia',     href: '/admin/thanh-vien-cong-dong', icon: Users, exact: true },
        ]
      },
    ],
  },
  {
    label: 'Nội dung',
    items: [
      { label: 'Trang chủ', href: '/admin/trang-chu', exact: true },
      {
        label: 'Tiểu sử',
        href: '/admin/noi-dung/tieu-su',
        exact: true,
        children: [
          { label: 'Lược sử',            href: '/admin/noi-dung/tieu-su/luoc-su',                icon: Star },
          { label: 'Phong Chân Phước',   href: '/admin/noi-dung/tieu-su/phong-chan-phuoc',       icon: Award },
          { label: 'Phong Thánh',        href: '/admin/noi-dung/tieu-su/tien-trinh-phong-thanh', icon: Crown },
          { label: 'Hành trình đức tin', href: '/admin/noi-dung/tieu-su/hanh-trinh-duc-tin',     icon: Milestone },
        ],
      },
      {
        label: 'Cùng cầu nguyện',
        href: '/admin/cung-cau-nguyen',
        exact: true,
        children: [
          { label: 'Thông báo',         href: '/admin/noi-dung/thong-bao', icon: Bell },
          { label: 'Lời kinh',          href: '/admin/loi-kinh',           icon: BookText },
          { label: 'Thánh ca',          href: '/admin/thanh-ca',           icon: Music },
        ],
      },
      {
        label: 'Chứng nhân',
        href: '/admin/loi-chung',
        children: [
          { label: 'Lời chứng đã gửi',   href: '/admin/loi-chung',     icon: MessageSquare, exact: true },
          { label: 'Nhật ký chứng nhân', href: '/admin/loi-chung/new', icon: BookHeart },
        ],
      },
      {
        label: 'Hành hương',
        href: '/admin/hanh-huong',
        children: [
          { label: 'Góc hành hương',   href: '/admin/goc-hanh-huong',                 icon: NotebookText },
          { label: 'Lịch hành hương',  href: '/admin/noi-dung/lich-hanh-huong', icon: Calendar },
        ],
      },
      {
        label: 'Cần biết',
        href: '/admin/can-biet',
        children: [
          { label: 'Địa chỉ',              href: '/admin/noi-dung/dia-chi',           icon: MapPin },
          { label: 'Giờ lễ',               href: '/admin/noi-dung/gio-le',            icon: Clock },
          { label: 'Liên hệ cộng đồng',   href: '/admin/cau-hinh/lien-he-cong-dong', icon: HeartHandshake },
          { label: 'Hoạt động cộng đồng', href: '/admin/hoat-dong-cong-dong',                  icon: Newspaper },
          { label: 'Lịch công giáo',       href: '/admin/noi-dung/lich-cong-giao',    icon: CalendarDays },
        ],
      },
      { label: 'Thư viện', href: '/admin/cau-hinh/thu-vien' },
    ]
  },
  {
    label: 'Cấu hình',
    items: [
      { label: 'Model AI',   href: '/admin/cau-hinh/model-ai' },
      { label: 'Phân quyền', href: '/admin/cau-hinh/phan-quyen' },
    ]
  }
]

export function AdminSidebar({ userEmail }: { userEmail: string }) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href
    return pathname === href || pathname.startsWith(href + '/')
  }

  const isSectionActive = (item: NavItem) =>
    isActive(item.href, item.exact) || (item.children ?? []).some(c => isActive(c.href))

  const getInitialOpen = () => {
    const open = new Set<string>()
    navGroups.forEach(g => g.items.forEach(item => {
      if (item.children && isSectionActive(item)) open.add(item.href)
    }))
    return open
  }

  const [openItems, setOpenItems] = useState<Set<string>>(getInitialOpen)

  useEffect(() => {
    setOpenItems(prev => {
      const next = new Set(prev)
      navGroups.forEach(g => g.items.forEach(item => {
        if (item.children && isSectionActive(item)) next.add(item.href)
      }))
      return next
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  // Close drawer on navigation
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  // Lock body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const toggle = (href: string) => {
    setOpenItems(prev => {
      const next = new Set(prev)
      next.has(href) ? next.delete(href) : next.add(href)
      return next
    })
  }

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-3.5 bg-vatican-blue shrink-0">
        <Link href="/admin/dang-ky-hanh-huong" onClick={() => setMobileOpen(false)}>
          <img src="/images/logo.png" alt="Cha Trương Bửu Diệp" className="h-[42px] w-auto object-contain" />
        </Link>
        {/* Close button — mobile only */}
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X size={20} strokeWidth={2.5} />
        </button>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 flex flex-col min-h-0">
        {navGroups.map((group, gi) => (
          <div key={group.label} className={gi > 0 ? 'mt-3' : ''}>
            <div className="px-2.5 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{group.label}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const active = isActive(item.href, item.exact)
                const sectionActive = isSectionActive(item)
                const isOpen = openItems.has(item.href)
                const Icon = item.icon
                const hasChildren = !!item.children?.length

                return (
                  <div key={item.href}>
                    {hasChildren ? (
                      <button
                        type="button"
                        onClick={() => toggle(item.href)}
                        className={`w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg text-[16px] font-semibold transition-colors ${
                          sectionActive
                            ? 'bg-vatican-blue/8 text-vatican-blue'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-vatican-dark'
                        }`}
                      >
                        {Icon && <Icon size={15} strokeWidth={2.5} className={sectionActive ? 'text-vatican-blue' : 'text-gray-400'} />}
                        <span className="leading-none flex-1 text-left">{item.label}</span>
                        <ChevronDown
                          size={15}
                          strokeWidth={2.5}
                          className={`shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} ${sectionActive ? 'text-vatican-blue' : 'text-gray-400'}`}
                        />
                      </button>
                    ) : (
                      <Link
                        href={item.href}
                        className={`flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg text-[16px] font-semibold transition-colors ${
                          active
                            ? 'bg-vatican-blue text-white'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-vatican-dark'
                        }`}
                      >
                        {Icon && <Icon size={15} strokeWidth={2.5} className={active ? 'text-white/90' : 'text-gray-400'} />}
                        <span className="leading-none">{item.label}</span>
                      </Link>
                    )}

                    {hasChildren && isOpen && (
                      <div className="ml-[18px] mt-0.5 flex flex-col gap-0.5 border-l border-gray-200 pl-3">
                        {item.children!.map((child) => {
                          const childActive = isActive(child.href, child.exact)
                          const ChildIcon = child.icon
                          return (
                            <Link
                              key={child.href}
                              href={child.href}
                              className={`flex items-center gap-2 px-2 py-2 rounded-lg text-[16px] font-semibold transition-colors ${
                                childActive
                                  ? 'bg-vatican-blue text-white'
                                  : 'text-gray-500 hover:bg-gray-100 hover:text-vatican-dark'
                              }`}
                            >
                              <ChildIcon size={13} strokeWidth={2.5} className={childActive ? 'text-white/90' : 'text-gray-400'} />
                              <span className="leading-none">{child.label}</span>
                            </Link>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User + logout */}
      <div className="border-t border-gray-100 px-3 py-3 shrink-0">
        <p className="text-[16px] text-gray-400 px-2 mb-1.5 truncate" title={userEmail}>{userEmail}</p>
        <form action="/auth/signout" method="post">
          <button type="submit" className="w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg text-[16px] font-semibold text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors">
            <LogOut size={15} strokeWidth={2.5} />
            Đăng xuất
          </button>
        </form>
      </div>
    </>
  )

  return (
    <>
      {/* ── Mobile top bar ── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 h-14 bg-vatican-blue flex items-center justify-between px-4 shrink-0">
        <button
          onClick={() => setMobileOpen(true)}
          className="w-10 h-10 flex items-center justify-center rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Mở menu"
        >
          <Menu size={22} strokeWidth={2.5} />
        </button>
        <Link href="/admin/dang-ky-hanh-huong">
          <img src="/images/logo.png" alt="Admin" className="h-8 w-auto object-contain" />
        </Link>
        <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center">
          <span className="text-[16px] font-bold text-white uppercase">
            {userEmail.charAt(0)}
          </span>
        </div>
      </div>

      {/* ── Mobile overlay backdrop ── */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      {/* Desktop: static. Mobile: absolute drawer sliding from left */}
      <aside
        className={`
          fixed lg:static top-0 left-0 z-50 lg:z-auto
          w-[300px] shrink-0 h-screen
          bg-white border-r border-gray-200
          flex flex-col overflow-hidden
          transition-transform duration-300 ease-in-out lg:transform-none
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {sidebarContent}
      </aside>
    </>
  )
}
