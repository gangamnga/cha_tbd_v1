'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { ArrowUpDown, Phone, Trash2, Compass, Wifi, Zap, Mic, Tag } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { ConfirmDeleteModal } from '@/components/admin/ConfirmDeleteModal'
import { ExportPDFButton } from '@/components/admin/ExportPDFButton'
import { AdminPagination } from '@/components/admin/AdminPagination'
import { AdminSearchInput } from '@/components/admin/AdminSearchInput'
import { AdminIconButton } from '@/components/admin/ui'
import { EmptyState } from '@/components/admin/EmptyState'
import { formatDateTime } from '@/lib/format-date'

type Member = { id: string; full_name: string; phone: string | null; created_at: string }

const SOURCE_META: Record<string, { label: string; Icon: LucideIcon }> = {
  'hanh-huong': { label: 'Nguồn từ hành hương',       Icon: Compass },
  'internet':   { label: 'Nguồn từ internet',          Icon: Wifi    },
  'y-chi':      { label: 'Nguồn từ ý chỉ cầu nguyện', Icon: Zap     },
  'loi-chung':  { label: 'Nguồn từ lời chứng',         Icon: Mic     },
  'khac':       { label: 'Nguồn khác',                 Icon: Tag     },
}

function MemberRow({ member, tableName, index, onDeleted }: {
  member: Member
  tableName: string
  index: number
  onDeleted: () => void
}) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const remove = async () => {
    setDeleting(true)
    await createClient().from(tableName).delete().eq('id', member.id)
    onDeleted()
  }

  return (
    <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
      <td className="px-5 py-3.5 text-[14px] text-gray-400 font-medium tabular-nums">{index}</td>
      <td className="px-4 py-3.5">
        <p className="text-[15px] font-bold text-vatican-dark">{member.full_name}</p>
      </td>
      <td className="px-4 py-3.5">
        {member.phone ? (
          <a href={`tel:${member.phone}`}
            className="flex items-center gap-1.5 text-[15px] text-vatican-blue font-medium hover:underline transition-colors w-fit">
            <Phone size={12} className="shrink-0" />
            {member.phone}
          </a>
        ) : (
          <span className="text-[14px] text-gray-300">—</span>
        )}
      </td>
      <td className="px-4 py-3.5 text-[14px] text-gray-500 whitespace-nowrap">
        {formatDateTime(member.created_at)}
      </td>
      <td className="px-4 py-3.5">
        <AdminIconButton
          onClick={() => setShowConfirm(true)}
          disabled={deleting}
          variant="danger"
          title="Xóa"
        >
          <Trash2 size={13} />
        </AdminIconButton>
        {showConfirm && (
          <ConfirmDeleteModal
            title="Xóa khỏi danh sách?"
            description={member.full_name}
            onConfirm={remove}
            onCancel={() => setShowConfirm(false)}
            loading={deleting}
          />
        )}
      </td>
    </tr>
  )
}

export function MembersTable({
  source,
  tableName,
  initial,
  defaultQ,
  defaultSort,
  count,
  currentPage,
  totalPages,
  from,
  to,
}: {
  source: string
  tableName: string
  initial: Member[]
  defaultQ: string
  defaultSort: string
  count: number
  currentPage: number
  totalPages: number
  from: number
  to: number
}) {
  const [members, setMembers] = useState(initial)
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [q, setQ] = useState(defaultQ)
  const [searchOpen, setSearchOpen] = useState(!!defaultQ)

  const meta = SOURCE_META[source] ?? { label: source, Icon: Tag }
  const { label, Icon } = meta

  const navigate = (newQ: string, sort: string) => {
    const p = new URLSearchParams()
    if (newQ.trim()) p.set('q', newQ.trim())
    if (sort !== 'desc') p.set('sort', sort)
    startTransition(() => router.push(`/admin/thanh-vien-cong-dong/${source}${p.toString() ? '?' + p.toString() : ''}`))
  }

  const clearSearch = () => {
    setQ(''); setSearchOpen(false)
    navigate('', defaultSort)
  }

  const toggleSort = () => {
    const next = defaultSort === 'desc' ? 'asc' : 'desc'
    navigate(q, next)
  }

  return (
    <div className="bg-white rounded-lg flex flex-col border border-gray-100">

      {/* Header */}
      <div className="bg-white border-b-[3px] border-vatican-yellow flex items-center gap-2 px-5 h-[48px] shrink-0 rounded-t-lg">
        <Icon size={18} strokeWidth={2.5} className="text-vatican-blue/80 shrink-0" />
        <span className="text-[16px] font-bold uppercase tracking-wide text-vatican-blue">{label}</span>
      </div>

      {/* Action Bar */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
        <p className="text-[14px] text-gray-500 font-medium">
          <strong className="text-vatican-dark">{count}</strong> thành viên
        </p>
        <div className="flex items-center gap-1.5">
          <AdminSearchInput
            open={searchOpen}
            value={q}
            onOpen={() => setSearchOpen(true)}
            onChange={v => setQ(v)}
            onClear={clearSearch}
            onKeyDown={e => e.key === 'Enter' && navigate(q, defaultSort)}
          />
          <button
            onClick={toggleSort}
            title={defaultSort === 'desc' ? 'Đang: Mới nhất trước' : 'Đang: Cũ nhất trước'}
            className={`w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-500 hover:border-vatican-blue hover:text-vatican-blue transition-colors shrink-0 ${defaultSort === 'asc' ? 'border-vatican-blue text-vatican-blue' : ''}`}
          >
            <ArrowUpDown size={15} />
          </button>
          <div className="h-6 w-px bg-gray-300 mx-0.5" />
          <ExportPDFButton
            title={label}
            headers={['STT', 'Họ và tên', 'Số điện thoại', 'Ngày giờ']}
            rows={members.map((m, i) => [
              String(from + i + 1),
              m.full_name,
              m.phone ?? '—',
              formatDateTime(m.created_at),
            ])}
          />
        </div>
      </div>

      {/* Table */}
      {members.length === 0 ? (
        <EmptyState
          icon={<Icon size={22} strokeWidth={1.5} className="text-gray-300" />}
          message={defaultQ ? `Không tìm thấy kết quả cho "${defaultQ}"` : 'Chưa có thành viên nào.'}
        />
      ) : (
        <div className="max-h-[calc(100vh-280px)] overflow-y-auto overflow-x-auto">
          <table className="w-full min-w-[520px]">
            <thead className="sticky top-0 z-10">
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-5 py-3 text-left text-[13px] font-bold uppercase tracking-wider text-gray-400 w-14">STT</th>
                <th className="px-4 py-3 text-left text-[13px] font-bold uppercase tracking-wider text-gray-400">Họ và tên</th>
                <th className="px-4 py-3 text-left text-[13px] font-bold uppercase tracking-wider text-gray-400">Điện thoại</th>
                <th className="px-4 py-3 text-left text-[13px] font-bold uppercase tracking-wider text-gray-400">Ngày giờ</th>
                <th className="px-4 py-3 w-12" />
              </tr>
            </thead>
            <tbody>
              {members.map((m, i) => (
                <MemberRow
                  key={m.id}
                  member={m}
                  tableName={tableName}
                  index={from + i + 1}
                  onDeleted={() => {
                    setMembers(prev => prev.filter(x => x.id !== m.id))
                    startTransition(() => router.refresh())
                  }}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <AdminPagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalCount={count}
        itemName="thành viên"
        from={from}
        to={to}
      />
    </div>
  )
}
