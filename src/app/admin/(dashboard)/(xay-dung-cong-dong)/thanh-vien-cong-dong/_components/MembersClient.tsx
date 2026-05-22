'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { ArrowUpDown, Phone, Pencil, Trash2, Plus, Compass, Loader2 } from 'lucide-react'
import { ConfirmDeleteModal } from '@/components/admin/ConfirmDeleteModal'
import { ExportPDFButton } from '@/components/admin/ExportPDFButton'
import { AdminModal } from '@/components/admin/AdminModal'
import { AdminPagination } from '@/components/admin/AdminPagination'
import { AdminTabs } from '@/components/admin/AdminTabs'
import { AdminSearchInput } from '@/components/admin/AdminSearchInput'
import { AdminIconButton, AdminButton, AdminInput, AdminLabel, ModalHeader } from '@/components/admin/ui'
import { formatDateTime } from '@/lib/format-date'
import { EmptyState } from '@/components/admin/EmptyState'

type Member = { id: string; full_name: string; phone: string | null; created_at: string }

const TAB_CONFIG: { id: string; label: string; table: string; nameField: string; phoneField: string | null }[] = [
  { id: 'hanh-huong', label: 'Hành hương',       table: 'pilgrimage_registrations', nameField: 'name',       phoneField: 'phone' },
  { id: 'y-chi',      label: 'Ý chỉ cầu nguyện', table: 'prayer_intentions',        nameField: 'name',       phoneField: null    },
  { id: 'loi-chung',  label: 'Lời chứng',         table: 'testimonies',              nameField: 'name',       phoneField: null    },
  { id: 'internet',   label: 'Internet',           table: 'community_signups',        nameField: 'full_name',  phoneField: 'phone' },
  { id: 'khac',       label: 'Khác',               table: 'community_signups',        nameField: 'full_name',  phoneField: 'phone' },
]

