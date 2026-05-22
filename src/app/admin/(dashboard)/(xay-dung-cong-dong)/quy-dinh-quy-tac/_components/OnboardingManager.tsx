'use client'

import { useState, useEffect, memo } from 'react'
import { X, AlertCircle, Trash2, Eye, Printer, Pencil, ExternalLink, FileText } from 'lucide-react'
import { AdminModal } from '@/components/admin/AdminModal'
import { ConfirmDeleteModal } from '@/components/admin/ConfirmDeleteModal'
import { AdminCheckbox, AdminButton, AdminIconButton, AdminInput, AdminLabel, ModalHeader } from '@/components/admin/ui'
import dynamic from 'next/dynamic'
import { EmptyState } from '@/components/admin/EmptyState'

const RichTextEditor = dynamic(() => import('@/components/admin/RichTextEditor'), {
  ssr: false,
  loading: () => (
    <div className="h-40 flex items-center justify-center border border-dashed border-gray-200 rounded-lg text-gray-400 bg-gray-50/50">
      Đang tải trình soạn thảo...
    </div>
  )
})


// --- Types ---
type OnboardingDoc = {
  id: string
  title: string
  desc: string
  downloads: number
  link: string
}

type ModalState =
  | null
  | { kind: 'new' }
  | { kind: 'view'; item: OnboardingDoc }
  | { kind: 'edit'; item: OnboardingDoc }

type DeleteTarget =
  | null
  | { kind: 'single'; item: OnboardingDoc }
  | { kind: 'bulk'; ids: string[] }

