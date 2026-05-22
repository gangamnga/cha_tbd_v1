import { notFound } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { MembersTable } from './_components/MembersTable'

type Member = { id: string; full_name: string; phone: string | null; created_at: string }

const PAGE_SIZE = 30

type SourceConfig = {
  table: string
  nameField: string
  phoneField: string | null
}

const SOURCE_CONFIG: Record<string, SourceConfig> = {
  'hanh-huong': { table: 'pilgrimage_registrations', nameField: 'name',      phoneField: 'phone' },
  'internet':   { table: 'community_signups',         nameField: 'full_name', phoneField: 'phone' },
  'y-chi':      { table: 'prayer_intentions',         nameField: 'name',      phoneField: null    },
  'loi-chung':  { table: 'testimonies',               nameField: 'name',      phoneField: null    },
  'khac':       { table: 'community_signups',         nameField: 'full_name', phoneField: 'phone' },
}

export default async function SourceMembersPage({
  params,
  searchParams,
}: {
  params: Promise<{ source: string }>
  searchParams: Promise<{ q?: string; sort?: string; page?: string }>
}) {
  const { source } = await params
  const config = SOURCE_CONFIG[source]
  if (!config) notFound()

  const { q, sort, page } = await searchParams
  const search = q?.trim() ?? ''
  const sortAsc = sort === 'asc'
  const currentPage = Math.max(1, parseInt(page ?? '1'))
  const from = (currentPage - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const supabase = await createClient()

  const selectCols = ['id', config.nameField, 'created_at', ...(config.phoneField ? [config.phoneField] : [])].join(', ')

  let query = supabase
    .from(config.table)
    .select(selectCols, { count: 'exact' })
    .order('created_at', { ascending: sortAsc })
    .range(from, to)

  if (search) {
    query = config.phoneField
      ? query.or(`${config.nameField}.ilike.%${search}%,${config.phoneField}.ilike.%${search}%`)
      : query.ilike(config.nameField, `%${search}%`)
  }

  const { data, count } = await query

  const members: Member[] = (data ?? []).map((row: any) => ({
    id:         row.id,
    full_name:  row[config.nameField] ?? '(Ẩn danh)',
    phone:      config.phoneField ? (row[config.phoneField] ?? null) : null,
    created_at: row.created_at,
  }))

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)

  return (
    <div className="p-4 md:p-8 w-full max-w-[1400px] mx-auto">
      <MembersTable
        source={source}
        tableName={config.table}
        initial={members}
        defaultQ={search}
        defaultSort={sort ?? 'desc'}
        count={count ?? 0}
        currentPage={currentPage}
        totalPages={totalPages}
        from={from}
        to={to}
      />
    </div>
  )
}
