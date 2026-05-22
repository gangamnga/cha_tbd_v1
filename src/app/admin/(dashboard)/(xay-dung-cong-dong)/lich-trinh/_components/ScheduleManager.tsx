'use client'

import { useState, useRef, useEffect, memo } from 'react'
import {
  CalendarDays, MapPin, Clock, Search, Plus, X, AlertCircle,
  Pencil, Trash2,
} from 'lucide-react'
import { AdminModal } from '@/components/admin/AdminModal'
import { ExportPDFButton } from '@/components/admin/ExportPDFButton'
import { ConfirmDeleteModal } from '@/components/admin/ConfirmDeleteModal'
import { AdminCheckbox, AdminButton, AdminIconButton, AdminInput, AdminTextarea, AdminLabel, ModalHeader, AdminStatusBadgeSelect, BadgeSelectOption } from '@/components/admin/ui'
import { EmptyState } from '@/components/admin/EmptyState'

// -- Types ---------------------------------------------------------------------

type EventStatus = 'pending' | 'in-progress' | 'completed'
type EventType   = 'sinh-hoat' | 'chien-dich' | 'chuc-mung' | 'tham-vieng' | 'tuong-tro'
type ActiveTab   = EventType

type CommunityEvent = {
  id: string
  title: string        // Tên hoạt động / Đối tượng chăm sóc
  date: string         // yyyy-MM-dd
  time?: string        // Giờ (Không bắt buộc)
  location?: string    // Địa điểm (Không bắt buộc)
  assignee?: string    // Người phụ trách (Chỉ dùng cho chăm sóc)
  status: EventStatus
  description: string  // Ghi chú chi tiết / Mô tả
  type: EventType
}

type ModalState =
  | null
  | { kind: 'new' }
  | { kind: 'edit-event'; event: CommunityEvent }

// -- Mock data -----------------------------------------------------------------

const MOCK_EVENTS: CommunityEvent[] = [
  { id: '1', title: 'Đọc kinh luân phiên Gia đình anh Tâm', date: '2026-05-24', time: '19:00', location: 'Quận Tân Bình, TP.HCM', status: 'pending',   description: 'Đọc kinh tạ ơn và cầu nguyện cho gia đình anh Tâm mới dọn về nhà mới.', type: 'sinh-hoat'  },
  { id: '2', title: 'Họp mặt Ban Quản Trị tháng 5',         date: '2026-05-28', time: '14:00', location: 'Cafe Tinh Tâm, Quận 3',        status: 'pending',   description: 'Tổng kết hoạt động tháng 5 và lên kế hoạch tháng 6.',                   type: 'sinh-hoat'  },
  { id: '3', title: 'Chuyến hành hương Tắc Sậy đợt 2',      date: '2026-06-15', time: '04:00', location: 'Nhà thờ Tắc Sậy, Bạc Liêu',    status: 'pending',   description: 'Chuyến đi hành hương lớn nhất quý 2, dự kiến 3 xe 45 chỗ.',            type: 'chien-dich' },
  { id: '4', title: 'Phát gạo tình thương mùa hè',           date: '2026-05-10', time: '08:00', location: 'Khu vực Quận 8, TP.HCM',        status: 'completed', description: 'Tặng 200 phần quà gạo và nhu yếu phẩm cho bà con nghèo.',              type: 'chien-dich' },
  { id: '5', title: 'Đọc kinh kính viếng Cha Diệp',          date: '2026-05-12', time: '20:00', location: 'Trực tuyến (Zoom)',             status: 'completed', description: 'Cầu nguyện chung trực tuyến hàng tuần.',                               type: 'sinh-hoat'  },
  {
    id: 'c1',
    title: 'Maria Nguyễn Thị Bích Loan',
    type: 'chuc-mung',
    date: '2026-08-15',
    description: 'Chúc mừng Lễ Đức Maria Hồn Xác Lên Trời. Gửi thiệp và hoa mừng.',
    status: 'pending',
    assignee: 'BQT Đoàn',
  },
  {
    id: 'c2',
    title: 'Giuse Trần Văn Minh',
    type: 'chuc-mung',
    date: '2026-05-20',
    description: 'Tròn 50 tuổi. Gọi điện chúc mừng.',
    status: 'completed',
    assignee: 'Chị Lan',
  },
  {
    id: 'c3',
    title: 'Gia đình Bác Tâm',
    type: 'tham-vieng',
    date: '2026-05-22',
    time: '19:30',
    location: 'Nhà riêng Bác Tâm',
    description: 'Bác Tâm trai vừa qua đời. Cần tổ chức đoàn đến đọc kinh cầu nguyện tối thứ 5.',
    status: 'in-progress',
    assignee: 'Ban Kinh nguyện',
  },
  {
    id: 'c4',
    title: 'Phêrô Nguyễn Văn Tài',
    type: 'tham-vieng',
    date: '2026-05-25',
    time: '09:00',
    location: 'Bệnh viện Chợ Rẫy',
    description: 'Bị tai nạn xe đang nằm viện Chợ Rẫy. Lên lịch chủ nhật ghé thăm.',
    status: 'pending',
    assignee: 'Ban Thường trực',
  },
  {
    id: 'c5',
    title: 'Em Anna Lê Thị Hoa',
    type: 'tuong-tro',
    date: '2026-06-01',
    description: 'Gia đình khó khăn, không đủ tiền đóng học phí đầu năm. Quỹ cộng đồng hỗ trợ 2.000.000đ.',
    status: 'completed',
    assignee: 'Ban Tài chính',
  }
]

