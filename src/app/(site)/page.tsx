import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/app/_components/container";
import { BookHeart, Megaphone, NotebookText, ArrowRight, Newspaper } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { pickItems } from "@/utils/pick-items";
import { NewsGrid } from "@/app/_components/news-grid/news-grid";
import { SidebarWidget } from "@/app/_components/news-grid/sidebar-widget";
import { ArticleCard } from "@/app/_components/news-grid/article-card";
import { ThongBaoWidget, LoiKinhWidget, ThanhCaWidget } from "@/app/_components/prayer-section";
import { SectionWrapper } from "@/app/_components/section-wrapper";
import { TestimonySection } from "@/app/_components/testimony-section";

export const metadata: Metadata = {
  title: "Trang Chủ",
  description: "Trang thông tin chính thức về Cha Phanxicô Trương Bửu Diệp — tin tức, tiểu sử, ơn lành và hành hương Tắc Sậy. Lễ Chân Phước 02/07/2026.",
  openGraph: {
    title: "Cha Phanxicô Trương Bửu Diệp — Lễ Chân Phước 02/07/2026",
    description: "Trang thông tin chính thức về Cha Phanxicô Trương Bửu Diệp — tin tức, tiểu sử, ơn lành và hành hương Tắc Sậy. Lễ Chân Phước 02/07/2026.",
    url: '/',
  },
};

export const revalidate = 60

