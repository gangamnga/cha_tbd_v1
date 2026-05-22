'use client'

import { useState, useEffect } from 'react'
import {
  Search, Plus, Edit2, Trash2, Star, ShieldAlert, CheckCircle,
  X, Phone, User, AlertTriangle, ArrowUpDown,
  Eye
} from 'lucide-react'
import { ConfirmDeleteModal } from '@/components/admin/ConfirmDeleteModal'
import { ExportPDFButton } from '@/components/admin/ExportPDFButton'
import { AdminModal } from '@/components/admin/AdminModal'
import { AdminCheckbox, AdminButton, AdminIconButton, AdminInput, AdminTextarea, AdminLabel, ModalHeader } from '@/components/admin/ui'
import { EmptyState } from '@/components/admin/EmptyState'

type Partner = {
  id: string
  name: string
  category: string
  contactName: string
  phone: string
  rating: number
  status: 'active' | 'blacklist'
  notes: string
  createdAt: string
}

const INITIAL_PARTNERS: Partner[] = [
  {
    id: 'p1',
    name: 'Vietravel Chi Nhánh Cần Thơ',
    category: 'Lữ hành',
    contactName: 'Nguyễn Văn An',
    phone: '0901234567',
    rating: 5,
    status: 'active',
    notes: 'Đối tác chiến lược tổ chức tour hành hương quy mô lớn, xe đời mới và hướng dẫn viên am hiểu giáo xứ.',
    createdAt: '2026-01-15T08:30:00.000Z'
  },
  {
    id: 'p2',
    name: 'Du Lịch Saigontourist',
    category: 'Lữ hành',
    contactName: 'Trần Thị Bình',
    phone: '0918765432',
    rating: 5,
    status: 'active',
    notes: 'Chất lượng phục vụ xuất sắc, thường xuyên có các ưu đãi giá vé cho đoàn hành hương công giáo.',
    createdAt: '2026-02-10T10:15:00.000Z'
  },
  {
    id: 'p3',
    name: 'Quán Cơm Niêu Tắc Sậy',
    category: 'Ăn uống',
    contactName: 'Lê Văn Cường',
    phone: '0987654321',
    rating: 4,
    status: 'active',
    notes: 'Quán ăn sạch sẽ, không gian rộng rãi chứa được 500 khách cùng lúc, phục vụ nhanh, món ăn hợp khẩu vị đoàn hành hương.',
    createdAt: '2026-03-05T11:45:00.000Z'
  },
  {
    id: 'p4',
    name: 'Nước Suối Tinh Khiết Sapuwa',
    category: 'Ăn uống',
    contactName: 'Phạm Văn Dũng',
    phone: '0933445566',
    rating: 4,
    status: 'active',
    notes: 'Cung cấp nước suối đóng chai số lượng lớn trực tiếp đến xe hành hương với chiết khấu tốt.',
    createdAt: '2026-03-20T09:00:00.000Z'
  },
  {
    id: 'p5',
    name: 'Xe Khách Hoàng Gia',
    category: 'Vận tải',
    contactName: 'Hoàng Văn Em',
    phone: '0944556677',
    rating: 1,
    status: 'blacklist',
    notes: 'Tài xế phóng nhanh vượt ẩu, có thái độ thô lỗ và thiếu tôn trọng với người lớn tuổi trong đoàn hành hương. Đã bị phản ánh nhiều lần.',
    createdAt: '2026-04-12T14:20:00.000Z'
  },
  {
    id: 'p6',
    name: 'Khách Sạn & Nhà Nghỉ An Bình',
    category: 'Dịch vụ',
    contactName: 'Nguyễn Thị Phương',
    phone: '0977889900',
    rating: 3,
    status: 'active',
    notes: 'Vị trí gần đền Cha Diệp, phòng ốc cơ bản sạch sẽ, giá cả bình dân phù hợp cho các đoàn lưu trú qua đêm.',
    createdAt: '2026-04-28T16:00:00.000Z'
  }
]

const CATEGORIES = ['Lữ hành', 'Ăn uống', 'Vận tải', 'Dịch vụ', 'Khác']

