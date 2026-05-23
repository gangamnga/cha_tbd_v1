import type { Metadata } from "next";
import Container from "@/app/_components/container";
import { SectionWrapper } from "@/app/_components/section-wrapper";
import { Star, Award, ChevronRight, Milestone, Check, Crown } from "lucide-react";
import { createClient } from "@/utils/supabase/server";

export const revalidate = 86400
import { BiographyTimeline } from "@/app/_components/biography-timeline";

export const metadata: Metadata = {
  title: "Tiểu Sử",
  description: "Tiểu sử Cha Phanxicô Trương Bửu Diệp — Linh mục tử đạo, Chân Phước (Á Thánh), lễ tuyên phong ngày 02/07/2026 tại Tắc Sậy.",
  openGraph: {
    title: "Tiểu Sử Cha Phanxicô Trương Bửu Diệp",
    description: "Tiểu sử Cha Phanxicô Trương Bửu Diệp — Linh mục tử đạo, Chân Phước (Á Thánh), lễ tuyên phong ngày 02/07/2026 tại Tắc Sậy.",
    url: '/tieu-su',
  },
};

type Step = { id: string; year: string; title: string; detail: string; done: boolean; highlight: boolean }

function StepList({ steps }: { steps: Step[] }) {
  return (
    <div className="flex flex-col gap-3">
      {steps.map((step) => (
        <div key={step.id} className="bg-white border border-gray-200 flex items-start gap-3 sm:gap-4 px-2.5 sm:px-4 py-3 sm:py-3.5 rounded-lg">
          <div className="shrink-0 mt-0.5">
            {step.done ? (
              <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                <Check size={14} strokeWidth={3} className="text-white" />
              </div>
            ) : (
              <div className="w-6 h-6 rounded-full bg-vatican-blue flex items-center justify-center">
                <ChevronRight size={14} strokeWidth={3} className="text-white" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-baseline gap-2 mb-1.5">
              <span className={`text-[16px] font-black uppercase tracking-wide ${step.highlight ? 'text-vatican-blue' : 'text-gray-400'}`}>
                {step.year}
              </span>
              <span className="text-[18px] font-bold text-vatican-dark">{step.title}</span>
            </div>
            <p className="text-[18px] text-gray-600 leading-relaxed">{step.detail}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default async function TieuSuPage() {
  const supabase = await createClient();
  const [{ data: facts }, { data: beatSteps }, { data: canonSteps }, { data: milestones }, { data: portraitSetting }] = await Promise.all([
    supabase.from('bio_facts').select('*').order('sort_order'),
    supabase.from('beatification_steps').select('*').order('sort_order'),
    supabase.from('canonization_steps').select('*').order('sort_order'),
    supabase.from('biography_milestones').select('*').order('sort_order'),
    supabase.from('site_settings').select('value').eq('key', 'bio_portrait_url').single(),
  ]);

  const portraitUrl = portraitSetting?.value ?? '/images/cha-truong-buu-diep.jpg';

  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Phanxicô Trương Bửu Diệp',
    alternateName: ['Cha Trương Bửu Diệp', 'Phanxicô Xaviê Trương Bửu Diệp'],
    description: 'Linh mục Công giáo người Việt Nam, tử đạo năm 1946, sắp được tuyên phong Chân Phước ngày 02/07/2026 tại Tắc Sậy.',
    birthDate: '1897-01-01',
    deathDate: '1946-03-12',
    birthPlace: { '@type': 'Place', name: 'Cồn Phước, An Giang, Việt Nam' },
    image: 'https://chatruongbuudiep.com/images/cha-truong-buu-diep.jpg',
    sameAs: ['https://www.facebook.com/chatruongbuudiep'],
  }

  return (
    <main className="mt-[9px] lg:mt-[18px] mb-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }} />
      <Container>

        {/* ROW 1: Lược sử */}
        <SectionWrapper id="luoc-su" title="Lược Sử" icon={<Star size={18} strokeWidth={2.5} />} theme="yellow" className="mb-8">
          <div className="bg-white px-2 sm:px-4 lg:px-5 py-2.5 sm:py-4 lg:py-5">
            <div className="flex flex-col sm:flex-row gap-[20px]">
              <div className="w-[200px] sm:w-[360px] mx-auto sm:mx-0 shrink-0">
                <div className="relative w-full aspect-[3/4] overflow-hidden rounded-lg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={portraitUrl}
                    alt="Chân dung Cha Phanxicô Trương Bửu Diệp"
                    className="w-full h-full object-cover object-top"
                  />
                </div>
              </div>
              <div className="flex-1 min-w-0 bg-white rounded-lg overflow-hidden">
                <table className="w-full">
                  <tbody>
                    {(facts ?? []).map(({ id, label, value }, i, arr) => (
                      <tr key={id} className={`flex flex-col sm:table-row ${i < arr.length - 1 ? "border-b border-gray-100" : ""}`}>
                        <td className="pt-3 pb-1 pl-4 pr-4 sm:py-3 sm:pl-4 sm:pr-3 align-top w-full sm:w-[140px] shrink-0 block sm:table-cell">
                          <span className="text-[15px] sm:text-[16px] font-semibold uppercase tracking-wide text-gray-400 whitespace-nowrap">{label}</span>
                        </td>
                        <td className="pt-0 pb-3 pl-4 pr-4 sm:py-3 sm:pl-0 sm:pr-4 align-top block sm:table-cell">
                          <span className="text-[18px] text-vatican-dark font-bold leading-snug whitespace-pre-line">{value}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </SectionWrapper>

        {/* ROW 2: Tiến trình phong Chân Phước */}
        <SectionWrapper title="Tiến Trình Phong Chân Phước" icon={<Award size={18} strokeWidth={2.5} />} theme="yellow" className="mb-8" id="phong-chan-phuoc">
          <div className="bg-white px-2 sm:px-4 lg:px-5 py-2.5 sm:py-4 lg:py-5">
            <StepList steps={beatSteps ?? []} />
          </div>
        </SectionWrapper>

        {/* ROW 3: Tiến trình phong Thánh */}
        <SectionWrapper title="Tiến Trình Phong Thánh" icon={<Crown size={18} strokeWidth={2.5} />} theme="yellow" className="mb-8" id="phong-thanh">
          <div className="bg-white px-2 sm:px-4 lg:px-5 py-2.5 sm:py-4 lg:py-5 flex flex-col gap-5">
            {/* Mô tả */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 sm:px-5 py-3 sm:py-4">
              <p className="text-[18px] text-gray-700 leading-relaxed">
                Sau khi được tuyên phong <strong className="text-vatican-dark">Chân Phước</strong>, bước tiếp theo để được tôn phong{' '}
                <strong className="text-vatican-dark">Hiển Thánh</strong> đòi hỏi Giáo hội xác nhận thêm{' '}
                <strong className="text-vatican-dark">một phép lạ mới</strong> — xảy ra sau ngày lễ phong Chân Phước —
                nhờ lời chuyển cầu của Ngài. Phép lạ này phải vượt qua hai vòng thẩm định chặt chẽ:{' '}
                hội đồng y khoa quốc tế và hội đồng thần học, trước khi Đức Giáo Hoàng ký sắc lệnh phong Thánh.
                Hành trình này không có thời hạn định sẵn — có thể vài năm, cũng có thể lâu hơn.
              </p>
              <p className="text-[18px] text-vatican-blue font-semibold leading-relaxed mt-3">
                Xin mọi tín hữu hãy kiên trì cầu nguyện và tin tưởng vào sự chuyển cầu của{' '}
                Cha Phanxicô Trương Bửu Diệp, để Thiên Chúa sớm tỏ bày dấu chỉ kỳ diệu,
                và Ngài sớm được tôn vinh trên toàn thể Giáo hội hoàn vũ.
              </p>
            </div>

            {/* Các mốc (nếu có) */}
            {(canonSteps ?? []).length > 0 && (
              <StepList steps={canonSteps ?? []} />
            )}
          </div>
        </SectionWrapper>

        {/* ROW 4: Hành trình đức tin */}
        <SectionWrapper title="Hành Trình Đức Tin" icon={<Milestone size={18} strokeWidth={2.5} />} theme="yellow" id="hanh-trinh">
          <BiographyTimeline showDescription={true} milestones={milestones ?? []} />
        </SectionWrapper>

      </Container>
    </main>
  );
}
