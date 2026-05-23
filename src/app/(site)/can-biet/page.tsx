import type { Metadata } from "next";
import Container from "@/app/_components/container";
import { SectionWrapper } from "@/app/_components/section-wrapper";
import { LiturgicalCalendar } from "@/app/_components/liturgical-calendar";
import { MapPin, Clock, CalendarDays, Mail, Globe, HeartHandshake, Newspaper } from "lucide-react";
import { CommunitySignupButton } from "./_components/CommunitySignupButton";
import { CanBietSection } from "@/app/_components/can-biet-section";
import { CommunityArticlesGrid } from "@/app/_components/community-articles-grid";
import { createClient } from "@/utils/supabase/server";

export const revalidate = 3600

export const metadata: Metadata = {
  title: "Cần Biết",
  description: "Thông tin cần biết khi hành hương Tắc Sậy: địa chỉ Cha Trương Bửu Diệp, giờ lễ, cộng đồng, hoạt động và lịch công giáo tại Bạc Liêu.",
  openGraph: {
    title: "Cần Biết — Hành Hương Tắc Sậy",
    description: "Thông tin cần biết khi hành hương Tắc Sậy: địa chỉ Cha Trương Bửu Diệp, giờ lễ, cộng đồng, hoạt động và lịch công giáo tại Bạc Liêu.",
    url: '/can-biet',
  },
};

