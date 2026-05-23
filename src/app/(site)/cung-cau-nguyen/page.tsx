import type { Metadata } from "next";
import Container from "@/app/_components/container";
import { SectionWrapper } from "@/app/_components/section-wrapper";
import { PrayerMeetingSchedule } from "@/app/_components/prayer-meeting-schedule";
import { IntentionForm } from "./_components/intention-form";

export const revalidate = 3600
import { PrayerList } from "./_components/prayer-list";
import { HymnList } from "./_components/hymn-list";
import { Flame, Bell, BookText, Music } from "lucide-react";
import { createClient } from "@/utils/supabase/server";

export const metadata: Metadata = {
  title: "Cùng Cầu Nguyện",
  description: "Cùng cầu nguyện với Cha Phanxicô Trương Bửu Diệp — Lời kinh, thánh ca, gửi ý chỉ cầu nguyện và lịch buổi cầu nguyện chung mỗi tuần.",
  openGraph: {
    title: "Cùng Cầu Nguyện — Cha Phanxicô Trương Bửu Diệp",
    description: "Cùng cầu nguyện với Cha Phanxicô Trương Bửu Diệp — Lời kinh, thánh ca, gửi ý chỉ cầu nguyện và lịch buổi cầu nguyện chung mỗi tuần.",
    url: '/cung-cau-nguyen',
  },
};

export default async function CungCauNguyenPage() {
  const supabase = await createClient()
  const [
    { data: announcementData },
    { data: prayers },
    { data: hymns },
    { data: prayerThemes },
    { data: hymnPlaylists },
  ] = await Promise.all([
    supabase.from('announcements').select('image_url').eq('is_active', true).maybeSingle(),
    supabase.from('prayers').select('id, title, content, themes').eq('is_active', true).order('sort_order'),
    supabase.from('hymns').select('id, title, artist, youtube_url, image_url, playlists').eq('is_active', true).order('sort_order'),
    supabase.from('prayer_themes').select('id, label').order('sort_order'),
    supabase.from('hymn_playlists').select('id, label, cover_image').order('sort_order'),
  ])
  const announcementImageUrl = announcementData?.image_url ?? null

  return (
    <main className="mt-[9px] lg:mt-[18px] mb-16">
      <Container>

        {/* ROW 1: Gửi Ý Chỉ + Thông Báo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-8 mb-8">

          {/* Thông Báo — 1/3 */}
          <SectionWrapper
            title="Thông Báo"
            icon={<Bell size={18} strokeWidth={2.5} />}
            theme="yellow"
            className="lg:col-span-1"
            id="thong-bao"
          >
            <div className="flex flex-col flex-1">
              <PrayerMeetingSchedule imageUrl={announcementImageUrl} />
            </div>
          </SectionWrapper>

          {/* Gửi Ý Chỉ Cầu Nguyện — 2/3 */}
          <SectionWrapper
            title="Gửi Ý Chỉ Cầu Nguyện"
            icon={<Flame size={18} strokeWidth={2.5} />}
            theme="yellow"
            className="lg:col-span-2"
            id="gui-y-chi"
          >
            <div className="bg-white px-2 sm:px-4 lg:px-5 py-2.5 sm:py-4 lg:py-5">

              <div className="bg-white px-3 sm:px-4 py-2.5 border-l-4 border-vatican-blue mb-3 rounded-r-lg">
                <p className="text-[16px] lg:text-[18px] text-gray-700 leading-relaxed">
                  Hãy gửi ý chỉ để được cộng đồng hiệp lời cầu nguyện cho bạn và những người thân yêu.
                </p>
              </div>

              <IntentionForm />

            </div>
          </SectionWrapper>

        </div>

        {/* ROW 2: Lời Kinh */}
        <SectionWrapper
          title="Lời Kinh"
          icon={<BookText size={18} strokeWidth={2.5} />}
          theme="yellow"
          className="mb-8"
          id="loi-kinh"
        >
          <div className="bg-white">
            <PrayerList prayers={prayers ?? []} themes={prayerThemes ?? []} perPage={6} />
          </div>
        </SectionWrapper>

        {/* ROW 3: Thánh Ca */}
        <SectionWrapper
          title="Thánh Ca"
          icon={<Music size={18} strokeWidth={2.5} />}
          theme="yellow"
          id="thanh-ca"
        >
          <div className="bg-white">
            <HymnList hymns={hymns ?? []} playlists={hymnPlaylists ?? []} perPage={6} />
          </div>
        </SectionWrapper>

      </Container>
    </main>
  );
}