export function PartnerManager() {
  const [partners, setPartners] = useState<Partner[]>([])
  const [search, setSearch] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc')
  const [selectedCategory, setSelectedCategory] = useState('Tất cả')

  // State CRUD
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentPartner, setCurrentPartner] = useState<Partner | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [viewPartner, setViewPartner] = useState<Partner | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)

  // Form State
  const [formName, setFormName] = useState('')
  const [formCategory, setFormCategory] = useState('Lữ hành')
  const [formContactName, setFormContactName] = useState('')
  const [formPhone, setFormPhone] = useState('')
  const [formRating, setFormRating] = useState(5)
  const [formStatus, setFormStatus] = useState<'active' | 'blacklist'>('active')
  const [formNotes, setFormNotes] = useState('')

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('vatican_partners')
    if (saved) {
      try {
        setPartners(JSON.parse(saved))
      } catch {
        setPartners(INITIAL_PARTNERS)
      }
    } else {
      setPartners(INITIAL_PARTNERS)
      localStorage.setItem('vatican_partners', JSON.stringify(INITIAL_PARTNERS))
    }
  }, [])

  const savePartners = (newPartners: Partner[]) => {
    setPartners(newPartners)
    localStorage.setItem('vatican_partners', JSON.stringify(newPartners))
  }

  // Open Add/Edit Modal
  const openModal = (partner?: Partner) => {
    if (partner) {
      setCurrentPartner(partner)
      setFormName(partner.name)
      setFormCategory(partner.category)
      setFormContactName(partner.contactName)
      setFormPhone(partner.phone)
      setFormRating(partner.rating)
      setFormStatus(partner.status)
      setFormNotes(partner.notes)
    } else {
      setCurrentPartner(null)
      setFormName('')
      setFormCategory('Lữ hành')
      setFormContactName('')
      setFormPhone('')
      setFormRating(5)
      setFormStatus('active')
      setFormNotes('')
    }
    setIsModalOpen(true)
  }

  // Open View Detail Modal
  const openViewModal = (partner: Partner) => {
    setViewPartner(partner)
    setIsViewModalOpen(true)
  }

  // Handle Save
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formName.trim() || !formPhone.trim()) return

    if (currentPartner) {
      const updated = partners.map(p => p.id === currentPartner.id ? {
        ...p,
        name: formName.trim(),
        category: formCategory,
        contactName: formContactName.trim(),
        phone: formPhone.trim(),
        rating: formRating,
        status: formStatus,
        notes: formNotes.trim(),
      } : p)
      savePartners(updated)
    } else {
      const newPartner: Partner = {
        id: 'partner_' + Date.now(),
        name: formName.trim(),
        category: formCategory,
        contactName: formContactName.trim(),
        phone: formPhone.trim(),
        rating: formRating,
        status: formStatus,
        notes: formNotes.trim(),
        createdAt: new Date().toISOString()
      }
      savePartners([newPartner, ...partners])
    }
    setIsModalOpen(false)
  }

  // Handle Delete
  const handleDelete = () => {
    if (!showDeleteConfirm) return
    const filtered = partners.filter(p => p.id !== showDeleteConfirm)
    savePartners(filtered)
    setShowDeleteConfirm(null)
  }

  // Filters logic
  const filteredPartners = partners.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                          p.contactName.toLowerCase().includes(search.toLowerCase()) ||
                          p.phone.includes(search)
    const matchesCategory = selectedCategory === 'Tất cả' || p.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Sort logic
  const sortedPartners = [...filteredPartners].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime()
    const dateB = new Date(b.createdAt).getTime()
    return sortOrder === 'desc' ? dateB - dateA : dateA - dateB
  })

  return (
    <div className="flex flex-col">

      {/* -- Toolbar -- */}
      <div className="px-6 py-4 border-b border-gray-100 flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between bg-gray-50/50">

        {/* Category tabs */}
        <div className="flex items-center gap-2 overflow-x-auto w-full xl:w-auto pb-2 xl:pb-0 scrollbar-none">
          {['Tất cả', ...CATEGORIES].map(cat => {
            const count = cat === 'Tất cả'
              ? partners.length
              : partners.filter(p => p.category === cat).length
            const isActive = selectedCategory === cat
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex items-center px-4 h-9 rounded-lg text-[14px] transition-colors whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-white text-vatican-blue border border-gray-200 font-extrabold'
                    : 'bg-gray-100 text-gray-600 border border-transparent font-bold hover:bg-gray-200/80'
                }`}
              >
                <span>{cat}</span>
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
          {/* Tìm kiếm */}
          {searchOpen ? (
            <form onSubmit={e => e.preventDefault()} className="flex items-center gap-2 bg-white border border-vatican-blue rounded-lg px-3 h-9 w-[180px] shrink-0">
              <Search size={14} className="text-vatican-blue shrink-0" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Tìm kiếm..."
                className="flex-1 text-[14px] outline-none text-vatican-dark placeholder:text-gray-400 bg-transparent min-w-0"
              />
              <button type="button" onClick={() => { setSearch(''); setSearchOpen(false) }} className="text-gray-400 hover:text-gray-600 shrink-0">
                <X size={13} />
              </button>
            </form>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              title="Tìm kiếm"
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-500 hover:border-vatican-blue hover:text-vatican-blue transition-colors shrink-0"
            >
              <Search size={14} />
            </button>
          )}

          {/* Sắp xếp */}
          <button
            onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
            title={sortOrder === 'desc' ? 'Đang: Mới nhất trước' : 'Đang: Cũ nhất trước'}
            className={`w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-500 hover:border-vatican-blue hover:text-vatican-blue transition-colors shrink-0 ${
              sortOrder === 'asc' ? 'border-vatican-blue text-vatican-blue' : ''
            }`}
          >
            <ArrowUpDown size={15} />
          </button>

          <div className="h-6 w-px bg-gray-200 hidden xl:block mx-1" />

          {/* Xuất PDF */}
          <ExportPDFButton
            title="Danh sách đối tác dịch vụ hành hương"
            headers={['STT', 'Tên đối tác', 'Liên hệ', 'Độ uy tín', 'Trạng thái']}
            rows={sortedPartners.map((p, i) => [
              String(i + 1),
              p.name,
              `${p.contactName} (${p.phone})`,
              `${p.rating}/5 Sao`,
              p.status === 'active' ? 'Hoạt động' : 'Danh sách đen'
            ])}
          />

          <AdminButton onClick={() => openModal()} className="shrink-0">
            <Plus size={13} />
            Thêm mới
          </AdminButton>
        </div>
      </div>

      {/* -- Bảng hiển thị danh sách -- */}
      {sortedPartners.length === 0 ? (
        <EmptyState
          icon={<AlertTriangle size={22} strokeWidth={1.5} className="text-gray-300" />}
          message={search.trim() ? `Không tìm thấy đối tác nào với "${search}"` : 'Chưa có đối tác nào được ghi nhận.'}
        />
      ) : (
        <div className="max-h-[calc(100vh-340px)] overflow-y-auto overflow-x-auto bg-white">
          <table className="w-full min-w-[900px] border-collapse">
            <thead className="sticky top-0 z-10 bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 w-10 text-center">
                  <AdminCheckbox checked={false} onChange={() => {}} className="opacity-60 cursor-not-allowed" />
                </th>
                <th className="px-4 py-3 text-left text-[13px] font-bold uppercase tracking-wider text-gray-400">Tên Đối Tác</th>
                <th className="px-4 py-3 text-left text-[13px] font-bold uppercase tracking-wider text-gray-400 w-64">Liên Hệ</th>
                <th className="px-4 py-3 text-left text-[13px] font-bold uppercase tracking-wider text-gray-400 w-52">Độ Uy Tín</th>
                <th className="px-4 py-3 w-32 text-center" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortedPartners.map((partner) => {
                const isBlacklist = partner.status === 'blacklist'
                return (
                  <tr
                    key={partner.id}
                    className={`border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors ${
                      isBlacklist
                        ? 'bg-red-50/20 hover:bg-red-50/40 border-l-[4px] border-l-red-500/80'
                        : 'border-l-[4px] border-l-transparent'
                    }`}
                  >
                    <td className="px-4 py-3.5 text-center w-10">
                      <AdminCheckbox checked={false} onChange={() => {}} className="opacity-60 cursor-not-allowed" />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-col gap-0.5">
                        <span className={`text-[15px] font-bold ${isBlacklist ? 'text-red-900' : 'text-vatican-dark'}`}>
                          {partner.name}
                        </span>
                        {partner.notes && (
                          <span className="text-[12px] text-gray-400 line-clamp-1 italic" title={partner.notes}>
                            {partner.notes}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-col gap-1">
                        <span className="text-[14px] text-vatican-dark font-medium flex items-center gap-1.5">
                          <User size={13} className="text-gray-400" />
                          {partner.contactName}
                        </span>
                        <a href={`tel:${partner.phone}`} className="text-[14px] text-vatican-blue hover:underline font-bold flex items-center gap-1.5 w-fit">
                          <Phone size={13} className="text-vatican-blue/80" />
                          {partner.phone}
                        </a>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-col gap-1.5 justify-center">
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={13}
                              className={i < partner.rating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-200'}
                            />
                          ))}
                        </div>
                        <div>
                          {isBlacklist ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold rounded-full bg-red-50 text-red-700 border border-red-200/60 animate-pulse">
                              <ShieldAlert size={11} />
                              Danh sách đen
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold rounded-full bg-green-50 text-green-700 border border-green-200/60">
                              <CheckCircle size={11} />
                              Hoạt động
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 w-32">
                      <div className="flex items-center justify-center gap-1">
                        <AdminIconButton
                          onClick={() => openViewModal(partner)}
                          variant="ghost"
                          title="Xem chi tiết"
                        >
                          <Eye size={13} />
                        </AdminIconButton>
                        <AdminIconButton
                          onClick={() => openModal(partner)}
                          variant="edit"
                          title="Chỉnh sửa"
                        >
                          <Edit2 size={13} />
                        </AdminIconButton>
                        <AdminIconButton
                          onClick={() => setShowDeleteConfirm(partner.id)}
                          variant="danger"
                          title="Xóa đối tác"
                        >
                          <Trash2 size={13} />
                        </AdminIconButton>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <ConfirmDeleteModal
          title="Xóa đối tác dịch vụ?"
          description={partners.find(p => p.id === showDeleteConfirm)?.name ?? ''}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(null)}
          loading={false}
        />
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <AdminModal onClose={() => setIsModalOpen(false)} maxWidth="max-w-[620px]">
          <ModalHeader title={currentPartner ? 'Cập nhật đối tác' : 'Thêm đối tác mới'} onClose={() => setIsModalOpen(false)} />

          <form onSubmit={handleSave} className="flex flex-col flex-1 min-h-0">
            <div className="overflow-y-auto px-6 py-6 flex flex-col gap-4">

              {/* Lĩnh vực */}
              <div className="flex items-center gap-2 select-none w-full shrink-0">
                {CATEGORIES.map(cat => {
                  const isSelected = formCategory === cat
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setFormCategory(cat)}
                      className={`flex-1 h-9 rounded-lg text-[14px] font-bold transition-all whitespace-nowrap ${
                        isSelected
                          ? 'bg-white text-vatican-blue border border-gray-200 font-extrabold'
                          : 'bg-gray-100 text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {cat}
                    </button>
                  )
                })}
              </div>

              {/* Tên đối tác */}
              <div>
                <AdminLabel>
                  Tên đối tác <span className="text-red-400">*</span>
                </AdminLabel>
                <AdminInput
                  type="text"
                  required
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="VD: Công ty Lữ hành Vietravel..."
                />
              </div>

              {/* Số điện thoại & Người đại diện */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <AdminLabel>
                    Số điện thoại liên hệ <span className="text-red-400">*</span>
                  </AdminLabel>
                  <AdminInput
                    type="tel"
                    required
                    value={formPhone}
                    onChange={e => setFormPhone(e.target.value)}
                    placeholder="VD: 0901234567..."
                  />
                </div>
                <div>
                  <AdminLabel>
                    Người đại diện liên hệ
                  </AdminLabel>
                  <AdminInput
                    type="text"
                    value={formContactName}
                    onChange={e => setFormContactName(e.target.value)}
                    placeholder="VD: Nguyễn Văn A..."
                  />
                </div>
              </div>

              {/* Độ uy tín */}
              <div>
                <AdminLabel>
                  Độ uy tín đối tác
                </AdminLabel>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-sm w-fit">
                    {Array.from({ length: 5 }).map((_, i) => {
                      const starNum = i + 1
                      const isFilled = starNum <= formRating
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setFormRating(starNum)}
                          className="focus:outline-none transition-transform hover:scale-110"
                        >
                          <Star
                            size={20}
                            className={isFilled ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'}
                          />
                        </button>
                      )
                    })}
                  </div>
                  <span className="text-[13.5px] font-black text-vatican-blue">{formRating} / 5 Sao</span>
                </div>
              </div>

              {/* Trạng thái đối tác */}
              <div>
                <AdminLabel>
                  Trạng thái đối tác
                </AdminLabel>
                <div className="flex gap-2 select-none w-full md:w-2/3">
                  <button
                    type="button"
                    onClick={() => setFormStatus('active')}
                    className={`flex-1 h-9 rounded-lg text-[13px] font-bold transition-all flex items-center justify-center gap-1.5 border ${
                      formStatus === 'active'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        : 'bg-white text-gray-400 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <CheckCircle size={13} />
                    Hoạt động
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormStatus('blacklist')}
                    className={`flex-1 h-9 rounded-lg text-[13px] font-bold transition-all flex items-center justify-center gap-1.5 border ${
                      formStatus === 'blacklist'
                        ? 'bg-rose-50 text-rose-700 border-rose-300'
                        : 'bg-white text-gray-400 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <ShieldAlert size={13} />
                    Danh sách đen
                  </button>
                </div>
              </div>

              {/* Ghi chú phản hồi */}
              <div>
                <AdminLabel>
                  Ghi chú phản hồi / lý do chất lượng
                </AdminLabel>
                <AdminTextarea
                  rows={3}
                  value={formNotes}
                  onChange={e => setFormNotes(e.target.value)}
                  placeholder="Ghi chú phản hồi chất lượng, lý do đưa vào danh sách đen..."
                />
              </div>

            </div>

            <div className="border-t border-gray-100 bg-gray-50/50 px-6 py-4 shrink-0 flex justify-end gap-2">
              <AdminButton type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
                Hủy
              </AdminButton>
              <AdminButton type="submit" variant="primary">
                Lưu
              </AdminButton>
            </div>
          </form>
        </AdminModal>
      )}

      {/* View Detail Modal */}
      {isViewModalOpen && viewPartner && (
        <AdminModal onClose={() => setIsViewModalOpen(false)} maxWidth="max-w-[580px]">
          <ModalHeader title="Chi tiết đối tác dịch vụ" onClose={() => setIsViewModalOpen(false)} />

          <div className="overflow-y-auto px-6 py-6 flex flex-col gap-5">
            <div className="border-b border-gray-100 pb-3">
              <span className="text-[11px] font-black uppercase tracking-widest text-gray-400">Tên đối tác</span>
              <h4 className="text-[18px] font-black text-vatican-dark mt-1 leading-snug">
                {viewPartner.name}
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-[11px] font-black uppercase tracking-widest text-gray-400">Lĩnh vực hoạt động</span>
                <p className="text-[14px] font-bold text-vatican-dark mt-1 bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-100 w-fit">
                  {viewPartner.category}
                </p>
              </div>

              <div>
                <span className="text-[11px] font-black uppercase tracking-widest text-gray-400">Trạng thái</span>
                <div className="mt-1">
                  {viewPartner.status === 'blacklist' ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-bold rounded-lg bg-red-50 text-red-700 border border-red-200/60 animate-pulse">
                      <ShieldAlert size={13} />
                      Danh sách đen
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-bold rounded-lg bg-green-50 text-green-700 border border-green-200/60">
                      <CheckCircle size={13} />
                      Đang hoạt động
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
              <div>
                <span className="text-[11px] font-black uppercase tracking-widest text-gray-400">Người đại diện</span>
                <p className="text-[14px] font-bold text-vatican-dark mt-1 flex items-center gap-2">
                  <User size={14} className="text-gray-400" />
                  {viewPartner.contactName || '—'}
                </p>
              </div>

              <div>
                <span className="text-[11px] font-black uppercase tracking-widest text-gray-400">Số điện thoại</span>
                <p className="text-[14px] font-bold mt-1">
                  <a href={`tel:${viewPartner.phone}`} className="text-vatican-blue hover:underline flex items-center gap-2 w-fit">
                    <Phone size={14} className="text-vatican-blue/80" />
                    {viewPartner.phone}
                  </a>
                </p>
              </div>
            </div>

            <div>
              <span className="text-[11px] font-black uppercase tracking-widest text-gray-400 block mb-1.5">Độ uy tín đối tác</span>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-sm w-fit">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      className={i < viewPartner.rating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-200'}
                    />
                  ))}
                </div>
                <span className="text-[13px] font-black text-vatican-blue">{viewPartner.rating} / 5 Sao</span>
              </div>
            </div>

            <div>
              <span className="text-[11px] font-black uppercase tracking-widest text-gray-400">Ghi chú phản hồi / Lý do chất lượng</span>
              <div className="mt-1.5 bg-gray-50 p-3.5 rounded-xl border border-gray-200/60 text-[14px] text-gray-600 leading-relaxed min-h-[80px] whitespace-pre-line italic">
                {viewPartner.notes || 'Không có ghi chú phản hồi nào.'}
              </div>
            </div>

            <div className="text-[12px] text-gray-400 flex justify-between items-center border-t border-gray-100 pt-3.5">
              <span>Đăng ký đối tác lúc:</span>
              <span className="font-bold">
                {new Date(viewPartner.createdAt).toLocaleDateString('vi-VN', {
                  day: '2-digit', month: '2-digit', year: 'numeric',
                  hour: '2-digit', minute: '2-digit'
                })}
              </span>
            </div>
          </div>

          <div className="border-t border-gray-100 bg-gray-50/50 px-6 py-4 shrink-0 flex justify-end gap-2">
            <AdminButton variant="primary" onClick={() => { setIsViewModalOpen(false); openModal(viewPartner) }}>
              <Edit2 size={14} />
              Chỉnh sửa thông tin
            </AdminButton>
            <AdminButton variant="secondary" onClick={() => setIsViewModalOpen(false)}>
              Đóng
            </AdminButton>
          </div>
        </AdminModal>
      )}

    </div>
  )
}
