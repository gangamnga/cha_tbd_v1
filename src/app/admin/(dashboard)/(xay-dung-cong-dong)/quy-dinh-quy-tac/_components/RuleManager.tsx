'use client'

import { useState, useRef, useEffect, useCallback, memo } from 'react'
import { Shield, Plus, Search, X, AlertCircle, Trash2, Pencil } from 'lucide-react'
import { ExportPDFButton } from '@/components/admin/ExportPDFButton'
import { AdminModal } from '@/components/admin/AdminModal'
import { ConfirmDeleteModal } from '@/components/admin/ConfirmDeleteModal'
import { AdminCheckbox, AdminButton, AdminIconButton, AdminInput, AdminTextarea, AdminLabel, ModalHeader, AdminStatusBadgeSelect, BadgeSelectOption, ModalStatusToggle } from '@/components/admin/ui'
import { OnboardingManager } from './OnboardingManager'
import { AdminTabs } from '@/components/admin/AdminTabs'
import { EmptyState } from '@/components/admin/EmptyState'

// --- Types ---
type RuleCategory = 'noi-quy' | 'quy-che-bqt' | 'xu-ly' | 'huong-dan-moi'

interface Rule {
  id: string
  category: RuleCategory
  title: string
  content: string
  severity?: 'normal' | 'warning' | 'strict'
  active: boolean
}

