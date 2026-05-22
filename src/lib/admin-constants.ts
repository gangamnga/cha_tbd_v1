import type { BadgeColor } from '@/components/admin/ui'

// ── Modal widths ──────────────────────────────────────────────────────────────
export const MODAL_WIDTHS = {
  sm:   'max-w-md',
  md:   'max-w-lg',
  lg:   'max-w-2xl',
  xl:   'max-w-4xl',
} as const

// ── Pagination ────────────────────────────────────────────────────────────────
export const PAGE_SIZE = 20

// ── Pilgrimage registration statuses ─────────────────────────────────────────
export const REGISTRATION_STATUS_COLOR: Record<string, BadgeColor> = {
  pending:   'amber',
  confirmed: 'green',
  cancelled: 'red',
}
export const REGISTRATION_STATUS_LABEL: Record<string, string> = {
  pending:   'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  cancelled: 'Đã huỷ',
}

// ── Prayer intention statuses ─────────────────────────────────────────────────
export const INTENTION_STATUS_COLOR: Record<string, BadgeColor> = {
  pending:   'amber',
  prayed:    'blue',
  cancelled: 'red',
}
export const INTENTION_STATUS_LABEL: Record<string, string> = {
  pending:   'Chờ cầu nguyện',
  prayed:    'Đã cầu nguyện',
  cancelled: 'Đã hủy',
}

// ── Testimony statuses ────────────────────────────────────────────────────────
export const TESTIMONY_STATUS_COLOR: Record<string, BadgeColor> = {
  pending:   'amber',
  approved:  'green',
  rejected:  'red',
  published: 'blue',
}
export const TESTIMONY_STATUS_LABEL: Record<string, string> = {
  pending:   'Chờ duyệt',
  approved:  'Đã duyệt',
  rejected:  'Từ chối',
  published: 'Đã đăng',
}