export default async function Index() {
  const supabase = await createClient()

  let configRecord = null
  let recentAnnouncements: { id: string; image_url: string | null }[] | null = null
  let recentArticles: { id: string; title: string; thumbnail_url: string | null; slug: string }[] | null = null
  let recentPrayers: { id: string; title: string; content: string }[] | null = null
  let recentHymns: { id: string; title: string; artist: string; image_url: string | null }[] | null = null
  let recentTestimonies: { id: string; title: string; slug: string; thumbnail_url: string | null }[] | null = null
  let recentHanhHuong: { id: string; title: string; thumbnail_url: string | null; slug: string }[] | null = null
  let recentCongDong: { id: string; title: string; slug: string; thumbnail_url: string | null }[] | null = null

  try {
    const results = await Promise.all([
      supabase.from('homepage_config').select('config').eq('id', 'main').maybeSingle(),
      supabase.from('announcements').select('id, image_url').eq('is_active', true).order('created_at', { ascending: false }).limit(20),
      supabase.from('articles').select('id, title, thumbnail_url, slug').eq('status', 'published').order('created_at', { ascending: false }).limit(50),
      supabase.from('prayers').select('id, title, content').eq('is_active', true).order('sort_order').limit(20),
      supabase.from('hymns').select('id, title, artist, image_url').eq('is_active', true).order('sort_order').limit(20),
      supabase.from('articles').select('id, title, slug, thumbnail_url').eq('category', 'loi-chung').eq('status', 'published').order('created_at', { ascending: false }).limit(6),
      supabase.from('articles').select('id, title, thumbnail_url, slug').eq('category', 'cam-nang').eq('status', 'published').order('created_at', { ascending: false }).limit(20),
      supabase.from('articles').select('id, title, slug, thumbnail_url').eq('category', 'cong-dong').eq('status', 'published').order('created_at', { ascending: false }).limit(6),
    ])
    ;[
      { data: configRecord },
      { data: recentAnnouncements },
      { data: recentArticles },
      { data: recentPrayers },
      { data: recentHymns },
      { data: recentTestimonies },
      { data: recentHanhHuong },
      { data: recentCongDong },
    ] = results
  } catch {
    // Render với dữ liệu trống nếu Supabase không phản hồi
  }

  const cfg = (configRecord?.config as Record<string, Record<string, unknown>>) || {}

  // Cấu hình Tin Nhanh (3 slots: hero, slot_1, slot_2)
  const tinNhanhIds = [cfg.tin_nhanh?.hero, cfg.tin_nhanh?.slot_1, cfg.tin_nhanh?.slot_2]
  const articles = pickItems(tinNhanhIds, recentArticles ?? [], 3)

  // Cấu hình Góc Hành Hương (6 slots)
  const hanhHuongIds = [1,2,3,4,5,6].map(i => cfg.hanh_huong?.[`slot_${i}`])
  const hanhHuongArticles = pickItems(hanhHuongIds, recentHanhHuong ?? [], 6)

  // Cấu hình Cùng Cầu Nguyện
  const announcementId = cfg.cung_cau_nguyen?.announcement
  const announcementData = announcementId
    ? (recentAnnouncements ?? []).find(a => a.id === announcementId) || (recentAnnouncements ?? [])[0]
    : (recentAnnouncements ?? [])[0]
  const announcementImageUrl = announcementData?.image_url ?? null

  const loiKinhIds = [1,2,3,4,5,6].map(i => cfg.cung_cau_nguyen?.[`loi_kinh_${i}`])
  const prayers = pickItems(loiKinhIds, recentPrayers ?? [], 6)

  const thanhCaIds = [1,2,3,4,5,6].map(i => cfg.cung_cau_nguyen?.[`thanh_ca_${i}`])
  const hymns = pickItems(thanhCaIds, recentHymns ?? [], 6)

  // Cấu hình Chứng Nhân (6 slots)
  const chungNhanIds = [1,2,3,4,5,6].map(i => cfg.chung_nhan?.[`slot_${i}`])
  const testimonies = pickItems(chungNhanIds, recentTestimonies ?? [], 6)

  const eventSchema = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: 'Lễ Phong Chân Phước Cha Phanxicô Trương Bửu Diệp',
    description: 'Lễ tuyên phong Chân Phước Cha Phanxicô Trương Bửu Diệp tại Tắc Sậy, Bạc Liêu.',
    startDate: '2026-07-02T06:00:00+07:00',
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: 'Tắc Sậy, Bạc Liêu',
      address: { '@type': 'PostalAddress', addressLocality: 'Tắc Sậy', addressRegion: 'Bạc Liêu', addressCountry: 'VN' },
    },
    organizer: { '@type': 'Organization', name: 'Giáo Hội Công Giáo Việt Nam' },
    image: 'https://chatruongbuudiep.com/images/cha-truong-buu-diep.jpg',
  }

  return (
    <main className="mt-[9px] lg:mt-[18px] mb-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(eventSchema) }} />
      <Container>

        {/*
          Mobile order:  1=Tin nhanh  2=Chứng nhân  3=Thông báo  4=Hoạt động CĐ  5=Hành hương  6=Thánh ca  7=Lời kinh
          Desktop (lg):  row1=[TinNhanh(9col)|HànhHương(3col)]  row2=[ThôngBáo|LoiKinh|ThanhCa each 4col]  row3=ChứngNhân  row4=HoạtĐộngCĐ
          Grid 12-col so prayer sections fit cleanly: 4+4+4=12, tin nhanh 9+3=12
        */}
        <div className="flex flex-col gap-8 lg:grid lg:grid-cols-12 lg:gap-x-5 lg:gap-y-8">

          {/* TIN NHANH — mobile 1st, desktop row1 cols 1-9 */}
          <div className="order-1 lg:col-start-1 lg:col-span-9 lg:row-start-1 flex flex-col">
            <SectionWrapper
              title="TIN NHANH"
              icon={<Megaphone size={18} strokeWidth={2.5} />}
              theme="yellow"
              className="flex flex-col h-full"
            >
              <div className="flex flex-col flex-1">
                <NewsGrid articles={articles} />
              </div>
            </SectionWrapper>
          </div>

          {/* NHẬT KÝ CHỨNG NHÂN — mobile 2nd, desktop row3 full */}
          <div className="order-2 lg:col-start-1 lg:col-span-12 lg:row-start-3">
            <SectionWrapper
              title="NHẬT KÝ CHỨNG NHÂN"
              icon={<BookHeart size={18} strokeWidth={2.5} />}
              theme="yellow"
            >
              <TestimonySection articles={testimonies} />
              <div className="shrink-0 p-4 flex justify-center">
                <Link
                  href="/chung-nhan#nhat-ky-chung-nhan"
                  className="inline-flex items-center justify-center gap-1.5 text-vatican-blue hover:bg-vatican-blue hover:text-white transition-all font-semibold text-[16px] py-2 px-6 rounded-lg bg-gray-50"
                >
                  Xem tất cả <ArrowRight size={16} strokeWidth={2.5} />
                </Link>
              </div>
            </SectionWrapper>
          </div>

          {/* THÔNG BÁO — mobile 3rd, desktop row2 cols 1-4 */}
          <div className="order-3 lg:col-start-1 lg:col-span-4 lg:row-start-2 flex flex-col">
            <ThongBaoWidget announcementImageUrl={announcementImageUrl} />
          </div>

          {/* HOẠT ĐỘNG CỘNG ĐỒNG — mobile 4th, desktop row4 full */}
          <div className="order-4 lg:col-start-1 lg:col-span-12 lg:row-start-4">
            <SectionWrapper
              title="HOẠT ĐỘNG CỘNG ĐỒNG"
              icon={<Newspaper size={18} strokeWidth={2.5} />}
              theme="yellow"
            >
              <TestimonySection articles={recentCongDong ?? []} />
              <div className="shrink-0 p-4 flex justify-center">
                <Link
                  href="/can-biet#hoat-dong-cong-dong"
                  className="inline-flex items-center justify-center gap-1.5 text-vatican-blue hover:bg-vatican-blue hover:text-white transition-all font-semibold text-[16px] py-2 px-6 rounded-lg bg-gray-50"
                >
                  Xem tất cả <ArrowRight size={16} strokeWidth={2.5} />
                </Link>
              </div>
            </SectionWrapper>
          </div>

          {/* GÓC HÀNH HƯƠNG — mobile 5th, desktop row1 cols 10-12 */}
          <div className="order-5 lg:col-start-10 lg:col-span-3 lg:row-start-1 flex flex-col">
            <SectionWrapper
              title="GÓC HÀNH HƯƠNG"
              icon={<NotebookText size={18} strokeWidth={2.5} />}
              theme="yellow"
              className="flex flex-col h-full"
            >
              <div className="flex flex-col flex-1">
                {/* Mobile: 2-col card grid */}
                <div className="lg:hidden px-2 py-2 grid grid-cols-2 gap-2.5">
                  {hanhHuongArticles.slice(0, 6).map((item) => (
                    <ArticleCard
                      key={item.id}
                      title={item.title}
                      imageUrl={item.thumbnail_url}
                      href={`/tin-tuc/${item.slug}`}
                      noClamp
                      imageClassName="aspect-video"
                    />
                  ))}
                </div>
                {/* Desktop: sidebar list */}
                <div className="hidden lg:flex lg:flex-col lg:flex-1">
                  <SidebarWidget articles={hanhHuongArticles} />
                </div>
              </div>
              <div className="shrink-0 mt-auto p-4 flex justify-center">
                <Link
                  href="/hanh-huong#goc-hanh-huong"
                  className="inline-flex items-center justify-center gap-1.5 text-vatican-blue hover:bg-vatican-blue hover:text-white transition-all font-semibold text-[16px] py-2 px-6 rounded-lg bg-gray-50"
                >
                  Xem tất cả <ArrowRight size={16} strokeWidth={2.5} />
                </Link>
              </div>
            </SectionWrapper>
          </div>

          {/* THÁNH CA — mobile 6th, desktop row2 cols 5-8 */}
          <div className="order-6 lg:col-start-5 lg:col-span-4 lg:row-start-2 flex flex-col">
            <ThanhCaWidget hymns={hymns ?? []} />
          </div>

          {/* LỜI KINH — mobile 7th, desktop row2 cols 9-12 */}
          <div className="order-7 lg:col-start-9 lg:col-span-4 lg:row-start-2 flex flex-col">
            <LoiKinhWidget prayers={prayers ?? []} />
          </div>

        </div>

      </Container>
    </main>
  );
}
