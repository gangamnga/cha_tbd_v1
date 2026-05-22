import { MapPin, PlayCircle, Info } from "lucide-react";
import { createClient } from "@/utils/supabase/server";

type Location = {
  id: string
  name: string
  badge: string | null
  note: string | null
  address_new: string | null
  address_old: string | null
  map_url: string | null
  directions_url: string | null
  theme: 'blue' | 'red'
  sort_order: number
}

function LocationCard({ loc }: { loc: Location }) {
  const isBlue = loc.theme === 'blue'
  const colorBorder = isBlue ? 'border-vatican-blue/30' : 'border-red-800/20'
  const colorBg = isBlue ? 'bg-vatican-blue/5' : 'bg-red-50'
  const colorBorderHeader = isBlue ? 'border-vatican-blue/20' : 'border-red-800/10'
  const colorText = isBlue ? 'text-vatican-blue' : 'text-red-800'
  const colorBadgeBorder = isBlue ? 'border-vatican-blue/30' : 'border-red-800/30'
  const colorPin = isBlue ? 'text-vatican-blue' : 'text-red-800'
  
  const colorNoteText = 'text-gray-700'
  const colorNoteDivider = isBlue ? 'border-vatican-blue/10' : 'border-red-800/10'

  return (
    <div className={`bg-white border ${colorBorder} rounded-lg overflow-hidden flex flex-col`}>
      <div className={`${colorBg} border-b ${colorBorderHeader} px-4 py-3 flex flex-col justify-center min-h-[48px]`}>
        <div className="flex items-center gap-2 flex-wrap">
          <p className={`text-[16px] lg:text-[18px] font-bold ${colorText} uppercase tracking-wide leading-tight`}>
            {loc.name}
          </p>
          {loc.badge && (
            <span className={`text-[16px] font-bold uppercase tracking-wide ${colorText} border ${colorBadgeBorder} bg-white px-2 py-0.5 rounded-lg`}>
              {loc.badge}
            </span>
          )}
        </div>
        {loc.note && (
          <div className={`mt-2.5 border-t ${colorNoteDivider} pt-2.5 flex gap-2.5 items-start`}>
            <div className={`${colorText} mt-[3px] shrink-0`}>
              <Info size={16} strokeWidth={2.5} />
            </div>
            <p className={`text-[16px] lg:text-[16px] ${colorNoteText} font-normal italic leading-relaxed`}>
              {loc.note.replace(/^\*?Lưu ý:\s*/i, '')}
            </p>
          </div>
        )}
      </div>
      <div className="flex items-start gap-3 px-4 py-4 flex-1">
        <div className="h-[18px] flex items-center shrink-0">
          <MapPin size={16} strokeWidth={2.5} className={colorPin} />
        </div>
        <div className="flex flex-col gap-1.5 flex-1">
          <div>
            <p className="text-[16px] lg:text-[16px] font-semibold text-gray-400 uppercase tracking-wide">Địa chỉ hiện nay</p>
            <p className="text-[16px] lg:text-[16px] text-gray-800 font-bold leading-snug mt-0.5">
              {loc.address_new}
            </p>
          </div>
          {loc.address_old && (
            <div className="pt-2.5 mt-1 border-t border-gray-100">
              <p className="text-[16px] lg:text-[16px] font-semibold text-gray-400 uppercase tracking-wide">Địa chỉ cũ</p>
              <p className="text-[16px] lg:text-[16px] text-gray-600 font-bold leading-snug mt-0.5">{loc.address_old}</p>
            </div>
          )}
        </div>
      </div>
      {(loc.map_url || loc.directions_url) && (
        <div className="px-4 pb-4 flex gap-2">
          {loc.map_url && (
            <a
              href={loc.map_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 bg-vatican-blue text-white font-semibold px-4 py-2 text-[16px] rounded-lg hover:bg-vatican-blue-dark transition-colors"
            >
              <MapPin size={15} strokeWidth={2.5} />
              Bản đồ
            </a>
          )}
          {loc.directions_url && (
            <a
              href={loc.directions_url}
              target={loc.directions_url !== '#' ? '_blank' : undefined}
              rel={loc.directions_url !== '#' ? 'noopener noreferrer' : undefined}
              className="flex-1 inline-flex items-center justify-center gap-2 border border-vatican-blue text-vatican-blue font-semibold px-4 py-2 text-[16px] rounded-lg hover:bg-vatican-blue hover:text-white transition-colors"
            >
              <PlayCircle size={15} strokeWidth={2.5} />
              Hướng dẫn
            </a>
          )}
        </div>
      )}
    </div>
  )
}

export async function CanBietSection() {
  const supabase = await createClient()
  const { data: locations } = await supabase
    .from('locations')
    .select('*')
    .order('sort_order')

  if (!locations || locations.length === 0) {
    return (
      <div className="bg-white p-4 lg:p-5 flex-1 flex flex-col w-full">
        <div className="flex flex-col items-center justify-center py-12 px-4 text-gray-400 border border-dashed border-gray-200 rounded-lg h-full min-h-[300px]">
          <MapPin size={48} strokeWidth={1} className="mb-4 text-gray-300" />
          <p className="text-[16px] text-gray-500 text-center max-w-md">
            Chưa có thông tin địa chỉ.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="px-2 sm:px-4 lg:px-5 py-2.5 sm:py-4 lg:py-5 flex flex-col">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {(locations ?? []).map(loc => (
          <LocationCard key={loc.id} loc={loc} />
        ))}
      </div>
    </div>
  )
}
