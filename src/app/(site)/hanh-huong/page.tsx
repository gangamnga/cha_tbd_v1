import type { Metadata } from "next";
import Container from "@/app/_components/container";
import { SectionWrapper } from "@/app/_components/section-wrapper";
import { CommunityArticlesGrid } from "@/app/_components/community-articles-grid";
import { NotebookText, Calendar, Info } from "lucide-react";
import { TripSchedule } from "./_components/trip-schedule";
import type { PilgrimageTrip } from "@/data/pilgrimages";
import { createClient } from "@/utils/supabase/server";

export const revalidate = 3600

export const metadata: Metadata = {
  title: "Hành Hương",
  description: "Hướng dẫn hành hương Cha Trương Bửu Diệp tại Tắc Sậy — lịch hành hương 2026, phương tiện di chuyển, chuẩn bị trước khi đi. Lễ Chân Phước 02/07/2026.",
  openGraph: {
    title: "Hành Hương Tắc Sậy — Lễ Chân Phước 02/07/2026",
    description: "Hướng dẫn hành hương Cha Trương Bửu Diệp tại Tắc Sậy — lịch hành hương 2026, phương tiện di chuyển, chuẩn bị trước khi đi. Lễ Chân Phước 02/07/2026.",
    url: '/hanh-huong',
  },
};

export default async function HanhHuongPage() {
  const supabase = await createClient();

  const [{ data: articleRows }, { data: tripRows }] = await Promise.all([
    supabase
      .from('articles')
      .select('id, title, slug, thumbnail_url')
      .eq('category', 'cam-nang')
      .eq('status', 'published')
      .order('created_at', { ascending: false }),
    supabase
      .from('pilgrimage_trips')
      .select('*')
      .order('sort_order'),
  ]);

  const trips: PilgrimageTrip[] = tripRows ?? [];


  return (
    <main className="mt-[9px] lg:mt-[18px] mb-16">
      <Container>

        {/* ROW 1: Góc Hành Hương */}
        <SectionWrapper
          id="goc-hanh-huong"
          title="GÓC HÀNH HƯƠNG"
          icon={<NotebookText size={18} strokeWidth={2.5} />}
          theme="yellow"
          className="mb-8"
        >
          <div className="bg-white p-4 lg:p-5 flex flex-col">
            <CommunityArticlesGrid articles={articleRows ?? []} />
          </div>
        </SectionWrapper>

        {/* ROW 2: Lịch Hành Hương Cộng Đồng */}
        <SectionWrapper
          id="lich-hanh-huong"
          title="LỊCH HÀNH HƯƠNG"
          icon={<Calendar size={18} strokeWidth={2.5} />}
          theme="yellow"
        >
          <div className="bg-white p-4 lg:p-5 flex flex-col">
            {trips.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-gray-400">
                <Calendar size={48} strokeWidth={1} className="mb-4 text-gray-300" />
                <p className="text-[16px] text-gray-500 text-center max-w-md">
                  Hiện chưa có lịch trình hành hương cộng đồng nào được lên kế hoạch.
                </p>
              </div>
            ) : (
              <>
                {/* Lời ngỏ đính chính cộng đồng */}
                <div className="mb-4 lg:mb-6 bg-blue-50/50 border border-vatican-blue/20 px-4 py-3.5 rounded-lg flex gap-3 items-start">
                  <div className="text-vatican-blue mt-0.5 shrink-0">
                    <Info size={18} strokeWidth={2.5} />
                  </div>
                  <p className="text-[16px] text-vatican-dark leading-relaxed">
                    Các chuyến đi hành hương này do cộng đồng tự tổ chức để gắn kết.
                  </p>
                </div>

                {(() => {
                  const years = [...new Set(trips.map(t => parseInt(t.dates.split("/").pop() || "0", 10)))].sort((a, b) => a - b);
                  return years.map((year, i) => {
                    const yearTrips = trips.filter(t => parseInt(t.dates.split("/").pop() || "0", 10) === year);
                    return (
                      <div key={year} className="flex flex-col">
                        {i > 0 && (
                          <>
                            <div className="py-6 lg:hidden">
                              <div className="h-px bg-gray-200 mx-6" />
                            </div>
                            <div className="hidden lg:block h-8" />
                          </>
                        )}
                        <TripSchedule year={year} trips={yearTrips} />
                      </div>
                    );
                  });
                })()}
              </>
            )}
          </div>
        </SectionWrapper>

      </Container>
    </main>
  );
}
