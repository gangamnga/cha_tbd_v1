import type { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://chatruongbuudiep.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL,                          lastModified: new Date(), changeFrequency: 'daily',   priority: 1.0 },
    { url: `${SITE_URL}/tieu-su`,             lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_URL}/hanh-huong`,          lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${SITE_URL}/chung-nhan`,             lastModified: new Date(), changeFrequency: 'daily',   priority: 0.8 },
    { url: `${SITE_URL}/can-biet`,            lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${SITE_URL}/cung-cau-nguyen`,     lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.7 },
  ]

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { data: articles } = await supabase
      .from('articles')
      .select('slug, created_at, updated_at')
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    const articlePages: MetadataRoute.Sitemap = (articles ?? []).map((a) => ({
      url: `${SITE_URL}/tin-tuc/${a.slug}`,
      lastModified: new Date(a.updated_at ?? a.created_at),
      changeFrequency: 'monthly',
      priority: 0.6,
    }))

    return [...staticPages, ...articlePages]
  } catch {
    return staticPages
  }
}
