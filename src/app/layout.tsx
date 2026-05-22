import type { Metadata } from "next";
import { Be_Vietnam_Pro, Lora } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const beVietnamPro = Be_Vietnam_Pro({ weight: ["400", "600", "700"], subsets: ["vietnamese"], variable: "--font-be-vietnam-pro", display: "swap" });
const lora = Lora({ weight: ["400", "700"], subsets: ["vietnamese"], variable: "--font-lora", display: "swap" });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://chatruongbuudiep.com'
const OG_IMAGE = '/images/cha-truong-buu-diep.jpg'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Trang chủ | Cha Trương Bửu Diệp - Trung Tâm Hành Hương Tắc Sậy',
    template: '%s | Cha Trương Bửu Diệp',
  },
  description: 'Cổng thông tin chính thức về Linh mục Phanxicô Trương Bửu Diệp. Tìm hiểu tiểu sử, lịch hành hương Tắc Sậy, gửi ý chỉ cầu nguyện và đọc nhật ký phép lạ ơn lành.',
  keywords: [
    'Cha Trương Bửu Diệp', 'nhà thờ tắc sậy', 'xin ơn cha diệp', 'linh mục trương bửu diệp',
    'địa chỉ nhà thờ cha diệp', 'giờ lễ nhà thờ tắc sậy', 'lời chứng ơn lành cha diệp', 
    'phép lạ cha trương bửu diệp', 'hành hương cha diệp'
  ],
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    siteName: 'Cổng Thông Tin Cha Trương Bửu Diệp',
    title: 'Cha Trương Bửu Diệp - Trung Tâm Hành Hương Tắc Sậy',
    description: 'Cổng thông tin chính thức về Linh mục Phanxicô Trương Bửu Diệp. Tìm hiểu tiểu sử, lịch hành hương Tắc Sậy, gửi ý chỉ cầu nguyện và đọc nhật ký phép lạ ơn lành.',
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: 'Cha Trương Bửu Diệp' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: [OG_IMAGE],
  },
  icons: {
    icon: [
      { url: '/favicon/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/favicon/apple-touch-icon.png',
    other: [{ rel: 'mask-icon', url: '/favicon/safari-pinned-tab.svg', color: '#1a3a5c' }],
  },
  manifest: '/favicon/site.webmanifest',
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CatholicChurch',
  name: 'Trung Tâm Hành Hương Tắc Sậy - Nơi an nghỉ Cha Trương Bửu Diệp',
  image: 'https://chatruongbuudiep.com/images/cha-truong-buu-diep.jpg',
  '@id': 'https://chatruongbuudiep.com',
  url: 'https://chatruongbuudiep.com',
  telephone: '+842913850418',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Ấp 2, xã Tân Phong, thị xã Giá Rai',
    addressLocality: 'Bạc Liêu',
    addressCountry: 'VN'
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 9.2555,
    longitude: 105.4228
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" suppressHydrationWarning className="font-sans">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={cn(beVietnamPro.variable, lora.variable, "font-sans bg-gray-50 text-vatican-text text-[16px] antialiased selection:bg-vatican-blue selection:text-white")}>
        {children}
      </body>
    </html>
  );
}
