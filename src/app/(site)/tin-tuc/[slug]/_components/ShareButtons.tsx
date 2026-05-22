'use client'

import { useState } from 'react'
import { Link2, Check } from 'lucide-react'

const SHARE_PLATFORMS = [
  {
    name: 'Facebook',
    logo: '/platforms/facebook.svg',
    getUrl: (url: string) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    name: 'WhatsApp',
    logo: '/platforms/whatsapp.svg',
    getUrl: (url: string, title: string) =>
      `https://wa.me/?text=${encodeURIComponent(`${title}\n${url}`)}`,
  },
  {
    name: 'Viber',
    logo: '/platforms/viber.svg',
    getUrl: (url: string, title: string) =>
      `viber://forward?text=${encodeURIComponent(`${title}\n${url}`)}`,
  },
]

export function ShareButtons({ title }: { title: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const handleShare = (getUrl: (url: string, title: string) => string) => {
    const url = window.location.href
    window.open(getUrl(url, title), '_blank', 'noopener,width=600,height=400')
  }

  return (
    <div className="flex flex-wrap items-center gap-2.5 pt-6 mt-6 border-t border-gray-100">
      <span className="text-[16px] font-semibold text-gray-400 mr-1">Chia sẻ:</span>

      {SHARE_PLATFORMS.map(({ name, logo, getUrl }) => (
        <button
          key={name}
          onClick={() => handleShare(getUrl)}
          title={`Chia sẻ qua ${name}`}
          className="w-9 h-9 bg-gray-100 hover:bg-gray-200 flex items-center justify-center rounded-lg transition-colors"
        >
          <img src={logo} alt={name} className="w-5 h-5 object-contain" />
        </button>
      ))}

      <button
        onClick={handleCopy}
        className="flex items-center gap-1.5 px-3 h-9 rounded-lg text-[16px] font-bold border border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-colors"
      >
        {copied ? <Check size={15} className="text-green-500" /> : <Link2 size={15} />}
        {copied ? 'Đã sao chép!' : 'Sao chép link'}
      </button>
    </div>
  )
}
