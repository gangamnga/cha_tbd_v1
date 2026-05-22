import { createClient } from '@/utils/supabase/server'
import { TestimonyList } from './_components/TestimonyList'
import { AdminPageSearchBar } from '@/components/admin/AdminPageSearchBar'
import { MessageSquare } from 'lucide-react'
import { AdminCard } from '@/components/admin/AdminCard'
import { AdminPagination } from '@/components/admin/AdminPagination'

import { AdminTabs } from '@/components/admin/AdminTabs'

const PAGE_SIZE = 20

export default async function LoiChungPage({
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
    .from('testimonies')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: sortAsc })
    .range(from, to)

  if (activeStatus !== 'all') dataQuery = dataQuery.eq('status', activeStatus)
  if (search) dataQuery = dataQuery.or(`title.ilike.%${search}%,name.ilike.%${search}%,content.ilike.%${search}%`)

  const [{ data: allStatuses }, { data: testimonies, count }] = await Promise.all([
    supabase.from('testimonies').select('status'),
    dataQuery,
  ])

  const statusCounts = (allStatuses ?? []).reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1
    return acc
  }, {})

  const TABS = [
    { value: 'pending',  label: 'Chờ duyệt', count: statusCounts['pending']  ?? 0 },
    { value: 'approved', label: 'Đã duyệt',  count: statusCounts['approved'] ?? 0 },
    { value: 'rejected', label: 'Từ chối',   count: statusCounts['rejected'] ?? 0 },
    { value: 'all',      label: 'Tất cả',    count: (allStatuses ?? []).length },
  ]
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)

  const tabHref = (value: string) => {
    const p = new URLSearchParams()
    if (value !== 'pending') p.set('status', value)
    if (search) p.set('q', search)
    if (sort && sort !== 'desc') p.set('sort', sort)
    return `/admin/loi-chung${p.toString() ? '?' + p.toString() : ''}`
  }

  return (
    <div className="p-4 md:p-8 w-full max-w-[1400px] mx-auto">
      <AdminCard icon={<MessageSquare size={18} strokeWidth={2.5} />} title="Lời Chứng Đã Gửi">

        {/* Action bar */}
        <div className="px-5 pt-4 pb-3 border-b border-gray-100 bg-gray-50/50 flex flex-col xl:flex-row gap-3 items-start xl:items-center justify-between shrink-0">

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

          {/* Search + Add */}
          <div className="flex items-center gap-2 shrink-0">
            <AdminPageSearchBar defaultQ={search} activeStatus={activeStatus} sort={sort ?? 'desc'} basePath="/admin/loi-chung" />
          </div>
        </div>

        {/* List */}
        <div className="bg-white">
          <TestimonyList testimonies={testimonies ?? []} search={search} />
        </div>

        {/* Pagination */}
        <AdminPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={count ?? 0}
          itemName="lời chứng"
          from={from}
          to={to}
        />

      </AdminCard>
    </div>
  )
}