const MOCK_DOCS: OnboardingDoc[] = [
  {
    id: 'd1',
    title: 'Thư ngỏ chào mừng thành viên mới',
    desc: '<p>Thư tâm tình từ Ban Quản Trị gửi đến các thành viên mới, giới thiệu sứ mạng hiệp thông cộng đồng.</p>',
    downloads: 385,
    link: '/docs/thu-ngo-chao-mung.pdf'
  },
  {
    id: 'd2',
    title: 'Cẩm nang 3 phút dành cho người mới',
    desc: '<p>3 việc đơn giản thực hành mỗi ngày: Hiệp thông cầu nguyện, sống bác ái chia sẻ và tham gia sinh hoạt.</p>',
    downloads: 712,
    link: '/docs/cam-nang-3-phut.pdf'
  },
  {
    id: 'd3',
    title: 'Kinh nghiệm chào đón người mới',
    desc: '<p>Tổng hợp các kịch bản và kinh nghiệm chia sẻ thiêng liêng từng bước để chào đón và nâng đỡ người mới trong cộng đồng:</p><br/><h4 style="font-weight:bold;color:#012642;margin-bottom:4px;">1. Chào đón thành viên mới tham gia nhóm (Ngày 1: Chào mừng)</h4><p style="background:#f8f9fb;padding:12px;border-left:4px solid #012642;margin-bottom:16px;white-space:pre-wrap;font-family:monospace;font-size:13px;line-height:1.6;color:#334155;">Trân kính anh/chị thành viên mới,\n\nBan Quản Trị Gia đình Cha Diệp xin gửi lời chào mừng chân thành nhất đến anh/chị đã hiệp thông cùng cộng đồng. Chúc anh/chị luôn nhận được tràn đầy ơn lành và bình an của Chúa qua sự bầu cử của Cha Thánh Phanxicô Trương Bửu Diệp.\n\nĐể bắt đầu hành trình đức tin và kết nối, kính mời anh/chị đọc qua Thư Ngỏ Chào Mừng tại đây: [Link Thư Ngỏ].\n\nNếu cần hỗ trợ bất kỳ thông tin nào, xin đừng ngần ngại nhắn tin cho Ban Quản Trị ạ. Nguyện xin Cha Diệp che chở và chúc lành cho anh/chị!</p><h4 style="font-weight:bold;color:#012642;margin-bottom:4px;">2. Chia sẻ câu chuyện ơn lành & Gieo mầm đức tin (Ngày 3: Gieo mầm)</h4><p style="background:#f8f9fb;padding:12px;border-left:4px solid #012642;margin-bottom:16px;white-space:pre-wrap;font-family:monospace;font-size:13px;line-height:1.6;color:#334155;">Chào anh/chị,\n\nHôm nay, Gia đình Cha Diệp xin gửi đến anh/chị một câu chuyện từ ơn đầy xúc động của một thành viên trong cộng đồng đã được Cha che chở qua cơn hiểm nghèo: [Link Video/Bài viết].\n\nKính mong câu chuyện nhỏ này sẽ tiếp thêm sức mạnh thiêng liêng cho đức tin của anh/chị trong cuộc sống hàng ngày. Chúc anh/chị một ngày làm việc tràn ngập niềm vui và hồng ân Thiên Chúa!</p><h4 style="font-weight:bold;color:#012642;margin-bottom:4px;">3. Lời mời hiệp thông đọc kinh trực tuyến tối thứ Bảy (Ngày 7: Hiệp thông)</h4><p style="background:#f8f9fb;padding:12px;border-left:4px solid #012642;margin-bottom:16px;white-space:pre-wrap;font-family:monospace;font-size:13px;line-height:1.6;color:#334155;">Thân gửi anh/chị,\n\nVào lúc 20:00 tối thứ Bảy tuần này, cộng đồng chúng ta sẽ có buổi Đọc kinh hiệp nguyện và chia sẻ ơn lành Cha Diệp trực tuyến qua Zoom (thời lượng khoảng 30 phút, rất ấm cúng và nhẹ nhàng).\n\nSự hiện diện của anh/chị sẽ là niềm khích lệ và là đóa hoa thiêng liêng dâng kính Cha. Kính mời anh/chị bấm vào link này để tham gia cùng gia đình chúng ta nhé: [Link Zoom].\n\nChúc anh/chị và gia đình một cuối tuần bình an!</p>',
    downloads: 412,
    link: ''
  },
  {
    id: 'd4',
    title: 'Câu hỏi thường gặp của người mới',
    desc: '<p>Giải đáp chi tiết các thắc mắc phổ biến của thành viên mới khi bắt đầu đồng hành cùng Cộng đồng Gia đình Cha Diệp:</p><br/><h4 style="font-weight:bold;color:#012642;margin-bottom:4px;">Q1: Tôi chưa có đạo Công giáo thì có thể tham gia sinh hoạt cùng cộng đồng được không?</h4><p style="background:#f0fdf4;padding:12px;border-left:4px solid #10b981;margin-bottom:16px;color:#1e293b;font-size:13px;line-height:1.6;">Dạ hoàn toàn được ạ! Cha Phanxicô Trương Bửu Diệp khi sinh thời luôn giang tay cứu giúp và yêu thương tất cả mọi người, không phân biệt tôn giáo hay nguồn gốc. Cộng đồng Gia đình Cha Diệp luôn mở rộng cửa chào đón quý anh/chị không có đạo tham gia hiệp thông, chia sẻ đức tin và thực hành bác ái.</p><h4 style="font-weight:bold;color:#012642;margin-bottom:4px;">Q2: Tham gia các hoạt động đóng góp, bác ái của cộng đồng có bắt buộc không?</h4><p style="background:#f0fdf4;padding:12px;border-left:4px solid #10b981;margin-bottom:16px;color:#1e293b;font-size:13px;line-height:1.6;">Dạ hoàn toàn KHÔNG bắt buộc ạ. Mọi hoạt động quyên góp, hỗ trợ các hoàn cảnh khó khăn hoặc hoạt động chung của cộng đồng đều dựa trên tinh thần tự nguyện, tùy thuộc hoàn toàn vào lòng hảo tâm và hoàn cảnh thực tế của mỗi thành viên. Sự tham gia cầu nguyện hiệp thông của anh/chị đã là món quà vô giá gửi đến cộng đồng.</p><h4 style="font-weight:bold;color:#012642;margin-bottom:4px;">Q3: Tôi ở xa hoặc công việc bận rộn thì có thể đồng hành cùng cộng đồng bằng cách nào?</h4><p style="background:#f0fdf4;padding:12px;border-left:4px solid #10b981;margin-bottom:16px;color:#1e293b;font-size:13px;line-height:1.6;">Dạ anh/chị có thể đồng hành cùng cộng đồng rất dễ dàng qua những cách sau:<br/>1. Dành ra 3 phút mỗi ngày để đọc Lời khẩn nguyện Cha Diệp cầu bình an cho bản thân, gia đình và toàn thể cộng đồng.<br/>2. Tham gia buổi đọc kinh chung trực tuyến qua Zoom tối thứ Bảy hàng tuần khi sắp xếp được thời gian.<br/>3. Chia sẻ những câu chuyện, bài học hoặc ơn lành mà bản thân nhận được lên nhóm để lan tỏa niềm tin cho mọi người.</p>',
    downloads: 518,
    link: ''
  },
  {
    id: 'd5',
    title: 'Thẻ Kinh nguyện khẩn Cha Diệp (Bản ngắn)',
    desc: '<p>Bản kinh nguyện gọn gàng, trang nghiêm để thành viên có thể đọc và khẩn cầu Cha mọi lúc mọi nơi.</p>',
    downloads: 1250,
    link: '/images/kinh-khay-cha-diep-ngan.jpg'
  },
  {
    id: 'd6',
    title: 'Video: Cuộc đời và Đức tin Cha Phanxicô Trương Bửu Diệp',
    desc: '<p>Thước phim tư liệu ngắn giới thiệu cuộc đời đầy tình yêu thương và cái chết tử đạo cao cả của Cha.</p>',
    downloads: 429,
    link: 'https://www.youtube.com/watch?v=example'
  }
]