export default async function CanBietPage() {
  const supabase = await createClient();
  const [{ data: communityRows }, { data: metaRows }, { data: massSlots }, { data: congDongArticles }] = await Promise.all([
    supabase.from('community_info').select('*').limit(1),
    supabase.from('mass_schedule_meta').select('*').limit(1),
    supabase.from('mass_schedule').select('*').order('sort_order'),
    supabase.from('articles').select('id, title, slug, thumbnail_url')
      .eq('category', 'cong-dong').eq('status', 'published').order('created_at', { ascending: false }),
  ]);
  const ci = communityRows?.[0] ?? null;
  const massMeta = metaRows?.[0] ?? null;
  const schedule = massSlots ?? [];

  const PLATFORM_LOGOS: Record<string, string> = {
    facebook: '/platforms/facebook.svg',
    tiktok:   '/platforms/tiktok.svg',
    youtube:  '/platforms/youtube.svg',
    viber:    '/platforms/viber.svg',
    whatsapp: '/platforms/whatsapp.svg',
  };
  const MESSAGING_KEYS = new Set(['viber', 'whatsapp']);

  // Phones: prefer new dynamic array, fall back to old single column
  const phones: string[] =
    ci?.phones?.length ? ci.phones : ci?.phone ? [ci.phone] : [];

  // Social links: prefer new dynamic array, fall back to old fixed columns
  type SocialLink = { label: string; url: string };
  let allLinks: SocialLink[] = [];
  if (ci?.social_links?.length) {
    allLinks = ci.social_links as SocialLink[];
  } else if (ci) {
    if (ci.facebook_url)   allLinks.push({ label: 'Facebook',  url: ci.facebook_url });
    if (ci.tiktok_url)     allLinks.push({ label: 'TikTok',    url: ci.tiktok_url });
    if (ci.youtube_url)    allLinks.push({ label: 'YouTube',   url: ci.youtube_url });
    if (ci.viber_phone)    allLinks.push({ label: 'Viber',     url: ci.viber_phone });
    if (ci.whatsapp_phone) allLinks.push({ label: 'WhatsApp',  url: ci.whatsapp_phone });
  }

  const socials = allLinks
    .filter(l => !MESSAGING_KEYS.has(l.label.toLowerCase()))
    .map(l => ({
      name: l.label,
      href: l.url,
      logo: PLATFORM_LOGOS[l.label.toLowerCase()] ?? null,
    }));

  const qrCodes = allLinks
    .filter(l => MESSAGING_KEYS.has(l.label.toLowerCase()))
    .map(l => {
      const key = l.label.toLowerCase();
      const src = key === 'viber'
        ? `https://api.qrserver.com/v1/create-qr-code/?size=160x160&qzone=1&data=${encodeURIComponent(`viber://chat?number=${l.url}`)}`
        : `https://api.qrserver.com/v1/create-qr-code/?size=160x160&qzone=1&data=${encodeURIComponent(`https://wa.me/${l.url.replace(/\D/g, '')}`)}`;
      return {
        name: l.label,
        src,
        logo: PLATFORM_LOGOS[key] ?? '',
        color: key === 'viber' ? 'text-[#7360F2]' : 'text-[#25D366]',
      };
    });

  return (
    <main className="mt-[9px] lg:mt-[18px] mb-16">
      <Container>

        {/* Khung 1: ĐỊA CHỈ (2/3) + GIỜ LỄ (1/3) */}
        <div className="flex flex-col lg:flex-row items-stretch gap-5 lg:gap-8 mb-8">

          <SectionWrapper
            title="Địa Chỉ"
            icon={<MapPin size={18} strokeWidth={2.5} />}
            theme="yellow"
            className="w-full lg:w-2/3"
            id="dia-chi"
          >
            <CanBietSection />
          </SectionWrapper>

          <SectionWrapper
            title="Giờ Lễ"
            icon={<Clock size={18} strokeWidth={2.5} />}
            theme="yellow"
            className="w-full lg:w-1/3"
            id="gio-le"
          >
            <div className="bg-white px-2 sm:px-4 lg:px-5 py-2.5 sm:py-4 lg:py-5 flex flex-col gap-3 flex-1 w-full">
              {(!massMeta && schedule.length === 0) ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-gray-400 border border-dashed border-gray-200 rounded-lg h-full min-h-[300px]">
                  <Clock size={48} strokeWidth={1} className="mb-4 text-gray-300" />
                  <p className="text-[16px] text-gray-500 text-center max-w-md">
                    Chưa có thông tin giờ lễ.
                  </p>
                </div>
              ) : (
                <>
                  {massMeta && (
                    <div className="flex flex-col gap-1.5 px-3 pb-2 pt-1">
                      <div className="flex items-start text-[16px] lg:text-[16px] leading-snug">
                        <span className="font-bold text-vatican-blue w-[90px] shrink-0">* Địa điểm:</span>
                        <span className="font-semibold text-vatican-dark flex-1">{massMeta.location_name}</span>
                      </div>
                      <div className="flex items-start text-[16px] lg:text-[16px] leading-snug">
                        <span className="font-bold text-vatican-blue w-[90px] shrink-0">* Lưu ý:</span>
                        <span className="font-semibold text-vatican-dark flex-1">{massMeta.note}</span>
                      </div>
                    </div>
                  )}
                  {schedule.map(({ id, day_label, times }) => (
                    <div key={id} className="bg-white px-3 sm:px-4 py-2.5 sm:py-3.5 rounded-lg border border-gray-200">
                      <p className="font-bold text-[16px] lg:text-[18px] text-vatican-blue mb-2.5">{day_label}</p>
                      <div className="flex flex-wrap gap-2">
                        {Array.isArray(times) && (times as string[]).map((t) => (
                          <span key={t} className="bg-gray-100 text-vatican-dark font-bold text-[16px] px-3 py-1 rounded-lg">{t}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </SectionWrapper>

        </div>

        {/* Khung 2: LIÊN HỆ (1/3) + HOẠT ĐỘNG (2/3) */}
        <div className="flex flex-col lg:flex-row items-stretch gap-5 lg:gap-8 mb-8">

          {/* LIÊN HỆ CỘNG ĐỒNG */}
          <SectionWrapper
            title="Tham Gia Cộng Đồng"
            icon={<HeartHandshake size={18} strokeWidth={2.5} />}
            theme="yellow"
            className="w-full lg:w-1/3 flex flex-col"
            id="cong-dong"
          >
            {!ci ? (
              <div className="bg-white px-2 sm:px-4 lg:px-5 py-2.5 sm:py-4 lg:py-5 flex-1 flex flex-col w-full">
                <div className="flex flex-col items-center justify-center py-12 px-4 text-gray-400 border border-dashed border-gray-200 rounded-lg h-full min-h-[300px]">
                  <HeartHandshake size={48} strokeWidth={1} className="mb-4 text-gray-300" />
                  <p className="text-[16px] text-gray-500 text-center max-w-md">
                    Chưa có thông tin liên hệ.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white flex-1 flex flex-col">
                <div className="px-2 sm:px-4 lg:px-5 pt-3.5 sm:pt-4 lg:pt-5 pb-2.5 sm:pb-3 border-b border-gray-100 flex items-center gap-2 flex-wrap shrink-0">
                  <p className="text-[16px] lg:text-[18px] font-black text-vatican-dark uppercase tracking-wide leading-tight">{ci.name || 'Chatruongbuudiep'}</p>
                </div>
                <div className="flex flex-col">
                  {[
                    { icon: <Clock size={15} strokeWidth={2} />,  label: "Mở cửa", show: (ci.hours_list?.length > 0) || !!ci.hours, value: (
                      <div className="flex flex-col gap-0.5">
                        {(ci.hours_list?.length ? ci.hours_list : ci.hours ? [ci.hours] : []).map((h: string, i: number) => (
                          <span key={i} className="block">{h}</span>
                        ))}
                      </div>
                    )},
                    { icon: <MapPin size={15} strokeWidth={2} />, label: "Địa chỉ", show: !!ci.address, value: <span>{ci.address}</span> },
                    { icon: <Mail size={15} strokeWidth={2} />,   label: "Email",   show: (ci.emails?.length > 0) || !!ci.email, value: (
                      <div className="flex flex-col gap-0.5">
                        {(ci.emails?.length ? ci.emails : ci.email ? [ci.email] : []).map((em: string, i: number) => (
                          <a key={i} href={`mailto:${em}`} className="hover:text-vatican-blue transition-colors break-all block">{em}</a>
                        ))}
                      </div>
                    )},
                    { icon: <Globe size={15} strokeWidth={2} />,  label: "Website", show: (ci.websites?.length > 0) || !!(ci.website1 || ci.website2), value: (
                      <div className="flex flex-col gap-0.5">
                        {(ci.websites?.length ? ci.websites : [ci.website1, ci.website2].filter(Boolean)).map((w: string, i: number) => (
                          <a key={i} href={w.startsWith('http') ? w : `https://${w}`} target="_blank" rel="noopener noreferrer" className="hover:text-vatican-blue transition-colors block">{w}</a>
                        ))}
                      </div>
                    )},
                  ].filter(item => item.show).map(({ icon, label, value }) => (
                    <div key={label} className="flex flex-col sm:flex-row items-start px-2 sm:px-4 lg:px-5 py-3 lg:py-4 border-b border-gray-100 gap-1 sm:gap-0">
                      <div className="flex items-center sm:items-start shrink-0">
                        <div className="w-6 h-[24px] shrink-0 flex items-center text-gray-400">
                          {icon}
                        </div>
                        <div className="w-[110px] shrink-0 flex items-center pl-1 sm:pl-0">
                          <span className="text-[15px] sm:text-[16px] font-semibold uppercase tracking-wide text-gray-400">{label}</span>
                        </div>
                      </div>
                      <div className="flex-1 sm:pl-4 text-[16px] text-gray-800 font-medium leading-snug mt-[1px] pl-[28px]">
                        {value}
                      </div>
                    </div>
                  ))}

                  {/* Theo dõi — cùng format hàng liên hệ */}
                  {socials.length > 0 && (
                    <div className="flex flex-col sm:flex-row items-start px-2 sm:px-4 lg:px-5 py-3 lg:py-4 border-b border-gray-100 gap-1 sm:gap-0">
                      <div className="flex items-center sm:items-start shrink-0">
                        <div className="w-6 h-[24px] shrink-0 hidden sm:flex" />
                        <div className="w-[110px] shrink-0 flex items-center">
                          <span className="text-[15px] sm:text-[16px] font-semibold uppercase tracking-wide text-gray-400">Theo dõi</span>
                        </div>
                      </div>
                      <div className="flex-1 sm:pl-4 pl-[28px] flex gap-1.5 mt-[1px]">
                        {socials.map(({ name, href, logo }) => (
                          <a key={name} href={href} title={name} target="_blank" rel="noopener noreferrer"
                            className="w-9 h-9 bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors rounded-lg">
                            <img src={logo} alt={name} className="w-5 h-5 object-contain" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quét mã — cùng format hàng liên hệ */}
                  {qrCodes.length > 0 && (
                    <div className="flex flex-col sm:flex-row items-start px-2 sm:px-4 lg:px-5 py-3 lg:py-4 gap-1 sm:gap-0">
                      <div className="flex items-center sm:items-start shrink-0">
                        <div className="w-6 h-[24px] shrink-0 hidden sm:flex" />
                        <div className="w-[110px] shrink-0 flex items-center">
                          <span className="text-[15px] sm:text-[16px] font-semibold uppercase tracking-wide text-gray-400">Quét mã</span>
                        </div>
                      </div>
                      <div className="flex-1 sm:pl-4 pl-[28px] flex flex-wrap gap-3 mt-[1px]">
                        {qrCodes.map(({ name, src, logo, color }) => (
                          <div key={name} className="flex flex-col items-center gap-1.5">
                            <div className="w-[80px] h-[80px] bg-white border border-gray-200 rounded-lg overflow-hidden flex items-center justify-center p-1">
                              <img src={src!} alt={`QR ${name}`} className="w-full h-full object-contain" />
                            </div>
                            <div className="flex items-center gap-1">
                              <img src={logo} alt={name} className="w-3.5 h-3.5 object-contain" />
                              <span className={`text-[16px] font-bold ${color}`}>{name}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <CommunitySignupButton />
              </div>
            )}
          </SectionWrapper>

          {/* HOẠT ĐỘNG CỘNG ĐỒNG */}
          <SectionWrapper
            title="Hoạt Động Cộng Đồng"
            icon={<Newspaper size={18} strokeWidth={2.5} />}
            theme="yellow"
            className="w-full lg:w-2/3 flex flex-col"
            id="hoat-dong-cong-dong"
          >
            <div className="bg-white px-2 sm:px-4 lg:px-5 py-2.5 sm:py-4 lg:py-5 flex-1 flex flex-col w-full">
              <CommunityArticlesGrid articles={congDongArticles ?? []} />
            </div>
          </SectionWrapper>

        </div>

        {/* Khung 3: LỊCH CÔNG GIÁO */}
        <SectionWrapper
          title="Lịch Công Giáo"
          icon={<CalendarDays size={18} strokeWidth={2.5} />}
          theme="yellow"
          id="lich-cong-giao"
        >
          <LiturgicalCalendar />
        </SectionWrapper>

      </Container>
    </main>
  );
}
