'use client'

import { useState, memo } from 'react'
import {
  Plus, Pencil, Trash2,
  Phone, Mail, UserCircle,
  UserCheck, UserX, Eye,
} from 'lucide-react'
import { AdminSearchInput } from '@/components/admin/AdminSearchInput'
import { createClient } from '@/utils/supabase/client'
import { ConfirmDeleteModal } from '@/components/admin/ConfirmDeleteModal'
import { ExportPDFButton } from '@/components/admin/ExportPDFButton'
import { AdminCheckbox, AdminButton, AdminIconButton, AdminBadge } from '@/components/admin/ui'
import { AdminTabs } from '@/components/admin/AdminTabs'
import type { BqtMember } from './constants'
import { DEPARTMENTS, splitMemberName } from './constants'
import { MemberModal, parseRoles, type ModalMode } from './MemberModal'
import { EmptyState } from '@/components/admin/EmptyState'

// -- MemberRow -----------------------------------------------------------------

const MemberRow = memo(function MemberRow({ member, isSelected, onToggle, onView, onEdit, onDelete }: {
  member: BqtMember
  isSelected: boolean
  onToggle: () => void
  onView: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  const memberRoles = parseRoles(member)
  const { holyName, name: rawName } = splitMemberName(member.name)

  return (
    <tr className={`transition-colors ${!member.is_active ? 'opacity-60' : ''} ${isSelected ? 'bg-vatican-blue/5' : 'hover:bg-gray-50'}`}>

      {/* Checkbox */}
      <td className="px-5 py-3.5">
        <AdminCheckbox checked={isSelected} onChange={onToggle} />
      </td>

      {/* Name + avatar */}
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0">
            {member.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={member.photo_url} alt={member.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-[13px] font-black text-gray-300 uppercase select-none">
                {(rawName || member.name).charAt(0)}
              </span>
            )}
          </div>
          <div className="min-w-0 flex flex-col">
            {holyName && (
              <span className="text-[12px] font-semibold text-vatican-blue/80 leading-tight mb-0.5">
                {holyName}
              </span>
            )}
            <p className="text-[15px] font-bold text-vatican-dark leading-snug">{rawName}</p>
          </div>
        </div>
      </td>

      {/* Roles */}
      <td className="px-4 py-3.5">
        {memberRoles.map((r, i) => {
          const dept = DEPARTMENTS.find(d => d.key === r.dept)
          return (
            <div key={i} className={i > 0 ? 'mt-1.5 pt-1.5 border-t border-gray-100' : ''}>
              <p className="text-[14px] font-semibold text-gray-700 leading-snug">{r.role}</p>
              <p className="text-[13px] text-gray-400">{dept?.label ?? r.dept}</p>
            </div>
          )
        })}
      </td>

      {/* Contact */}
      <td className="px-4 py-3.5 hidden md:table-cell">
        <div className="flex flex-col gap-0.5">
          {member.phone && (
            <a href={`tel:${member.phone}`}
              className="flex items-center gap-1.5 text-[13px] text-vatican-blue hover:underline w-fit">
              <Phone size={11} className="shrink-0" />{member.phone}
            </a>
          )}
          {member.email && (
            <a href={`mailto:${member.email}`}
              className="flex items-center gap-1.5 text-[13px] text-gray-500 hover:underline w-fit">
              <Mail size={11} className="shrink-0" />{member.email}
            </a>
          )}
        </div>
      </td>

      {/* Term & Status */}
      <td className="px-4 py-3.5 hidden sm:table-cell">
        <div className="flex flex-col gap-1 items-start justify-center">
          {member.term_year ? (
            <span className="text-[13px] text-gray-500 whitespace-nowrap font-medium">Nhiệm kỳ {member.term_year}</span>
          ) : (
            <span className="text-[13px] text-gray-400 italic whitespace-nowrap font-normal">Chưa cập nhật</span>
          )}
          <AdminBadge color={member.is_active ? 'green' : 'gray'}>
            {member.is_active ? 'Hoạt động' : 'Ngừng'}
          </AdminBadge>
        </div>
      </td>

      {/* Actions */}
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-0.5">
          <AdminIconButton onClick={onView} variant="ghost" title="Xem">
            <Eye size={13} />
          </AdminIconButton>
          <AdminIconButton onClick={onEdit} variant="edit" title="Sửa">
            <Pencil size={13} />
          </AdminIconButton>
          <AdminIconButton onClick={onDelete} variant="danger" title="Xóa">
            <Trash2 size={13} />
          </AdminIconButton>
        </div>
      </td>
    </tr>
  )
})

// -- MembersTab ----------------------------------------------------------------

export function MembersTab({ initial }: { initial: BqtMember[] }) {
  const [members,      setMembers]      = useState(initial)
  const [modal,        setModal]        = useState<ModalMode | null>(null)
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [searchQuery,  setSearchQuery]  = useState('')
  const [searchOpen,   setSearchOpen]   = useState(false)

  const [selected,          setSelected]          = useState<Set<string>>(new Set())
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false)
  const [bulkDeleting,      setBulkDeleting]      = useState(false)
  const [bulkUpdating,      setBulkUpdating]      = useState(false)
  const [deleteTarget,      setDeleteTarget]      = useState<BqtMember | null>(null)
  const [deleting,          setDeleting]          = useState(false)

  const displayMembers = members
    .filter(m => {
      if (statusFilter === 'active'   && !m.is_active) return false
      if (statusFilter === 'inactive' &&  m.is_active) return false
      if (searchQuery && !m.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
      return true
    })
    .slice()
    .sort((a, b) => {
      const di = DEPARTMENTS.findIndex(d => d.key === a.department) - DEPARTMENTS.findIndex(d => d.key === b.department)
      return di !== 0 ? di : a.sort_order - b.sort_order
    })

  const allSelected   = displayMembers.length > 0 && displayMembers.every(m => selected.has(m.id))
  const someSelected  = displayMembers.some(m => selected.has(m.id)) && !allSelected
  const selectedCount = selected.size

  const toggleAll  = () => {
    if (allSelected || someSelected) setSelected(new Set())
    else setSelected(new Set(displayMembers.map(m => m.id)))
  }
  const toggleItem = (id: string) => setSelected(prev => {
    const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next
  })

  const bulkSetStatus = async (isActive: boolean) => {
    setBulkUpdating(true)
    await createClient().from('bqt_members').update({ is_active: isActive }).in('id', Array.from(selected))
    setMembers(prev => prev.map(m => selected.has(m.id) ? { ...m, is_active: isActive } : m))
    setSelected(new Set()); setBulkUpdating(false)
  }

  const bulkDelete = async () => {
    setBulkDeleting(true)
    await createClient().from('bqt_members').delete().in('id', Array.from(selected))
    setMembers(prev => prev.filter(m => !selected.has(m.id)))
    setSelected(new Set()); setBulkDeleting(false); setConfirmBulkDelete(false)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    await createClient().from('bqt_members').delete().eq('id', deleteTarget.id)
    setMembers(prev => prev.filter(m => m.id !== deleteTarget.id))
    setSelected(prev => { const n = new Set(prev); n.delete(deleteTarget.id); return n })
    setDeleting(false); setDeleteTarget(null)
  }

  const toExportRow = (m: BqtMember): string[] => {
    const rs = parseRoles(m)
    return [
      m.name,
      rs.map(r => DEPARTMENTS.find(d => d.key === r.dept)?.label ?? r.dept).join(', '),
      rs.map(r => r.role).join(', '),
      m.phone ?? '', m.email ?? '',
      m.term_year?.toString() ?? '',
      m.is_active ? 'Hoạt động' : 'Ngừng',
    ]
  }
  const pdfRows = selectedCount > 0
    ? members.filter(m => selected.has(m.id)).map(toExportRow)
    : members.map(toExportRow)

  const handleSaved = (saved: BqtMember) => {
    setMembers(prev => {
      const idx = prev.findIndex(m => m.id === saved.id)
      return idx >= 0 ? prev.map(m => m.id === saved.id ? saved : m) : [saved, ...prev]
    })
    if (modal?.type === 'edit') {
      setModal({ type: 'view', member: saved })
    } else {
      setModal(null)
    }
  }

  const filterTabs = [
    { id: 'all'      as const, label: 'Tất cả',    count: members.length },
    { id: 'active'   as const, label: 'Hoạt động', count: members.filter(m =>  m.is_active).length },
    { id: 'inactive' as const, label: 'Ngừng',     count: members.filter(m => !m.is_active).length },
  ]

  return (
    <div className="flex flex-col">

      {/* Toolbar */}
      <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50 flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between">
        <AdminTabs
          tabs={filterTabs}
          activeTab={statusFilter}
          onChange={setStatusFilter}
          className="w-full xl:w-auto pb-2 xl:pb-0"
        />

        <div className="flex items-center gap-2 w-full xl:w-auto justify-end shrink-0">
          <AdminSearchInput
            open={searchOpen}
            value={searchQuery}
            onOpen={() => setSearchOpen(true)}
            onChange={v => setSearchQuery(v)}
            onClear={() => { setSearchQuery(''); setSearchOpen(false) }}
          />

          <div className="h-6 w-px bg-gray-200 hidden xl:block mx-1" />

          <ExportPDFButton
            title="Danh sách Ban Quản Trị"
            headers={['Họ và tên', 'Ban', 'Chức vụ', 'Điện thoại', 'Email', 'Nhiệm kỳ', 'Trạng thái']}
            rows={pdfRows}
          />

          <div className="h-6 w-px bg-gray-200 hidden xl:block mx-1" />

          <AdminButton onClick={() => setModal({ type: 'add' })} className="px-6 shrink-0 text-[14px]">
            <Plus size={13} />Thêm thành viên
          </AdminButton>
        </div>
      </div>

      {/* Table */}
      {displayMembers.length === 0 ? (
        <EmptyState
          icon={<UserCircle size={22} strokeWidth={1.5} className="text-gray-300" />}
          message={searchQuery ? `Không tìm thấy kết quả cho "${searchQuery}"` : 'Chưa có thành viên nào.'}
        />
      ) : (
        <div className="max-h-[calc(100vh-280px)] overflow-y-auto overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead className="sticky top-0 z-10">
              <tr className={`border-b transition-colors ${selectedCount > 0 ? 'bg-vatican-blue/5 border-vatican-blue/10' : 'bg-gray-50 border-gray-100'}`}>
                <th className="px-5 py-3 w-10">
                  <AdminCheckbox checked={allSelected} indeterminate={someSelected} onChange={toggleAll} />
                </th>

                {selectedCount > 0 ? (
                  <th colSpan={5} className="px-2 py-3 text-left">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-[14px] font-bold text-vatican-blue">Đã chọn {selectedCount}</span>
                      <AdminButton size="compact" variant="secondary" onClick={() => bulkSetStatus(true)} disabled={bulkUpdating || bulkDeleting} className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100">
                        <UserCheck size={12} />Kích hoạt
                      </AdminButton>
                      <AdminButton size="compact" variant="secondary" onClick={() => bulkSetStatus(false)} disabled={bulkUpdating || bulkDeleting} className="bg-gray-100 border-transparent text-gray-600 hover:bg-gray-200">
                        <UserX size={12} />Ngừng
                      </AdminButton>
                      <AdminButton size="compact" variant="danger" onClick={() => setConfirmBulkDelete(true)} disabled={bulkUpdating || bulkDeleting}>
                        <Trash2 size={12} />Xóa {selectedCount}
                      </AdminButton>
                      <button onClick={() => setSelected(new Set())}
                        className="ml-auto text-[13px] text-gray-400 hover:text-gray-600 transition-colors mr-4">
                        Bỏ chọn
                      </button>
                    </div>
                  </th>
                ) : (
                  <>
                    <th className="px-4 py-3 text-left text-[13px] font-bold uppercase tracking-wider text-gray-400">Họ và tên</th>
                    <th className="px-4 py-3 text-left text-[13px] font-bold uppercase tracking-wider text-gray-400">Ban / Chức vụ</th>
                    <th className="px-4 py-3 text-left text-[13px] font-bold uppercase tracking-wider text-gray-400 hidden md:table-cell">Liên hệ</th>
                    <th className="px-4 py-3 text-left text-[13px] font-bold uppercase tracking-wider text-gray-400 hidden sm:table-cell">Nhiệm kỳ</th>
                    <th className="px-4 py-3 w-24" />
                  </>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {displayMembers.map(member => (
                <MemberRow
                  key={member.id}
                  member={member}
                  isSelected={selected.has(member.id)}
                  onToggle={() => toggleItem(member.id)}
                  onView={() => setModal({ type: 'view', member })}
                  onEdit={() => setModal({ type: 'edit', member })}
                  onDelete={() => setDeleteTarget(member)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <MemberModal
          mode={modal}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
          onChangeMode={setModal}
        />
      )}

      {deleteTarget && (
        <ConfirmDeleteModal
          title="Xóa thành viên?"
          description={deleteTarget.name}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}

      {confirmBulkDelete && (
        <ConfirmDeleteModal
          title={`Xóa ${selectedCount} thành viên?`}
          description="Hành động này không thể hoàn tác."
          onConfirm={bulkDelete}
          onCancel={() => setConfirmBulkDelete(false)}
          loading={bulkDeleting}
        />
      )}
    </div>
  )
}