// --- Print Builder ---
function buildOnboardingPrintHTML(doc: OnboardingDoc): string {
  return `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="utf-8"/>
<title>Tài liệu: ${doc.title}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  @page { size:A4 portrait; margin:20mm; }
  body { font-family:Arial,Helvetica,sans-serif; font-size:11pt; color:#1a1a1a; line-height:1.6; padding: 10px; }

  .header { text-align:center; margin-bottom:20pt; }
  .header .org { font-size:10pt; color:#555; margin-bottom:4pt; }
  .header h1 { font-size:15pt; font-weight:bold; color:#012642; letter-spacing:0.5px; text-transform:uppercase; margin-bottom:4pt; }

  .divider { border:none; border-top:2px solid #012642; margin:10pt 0 16pt 0; }

  .meta { margin-bottom:16pt; }
  .meta-row { display:flex; gap:8pt; margin-bottom:6pt; font-size:10.5pt; }
  .meta-label { font-weight:bold; min-width:110pt; color:#4b5563; }
  .meta-value { flex:1; color:#111827; }

  h3 { font-size:11pt; font-weight:bold; color:#012642; text-transform:uppercase;
       letter-spacing:.5px; margin:16pt 0 8pt; border-bottom:1px solid #e5e7eb; padding-bottom:4pt; }

  .content { font-size:11pt; line-height:1.7; color: #374151; }

  .footer { margin-top:40pt; display:flex; justify-content:space-between; text-align:center; font-size:9.5pt; color:#6b7280; border-top:1px solid #f3f4f6; padding-top:8pt; }

  @media print {
    * { -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important; }
  }
</style>
<script>window.addEventListener('load',function(){setTimeout(function(){window.print();},300);});</script>
</head>
<body>
  <div class="header">
    <p class="org">Cộng đồng Cha Phanxicô Trương Bửu Diệp</p>
    <h1>TÀI LIỆU HƯỚNG DẪN THÀNH VIÊN MỚI</h1>
  </div>
  <hr class="divider"/>

  <div class="meta">
    <div class="meta-row">
      <span class="meta-label">Tên tài liệu:</span>
      <span class="meta-value" style="font-weight:bold; color:#012642;">${doc.title}</span>
    </div>
    <div class="meta-row">
      <span class="meta-label">Lượt tải về:</span>
      <span class="meta-value">${doc.downloads} lượt tải</span>
    </div>
    ${doc.link ? `
    <div class="meta-row">
      <span class="meta-label">Đường liên kết:</span>
      <span class="meta-value" style="word-break: break-all;"><a href="${doc.link}" target="_blank">${doc.link}</a></span>
    </div>` : ''}
  </div>
  <h3>Nội dung tài liệu</h3>
  <div class="content">
    ${doc.desc || '<p>Không có mô tả chi tiết cho tài liệu này.</p>'}
  </div>

  <div class="footer">
    <span>Gia đình Cha Phanxicô Trương Bửu Diệp</span>
    <span>Tài liệu nội bộ ban hành</span>
  </div>
</body>
</html>`
}