// -- Config --------------------------------------------------------------------

const TABS: { key: ActiveTab; label: string }[] = [
  { key: 'sinh-hoat',  label: 'Sinh hoạt'  },
  { key: 'chien-dich', label: 'Sự kiện'    },
  { key: 'chuc-mung',  label: 'Chúc mừng'  },
  { key: 'tham-vieng', label: 'Thăm viếng' },
  { key: 'tuong-tro',  label: 'Tương trợ'  },
]

const TYPE_OPTIONS: { value: ActiveTab; label: string }[] = [
  { value: 'sinh-hoat',  label: 'Sinh hoạt'  },
  { value: 'chien-dich', label: 'Sự kiện'    },
  { value: 'chuc-mung',  label: 'Chúc mừng'  },
  { value: 'tham-vieng', label: 'Thăm viếng' },
  { value: 'tuong-tro',  label: 'Tương trợ'  },
]

// -- Helpers -------------------------------------------------------------------

function getStatusConfig(status: EventStatus, isCare: boolean) {
  if (isCare) {
    if (status === 'pending') {
      return { label: 'Cần quan tâm', bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-200' }
    }
    if (status === 'in-progress') {
      return { label: 'Đang triển khai', bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' }
    }
  } else {
    if (status === 'pending') {
      return { label: 'Sắp diễn ra', bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' }
    }
  }
  return { label: 'Đã hoàn tất', bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' }
}

// -- StatusToggle --------------------------------------------------------------

function StatusToggle({
  value,
  onChange,
  isCare,
}: {
  value: EventStatus
  onChange: (v: EventStatus) => void
  isCare: boolean
}) {
  const states: EventStatus[] = isCare ? ['pending', 'in-progress', 'completed'] : ['pending', 'completed']
  return (
    <div className="flex bg-gray-100 rounded-lg p-0.5 gap-0.5 select-none shrink-0 border border-gray-200 w-full">
      {states.map(s => {
        const active = value === s
        const cfg = getStatusConfig(s, isCare)
        return (
          <button
            key={s}
            type="button"
            onClick={() => onChange(s)}
            className={`flex-1 py-1.5 rounded-md text-[12px] font-bold transition-all ${
              active
                ? `${cfg.bg} ${cfg.text} border border-black/5`
                : 'bg-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-200/30 border border-transparent'
            }`}
          >
            {cfg.label}
          </button>
        )
      })}
    </div>
  )
}

// -- RowStatusToggle -----------------------------------------------------------

function RowStatusToggle({
  status,
  onChange,
  isCare,
}: {
  status: EventStatus
  onChange: (s: EventStatus) => void
  isCare: boolean
}) {
  const options: BadgeSelectOption[] = isCare
    ? [
        { value: 'pending', label: 'Cần quan tâm', color: 'red' },
        { value: 'in-progress', label: 'Đang triển khai', color: 'amber' },
        { value: 'completed', label: 'Đã hoàn tất', color: 'green' },
      ]
    : [
        { value: 'pending', label: 'Sắp diễn ra', color: 'amber' },
        { value: 'completed', label: 'Đã hoàn tất', color: 'green' },
      ]

  return (
    <AdminStatusBadgeSelect
      value={status}
      onChange={(val) => onChange(val as EventStatus)}
      options={options}
    />
  )
}

// -- EventModal ----------------------------------------------------------------

function EventModal({ state, activeTab, onClose, onSavedEvent }: {
  state: Exclude<ModalState, null>
  activeTab: ActiveTab
  onClose: () => void
  onSavedEvent: (e: CommunityEvent) => void
}) {
  const isEdit = state.kind !== 'new'

  const [type, setType]         = useState<ActiveTab>(state.kind === 'edit-event' ? state.event.type : activeTab)
  const [title, setTitle]       = useState(state.kind === 'edit-event' ? state.event.title : '')
  const [date, setDate]         = useState(state.kind === 'edit-event' ? state.event.date : new Date().toISOString().slice(0, 10))
  const [time, setTime]         = useState(state.kind === 'edit-event' ? state.event.time ?? '' : '')
  const [location, setLocation] = useState(state.kind === 'edit-event' ? state.event.location ?? '' : '')
  const [assignee, setAssignee] = useState(state.kind === 'edit-event' ? state.event.assignee ?? '' : '')
  const [desc, setDesc]         = useState(state.kind === 'edit-event' ? state.event.description : '')
  const [status, setStatus]     = useState<EventStatus>(state.kind === 'edit-event' ? state.event.status : 'pending')
  const [error, setError]       = useState<string | null>(null)

  const isCareTab = ['chuc-mung', 'tham-vieng', 'tuong-tro'].includes(type)

  const handleSave = () => {
    if (!title.trim()) {
      setError(isCareTab ? 'Vui lòng nhập tên đối tượng.' : 'Vui lòng nhập tên hoạt động.')
      return
    }
    if (!date) { setError('Vui lòng chọn ngày.'); return }

    onSavedEvent({
      id:          state.kind === 'edit-event' ? state.event.id : Date.now().toString(),
      title:       title.trim(),
      date,
      time:        time.trim() || undefined,
      location:    location.trim() || undefined,
      assignee:    isCareTab ? assignee.trim() || undefined : undefined,
      description: desc.trim(),
      status,
      type:        type,
    })
  }

  return (
    <AdminModal onClose={onClose} maxWidth="max-w-[640px]">
      {/* Header */}
      <ModalHeader title={isEdit ? 'Chỉnh sửa hoạt động' : 'Thêm mới hoạt động'} onClose={onClose} />

      {/* Body */}
      <div className="overflow-y-auto px-6 py-6 flex flex-col gap-4">
        {/* Loại */}
        <div className={`flex items-center gap-2 select-none w-full shrink-0 ${isEdit ? 'opacity-50 pointer-events-none' : ''}`}>
          {TYPE_OPTIONS.map(opt => {
            const active = type === opt.value
            return (
              <button key={opt.value} type="button" onClick={() => setType(opt.value)}
                className={`flex-1 h-9 rounded-lg text-[14px] font-bold transition-all whitespace-nowrap ${
                  active
                    ? 'bg-white text-vatican-blue border border-gray-200 font-extrabold'
                    : 'bg-gray-100 text-gray-500 hover:text-gray-700'
                }`}>
                {opt.label}
              </button>
            )
          })}
        </div>

        {/* Tên / Đối tượng */}
        <div>
          <AdminLabel>
            {isCareTab ? 'Đối tượng chăm sóc / Gia đình' : 'Tên hoạt động'} <span className="text-red-400">*</span>
          </AdminLabel>
          <AdminInput type="text" value={title} onChange={e => setTitle(e.target.value)}
            placeholder={isCareTab ? 'VD: Gia đình anh X, Bà Maria Y...' : 'VD: Đọc kinh gia đình, Họp mặt BQT...'} />
        </div>

        {/* Địa điểm */}
        <div>
          <AdminLabel>{isCareTab ? 'Địa chỉ / Nơi chăm sóc' : 'Địa điểm'}</AdminLabel>
          <AdminInput type="text" value={location} onChange={e => setLocation(e.target.value)}
            placeholder={isCareTab ? 'Nếu có' : 'VD: Quận Tân Bình, Nhà thờ Tắc Sậy...'} />
        </div>

        {/* Phụ trách (Chỉ hiển thị cho Chăm sóc) */}
        {isCareTab && (
          <div>
            <AdminLabel>Người phụ trách</AdminLabel>
            <AdminInput type="text" value={assignee} onChange={e => setAssignee(e.target.value)}
              placeholder="VD: Ban Bác ái, Ca đoàn, Chị Lan..." />
          </div>
        )}

        {/* Ngày & Giờ */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <AdminLabel>Ngày <span className="text-red-400">*</span></AdminLabel>
            <AdminInput type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div>
            <AdminLabel>Giờ</AdminLabel>
            <AdminInput type="time" value={time} onChange={e => setTime(e.target.value)} />
          </div>
        </div>

        {/* Trạng thái */}
        <div>
          <AdminLabel>Trạng thái</AdminLabel>
          <div className={isCareTab ? 'w-full' : 'w-2/3'}>
            <StatusToggle value={status} onChange={setStatus} isCare={isCareTab} />
          </div>
        </div>

        {/* Ghi chú / Mô tả */}
        <div>
          <AdminLabel>{isCareTab ? 'Ghi chú chi tiết' : 'Mô tả hoạt động'}</AdminLabel>
          <AdminTextarea value={desc} onChange={e => setDesc(e.target.value)}
            placeholder="Thông tin chi tiết..."
            rows={4} />
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-1.5 text-[13px] font-semibold text-red-600">
            <AlertCircle size={13} />{error}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 bg-gray-50/50 px-6 py-4 shrink-0 flex justify-end gap-2">
        <AdminButton variant="secondary" onClick={onClose}>Hủy</AdminButton>
        <AdminButton variant="primary" onClick={handleSave}>
          {isEdit ? 'Cập nhật' : 'Lưu'}
        </AdminButton>
      </div>
    </AdminModal>
  )
}

// -- EventRow ------------------------------------------------------------------

const EventRow = memo(function EventRow({
  event,
  isSelected,
  onToggle,
  onToggleStatus,
  onEdit,
  onDelete,
}: {
  event: CommunityEvent
  isSelected: boolean
  onToggle: () => void
  onToggleStatus: (newStatus: EventStatus) => void
  onEdit: () => void
  onDelete: () => void
}) {
  const [y, m, d] = event.date.split('-')
  const isCare = ['chuc-mung', 'tham-vieng', 'tuong-tro'].includes(event.type)

  return (
    <tr className={`transition-colors ${isSelected ? 'bg-vatican-blue/5' : 'hover:bg-gray-50'}`}>
      {/* Checkbox */}
      <td className="px-5 py-3.5 w-10">
        <AdminCheckbox checked={isSelected} onChange={onToggle} />
      </td>

      {/* Info */}
      <td className="px-4 py-3.5">
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-bold text-vatican-dark truncate">{event.title}</p>
          <div className="flex items-center gap-3 mt-0.5 text-[13px] text-gray-500">
            <span className="flex items-center gap-1">
              <Clock size={12} className="text-gray-400" />
              {event.time ? `${event.time} – ` : ''}{d}/{m}/{y}
            </span>
            {event.location && (
              <span className="flex items-center gap-1">
                <MapPin size={12} className="text-gray-400" /> {event.location}
              </span>
            )}
          </div>
          {event.description && (
            <p className="text-[13px] text-gray-400 mt-1 italic truncate max-w-[450px]" title={event.description}>
              {event.description}
            </p>
          )}
        </div>
      </td>

      {/* Phụ trách - Chỉ hiển thị cho tab Chăm sóc */}
      {isCare && (
        <td className="px-4 py-3.5 hidden lg:table-cell w-40">
          <div className="flex items-center gap-1.5 text-[14px] text-gray-600 max-w-[150px] truncate">
            <span className="truncate" title={event.assignee}>
              {event.assignee || <span className="text-gray-300 italic">Chưa phân công</span>}
            </span>
          </div>
        </td>
      )}

      {/* Trạng thái */}
      <td className="px-4 py-3.5 w-[160px] hidden sm:table-cell">
        <RowStatusToggle status={event.status} onChange={onToggleStatus} isCare={isCare} />
      </td>

      {/* Hành động */}
      <td className="px-4 py-3.5 w-28">
        <div className="flex items-center gap-0.5">
          <AdminIconButton variant="edit" onClick={onEdit} title="Sửa">
            <Pencil size={13} />
          </AdminIconButton>
          <AdminIconButton variant="danger" onClick={onDelete} title="Xóa">
            <Trash2 size={13} />
          </AdminIconButton>
        </div>
      </td>
    </tr>
  )
})

// -- Main ScheduleManager ------------------------------------------------------

export function ScheduleManager() {
  const [activeTab,   setActiveTab]   = useState<ActiveTab>('sinh-hoat')
  const [events,      setEvents]      = useState<CommunityEvent[]>(MOCK_EVENTS)
  const [modal,       setModal]       = useState<ModalState>(null)
  const [deleteTarget,setDeleteTarget]= useState<CommunityEvent | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchOpen,  setSearchOpen]  = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false)

  const isCareTab = ['chuc-mung', 'tham-vieng', 'tuong-tro'].includes(activeTab)

  useEffect(() => { if (searchOpen) searchInputRef.current?.focus() }, [searchOpen])
  useEffect(() => {
    setSearchQuery('')
    setSearchOpen(false)
    setSelected(new Set())
  }, [activeTab])

  const q = searchQuery.toLowerCase()

  const filteredEvents = events.filter(e =>
    e.type === activeTab &&
    (q === '' ||
     e.title.toLowerCase().includes(q) ||
     (e.location && e.location.toLowerCase().includes(q)) ||
     (e.assignee && e.assignee.toLowerCase().includes(q)) ||
     e.description.toLowerCase().includes(q))
  )

  const sortedEvents = [...filteredEvents].sort((a, b) => {
    const dateCompare = b.date.localeCompare(a.date)
    if (dateCompare !== 0) return dateCompare
    return (b.time ?? '').localeCompare(a.time ?? '')
  })

  const displayItems = sortedEvents
  const selectedCount = selected.size
  const allSelected  = displayItems.length > 0 && displayItems.every(item => selected.has(item.id))
  const someSelected = displayItems.some(item => selected.has(item.id)) && !allSelected

  const toggleAll  = () => {
    if (allSelected || someSelected) setSelected(new Set())
    else setSelected(new Set(displayItems.map(item => item.id)))
  }

  const toggleItem = (id: string) => setSelected(prev => {
    const next = new Set(prev)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    return next
  })

  const bulkDelete = () => {
    setEvents(prev => prev.filter(e => !selected.has(e.id)))
    setSelected(new Set())
    setConfirmBulkDelete(false)
  }

  const tabCount = (key: EventType) => {
    const isCare = ['chuc-mung', 'tham-vieng', 'tuong-tro'].includes(key)
    if (isCare) {
      return events.filter(e => e.type === key && e.status !== 'completed').length
    }
    return events.filter(e => e.type === key && e.status === 'pending').length
  }

  const handleSavedEvent = (saved: CommunityEvent) => {
    setEvents(prev => {
      const idx = prev.findIndex(e => e.id === saved.id)
      return idx >= 0 ? prev.map(e => e.id === saved.id ? saved : e) : [saved, ...prev]
    })
    setModal(null)
    setActiveTab(saved.type)
  }

  const handleToggleEventStatus = (id: string, newStatus: EventStatus) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, status: newStatus } : e))
  }

  const handleConfirmDelete = () => {
    if (!deleteTarget) return
    setEvents(prev => prev.filter(e => e.id !== deleteTarget.id))
    setSelected(prev => {
      const n = new Set(prev)
      n.delete(deleteTarget.id)
      return n
    })
    setDeleteTarget(null)
  }

  const iconBtn = 'w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-500 hover:border-vatican-blue hover:text-vatican-blue transition-colors shrink-0'

  return (
    <div className="flex flex-col">

      {/* -- Toolbar -- */}
      <div className="px-6 py-4 border-b border-gray-100 flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between bg-gray-50/50">

        {/* Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto w-full xl:w-auto pb-2 xl:pb-0 scrollbar-none">
          {TABS.map(tab => {
            const count = tabCount(tab.key)
            return (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`flex items-center px-4 h-9 rounded-lg text-[14px] transition-colors whitespace-nowrap shrink-0 ${
                  activeTab === tab.key
                    ? 'bg-white text-vatican-blue border border-gray-200 font-extrabold'
                    : 'bg-gray-100 text-gray-600 border border-transparent font-bold'
                }`}>
                <span>{tab.label}</span>
                {count > 0 && (
                  <span className="ml-1.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-black rounded-full px-1.5 shrink-0">
                    <span className="translate-y-[0.5px] transform leading-none">{count}</span>
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 w-full xl:w-auto justify-end shrink-0">
          {/* Search */}
          {searchOpen ? (
            <div className="flex items-center gap-2 bg-white border border-vatican-blue rounded-lg px-3 h-9 w-[180px] shrink-0">
              <Search size={14} className="text-vatican-blue shrink-0" />
              <input ref={searchInputRef} type="text" value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)} placeholder="Tìm kiếm..."
                className="flex-1 text-[14px] outline-none text-vatican-dark placeholder:text-gray-400 bg-transparent min-w-0" />
              <button type="button" onClick={() => { setSearchQuery(''); setSearchOpen(false) }} className="text-gray-400 hover:text-gray-600 shrink-0">
                <X size={13} />
              </button>
            </div>
          ) : (
            <button onClick={() => setSearchOpen(true)} title="Tìm kiếm" className={iconBtn}>
              <Search size={14} />
            </button>
          )}

          <div className="h-6 w-px bg-gray-200 hidden xl:block mx-1" />

          {/* Export PDF */}
          <ExportPDFButton
            title={
              activeTab === 'sinh-hoat'
                ? 'Danh sách Sinh hoạt'
                : activeTab === 'chien-dich'
                ? 'Danh sách Sự kiện'
                : activeTab === 'chuc-mung'
                ? 'Danh sách Chúc mừng'
                : activeTab === 'tham-vieng'
                ? 'Danh sách Thăm viếng'
                : 'Danh sách Tương trợ'
            }
            headers={
              isCareTab
                ? ['Đối tượng', 'Ngày', 'Ghi chú', 'Phụ trách', 'Trạng thái']
                : ['Tên hoạt động', 'Ngày', 'Giờ', 'Địa điểm', 'Trạng thái']
            }
            rows={(selectedCount > 0 ? sortedEvents.filter(e => selected.has(e.id)) : sortedEvents).map(e => {
              const [y, m, d] = e.date.split('-')
              const dateStr = `${d}/${m}/${y}`
              if (isCareTab) {
                return [
                  e.title,
                  dateStr,
                  e.description,
                  e.assignee || '',
                  getStatusConfig(e.status, true).label
                ]
              } else {
                return [
                  e.title,
                  dateStr,
                  e.time || '',
                  e.location || '',
                  getStatusConfig(e.status, false).label
                ]
              }
            })}
          />

          <div className="h-6 w-px bg-gray-200 hidden xl:block mx-1" />

          {/* Thêm mới */}
          <AdminButton onClick={() => setModal({ kind: 'new' })} className="shrink-0">
            <Plus size={13} />Thêm mới
          </AdminButton>
        </div>
      </div>

      {/* -- Content & Table -- */}
      {displayItems.length === 0 ? (
        <EmptyState
          icon={<CalendarDays size={22} strokeWidth={1.5} className="text-gray-300" />}
          message={searchQuery ? `Không tìm thấy kết quả cho "${searchQuery}"` : 'Chưa có hoạt động nào được ghi nhận.'}
        />
      ) : (
        <div className="max-h-[calc(100vh-280px)] overflow-y-auto overflow-x-auto bg-white rounded-b-xl">
          <table className="w-full min-w-[640px]">
            <thead className="sticky top-0 z-10">
              <tr className={`border-b transition-colors ${selectedCount > 0 ? 'bg-vatican-blue/5 border-vatican-blue/10' : 'bg-gray-50/50 border-gray-100'}`}>
                <th className="px-5 py-3 w-10 text-left">
                  <AdminCheckbox checked={allSelected} indeterminate={someSelected} onChange={toggleAll} />
                </th>

                {selectedCount > 0 ? (
                  <th colSpan={isCareTab ? 5 : 4} className="px-2 py-3 text-left">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-[14px] font-bold text-vatican-blue">Đã chọn {selectedCount}</span>
                      <AdminButton variant="danger" size="compact" onClick={() => setConfirmBulkDelete(true)}>
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
                    <th className="px-4 py-3 text-left text-[13px] font-bold uppercase tracking-wider text-gray-400">
                      {isCareTab ? 'Đối tượng' : 'Tiêu đề hoạt động'}
                    </th>
                    {isCareTab && (
                      <th className="px-4 py-3 text-left text-[13px] font-bold uppercase tracking-wider text-gray-400 hidden lg:table-cell w-40">
                        Phụ trách
                      </th>
                    )}
                    <th className="px-4 py-3 text-left text-[13px] font-bold uppercase tracking-wider text-gray-400 hidden sm:table-cell w-[160px]">
                      Trạng thái
                    </th>
                    <th className="px-4 py-3 w-28" />
                  </>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {sortedEvents.map(event => (
                <EventRow key={event.id} event={event}
                  isSelected={selected.has(event.id)}
                  onToggle={() => toggleItem(event.id)}
                  onToggleStatus={(newStatus) => handleToggleEventStatus(event.id, newStatus)}
                  onEdit={() => setModal({ kind: 'edit-event', event })}
                  onDelete={() => setDeleteTarget(event)} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (modal.kind === 'new' || modal.kind === 'edit-event') && (
        <EventModal
          state={modal}
          activeTab={activeTab}
          onClose={() => setModal(null)}
          onSavedEvent={handleSavedEvent}
        />
      )}

      {deleteTarget && (
        <ConfirmDeleteModal
          title={isCareTab ? 'Xóa hạng mục chăm sóc' : 'Xóa hoạt động'}
          description={
            isCareTab
              ? `Bạn có chắc chắn muốn xóa hạng mục của "${deleteTarget.title}"? Hành động này không thể hoàn tác.`
              : `Bạn có chắc chắn muốn xóa "${deleteTarget.title}"? Hành động này không thể hoàn tác.`
          }
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {confirmBulkDelete && (
        <ConfirmDeleteModal
          title={isCareTab ? `Xóa ${selectedCount} hạng mục chăm sóc?` : `Xóa ${selectedCount} hoạt động?`}
          description="Hành động này không thể hoàn tác và sẽ xóa tất cả các mục đã chọn."
          onConfirm={bulkDelete}
          onCancel={() => setConfirmBulkDelete(false)}
        />
      )}
    </div>
  )
}