const INITIAL_RULES: Rule[] = [
  // --- Nội quy Cộng đồng ---
  {
    id: '1',
    category: 'noi-quy',
    title: 'Tình Bác Ái & Sự Hiệp Thông',
    content: 'Mỗi thành viên sinh hoạt được mời gọi giao tiếp từ nhẹ, hoà nhã và yêu thương nhau theo tinh thần Tin Mừng. Hãy luôn chia sẻ những lời khuyên nâng đỡ, cùng nhau xây dựng bầu khí gia đình đức tin ấm áp.',
    severity: 'normal',
    active: true
  },
  {
    id: '2',
    category: 'noi-quy',
    title: 'Bảo vệ & Nuôi dưỡng Đức tin trong sạch',
    content: 'Khuyến khích đăng tải các nội dung suy niệm Lời Chúa, chia sẻ chứng tá đức tin sống động hoặc gương các Thánh. Xin tránh lan truyền các học thuyết lạc giáo, tin đồn mê tín dị đoan hoặc thông tin chưa được Giáo hội phê chuẩn.',
    severity: 'warning',
    active: true
  },
  {
    id: '3',
    category: 'noi-quy',
    title: 'Giữ gìn sự thanh tao của Không gian chung',
    content: 'Để cộng đồng luôn là nơi tinh lặng hướng lòng về Chúa, xin anh chị em lưu ý tránh đăng tải quảng cáo bán hàng, giới thiệu dịch vụ thương mại, hoặc tự phát kêu gọi quyên góp tài chính cá nhân.',
    severity: 'warning',
    active: true
  },
  {
    id: '4',
    category: 'noi-quy',
    title: 'Tôn trọng Sự riêng tư của Anh chị em',
    content: 'Xin tôn trọng quyền riêng tư của tha nhân. Tuyệt đối không chia sẻ thông tin cá nhân, hình ảnh riêng tư hoặc các ý chỉ cầu nguyện thầm kín của anh chị em khác nếu chưa được họ đồng ý.',
    severity: 'normal',
    active: true
  },

  // --- Quy chế Ban quản trị ---
  {
    id: '5',
    category: 'quy-che-bqt',
    title: 'Cam kết Tự nguyện & Trách nhiệm Sứ vụ',
    content: 'Phục vụ trong BQT hoàn toàn là tự nguyện vì lòng mến Chúa và cộng đồng, không chịu sự chế tài của pháp luật thế gian. Tuy nhiên, khi đã tự nguyện nhận việc hoặc được giao phó sứ vụ, mỗi thành viên cam kết thực hiện với lương tâm trách nhiệm cao nhất, hoàn thành đúng hẹn để giữ dòng chảy sinh hoạt chung không bị đình trệ.',
    severity: 'strict',
    active: true
  },
  {
    id: '6',
    category: 'quy-che-bqt',
    title: 'Minh bạch & Ngay thẳng trong Bác Ái',
    content: 'Mọi hoạt động điều phối quỹ từ thiện hoặc đóng góp của ân nhân phải được ghi chép sổ sách rõ ràng, lưu trữ chứng từ đầy đủ và công khai báo cáo minh bạch định kỳ. Đây là cam kết đạo đức cốt lõi trước mặt Chúa và cộng đồng.',
    severity: 'strict',
    active: true
  },
  {
    id: '7',
    category: 'quy-che-bqt',
    title: 'Trách nhiệm Bảo mật & Đồng hành Bác Ái',
    content: 'Cam kết bảo mật tuyệt đối danh tính, thông tin cá nhân và ý chỉ cầu nguyện thầm kín của giáo dân. Ban quản trị luôn lắng nghe với lòng bao dung, tránh tranh cãi gay gắt hay phán xét trực tiếp thành viên.',
    severity: 'strict',
    active: true
  },
  {
    id: '8',
    category: 'quy-che-bqt',
    title: 'Chuẩn mực Gương mẫu trong Lời nói',
    content: 'Admin và kiểm duyệt viên cần giữ thái độ hoà nhã, khiêm nhường trong mọi lời bình luận. Luôn là nhân tố kiến tạo sự hiệp nhất, tránh gây chia rẽ, kết bè phái hoặc lạm dụng quyền hạn điều hành.',
    severity: 'normal',
    active: true
  },

  // --- Quy trình Xử lý ---
  {
    id: '9',
    category: 'xu-ly',
    title: 'Nhắc nhở & Đồng hành (Thành viên tự do)',
    content: 'Đối tượng: Giáo dân và thành viên sinh hoạt tự do.\nChi tiết: Đối với các sơ suất nhỏ lần đầu (đăng nhầm mục, spam nhẹ). Ban kiểm duyệt sẽ ẩn bài viết và gửi tin nhắn riêng hướng dẫn với công nhận nhẹ nhàng, ấm áp kèm lời chúc bình an để thành viên điều chỉnh.',
    severity: 'normal',
    active: true
  },
  {
    id: '10',
    category: 'xu-ly',
    title: 'Đối thoại & Tạm ngừng tương tác (Thành viên tự do)',
    content: 'Đối tượng: Giáo dân và thành viên sinh hoạt tự do.\nChi tiết: Trường hợp thành viên tiếp tục vi phạm quy chế chung hoặc phát ngôn thiếu bác ái. Ban điều phối tiến hành liên hệ trò chuyện trực tiếp để chia sẻ tinh thần hiệp thông, đồng thời tạm ngừng quyền đăng bài 3-7 ngày để cùng suy ngẫm.',
    severity: 'warning',
    active: true
  },
  {
    id: '11',
    category: 'xu-ly',
    title: 'Giới hạn quyền truy cập bảo vệ Cộng đồng (Thành viên tự do)',
    content: 'Đối tượng: Giáo dân và thành viên sinh hoạt tự do.\nChi tiết: Chỉ áp dụng biện pháp khóa tài khoản vĩnh viễn hoặc chặn IP khi phát hiện tài khoản cố tình phá hoại đức tin Công giáo, bôi nhọ Giáo hội, lừa đảo tài chính hoặc truyền bá giáo phái cực đoan sau khi mọi nỗ lực đối thoại thất bại.',
    severity: 'strict',
    active: true
  },
  {
    id: '12',
    category: 'xu-ly',
    title: 'Nhắc nhở Lương tâm & Cam kết phục vụ (Thành viên BQT)',
    content: 'Đối tượng: Trưởng/phó ban, Kiểm duyệt viên & Admin BQT.\nChi tiết: Khi thành viên BQT thiếu trách nhiệm trong công việc được giao hoặc chậm trễ nhiệm vụ kiểm duyệt mà không có lý do. Ban đại diện gặp gỡ riêng để chia sẻ, lắng nghe khó khăn và nhắc nhở nhẹ nhàng về cam kết tự nguyện ban đầu.',
    severity: 'warning',
    active: true
  },
  {
    id: '13',
    category: 'xu-ly',
    title: 'Tạm ngừng Sứ vụ tự nguyện để tĩnh tâm (Thành viên BQT)',
    content: 'Đối tượng: Trưởng/phó ban, Kiểm duyệt viên & Admin BQT.\nChi tiết: Áp dụng khi thành viên liên tục trễ hẹn công việc được giao hoặc phát ngôn thiếu gương mẫu làm ảnh hưởng đến dòng chảy hoạt động chung. Tạm ngừng quyền quản trị 15-30 ngày để thành viên dành thời gian tĩnh tâm và sắp xếp lại việc cá nhân.',
    severity: 'warning',
    active: true
  },
  {
    id: '14',
    category: 'xu-ly',
    title: 'Mời rút lui trong Bình an và Bác Ái (Thành viên BQT)',
    content: 'Đối tượng: Trưởng/phó ban, Kiểm duyệt viên & Admin BQT.\nChi tiết: Đối với các vi phạm nghiêm trọng cam kết phục vụ (lạm quyền tư lợi, thiếu minh bạch tài chính bác ái, gây chia rẽ nội bộ trầm trọng). BQT họp biểu quyết và nhẹ nhàng đề nghị thành viên rút lui khỏi sứ vụ trong bình an để giữ gìn sự hiệp thông của cộng đồng.',
    severity: 'strict',
    active: true
  }
]