function MemberRow({ member, tableName, index, onEdit, onDeleted }: {
  member: Member
  tableName: string
  index: number
  onEdit: () => void
  onDeleted: () => void
}) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [deleting,    setDeleting]    = useState(false)

  const remove = async () => {
    setDeleting(true)
    await createClient().from(tableName).delete().eq('id', member.id)
    onDeleted()
  }

  return (
    <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
      <td className="px-4 py-3.5 text-[14px] text-gray-400 font-medium tabular-nums">{index}</td>
      <td className="px-4 py-3.5">
        <p className="text-[15px] font-bold text-vatican-dark">{member.full_name}</p>
      </td>
      <td className="px-4 py-3.5">
        {member.phone ? (
          <a href={`tel:${member.phone}`}
            className="flex items-center gap-1.5 text-[14px] text-vatican-blue font-medium hover:underline transition-colors w-fit">
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
      <td className="px-4 py-3.5 w-24">
        <div className="flex items-center gap-1 justify-center">
          <AdminIconButton onClick={onEdit} variant="edit" title="Sửa">
            <Pencil size={13} />
          </AdminIconButton>
          <AdminIconButton onClick={() => setShowConfirm(true)} disabled={deleting} variant="danger" title="Xóa">
            <Trash2 size={13} />
          </AdminIconButton>
        </div>
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

export function MembersClient({
  activeTab,
  tableName,
  initial,
  defaultQ,
  defaultSort,
  count,
  currentPage,
  totalPages,
  from,
  to,
  tabCounts,
}: {
  activeTab: string
  tableName: string
  initial: Member[]
  defaultQ: string
  defaultSort: string
  count: number
  currentPage: number
  totalPages: number
  from: number
  to: number
  tabCounts: Record<string, number>
}) {
  const [members,  setMembers]  = useState(initial)
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [q,          setQ]          = useState(defaultQ)
  const [searchOpen, setSearchOpen] = useState(!!defaultQ)

  const [isModalOpen,    setIsModalOpen]    = useState(false)
  const [editingMember,  setEditingMember]  = useState<Member | null>(null)
  const [formName,       setFormName]       = useState('')
  const [formPhone,      setFormPhone]      = useState('')
  const [saving,         setSaving]         = useState(false)
  const [modalTab,       setModalTab]       = useState<string>(activeTab)
  const [modalError,     setModalError]     = useState<string | null>(null)

  useEffect(() => { setMembers(initial) }, [initial])

  const activeTabMeta = TAB_CONFIG.find(t => t.id === activeTab) ?? TAB_CONFIG[0]
  const modalTabMeta  = TAB_CONFIG.find(t => t.id === modalTab)  ?? TAB_CONFIG[0]

  const navigate = (tabId: string, newQ: string, sort: string) => {
    const p = new URLSearchParams()
    p.set('source', tabId)
    if (newQ.trim()) p.set('q', newQ.trim())
    if (sort !== 'desc') p.set('sort', sort)
    startTransition(() => router.push(`/admin/thanh-vien-cong-dong?${p.toString()}`))
  }

  const switchTab   = (tabId: string) => navigate(tabId, '', defaultSort)
  const clearSearch = () => { setQ(''); setSearchOpen(false); navigate(activeTab, '', defaultSort) }
  const toggleSort  = () => navigate(activeTab, q, defaultSort === 'desc' ? 'asc' : 'desc')

  const openFormModal = (member?: Member) => {
    setEditingMember(member ?? null)
    setFormName(member?.full_name ?? '')
    setFormPhone(member?.phone ?? '')
    setModalTab(activeTab)
    setModalError(null)
    setIsModalOpen(true)
  }

  const closeModal = () => { setIsModalOpen(false); setModalError(null) }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const meta         = TAB_CONFIG.find(t => t.id === modalTab) ?? TAB_CONFIG[0]
    const nameField    = meta.nameField
    const phoneField   = meta.phoneField
    const hasPhone     = phoneField !== null

    if (!formName.trim() || (hasPhone && !formPhone.trim())) return

    setSaving(true); setModalError(null)

    try {
      const supabase = createClient()

      if (editingMember) {
        const payload: Record<string, any> = { [nameField]: formName.trim() }
        if (phoneField) payload[phoneField] = formPhone.trim()
        const { error } = await supabase.from(meta.table).update(payload).eq('id', editingMember.id)
        if (error) throw error
        if (modalTab === activeTab) {
          setMembers(prev => prev.map(m => m.id === editingMember.id
            ? { ...m, full_name: formName.trim(), phone: hasPhone ? formPhone.trim() : null }
            : m))
        }
      } else {
        const payload: Record<string, any> = { [nameField]: formName.trim() }
        if (phoneField) payload[phoneField] = formPhone.trim()
        if (meta.table === 'community_signups') payload['source'] = modalTab
        const { data, error } = await supabase.from(meta.table).insert([payload]).select()
        if (error) throw error
        if (modalTab === activeTab && data?.[0]) {
          const row = data[0]
          setMembers(prev => [{
            id:         row.id,
            full_name:  row[nameField]  ?? formName.trim(),
            phone:      phoneField ? (row[phoneField] ?? formPhone.trim()) : null,
            created_at: row.created_at  ?? new Date().toISOString(),
          }, ...prev])
        }
      }

      closeModal()
      startTransition(() => {
        router.refresh()
        if (!editingMember && modalTab !== activeTab) switchTab(modalTab)
      })
    } catch (err: any) {
      setModalError('Có lỗi xảy ra: ' + (err?.message ?? 'Vui lòng thử lại!'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col">

      {/* Toolbar */}
      <div className="px-6 py-4 border-b border-gray-100 flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between bg-gray-50/50">
        <AdminTabs
          tabs={TAB_CONFIG.map(tab => ({ id: tab.id, label: tab.label, count: tabCounts[tab.id] }))}
          activeTab={activeTab}
          onChange={switchTab}
          className="w-full xl:w-auto pb-2 xl:pb-0"
        />

        <div className="flex items-center gap-2 w-full xl:w-auto justify-end shrink-0">
          <AdminSearchInput
            open={searchOpen}
            value={q}
            onOpen={() => setSearchOpen(true)}
            onChange={v => setQ(v)}
            onClear={clearSearch}
            onKeyDown={e => e.key === 'Enter' && navigate(activeTab, q, defaultSort)}
          />

          <button
            onClick={toggleSort}
            title={defaultSort === 'desc' ? 'Đang: Mới nhất trước' : 'Đang: Cũ nhất trước'}
            className={`w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-500 hover:border-vatican-blue hover:text-vatican-blue transition-colors shrink-0 ${
              defaultSort === 'asc' ? 'border-vatican-blue text-vatican-blue' : ''
            }`}
          >
            <ArrowUpDown size={15} />
          </button>

          <div className="h-6 w-px bg-gray-200 hidden xl:block mx-1" />

          <ExportPDFButton
            title={`Danh sách thành viên - Nguồn ${activeTabMeta.label}`}
            headers={['STT', 'Họ và tên', 'Điện thoại', 'Ngày giờ']}
            rows={members.map((m, i) => [String(from + i + 1), m.full_name, m.phone ?? '—', formatDateTime(m.created_at)])}
          />

          <AdminButton onClick={() => openFormModal()} className="shrink-0 text-[14px]">
            <Plus size={13} />Thêm mới
          </AdminButton>
        </div>
      </div>

      {/* Table */}
      {members.length === 0 ? (
        <EmptyState
          icon={<Compass size={22} strokeWidth={1.5} className="text-gray-300" />}
          message={defaultQ ? `Không tìm thấy kết quả cho "${defaultQ}"` : 'Chưa có thành viên nào.'}
        />
      ) : (
        <div className="max-h-[calc(100vh-280px)] overflow-y-auto overflow-x-auto bg-white">
          <table className="w-full min-w-[600px] border-collapse">
            <thead className="sticky top-0 z-10 bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-[13px] font-bold uppercase tracking-wider text-gray-400 w-14">STT</th>
                <th className="px-4 py-3 text-left text-[13px] font-bold uppercase tracking-wider text-gray-400">Họ và tên</th>
                <th className="px-4 py-3 text-left text-[13px] font-bold uppercase tracking-wider text-gray-400 w-48">Điện thoại</th>
                <th className="px-4 py-3 text-left text-[13px] font-bold uppercase tracking-wider text-gray-400 w-52">Ngày giờ</th>
                <th className="px-4 py-3 w-24 text-center" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {members.map((m, i) => (
                <MemberRow
                  key={m.id}
                  member={m}
                  tableName={tableName}
                  index={from + i + 1}
                  onEdit={() => openFormModal(m)}
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

      {/* Modal Thêm / Sửa */}
      {isModalOpen && (
        <AdminModal onClose={closeModal} maxWidth="max-w-[640px]" disabled={saving}>
          <ModalHeader
            title={editingMember ? 'Cập nhật thành viên' : 'Thêm thành viên mới'}
            onClose={closeModal}
            disabled={saving}
          />

          <form onSubmit={handleSave} className="flex flex-col flex-1 min-h-0">
            <div className="overflow-y-auto px-6 py-6 flex flex-col gap-4">

              {/* Nguồn */}
              <div className={editingMember ? 'opacity-50 pointer-events-none' : ''}>
                <AdminTabs
                  tabs={TAB_CONFIG.map(tab => ({ id: tab.id, label: tab.label }))}
                  activeTab={modalTab}
                  onChange={setModalTab}
                />
              </div>

              {/* Họ và tên */}
              <div>
                <AdminLabel>Họ và tên <span className="text-red-400">*</span></AdminLabel>
                <AdminInput
                  type="text"
                  required
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="VD: Nguyễn Văn An, Trần Thị Bình..."
                  autoFocus
                />
              </div>

              {/* Số điện thoại */}
              {modalTabMeta.phoneField !== null && (
                <div>
                  <AdminLabel>Số điện thoại <span className="text-red-400">*</span></AdminLabel>
                  <AdminInput
                    type="tel"
                    required
                    value={formPhone}
                    onChange={e => setFormPhone(e.target.value)}
                    placeholder="VD: 0901234567..."
                  />
                </div>
              )}
            </div>

            <div className="border-t border-gray-100 bg-gray-50/50 px-6 py-4 shrink-0 flex items-center gap-3">
              {modalError && (
                <p className="flex-1 text-[13px] font-semibold text-red-500 min-w-0 truncate">{modalError}</p>
              )}
              <div className="flex gap-2 ml-auto shrink-0">
                <AdminButton type="button" onClick={closeModal} disabled={saving} variant="secondary">
                  Hủy
                </AdminButton>
                <AdminButton type="submit" disabled={saving}>
                  {saving
                    ? <><Loader2 size={13} className="animate-spin" />Đang lưu...</>
                    : editingMember ? 'Cập nhật' : 'Lưu'}
                </AdminButton>
              </div>
            </div>
          </form>
        </AdminModal>
      )}

    </div>
  )
}