// --- Row Components ---
const DocRow = memo(function DocRow({ doc, isSelected, onToggle, onView, onEdit, onDelete }: {
  doc: OnboardingDoc
  isSelected: boolean
  onToggle: () => void
  onView: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  const cleanDesc = doc.desc ? doc.desc.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim() : ''

  return (
    <tr className={`transition-colors ${isSelected ? 'bg-vatican-blue/5' : 'hover:bg-gray-50'}`}>
      {/* Checkbox */}
      <td className="px-5 py-3.5 w-10">
        <AdminCheckbox checked={isSelected} onChange={onToggle} />
      </td>

      {/* Tài liệu */}
      <td className="px-4 py-3.5">
        <p className="text-[14px] font-bold text-vatican-dark cursor-pointer hover:text-vatican-blue" onClick={onView}>
          {doc.title}
        </p>
        {cleanDesc && (
          <p className="text-[12px] text-gray-400 mt-0.5 line-clamp-1">{cleanDesc}</p>
        )}
      </td>

      {/* Hành động */}
      <td className="px-4 py-3.5 w-[130px]">
        <div className="flex items-center gap-0.5">
          <AdminIconButton variant="ghost" onClick={onView} title="Xem">
            <Eye size={13} />
          </AdminIconButton>
          <AdminIconButton variant="edit" onClick={onEdit} title="Sửa">
            <Pencil size={13} />
          </AdminIconButton>
          <AdminIconButton variant="danger" onClick={onDelete} title="Xóa">
            <Trash2 size={13} />
          </AdminIconButton>
          {doc.link && (
            <a href={doc.link} target="_blank" rel="noopener noreferrer" className="inline-block">
              <AdminIconButton variant="edit" title="Xem tệp">
                <ExternalLink size={13} />
              </AdminIconButton>
            </a>
          )}
        </div>
      </td>
    </tr>
  )
})

// --- Modal Component ---
function OnboardingModal({
  state,
  onClose,
  onSave,
  onChangeMode
}: {
  state: Exclude<ModalState, null>
  onClose: () => void
  onSave: (item: OnboardingDoc) => void
  onChangeMode: (newMode: ModalState) => void
}) {
  const isView = state.kind === 'view'
  const isEdit = state.kind === 'edit'
  const editItem = isEdit || isView ? state.item : null

  const [docTitle, setDocTitle] = useState('')
  const [docDesc, setDocDesc] = useState('')
  const [docLink, setDocLink] = useState('')

  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (editItem) {
      setDocTitle(editItem.title ?? '')
      setDocDesc(editItem.desc ?? '')
      setDocLink(editItem.link ?? '')
    } else {
      setDocTitle('')
      setDocDesc('')
      setDocLink('')
    }
  }, [state, editItem])

  const handleSave = () => {
    setError(null)
    if (!docTitle.trim()) {
      setError('Vui lòng nhập tên tài liệu.')
      return
    }
    onSave({
      id: isEdit ? editItem!.id : 'd_' + Date.now().toString(),
      title: docTitle.trim(),
      desc: docDesc.trim(),
      downloads: isEdit ? editItem!.downloads : 0,
      link: docLink.trim()
    })
  }

  const handlePrint = () => {
    if (!editItem) return
    const printHTML = buildOnboardingPrintHTML(editItem)
    const blob = new Blob([printHTML], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank', 'width=900,height=860')
    setTimeout(() => URL.revokeObjectURL(url), 10_000)
  }

  // --- VIEW MODE MODAL ---
  if (isView && editItem) {
    return (
      <AdminModal onClose={onClose} maxWidth="max-w-[650px]">
        <ModalHeader title="CHI TIẾT TÀI LIỆU" subtitle="Thông tin chi tiết hướng dẫn thành viên mới" onClose={onClose} />

        <div className="flex-1 overflow-y-auto px-6 py-6 bg-white max-h-[70vh]">
          <div className="flex flex-col gap-6">
            <div>
              <h4 className="text-[18px] font-black text-vatican-dark leading-snug uppercase tracking-wide">
                {editItem.title}
              </h4>
              <div className="flex items-center gap-2 mt-2 flex-wrap text-[13px] text-gray-500 font-medium">
                <span>{editItem.downloads} lượt tải</span>
              </div>
            </div>
            <div className="border-t border-gray-100/80" />
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400 mb-2">Nội dung chi tiết</p>
              <div
                className="px-4 py-3.5 rounded-lg border border-gray-200 bg-gray-50/20 text-[14px] text-gray-700 leading-relaxed font-medium content-rich-html prose max-w-none max-h-[400px] overflow-y-auto"
                dangerouslySetInnerHTML={{ __html: editItem.desc || '<p class="text-gray-400">Chưa cập nhật mô tả.</p>' }}
              />
            </div>
            {editItem.link && (
              <>
                <div className="border-t border-gray-100/80" />
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400 mb-2">Đường liên kết</p>
                  <a href={editItem.link} target="_blank" rel="noreferrer" className="text-[14px] font-bold text-vatican-blue hover:underline break-all">
                    {editItem.link}
                  </a>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="border-t border-gray-100 bg-gray-50/50 px-6 py-4 shrink-0 flex justify-end gap-2">
          <AdminButton variant="secondary" onClick={onClose}>
            Đóng
          </AdminButton>
          {editItem.link && (
            <a href={editItem.link} target="_blank" rel="noopener noreferrer" className="inline-block">
              <AdminButton variant="secondary">
                <ExternalLink size={14} />Xem tệp
              </AdminButton>
            </a>
          )}
          <AdminButton variant="secondary" onClick={handlePrint}>
            <Printer size={14} className="text-vatican-blue" />
            In nội dung
          </AdminButton>
          <AdminButton variant="primary" onClick={() => onChangeMode({ kind: 'edit', item: editItem })}>
            <Pencil size={14} />Chỉnh sửa
          </AdminButton>
        </div>
      </AdminModal>
    )
  }

  // --- EDIT / NEW MODE MODAL ---
  const title = isEdit ? 'Chỉnh sửa tài liệu' : 'Thêm tài liệu mới'

  return (
    <AdminModal onClose={onClose} maxWidth="max-w-[750px]">
      <ModalHeader title={title} onClose={onClose} />

      <div className="p-6 overflow-y-auto flex flex-col gap-6 max-h-[70vh]">
        <div className="flex flex-col gap-4">
          <div>
            <AdminLabel>Tên tài liệu <span className="text-red-500">*</span></AdminLabel>
            <AdminInput
              type="text"
              value={docTitle}
              onChange={e => setDocTitle(e.target.value)}
              placeholder="Nhập tên tài liệu..."
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <AdminLabel>Nội dung chi tiết / Mô tả</AdminLabel>
            <RichTextEditor content={docDesc} onChange={setDocDesc} />
          </div>
          <div>
            <AdminLabel>Tệp đính kèm / Link</AdminLabel>
            <AdminInput
              type="text"
              value={docLink}
              onChange={e => setDocLink(e.target.value)}
              placeholder="URL tải tài liệu hoặc link YouTube..."
            />
          </div>

          {error && (
            <div className="flex items-center gap-1.5 text-[13px] font-semibold text-red-600">
              <AlertCircle size={13} />
              {error}
            </div>
          )}
        </div>
      </div>

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

export function OnboardingManager({
  searchQuery,
  onRegisterAddDoc,
  onUpdatePDFData
}: {
  searchQuery: string
  onRegisterAddDoc?: (addFn: () => void) => void
  onUpdatePDFData?: (headers: string[], rows: string[][]) => void
}) {
  const [docs, setDocs] = useState<OnboardingDoc[]>(MOCK_DOCS)
  const [modal, setModal] = useState<ModalState>(null)

  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null)

  useEffect(() => {
    setSelected(new Set())
  }, [])

  useEffect(() => {
    if (onRegisterAddDoc) {
      onRegisterAddDoc(() => setModal({ kind: 'new' }))
    }
  }, [onRegisterAddDoc])

  const handleSaveItem = (savedItem: OnboardingDoc) => {
    setDocs(prev => {
      const idx = prev.findIndex(d => d.id === savedItem.id)
      if (idx >= 0) {
        return prev.map(d => d.id === savedItem.id ? savedItem : d)
      }
      return [savedItem, ...prev]
    })
    setModal(null)
  }

  const handleConfirmDelete = () => {
    if (!deleteTarget) return

    if (deleteTarget.kind === 'single') {
      const id = deleteTarget.item.id
      setDocs(prev => prev.filter(d => d.id !== id))
      setSelected(prev => {
        const n = new Set(prev)
        n.delete(id)
        return n
      })
    } else if (deleteTarget.kind === 'bulk') {
      const idsToDelete = new Set(deleteTarget.ids)
      setDocs(prev => prev.filter(d => !idsToDelete.has(d.id)))
      setSelected(new Set())
    }
    setDeleteTarget(null)
  }

  const q = searchQuery.toLowerCase().trim()
  const filteredDocs = docs.filter(d => q === '' || d.title.toLowerCase().includes(q) || d.desc.toLowerCase().includes(q))

  const currentList = filteredDocs
  const selectedCount = selected.size
  const allSelected = currentList.length > 0 && currentList.every(item => selected.has(item.id))
  const someSelected = currentList.some(item => selected.has(item.id)) && !allSelected

  const toggleAll = () => {
    if (allSelected || someSelected) {
      setSelected(new Set())
    } else {
      setSelected(new Set(currentList.map(item => item.id)))
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

  const exportPDFHeaders = ['Tiêu đề', 'Mô tả / Chi tiết']

  const exportPDFRows = () => {
    const listToExport = selectedCount > 0
      ? currentList.filter(item => selected.has(item.id))
      : currentList

    return (listToExport as OnboardingDoc[]).map(e => [
      e.title,
      e.desc.replace(/<[^>]*>/g, '')
    ])
  }

  useEffect(() => {
    if (onUpdatePDFData) {
      onUpdatePDFData(exportPDFHeaders, exportPDFRows())
    }
  }, [docs, selected, searchQuery, onUpdatePDFData])

  return (
    <div className="flex flex-col h-full bg-white animate-fade-in">

      {/* -- Content & Table -- */}
      {currentList.length === 0 ? (
        <EmptyState
          icon={<FileText size={22} strokeWidth={1.5} className="text-gray-300" />}
          message={searchQuery ? `Không tìm thấy kết quả cho "${searchQuery}"` : 'Chưa có tài liệu hướng dẫn nào.'}
        />
      ) : (
        <div className="max-h-[calc(100vh-280px)] overflow-y-auto overflow-x-auto bg-white flex-1">
          <table className="w-full min-w-[640px]">
            <thead className="sticky top-0 z-10 bg-white">
              <tr className={`border-b transition-colors ${selectedCount > 0 ? 'bg-vatican-blue/5 border-vatican-blue/10' : 'bg-gray-50/50 border-gray-100'}`}>
                <th className="px-5 py-3 w-10 text-left">
                  <AdminCheckbox checked={allSelected} indeterminate={someSelected} onChange={toggleAll} />
                </th>

                {selectedCount > 0 ? (
                  <th colSpan={2} className="px-2 py-3 text-left">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-[14px] font-bold text-vatican-blue">Đã chọn {selectedCount}</span>
                      <AdminButton variant="danger" size="compact" onClick={() => setDeleteTarget({ kind: 'bulk', ids: Array.from(selected) })}>
                        <Trash2 size={12} />Xóa {selectedCount} mục
                      </AdminButton>
                      <button onClick={() => setSelected(new Set())}
                        className="ml-auto text-[13px] text-gray-400 hover:text-gray-600 transition-colors mr-4">
                        Bỏ chọn
                      </button>
                    </div>
                  </th>
                ) : (
                  <>
                    <th className="px-4 py-3 text-left text-[13px] font-bold uppercase tracking-wider text-gray-400">Tiêu đề</th>
                    <th className="px-4 py-3 w-[130px]" />
                  </>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {filteredDocs.map(doc => (
                <DocRow
                  key={doc.id}
                  doc={doc}
                  isSelected={selected.has(doc.id)}
                  onToggle={() => toggleItem(doc.id)}
                  onView={() => setModal({ kind: 'view', item: doc })}
                  onEdit={() => setModal({ kind: 'edit', item: doc })}
                  onDelete={() => setDeleteTarget({ kind: 'single', item: doc })}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <OnboardingModal
          state={modal}
          onClose={() => setModal(null)}
          onSave={handleSaveItem}
          onChangeMode={setModal}
        />
      )}

      {deleteTarget && (
        <ConfirmDeleteModal
          title={deleteTarget.kind === 'single' ? 'Xóa hạng mục' : `Xóa ${deleteTarget.ids.length} hạng mục?`}
          description={
            deleteTarget.kind === 'single'
              ? `Bạn có chắc chắn muốn xóa hạng mục "${deleteTarget.item.title}"? Hành động này không thể hoàn tác.`
              : `Bạn có chắc chắn muốn xóa ${deleteTarget.ids.length} hạng mục đã chọn này? Hành động này không thể hoàn tác.`
          }
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
