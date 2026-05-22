import { createClient } from '@/utils/supabase/server'
import { RegistrationTable } from './_components/RegistrationTable'
import { AdminPageSearchBar } from '@/components/admin/AdminPageSearchBar'
import { AddRegistrationButton } from './_components/AddRegistrationButton'
import { ExportPDFButton } from '@/components/admin/ExportPDFButton'
import { UserPlus } from 'lucide-react'
import { AdminCard } from '@/components/admin/AdminCard'
import { AdminPagination } from '@/components/admin/AdminPagination'
import { AdminTabs } from '@/components/admin/AdminTabs'

const PAGE_SIZE = 30

export default async function DangKyHanhHuongPage({
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
    .from('pilgrimage_registrations')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: sortAsc })
    .range(from, to)

  if (activeStatus !== 'all') dataQuery = dataQuery.eq('status', activeStatus)
  if (search) dataQuery = dataQuery.or(`name.ilike.%${search}%,phone.ilike.%${search}%,trip_title.ilike.%${search}%`)

  const [{ data: allStatuses }, { data: registrations, count }] = await Promise.all([
    supabase.from('pilgrimage_registrations').select('status'),
    dataQuery,
  ])

  const statusCounts = (allStatuses ?? []).reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1
    return acc
  }, {})

  const TABS = [
    { value: 'pending',   label: 'Chờ xác nhận', count: statusCounts['pending']   ?? 0 },
    { value: 'confirmed', label: 'Đã xác nhận',  count: statusCounts['confirmed'] ?? 0 },
    { value: 'cancelled', label: 'Đã huỷ',        count: statusCounts['cancelled'] ?? 0 },
    { value: 'all',       label: 'Tất cả',         count: (allStatuses ?? []).length },
  ]
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)

  const tabHref = (value: string) => {
    const p = new URLSearchParams()
    if (value !== 'pending') p.set('status', value)
    if (search) p.set('q', search)
    if (sort && sort !== 'desc') p.set('sort', sort)
    return `/admin/dang-ky-hanh-huong${p.toString() ? '?' + p.toString() : ''}`
  }

  return (
    <div className="p-4 md:p-8 w-full max-w-[1400px] mx-auto">
      <AdminCard icon={<UserPlus size={18} strokeWidth={2.5} />} title="Đăng Ký Hành Hương">

        {/* Action Bar */}
        <div className="px-5 pt-4 pb-3 border-b border-gray-100 flex flex-col xl:flex-row gap-3 items-start xl:items-center justify-between bg-gray-50/50">
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

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <AdminPageSearchBar defaultQ={search} activeStatus={activeStatus} sort={sort ?? 'desc'} basePath="/admin/dang-ky-hanh-huong" />
            <div className="h-6 w-px bg-gray-300 hidden xl:block" />
            <ExportPDFButton
              title="Danh sách đăng ký hành hương"
              headers={['Họ và tên', 'Điện thoại', 'Số người', 'Chuyến hành hương', 'Ngày chuyến', 'Ghi chú', 'Trạng thái', 'Ngày đăng ký']}
              rows={(registrations ?? []).map(r => [
                r.name ?? '', r.phone ?? '', String(r.num_people ?? 1),
                r.trip_title ?? '', r.trip_dates ?? '', r.notes ?? '',
                ({ pending: 'Chờ xác nhận', confirmed: 'Đã xác nhận', cancelled: 'Đã huỷ' } as Record<string,string>)[r.status] ?? r.status ?? '',
                r.created_at ? new Date(r.created_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '',
              ])}
            />
            <AddRegistrationButton />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white">
          <RegistrationTable registrations={registrations ?? []} search={search} activeStatus={activeStatus} />
        </div>

        {/* Pagination */}
        <AdminPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={count ?? 0}
          itemName="đăng ký"
          from={from}
          to={to}
        />

      </AdminCard>
    </div>
  )
}
