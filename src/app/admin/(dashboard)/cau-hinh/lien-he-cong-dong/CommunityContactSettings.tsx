'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { HeartHandshake, Save, Plus, X, Trash2, CheckCircle, GripVertical } from 'lucide-react'
import { ConfirmDeleteModal } from '@/components/admin/ConfirmDeleteModal'
import { AdminLabel, AdminInput, AdminIconButton, AdminButton } from '@/components/admin/ui'
import { useDndSensors } from '@/hooks/useDndSensors'
import {
  DndContext,
  closestCenter,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

type ContactConfig = {
  id: string
  name: string | null
  address: string | null
  phones: string[]
  emails: string[]
  websites: string[]
  hours_list: string[]
  social_links: { label: string; url: string }[]
}

type SimpleItem = { id: string; value: string }
type LinkItem   = { id: string; label: string; url: string }

const uid = () => Math.random().toString(36).slice(2)

const LOGOS: Record<string, string> = {
  facebook:  '/platforms/facebook.svg',
  tiktok:    '/platforms/tiktok.svg',
  youtube:   '/platforms/youtube.svg',
  viber:     '/platforms/viber.svg',
  whatsapp:  '/platforms/whatsapp.svg',
}
const MESSAGING = new Set(['viber', 'whatsapp'])
const MESSAGING_COLORS: Record<string, string> = {
  viber:    '#7360F2',
  whatsapp: '#25D366',
}

const getLogo      = (label: string) => LOGOS[label.toLowerCase().replace(/\s/g, '')]
const isMessaging  = (label: string) => MESSAGING.has(label.toLowerCase())
const getQrUrl     = (label: string, url: string) => {
  const key = label.toLowerCase()
  if (key === 'viber')
    return `https://api.qrserver.com/v1/create-qr-code/?size=120x120&qzone=1&data=${encodeURIComponent(`viber://chat?number=${url}`)}`
  if (key === 'whatsapp')
    return `https://api.qrserver.com/v1/create-qr-code/?size=120x120&qzone=1&data=${encodeURIComponent(`https://wa.me/${url.replace(/\D/g, '')}`)}`
  return null
}


// ── Generic sortable row (phone / email / website) ────────────────────────
function SimpleRow({ item, placeholder, onChange, onDelete }: {
  item: SimpleItem
  placeholder?: string
  onChange: (v: string) => void
  onDelete: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id })
  const style = { transform: CSS.Transform.toString(transform), transition }
  const [showConfirm, setShowConfirm] = useState(false)

  return (
    <div ref={setNodeRef} style={style}
      className={`flex items-center gap-2 ${isDragging ? 'opacity-40' : ''}`}>
      <button {...attributes} {...listeners} suppressHydrationWarning
        className="cursor-grab active:cursor-grabbing shrink-0 text-gray-300 hover:text-gray-400 touch-none" tabIndex={-1}>
        <GripVertical size={14} />
      </button>
      <AdminInput value={item.value} placeholder={placeholder} onChange={e => onChange(e.target.value)} />
      <AdminIconButton onClick={() => setShowConfirm(true)} variant="danger">
        <Trash2 size={13} />
      </AdminIconButton>
      {showConfirm && (
        <ConfirmDeleteModal title="Xóa mục này?" description={item.value || undefined}
          onConfirm={() => { setShowConfirm(false); onDelete() }}
          onCancel={() => setShowConfirm(false)} />
      )}
    </div>
  )
}

// ── Sortable link row (social / messaging) ────────────────────────────────
function LinkRow({ item, onLabelChange, onUrlChange, onDelete }: {
  item: LinkItem
  onLabelChange: (v: string) => void
  onUrlChange: (v: string) => void
  onDelete: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id })
  const style = { transform: CSS.Transform.toString(transform), transition }
  const [showConfirm, setShowConfirm] = useState(false)

  const logo      = getLogo(item.label)
  const messaging = isMessaging(item.label)
  const qrUrl     = messaging && item.url ? getQrUrl(item.label, item.url) : null
  const color     = MESSAGING_COLORS[item.label.toLowerCase()]

  return (
    <div ref={setNodeRef} style={style}
      className={`flex flex-col gap-2 ${isDragging ? 'opacity-40' : ''}`}>

      {/* Input row */}
      <div className="flex items-center gap-2">
        <button {...attributes} {...listeners} suppressHydrationWarning
          className="cursor-grab active:cursor-grabbing shrink-0 text-gray-300 hover:text-gray-400 touch-none" tabIndex={-1}>
          <GripVertical size={14} />
        </button>
        <div className="w-5 shrink-0 flex items-center justify-center">
          {logo
            ? <img src={logo} alt={item.label} className="w-4 h-4 object-contain opacity-60" />
            : <span className="w-4 h-4 rounded-full bg-gray-200 inline-block" />}
        </div>
        <AdminInput
          value={item.label}
          placeholder="Facebook"
          onChange={e => onLabelChange(e.target.value)}
          className="w-[110px] shrink-0 px-2.5"
        />
        <AdminInput
          value={item.url}
          placeholder={messaging ? '+84911 990 226' : 'https://...'}
          onChange={e => onUrlChange(e.target.value)}
          className="flex-1"
        />
        <AdminIconButton onClick={() => setShowConfirm(true)} variant="danger">
          <Trash2 size={13} />
        </AdminIconButton>
      </div>
      {showConfirm && (
        <ConfirmDeleteModal title="Xóa liên kết?" description={item.label || undefined}
          onConfirm={() => { setShowConfirm(false); onDelete() }}
          onCancel={() => setShowConfirm(false)} />
      )}

      {/* QR preview for Viber / WhatsApp */}
      {qrUrl && (
        <div className="ml-[calc(14px+8px+20px+8px+110px+8px)] flex items-center gap-3">
          <div className="w-[72px] h-[72px] border border-gray-200 rounded-lg overflow-hidden bg-white p-1 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrUrl} alt={`QR ${item.label}`} className="w-full h-full object-contain" />
          </div>
          <span className="text-[16px] font-bold" style={{ color }}>Xem trước QR — {item.label}</span>
        </div>
      )}
    </div>
  )
}

