// Shared types, configs, and data for the livestream/media section.
// Imported by both MediaManager.tsx and LivestreamModal.tsx.

export type EventStatus    = 'pending' | 'completed'
export type StreamPlatform = 'youtube' | 'facebook' | 'tiktok' | 'podcast' | 'zoom'

export type LivestreamSession = {
  id: string; title: string; platforms: StreamPlatform[]
  scheduled_date: string; scheduled_time: string
  description: string; status: EventStatus; episode?: number
}

export type ModalState =
  | null
  | { kind: 'new' }
  | { kind: 'view-stream'; session: LivestreamSession }
  | { kind: 'edit-stream'; session: LivestreamSession }

// ── Mock data ─────────────────────────────────────────────────────────────────

export const MOCK_STREAMS: LivestreamSession[] = [
  { id: 's1', title: 'Cầu nguyện tối Chúa Nhật',            platforms: ['youtube', 'facebook'], scheduled_date: '2026-05-25', scheduled_time: '20:00', description: 'Cầu nguyện chung hàng tuần, chia sẻ lời Chúa và kinh Mân Côi.', status: 'pending',   episode: 48 },
  { id: 's2', title: 'Podcast: Hành trình đức tin — Tập 12', platforms: ['podcast'],             scheduled_date: '2026-05-27', scheduled_time: '07:00', description: 'Chủ đề: Cha Diệp và tinh thần hy sinh trong đời thường. Khách mời: Thầy Giuse Nguyễn Minh.', status: 'pending', episode: 12 },
  { id: 's3', title: 'Livestream Lễ Giỗ Cha Diệp',           platforms: ['youtube', 'tiktok'],   scheduled_date: '2026-06-12', scheduled_time: '08:00', description: 'Phát sóng trực tiếp Thánh Lễ kỷ niệm ngày Cha Diệp qua đời tại Tắc Sậy.', status: 'pending' },
  { id: 's4', title: 'Cầu nguyện tối Chúa Nhật',            platforms: ['youtube'],             scheduled_date: '2026-05-18', scheduled_time: '20:00', description: 'Cầu nguyện chung hàng tuần.', status: 'completed', episode: 47 },
]

// ── Config ────────────────────────────────────────────────────────────────────

export const STATUS_CONFIG: Record<EventStatus, { label: string; bg: string; text: string; border: string }> = {
  pending:   { label: 'Sắp diễn ra', bg: 'bg-amber-100',   text: 'text-amber-700',   border: 'border-amber-200'   },
  completed: { label: 'Đã hoàn tất', bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' },
}

export const PLATFORM_ORDER: StreamPlatform[] = ['youtube', 'facebook', 'tiktok', 'podcast', 'zoom']

export const PLATFORM_CONFIG: Record<StreamPlatform, { label: string; color: string }> = {
  youtube:  { label: 'YouTube',  color: 'text-red-600'    },
  facebook: { label: 'Facebook', color: 'text-blue-600'   },
  tiktok:   { label: 'TikTok',   color: 'text-gray-800'   },
  podcast:  { label: 'Podcast',  color: 'text-purple-600' },
  zoom:     { label: 'Zoom',     color: 'text-sky-600'    },
}

export const TABS: { key: 'phat-song' | 'tu-khoa-seo'; label: string }[] = [
  { key: 'phat-song',   label: 'Phát sóng & Livestream' },
  { key: 'tu-khoa-seo', label: 'Từ khóa SEO' },
]
