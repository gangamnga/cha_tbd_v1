import { createClient } from '@/utils/supabase/server'
import { IntentionList } from './_components/IntentionList'
import { AdminPageSearchBar } from '@/components/admin/AdminPageSearchBar'
import { AddIntentionButton } from './_components/AddIntentionButton'
import { ExportPDFButton } from '@/components/admin/ExportPDFButton'
import { AdminCard } from '@/components/admin/AdminCard'
import { AdminPagination } from '@/components/admin/AdminPagination'
import { AdminTabs } from '@/components/admin/AdminTabs'
import { Flame } from 'lucide-react'

const PAGE_SIZE = 20

export default async function YChiPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; sort?: string; page?: string }>
}) {
  const { status, q, sort, page } = await searchParams
  const activeStatus = status ?? 'pending'
  const search = q?.trim() ?? ''
  const sortAsc = sort === 'asc'
  const currentPage = Math.max(1, parseInt(page ?? '1'))
  const from = (currentPage - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const supabase = await createClient()

  let dataQuery = supabase
    .from('prayer_intentions')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: sortAsc })
    .range(from, to)

  if (activeStatus !== 'all') dataQuery = dataQuery.eq('status', activeStatus)
  if (search) dataQuery = dataQuery.or(`name.ilike.%${search}%,content.ilike.%${search}%`)

  const [{ data: allStatuses }, { data: intentions, count }] = await Promise.all([
    supabase.from('prayer_intentions').select('status'),
    dataQuery,
  ])

  const statusCounts = (allStatuses ?? []).reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1
    return acc
  }, {})

  const TABS = [
    { value: 'pending',   label: 'Chờ cầu nguyện', count: statusCounts['pending']   ?? 0 },
    { value: 'prayed',    label: 'Đã cầu nguyện',   count: statusCounts['prayed']    ?? 0 },
    { value: 'cancelled', label: 'Đã hủy',           count: statusCounts['cancelled'] ?? 0 },
    { value: 'all',       label: 'Tất cả',           count: (allStatuses ?? []).length },
  ]
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)

  const tabHref = (value: string) => {
    const p = new URLSearchParams()
    if (value !== 'pending') p.set('status', value)
    if (search) p.set('q', search)
    if (sort && sort !== 'desc') p.set('sort', sort)
    return `/admin/y-chi${p.toString() ? '?' + p.toString() : ''}`
  }

  return (
    <div className="p-4 md:p-8 w-full max-w-[1400px] mx-auto">
      <AdminCard title="Ý Chỉ Cầu Nguyện" icon={<Flame size={18} strokeWidth={2.5} />}>
        
        {/* Action Bar */}
        <div className="px-5 pt-4 pb-3 border-b border-gray-100 flex flex-col xl:flex-row gap-3 items-start xl:items-center justify-between bg-gray-50/50">

          {/* Tabs */}
          <div className="flex-1 min-w-0">
            <AdminTabs
              tabs={TABS.map(tab => ({
                id: tab.value,
                label: tab.label,
                count: tab.count,
                href: tabHref(tab.value),
              }))}
              activeTab={activeStatus}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto shrink-0">
            <AdminPageSearchBar defaultQ={search} activeStatus={activeStatus} sort={sort ?? 'desc'} basePath="/admin/y-chi" />
            <ExportPDFButton
              title="Danh sách ý chỉ cầu nguyện"
              headers={['Họ và tên', 'Địa phương', 'Loại', 'Nội dung', 'Trạng thái', 'Ngày gửi']}
              rows={(intentions ?? []).map(i => [
                i.name ?? '',
                i.location ?? '',
                (i.categories ?? []).join('; '),
                i.content ?? '',
                ({ pending: 'Chờ cầu nguyện', prayed: 'Đã cầu nguyện', cancelled: 'Đã hủy' } as Record<string,string>)[i.status] ?? i.status ?? '',
                i.created_at ? new Date(i.created_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '',
              ])}
            />
            <AddIntentionButton />
          </div>

        </div>

        {/* List */}
        <div className="bg-white">
          <IntentionList intentions={intentions ?? []} search={search} />
        </div>

        {/* Pagination */}
        <AdminPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={count ?? 0}
          itemName="ý chỉ"
          from={from}
          to={to}
        />

      </AdminCard>
    </div>
  )
}