// ── Generic sortable list section ─────────────────────────────────────────
function SimpleList({ label, items, placeholder, addLabel, onChange, onDelete, onAdd, onDragEnd, sensors }: {
  label: string
  items: SimpleItem[]
  placeholder?: string
  addLabel: string
  onChange: (id: string, v: string) => void
  onDelete: (id: string) => void
  onAdd: () => void
  onDragEnd: (e: DragEndEvent) => void
  sensors: ReturnType<typeof useDndSensors>
}) {
  return (
    <div className="flex flex-col gap-2">
      <AdminLabel>{label}</AdminLabel>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-2">
            {items.map(item => (
              <SimpleRow key={item.id} item={item} placeholder={placeholder}
                onChange={v => onChange(item.id, v)}
                onDelete={() => onDelete(item.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <button onClick={onAdd}
        className="flex items-center gap-1.5 w-full py-2.5 justify-center rounded-lg border border-dashed border-gray-300 text-[14px] font-bold text-gray-500 hover:border-vatican-blue hover:text-vatican-blue transition-colors">
        <Plus size={13} />{addLabel}
      </button>
    </div>
  )
}

// ── Main export ──────────────────────────────────────────────────────────
export function CommunityContactSettings({ config }: { config: ContactConfig }) {
  const [name,    setName]    = useState(config.name    ?? '')
  const [address, setAddress] = useState(config.address ?? '')

  const [phones,   setPhones]   = useState<SimpleItem[]>(config.phones.map(v => ({ id: uid(), value: v })))
  const [emails,   setEmails]   = useState<SimpleItem[]>(config.emails.map(v => ({ id: uid(), value: v })))
  const [websites, setWebsites] = useState<SimpleItem[]>(config.websites.map(v => ({ id: uid(), value: v })))
  const [hoursList, setHoursList] = useState<SimpleItem[]>(config.hours_list.map(v => ({ id: uid(), value: v })))
  const [links,    setLinks]    = useState<LinkItem[]>(config.social_links.map(l => ({ id: uid(), label: l.label, url: l.url })))

  const [saving, setSaving] = useState(false)
  const [saved,  setSaved]  = useState(false)
  const router = useRouter()

  const save = async () => {
    setSaving(true)
    await createClient().from('community_info').update({
      name, address,
      phones:      phones.map(p => p.value).filter(Boolean),
      emails:      emails.map(e => e.value).filter(Boolean),
      websites:    websites.map(w => w.value).filter(Boolean),
      hours_list:  hoursList.map(h => h.value).filter(Boolean),
      social_links: links.map(({ label, url }) => ({ label, url })).filter(l => l.label && l.url),
      updated_at:  new Date().toISOString(),
    }).eq('id', config.id)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
    router.refresh()
  }

  const sensors = useDndSensors()

  const dragEnd = (setter: React.Dispatch<React.SetStateAction<SimpleItem[]>>) => (e: DragEndEvent) => {
    const { active, over } = e
    if (!over || active.id === over.id) return
    setter(prev => arrayMove(prev, prev.findIndex(x => x.id === active.id), prev.findIndex(x => x.id === over.id)))
  }
  const linkDragEnd = (e: DragEndEvent) => {
    const { active, over } = e
    if (!over || active.id === over.id) return
    setLinks(prev => arrayMove(prev, prev.findIndex(x => x.id === active.id), prev.findIndex(x => x.id === over.id)))
  }

  const simpleChange = (setter: React.Dispatch<React.SetStateAction<SimpleItem[]>>) =>
    (id: string, v: string) => setter(prev => prev.map(x => x.id === id ? { ...x, value: v } : x))

  const simpleDelete = (setter: React.Dispatch<React.SetStateAction<SimpleItem[]>>) =>
    (id: string) => setter(prev => prev.filter(x => x.id !== id))

  return (
    <div className="bg-white rounded-lg flex flex-col border border-gray-100">

      {/* Header */}
      <div className="bg-white border-b-[3px] border-vatican-yellow flex items-center gap-2 px-5 h-[48px] shrink-0 rounded-t-lg">
        <HeartHandshake size={18} strokeWidth={2.5} className="text-vatican-blue/80 shrink-0" />
        <span className="text-[16px] font-bold uppercase tracking-wide text-vatican-blue">Liên hệ cộng đồng</span>
      </div>

      {/* Action bar */}
      <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between gap-4 shrink-0">
        <p className="text-[16px] text-gray-500 font-medium">Thông tin liên hệ hiển thị trên trang Cần Biết — chỉnh sửa và lưu để cập nhật ngay lập tức</p>
        <div className="flex items-center gap-3 shrink-0">
          {saved && (
            <span className="flex items-center gap-1.5 text-[16px] text-green-600 font-semibold">
              <CheckCircle size={13} />Đã lưu
            </span>
          )}
          <AdminButton onClick={save} disabled={saving} className="text-[14px]">
            <Save size={13} />{saving ? 'Đang lưu...' : 'Lưu'}
          </AdminButton>
        </div>
      </div>

      {/* Body — 2 cột */}
      <div className="flex divide-x divide-gray-100">

        {/* Cột trái */}
        <div className="flex-1 p-6 flex flex-col gap-5">

          <div className="flex flex-col gap-1.5">
            <AdminLabel>Tên hiển thị</AdminLabel>
            <AdminInput value={name} placeholder="CHATRUONGBUUDIEP" onChange={e => setName(e.target.value)} />
          </div>

          <div className="flex flex-col gap-1.5">
            <AdminLabel>Địa chỉ</AdminLabel>
            <AdminInput value={address} onChange={e => setAddress(e.target.value)} />
          </div>

          <SimpleList
            label="Giờ mở cửa"
            items={hoursList}
            placeholder="VD: Thứ 2–6: 05:00–21:00"
            addLabel="Thêm khung giờ"
            sensors={sensors}
            onChange={simpleChange(setHoursList)}
            onDelete={simpleDelete(setHoursList)}
            onAdd={() => setHoursList(prev => [...prev, { id: uid(), value: '' }])}
            onDragEnd={dragEnd(setHoursList)}
          />

          <SimpleList
            label="Điện thoại"
            items={phones}
            placeholder="+84911 990 226"
            addLabel="Thêm số điện thoại"
            sensors={sensors}
            onChange={simpleChange(setPhones)}
            onDelete={simpleDelete(setPhones)}
            onAdd={() => setPhones(prev => [...prev, { id: uid(), value: '' }])}
            onDragEnd={dragEnd(setPhones)}
          />

          <SimpleList
            label="Email"
            items={emails}
            placeholder="congdongchadiep@gmail.com"
            addLabel="Thêm email"
            sensors={sensors}
            onChange={simpleChange(setEmails)}
            onDelete={simpleDelete(setEmails)}
            onAdd={() => setEmails(prev => [...prev, { id: uid(), value: '' }])}
            onDragEnd={dragEnd(setEmails)}
          />

          <SimpleList
            label="Website"
            items={websites}
            placeholder="chatruongbuudiep.com"
            addLabel="Thêm website"
            sensors={sensors}
            onChange={simpleChange(setWebsites)}
            onDelete={simpleDelete(setWebsites)}
            onAdd={() => setWebsites(prev => [...prev, { id: uid(), value: '' }])}
            onDragEnd={dragEnd(setWebsites)}
          />
        </div>

        {/* Cột phải: Mạng xã hội & Liên kết */}
        <div className="flex-1 p-6 flex flex-col gap-4">
          <div>
            <AdminLabel>Mạng xã hội &amp; Liên kết</AdminLabel>
            <p className="text-[16px] text-gray-400 mt-0.5">
              Viber / WhatsApp nhập số điện thoại để tự động tạo mã QR
            </p>
          </div>

          <div className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-widest text-gray-400 pb-1 border-b border-gray-100">
            <span className="w-[30px] shrink-0" />
            <span className="w-5 shrink-0" />
            <span className="w-[110px] shrink-0">Tên</span>
            <span className="flex-1">URL / Số điện thoại</span>
            <span className="w-6 shrink-0" />
          </div>

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={linkDragEnd}>
            <SortableContext items={links.map(l => l.id)} strategy={verticalListSortingStrategy}>
              <div className="flex flex-col gap-3">
                {links.map(l => (
                  <LinkRow key={l.id} item={l}
                    onLabelChange={v => setLinks(prev => prev.map(x => x.id === l.id ? { ...x, label: v } : x))}
                    onUrlChange={v => setLinks(prev => prev.map(x => x.id === l.id ? { ...x, url: v } : x))}
                    onDelete={() => setLinks(prev => prev.filter(x => x.id !== l.id))}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <button onClick={() => setLinks(prev => [...prev, { id: uid(), label: '', url: '' }])}
            className="flex items-center gap-1.5 w-full py-2.5 justify-center rounded-lg border border-dashed border-gray-300 text-[14px] font-bold text-gray-500 hover:border-vatican-blue hover:text-vatican-blue transition-colors">
            <Plus size={13} />Thêm liên kết mới
          </button>
        </div>
      </div>
    </div>
  )
}
