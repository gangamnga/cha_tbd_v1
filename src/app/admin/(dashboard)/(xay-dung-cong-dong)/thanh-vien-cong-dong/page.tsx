import { createClient } from '@/utils/supabase/server'
import { HeartHandshake } from 'lucide-react'
import { AdminCard } from '@/components/admin/AdminCard'
import { MembersClient } from './_components/MembersClient'

const PAGE_SIZE = 30

type SourceConfig = {
  table: string
  nameField: string
  phoneField: string | null
}

const SOURCE_CONFIG: Record<string, SourceConfig> = {
  'hanh-huong': { table: 'pilgrimage_registrations', nameField: 'name',      phoneField: 'phone' },
  'y-chi':      { table: 'prayer_intentions',         nameField: 'name',      phoneField: null    },
  'loi-chung':  { table: 'testimonies',               nameField: 'name',      phoneField: null    },
  'internet':   { table: 'community_signups',         nameField: 'full_name', phoneField: 'phone' },
  'khac':       { table: 'community_signups',         nameField: 'full_name', phoneField: 'phone' },
}

export default async function ThanhVienCongDongPage({
  searchParams,
}: {
  searchParams: Promise<{ source?: string; q?: string; sort?: string; page?: string }>
}) {
  const params = await searchParams
  const source = params.source?.trim() || 'hanh-huong'
  const config = SOURCE_CONFIG[source] ? SOURCE_CONFIG[source] : SOURCE_CONFIG['hanh-huong']
  const activeTab = SOURCE_CONFIG[source] ? source : 'hanh-huong'

  const q = params.q?.trim() ?? ''
  const sort = params.sort === 'asc' ? 'asc' : 'desc'
  const currentPage = Math.max(1, parseInt(params.page ?? '1'))
  const from = (currentPage - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const supabase = await createClient()

  // Query song song để lấy số lượng (count) của cả 5 tab
  const [
    countHanhHuong,
    countYChi,
    countLoiChung,
    countInternet,
    countKhac
  ] = await Promise.all([
    supabase.from('pilgrimage_registrations').select('id', { count: 'exact', head: true }),
    supabase.from('prayer_intentions').select('id', { count: 'exact', head: true }),
    supabase.from('testimonies').select('id', { count: 'exact', head: true }),
    supabase.from('community_signups').select('id', { count: 'exact', head: true }).eq('source', 'internet'),
    supabase.from('community_signups').select('id', { count: 'exact', head: true }).eq('source', 'khac'),
  ])

  const tabCounts = {
    'hanh-huong': countHanhHuong.count ?? 0,
    'y-chi': countYChi.count ?? 0,
    'loi-chung': countLoiChung.count ?? 0,
    'internet': countInternet.count ?? 0,
    'khac': countKhac.count ?? 0,
  }

  const selectCols = ['id', config.nameField, 'created_at', ...(config.phoneField ? [config.phoneField] : [])].join(', ')

  let query = supabase
    .from(config.table)
    .select(selectCols, { count: 'exact' })
    .order('created_at', { ascending: sort === 'asc' })
    .range(from, to)

  // Filter theo source đối với bảng community_signups
  if (config.table === 'community_signups') {
    query = query.eq('source', activeTab)
  }

  // Search filter
  if (q) {
    query = config.phoneField
      ? query.or(`${config.nameField}.ilike.%${q}%,${config.phoneField}.ilike.%${q}%`)
      : query.ilike(config.nameField, `%${q}%`)
  }

  const { data, count } = await query

  const members = (data ?? []).map((row: any) => ({
    id:         row.id,
    full_name:  row[config.nameField] ?? '(Ẩn danh)',
    phone:      config.phoneField ? (row[config.phoneField] ?? null) : null,
    created_at: row.created_at,
  }))

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)

  return (
    <div className="p-4 md:p-8 w-full max-w-[1400px] mx-auto">
      <AdminCard title="Nguồn Tham Gia" icon={<HeartHandshake size={18} strokeWidth={2.5} />}>
        <MembersClient
          activeTab={activeTab}
          tableName={config.table}
          initial={members}
          defaultQ={q}
          defaultSort={sort}
          count={count ?? 0}
          currentPage={currentPage}
          totalPages={totalPages}
          from={from}
          to={to}
          tabCounts={tabCounts}
        />
      </AdminCard>
    </div>
  )
}