const RULE_STATUS_OPTIONS: BadgeSelectOption[] = [
  { value: 'active', label: 'Áp dụng', color: 'green' },
  { value: 'inactive', label: 'Không áp dụng', color: 'gray' },
]

function RuleActiveToggle({ active, onToggle }: { active: boolean; onToggle: () => void }) {
  return (
    <AdminStatusBadgeSelect
      value={active ? 'active' : 'inactive'}
      onChange={() => onToggle()}
      options={RULE_STATUS_OPTIONS}
    />
  )
}

const RuleRow = memo(function RuleRow({
  rule,
  isSelected,
  onToggle,
  onEdit,
  onDelete,
  onToggleActive
}: {
  rule: Rule
  isSelected: boolean
  onToggle: () => void
  onEdit: () => void
  onDelete: () => void
  onToggleActive: () => void
}) {
  return (
    <tr className={`transition-colors ${isSelected ? 'bg-vatican-blue/5' : 'hover:bg-gray-50/50'}`}>
      {/* Checkbox */}
      <td className="px-5 py-3.5 w-10">
        <AdminCheckbox checked={isSelected} onChange={onToggle} />
      </td>

      {/* Tiêu đề */}
      <td className="px-4 py-3.5 align-top w-[30%] min-w-[200px]">
        <h4 className="text-[15px] font-bold text-vatican-dark leading-snug">
          {rule.title}
        </h4>
      </td>

      {/* Nội dung quy định */}
      <td className="px-4 py-3.5 align-top">
        <p className="text-[13px] text-gray-500 leading-relaxed font-normal whitespace-pre-line">
          {rule.content}
        </p>
      </td>

      {/* Trạng thái */}
      <td className="px-4 py-3.5 align-top w-[140px] shrink-0">
        <RuleActiveToggle active={rule.active} onToggle={onToggleActive} />
      </td>

      {/* Hành động */}
      <td className="px-4 py-3.5 align-top w-[100px] shrink-0">
        <div className="flex gap-0.5 justify-end ml-auto w-fit">
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

type ModalState =
  | null
  | { kind: 'new' }
  | { kind: 'edit'; rule: Rule }


function RuleModal({
  state,
  activeTab,
  onClose,
  onSave,
}: {
  state: Exclude<ModalState, null>
  activeTab: RuleCategory
  onClose: () => void
  onSave: (rule: Rule) => void
}) {
  const isEdit = state.kind === 'edit'
  const [ruleCategory, setRuleCategory] = useState<RuleCategory>(
    isEdit ? state.rule.category : activeTab
  )
  const [title, setTitle] = useState(isEdit ? state.rule.title : '')
  const [content, setContent] = useState(isEdit ? state.rule.content : '')
  const [active, setActive] = useState(isEdit ? state.rule.active : true)
  const [error, setError] = useState<string | null>(null)


  const modalTitle = isEdit
    ? 'Chỉnh sửa quy định'
    : ruleCategory === 'noi-quy'
    ? 'Thêm nội quy'
    : ruleCategory === 'quy-che-bqt'
    ? 'Thêm quy chế'
    : 'Thêm quy trình'

  const handleSave = () => {
    if (!title.trim()) {
      setError('Vui lòng nhập tiêu đề.')
      return
    }
    if (!content.trim()) {
      setError('Vui lòng nhập nội dung chi tiết.')
      return
    }
    onSave({
      id: isEdit ? state.rule.id : Date.now().toString(),
      category: ruleCategory,
      title: title.trim(),
      content: content.trim(),
      severity: isEdit ? state.rule.severity : 'normal',
      active,
    })
  }

  return (
    <AdminModal onClose={onClose} maxWidth="max-w-[640px]">
      {/* Header */}
      <ModalHeader title={modalTitle} onClose={onClose} />

      {/* Phân loại */}
      <div className="px-6 pt-4 shrink-0 bg-white">
        <AdminTabs
          tabs={[
            { id: 'noi-quy',     label: 'Nội quy Cộng đồng'  },
            { id: 'quy-che-bqt', label: 'Quy chế BQT'        },
            { id: 'xu-ly',       label: 'Quy trình xử lý'    },
          ]}
          activeTab={ruleCategory}
          onChange={setRuleCategory}
          className={`${isEdit ? 'opacity-50 pointer-events-none' : ''}`}
        />
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-4">
        <div>
          <AdminLabel>Tiêu đề <span className="text-red-500">*</span></AdminLabel>
          <AdminInput
            type="text"
            placeholder="Nhập tiêu đề..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <AdminLabel>Trạng thái</AdminLabel>
          <ModalStatusToggle active={active} onChange={setActive} />
        </div>

        <div>
          <AdminLabel>Nội dung chi tiết <span className="text-red-500">*</span></AdminLabel>
          <AdminTextarea
            placeholder="Nhập nội dung chi tiết..."
            className="min-h-[120px]"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        {error && (
          <div className="flex items-center gap-1.5 text-[13px] font-semibold text-red-600 mt-1">
            <AlertCircle size={13} />
            {error}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 bg-gray-50/50 px-6 py-4 shrink-0 flex items-center justify-end gap-2">
        <AdminButton variant="secondary" onClick={onClose}>
          Hủy
        </AdminButton>
        <AdminButton variant="primary" onClick={handleSave}>
          Lưu dữ liệu
        </AdminButton>
      </div>
    </AdminModal>
  )
}

const TABS: { key: RuleCategory; label: string }[] = [
  { key: 'noi-quy', label: 'Nội quy Cộng đồng' },
  { key: 'quy-che-bqt', label: 'Quy chế Ban quản trị' },
  { key: 'xu-ly', label: 'Quy trình Xử lý' },
  { key: 'huong-dan-moi', label: 'Tài liệu hướng dẫn' },
]

type RuleDeleteTarget =
  | null
  | { kind: 'single'; item: Rule }
  | { kind: 'bulk'; ids: string[] }

export function RuleManager() {
  const [rules, setRules] = useState<Rule[]>(INITIAL_RULES)
  const [activeTab, setActiveTab] = useState<RuleCategory>('noi-quy')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [modal, setModal] = useState<ModalState>(null)
  const [deleteTarget, setDeleteTarget] = useState<RuleDeleteTarget>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Onboarding hooks and refs
  const openAddDocRef = useRef<(() => void) | null>(null)
  const [onboardingPDFData, setOnboardingPDFData] = useState<{ headers: string[]; rows: string[][] }>({
    headers: [],
    rows: []
  })

  const handleRegisterAddDoc = useCallback((addFn: () => void) => {
    openAddDocRef.current = addFn
  }, [])

  const handleUpdatePDFData = useCallback((headers: string[], rows: string[][]) => {
    setOnboardingPDFData({ headers, rows })
  }, [])

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus()
  }, [searchOpen])

  useEffect(() => {
    setSearchQuery('')
    setSearchOpen(false)
    setSelected(new Set())
  }, [activeTab])

  const filterBySearch = (items: Rule[]) => {
    let filtered = items.filter(item => item.category === activeTab)
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase()
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(lowerQuery) ||
        item.content.toLowerCase().includes(lowerQuery)
      )
    }
    return filtered
  }

  const handleSave = (rule: Rule) => {
    if (modal?.kind === 'edit') {
      setRules(prev => prev.map(r => r.id === rule.id ? rule : r))
    } else {
      setRules(prev => [rule, ...prev])
    }
    setModal(null)
  }

  const handleDelete = () => {
    if (!deleteTarget) return

    if (deleteTarget.kind === 'single') {
      const id = deleteTarget.item.id
      setRules(prev => prev.filter(r => r.id !== id))
      setSelected(prev => {
        const n = new Set(prev)
        n.delete(id)
        return n
      })
    } else if (deleteTarget.kind === 'bulk') {
      const idsToDelete = new Set(deleteTarget.ids)
      setRules(prev => prev.filter(r => !idsToDelete.has(r.id)))
      setSelected(new Set())
    }
    setDeleteTarget(null)
  }

  const handleToggleActive = (id: string) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, active: !r.active } : r))
  }

  const currentRules = filterBySearch(rules)
  const selectedCount = selected.size
  const allSelected = currentRules.length > 0 && currentRules.every(item => selected.has(item.id))
  const someSelected = currentRules.some(item => selected.has(item.id)) && !allSelected

  const toggleAll = () => {
    if (allSelected || someSelected) {
      setSelected(new Set())
    } else {
      setSelected(new Set(currentRules.map(item => item.id)))
    }
  }

  const toggleItem = (id: string) => {
    setSelected(prev => {
      const n = new Set(prev)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })
  }

  return (
    <div className="flex flex-col h-full bg-white animate-fade-in">
      {/* -- Toolbar -- */}
      <div className="px-6 py-4 border-b border-gray-100 flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between bg-gray-50/50">
        <div className="flex-1 min-w-0 w-full">
            <AdminTabs
              tabs={TABS.map(tab => ({
                id: tab.key,
                label: tab.label,
              }))}
              activeTab={activeTab}
              onChange={setActiveTab}
            />
        </div>

        <div className="flex items-center gap-4 shrink-0 flex-wrap w-full xl:w-auto justify-end">
          {/* Search */}
          <div className="flex items-center shrink-0">
            {searchOpen ? (
              <div className="flex items-center gap-2 bg-white border border-vatican-blue rounded-lg px-3 h-9 transition-colors w-[180px]">
                <Search size={14} className="text-vatican-blue shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm..."
                  className="flex-1 text-[14px] outline-none text-vatican-dark placeholder:text-gray-400 bg-transparent min-w-0"
                />
                <button type="button" onClick={() => { setSearchQuery(''); setSearchOpen(false) }} className="text-gray-400 hover:text-gray-600 shrink-0">
                  <X size={13} />
                </button>
              </div>
            ) : (
              <button onClick={() => setSearchOpen(true)} title="Tìm kiếm" className="w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-500 hover:border-vatican-blue hover:text-vatican-blue transition-colors shrink-0">
                <Search size={14} />
              </button>
            )}
          </div>

          <div className="h-6 w-px bg-gray-200 hidden xl:block mx-1" />

          {/* Export PDF */}
          {activeTab === 'huong-dan-moi' ? (
            <ExportPDFButton
              title="Danh sách Tài liệu Hướng dẫn"
              headers={onboardingPDFData.headers}
              rows={onboardingPDFData.rows}
            />
          ) : (
            <ExportPDFButton
              title={`Danh sách ${TABS.find(t => t.key === activeTab)?.label}`}
              headers={['Tiêu đề', 'Nội dung quy định', 'Trạng thái']}
              rows={(selectedCount > 0
                ? currentRules.filter(item => selected.has(item.id))
                : currentRules
              ).map(e => [
                e.title,
                e.content,
                e.active ? 'Đang áp dụng' : 'Không áp dụng'
              ])}
            />
          )}

          <div className="h-6 w-px bg-gray-200 hidden xl:block mx-1" />

          {/* Add Button */}
          {activeTab === 'huong-dan-moi' ? (
            <AdminButton onClick={() => openAddDocRef.current?.()} className="shrink-0">
              <Plus size={13} />
              Thêm tài liệu
            </AdminButton>
          ) : (
            <AdminButton onClick={() => setModal({ kind: 'new' })} className="shrink-0">
              <Plus size={13} />
              {activeTab === 'noi-quy' ? 'Thêm nội quy' : activeTab === 'quy-che-bqt' ? 'Thêm quy chế' : 'Thêm quy trình'}
            </AdminButton>
          )}
        </div>
      </div>

      {/* -- Content -- */}
      {activeTab === 'huong-dan-moi' ? (
        <div className="flex-1 bg-white">
          <OnboardingManager
            searchQuery={searchQuery}
            onRegisterAddDoc={handleRegisterAddDoc}
            onUpdatePDFData={handleUpdatePDFData}
          />
        </div>
      ) : currentRules.length === 0 ? (
        <EmptyState
          icon={<Shield size={22} strokeWidth={1.5} className="text-gray-300" />}
          message={searchQuery ? `Không tìm thấy kết quả cho "${searchQuery}"` : 'Chưa có dữ liệu quy định.'}
        />
      ) : (
        <div className="flex-1 max-h-[calc(100vh-280px)] overflow-y-auto overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead className="sticky top-0 z-10 bg-white">
              <tr className={`border-b transition-colors ${selectedCount > 0 ? 'bg-vatican-blue/5 border-vatican-blue/10' : 'bg-gray-50/50 border-gray-100'}`}>
                <th className="px-5 py-3 w-10 text-left">
                  <AdminCheckbox checked={allSelected} indeterminate={someSelected} onChange={toggleAll} />
                </th>

                {selectedCount > 0 ? (
                  <th colSpan={4} className="px-2 py-3 text-left">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-[14px] font-bold text-vatican-blue">Đã chọn {selectedCount}</span>
                      <button onClick={() => setDeleteTarget({ kind: 'bulk', ids: Array.from(selected) })}
                        className="flex items-center gap-1.5 px-3 h-7 rounded-lg text-[12px] font-bold bg-white border border-red-200 text-red-600 hover:bg-red-50 transition-colors">
                        <Trash2 size={12} className="shrink-0" />
                        Xóa {selectedCount} quy định
                      </button>

                      <button onClick={() => setSelected(new Set())}
                        className="ml-auto text-[13px] text-gray-400 hover:text-gray-600 transition-colors mr-4">
                        Bỏ chọn
                      </button>
                    </div>
                  </th>
                ) : (
                  <>
                    <th className="px-4 py-3 text-left text-[13px] font-bold uppercase tracking-wider text-gray-400 w-[30%] min-w-[200px]">
                      Tiêu đề
                    </th>
                    <th className="px-4 py-3 text-left text-[13px] font-bold uppercase tracking-wider text-gray-400">
                      Nội dung quy định
                    </th>
                    <th className="px-4 py-3 text-left text-[13px] font-bold uppercase tracking-wider text-gray-400 w-[140px]">
                      Trạng thái
                    </th>
                    <th className="px-4 py-3 text-left text-[13px] font-bold uppercase tracking-wider text-gray-400 w-[100px]" />
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {currentRules.map(rule => (
                <RuleRow
                  key={rule.id}
                  rule={rule}
                  isSelected={selected.has(rule.id)}
                  onToggle={() => toggleItem(rule.id)}
                  onEdit={() => setModal({ kind: 'edit', rule })}
                  onDelete={() => setDeleteTarget({ kind: 'single', item: rule })}
                  onToggleActive={() => handleToggleActive(rule.id)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <RuleModal
          state={modal}
          activeTab={activeTab}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}

      {deleteTarget && (
        <ConfirmDeleteModal
          title={deleteTarget.kind === 'single' ? 'Xóa quy định?' : `Xóa ${deleteTarget.ids.length} quy định?`}
          description={
            deleteTarget.kind === 'single'
              ? `Bạn có chắc chắn muốn xóa quy định "${deleteTarget.item.title}"? Hành động này không thể hoàn tác.`
              : `Bạn có chắc chắn muốn xóa ${deleteTarget.ids.length} quy định đã chọn này? Hành động này không thể hoàn tác.`
          }
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
