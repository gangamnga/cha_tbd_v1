import type { Metadata } from "next";
import { createClient } from "@/utils/supabase/server";
import Container from "@/app/_components/container";
import { SectionWrapper } from "@/app/_components/section-wrapper";
import { TestimonyFilters } from "./_components/testimony-filters";
import { TestimonyForm } from "./_components/testimony-form";
import { CATEGORIES } from "@/data/testimonies";
import { BookHeart, MessageSquare, ImageOff } from "lucide-react";
import Image from "next/image";
import { TestimonyPagination } from "./_components/testimony-pagination";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Nhật Ký Chứng Nhân",
  description: "Những lời chứng ơn lành qua lời cầu bầu của Cha Phanxicô Trương Bửu Diệp. Chia sẻ hành trình đức tin và những phép lạ bạn đã nhận được.",
  openGraph: {
    title: "Nhật Ký Chứng Nhân — Cha Phanxicô Trương Bửu Diệp",
    description: "Những lời chứng ơn lành qua lời cầu bầu của Cha Phanxicô Trương Bửu Diệp. Chia sẻ hành trình đức tin và những phép lạ bạn đã nhận được.",
    url: '/chung-nhan',
  },
};

export const revalidate = 300

const PAGE_SIZE = 9;

export default async function OnLanhPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string; page?: string }>;
}) {
  const { cat, page: pageParam } = await searchParams;
  const category = cat ?? "tat-ca";
  const currentPage = Math.max(1, parseInt(pageParam ?? "1", 10));
  const from = (currentPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createClient();
  const categoryLabel = CATEGORIES.find((c) => c.value === category)?.label;

  let query = supabase
    .from("articles")
    .select("id, title, slug, thumbnail_url, testimony_categories")
    .eq("category", "loi-chung")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .range(from, to);

  if (category !== "tat-ca" && categoryLabel) {
    query = query.contains("testimony_categories", [categoryLabel]);
  }

  const [{ data: articles }, { data: allForCount }] = await Promise.all([
    query,
    supabase
      .from("articles")
      .select("testimony_categories")
      .eq("category", "loi-chung")
      .eq("status", "published"),
  ]);

  const categoryCounts: Record<string, number> = {};
  allForCount?.forEach((a) => {
    (a.testimony_categories ?? []).forEach((c: string) => {
      categoryCounts[c] = (categoryCounts[c] ?? 0) + 1;
    });
  });

  const totalItems =
    category === "tat-ca"
      ? (allForCount?.length ?? 0)
      : (categoryLabel ? (categoryCounts[categoryLabel] ?? 0) : 0);
  const totalPages = Math.ceil(totalItems / PAGE_SIZE);

  const list = articles ?? [];

  return (
    <main className="mt-[9px] lg:mt-[18px] mb-16">
      <Container>

        {/* ROW 1: Nhật ký chứng nhân */}
        <SectionWrapper
          id="nhat-ky-chung-nhan"
          title="Nhật Ký Chứng Nhân"
          icon={<BookHeart size={18} strokeWidth={2.5} />}
          theme="yellow"
          className="mb-8"
        >
          <div className="bg-white px-2 sm:px-4 lg:px-5 py-2.5 sm:py-4 lg:py-5">
            <div className="flex flex-col lg:flex-row gap-5 items-start">

              {/* Cột trái: bộ lọc danh mục */}
              <TestimonyFilters activeCategory={category} categoryCounts={categoryCounts} totalCount={allForCount?.length ?? 0} />

              {/* Cột phải: lưới 3×3 + xem tất cả */}
              <div className="flex-1 min-w-0 w-full flex flex-col">
                {list.length > 0 ? (
                  <>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
                      {list.map((item, idx) => (
                        <Link key={item.id} href={`/tin-tuc/${item.slug}`} className={`group block${idx === 8 ? " hidden lg:block" : ""}`}>
                          <div className="relative w-full aspect-video bg-gray-100 rounded-lg overflow-hidden shrink-0">
                            {item.thumbnail_url ? (
                              <Image
                                src={item.thumbnail_url}
                                alt={item.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                sizes="(max-width: 1024px) 50vw, 33vw"
                              />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center gap-1.5 bg-gradient-to-br from-gray-100 to-gray-200">
                                <ImageOff size={24} strokeWidth={1.5} className="text-gray-300" />
                                <span className="text-[16px] font-bold uppercase tracking-widest text-gray-300">Chưa có ảnh</span>
                              </div>
                            )}
                          </div>
                          <h3 className="font-bold text-[16px] text-vatican-dark line-clamp-3 leading-snug group-hover:text-vatican-blue transition-colors mt-3">
                            {item.title}
                          </h3>
                        </Link>
                      ))}
                    </div>

                    <div className="mt-6 border-t border-gray-100 pt-5">
                      <TestimonyPagination currentPage={currentPage} totalPages={totalPages} category={category} />
                    </div>
                  </>
                ) : (
                  <div className="py-12 flex flex-col items-center gap-3 text-center lg:px-5">
                    <p className="text-[16px] text-gray-400">Chưa có lời chứng nào trong mục này.</p>
                  </div>
                )}
              </div>

            </div>
          </div>
        </SectionWrapper>

        {/* ROW 2: Gửi lời chứng */}
        <SectionWrapper
          id="gui-loi-chung"
          title="Gửi Lời Chứng Của Bạn"
          icon={<MessageSquare size={18} strokeWidth={2.5} />}
          theme="yellow"
        >
          <div className="bg-white px-2 sm:px-4 lg:px-5 py-2.5 sm:py-4 lg:py-5">
            <div className="flex flex-col lg:flex-row gap-5">

              <div className="w-full lg:w-1/3 shrink-0 flex flex-col gap-4">
                <div className="bg-white px-3 sm:px-4 py-3.5 sm:py-4 border-l-4 border-vatican-blue rounded-r-lg">
                  <p className="text-[16px] text-gray-700 leading-relaxed">
                    Nếu bạn đã nhận được ơn lành qua lời cầu bầu của Cha Phanxicô Trương Bửu Diệp, hãy chia sẻ để cùng tôn vinh Thiên Chúa và củng cố đức tin cộng đồng.
                  </p>
                </div>
                <div className="bg-white px-3 sm:px-4 py-3.5 sm:py-4 border border-gray-200 rounded-lg">
                  <p className="text-[16px] font-bold uppercase tracking-wide text-gray-500 mb-3">Lưu ý khi gửi</p>
                  <ul className="flex flex-col gap-2">
                    {[
                      "Lời chứng sẽ được Ban biên tập xét duyệt trước khi đăng.",
                      "Bạn có thể dùng tên thật hoặc bút danh.",
                      "Nội dung cần trung thực, tránh thêm thắt.",
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-[16px] text-gray-600">
                        <span className="text-vatican-blue font-bold shrink-0 mt-0.5">—</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <TestimonyForm />
              </div>

            </div>
          </div>
        </SectionWrapper>

      </Container>
    </main>
  );
}
