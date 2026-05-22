import { createClient } from '@/utils/supabase/server'
import { CommunityContactSettings } from './CommunityContactSettings'

type SocialLink = { label: string; url: string }

export default async function LienHeCongDongSettingsPage() {
  const supabase = await createClient()
  const { data: row } = await supabase.from('community_info').select('*').limit(1).single()

  // Migrate old fixed columns → new dynamic arrays (in-memory, written on next save)
  const phones: string[] =
    row?.phones?.length ? row.phones : row?.phone ? [row.phone] : []

  const emails: string[] =
    row?.emails?.length ? row.emails : row?.email ? [row.email] : []

  const websites: string[] =
    row?.websites?.length ? row.websites
      : [row?.website1, row?.website2].filter(Boolean) as string[]

  const hoursList: string[] =
    row?.hours_list?.length ? row.hours_list : row?.hours ? [row.hours] : []

  let socialLinks: SocialLink[] = []
  if (row?.social_links?.length) {
    socialLinks = row.social_links as SocialLink[]
  } else if (row) {
    if (row.facebook_url)   socialLinks.push({ label: 'Facebook',  url: row.facebook_url })
    if (row.tiktok_url)     socialLinks.push({ label: 'TikTok',    url: row.tiktok_url })
    if (row.youtube_url)    socialLinks.push({ label: 'YouTube',   url: row.youtube_url })
    if (row.viber_phone)    socialLinks.push({ label: 'Viber',     url: row.viber_phone })
    if (row.whatsapp_phone) socialLinks.push({ label: 'WhatsApp',  url: row.whatsapp_phone })
  }

  const config = {
    id:           row?.id    ?? '',
    name:         row?.name  ?? null,
    address:      row?.address ?? null,
    phones,
    emails,
    websites,
    hours_list:   hoursList,
    social_links: socialLinks,
  }

  return (
    <div className="p-4 md:p-8 w-full max-w-[1400px] mx-auto">
      <CommunityContactSettings config={config} />
    </div>
  )
}
