'use client'

import { useState, useTransition } from 'react'
import { AdminCheckbox, AdminBadge, AdminButton } from '@/components/admin/ui'
import { EmptyState } from '@/components/admin/EmptyState'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { UserPlus, CheckCircle, Phone, Users } from 'lucide-react'
import { useBulkSelection } from '@/hooks/useBulkSelection'
import {
  REGISTRATION_STATUS_COLOR,
  REGISTRATION_STATUS_LABEL,
} from '@/lib/admin-constants'
import type { Registration } from '@/lib/admin-types'

export function RegistrationTable({ registrations, search, activeStatus }: {
  registrations: Registration[]
  search: string
  activeStatus?: string
}) {
  const [itemLoading, setItemLoading] = useState<Set<string>>(new Set())
  const router = useRouter()
  const [, startTransition] = useTransition()

  const { selected, selectedCount, allSelected, someSelected, toggleAll, toggleItem, clearSelection } =
    useBulkSelection(registrations, r => r.status === 'pending')

  const setStatus = async (ids: string[], status: string) => {
    await createClient().from('pilgrimage_registrations').update({ status }).in('id', ids)
    startTransition(() => router.refresh())
  }

  const bulkConfirm = async () => {
    await setStatus(Array.from(selected), 'confirmed')
    clearSelection()
  }

  const singleAction = async (id: string, status: string) => {
    setItemLoading(prev => new Set([...prev, id]))
    await setStatus([id], status)
    setItemLoading(prev => { const n = new Set(prev); n.delete(id); return n })
  }

  if (!registrations || registrations.length === 0) {
    return (
      <EmptyState
        icon={<UserPlus size={22} strokeWidth={1.5} className="text-gray-300" />}
        message={search ? `Không tìm thấy kết quả cho "${search}"` : 'Chưa có đăng ký nào.'}
      />
    )
  }

  const pendingCount = registrations.filter(r => r.status === 'pending').length

  return (
    <div className="max-h-[calc(100vh-280px)] overflow-y-auto overflow-x-auto">
      <table className="w-full min-w-[600px]">
        <thead className="sticky top-0 z-10">
          <tr className={`border-b transition-colors ${selectedCount > 0 ? 'bg-vatican-blue/5 border-vatican-blue/10' : 'bg-gray-50 border-gray-100'}`}>
            <th className="px-5 py-2.5 w-10">
              {pendingCount > 0 && (
                <AdminCheckbox checked={allSelected} indeterminate={someSelected} onChange={toggleAll} />
              )}
            </th>

            {selectedCount > 0 ? (
              <th colSpan={5} className="px-2 py-2.5 text-left">
                <div className="flex items-center gap-3">
                  <span className="text-[14px] font-bold text-vatican-blue">Đã chọn {selectedCount}</span>
                  <AdminButton
                    size="compact"
                    variant="confirm"
                    onClick={bulkConfirm}
                  >
                    <CheckCircle size={13} />
                    Xác nhận {selectedCount}
                  </AdminButton>
                  <button
                    onClick={clearSelection}
                    className="ml-auto text-[13px] text-gray-400 hover:text-gray-600 transition-colors mr-4"
                  >
                    Bỏ chọn
                  </button>
                </div>
              </th>
            ) : (
              <>
                <th className="px-4 py-2.5 text-left text-[13px] font-bold uppercase tracking-wider text-gray-400">Họ và tên</th>
                <th className="px-4 py-2.5 text-left text-[13px] font-bold uppercase tracking-wider text-gray-400">Điện thoại</th>
                <th className="px-4 py-2.5 text-left text-[13px] font-bold uppercase tracking-wider text-gray-400 w-8">Người</th>
                <th className="px-4 py-2.5 text-left text-[13px] font-bold uppercase tracking-wider text-gray-400">Chuyến hành hương</th>
                <th className="px-4 py-2.5 text-left text-[13px] font-bold uppercase tracking-wider text-gray-400">Trạng thái</th>
              </>
            )}
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100">
          {registrations.map(r => {
            const isPending = r.status === 'pending'
            const isSelected = selected.has(r.id)
            const loading = itemLoading.has(r.id)

            return (
              <tr key={r.id}
                className={`transition-colors ${r.status === 'cancelled' ? 'opacity-50' : ''} ${isSelected ? 'bg-vatican-blue/5' : 'hover:bg-gray-50'}`}
              >
                <td className="px-5 py-3.5">
                  {isPending && (
                    <AdminCheckbox checked={isSelected} onChange={() => toggleItem(r.id)} />
                  )}
                </td>
                <td className="px-4 py-3.5">
                  <p className="text-[15px] font-bold text-vatican-dark">{r.name}</p>
                  <p className="text-[13px] text-gray-400 mt-0.5">
                    {r.created_at ? new Date(r.created_at).toLocaleDateString('vi-VN', {
                      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
                    }) : ''}
                  </p>
                  {r.notes && (
                    <p className="text-[13px] text-gray-500 mt-0.5 italic leading-snug">{r.notes}</p>
                  )}
                </td>
                <td className="px-4 py-3.5">
                  <a href={`tel:${r.phone}`}
                    className="flex items-center gap-1.5 text-[14px] text-vatican-blue font-medium hover:underline transition-colors w-fit">
                    <Phone size={12} className="shrink-0" />
                    {r.phone}
                  </a>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-1.5 text-[14px] font-bold text-vatican-dark">
                    <Users size={12} className="text-gray-400 shrink-0" />
                    {r.num_people ?? 1}
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <p className="text-[14px] text-vatican-dark font-medium leading-snug">{r.trip_title ?? '—'}</p>
                  <p className="text-[13px] text-gray-400 mt-0.5">{r.trip_dates ?? ''}</p>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {activeStatus === 'all' && (
                      <AdminBadge color={REGISTRATION_STATUS_COLOR[r.status] ?? 'gray'}>
                        {REGISTRATION_STATUS_LABEL[r.status] ?? r.status}
                      </AdminBadge>
                    )}
                    {selectedCount === 0 && (
                      <>
                        {r.status !== 'confirmed' && (
                          <AdminButton
                            size="compact"
                            variant="confirm"
                            onClick={() => singleAction(r.id, 'confirmed')}
                            disabled={loading}
                          >
                            {r.status === 'cancelled' ? 'Xác nhận lại' : 'Xác nhận'}
                          </AdminButton>
                        )}
                        {r.status !== 'cancelled' && (
                          <AdminButton
                            size="compact"
                            variant="danger"
                            onClick={() => singleAction(r.id, 'cancelled')}
                            disabled={loading}
                          >
                            Hủy
                          </AdminButton>
                        )}
                      </>
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
