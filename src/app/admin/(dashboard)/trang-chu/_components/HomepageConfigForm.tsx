'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Megaphone, Map, BookHeart, Save, CheckCircle, AlertCircle, Bell, BookOpen, Music, Newspaper, Info } from 'lucide-react'
import { AdminButton, AdminSelect } from '@/components/admin/ui'
import { AdminCard } from '@/components/admin/AdminCard'

type Article      = { id: string; title: string }
type Announcement = { id: string; content_html: string }
type Testimony    = { id: string; title: string }
type Prayer       = { id: string; title: string }
type Hymn         = { id: string; title: string; artist: string }

interface Props {
  initialConfig:   Record<string, Record<string, string | null>>
  allArticles:     Article[]
  camNangArticles: Article[]
  announcements:   Announcement[]
  testimonies:     Testimony[]
  prayers:         Prayer[]
  hymns:           Hymn[]
}

function announcementLabel(html: string) {
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  return text.length > 80 ? text.slice(0, 80) + '…' : text
}

const selectCls = 'flex-1 min-w-0 text-ellipsis overflow-hidden whitespace-nowrap'

function LabeledRow({ label, value, options, onChange, disabledIds = [] }: {
  label: string
  value: string
  options: { id: string; label: string }[]
  onChange: (v: string) => void
  disabledIds?: string[]
}) {
  const mappedOptions = options.map(o => ({
    value: o.id,
    label: o.label,
    disabled: disabledIds.includes(o.id) && o.id !== value,
  }))

  return (
    <div className="flex items-center gap-3 min-w-0 w-full">
      <span className="w-36 shrink-0 text-sm md:text-base font-bold text-gray-500">{label}</span>
      <AdminSelect
        value={value}
        onChange={onChange}
        options={mappedOptions}
        placeholder="— Chọn —"
        className={selectCls}
      />
    </div>
  )
}

function NumberedRow({ num, value, options, onChange, disabledIds = [] }: {
  num: number
  value: string
  options: { id: string; label: string }[]
  onChange: (v: string) => void
  disabledIds?: string[]
}) {
  const mappedOptions = options.map(o => ({
    value: o.id,
    label: o.label,
    disabled: disabledIds.includes(o.id) && o.id !== value,
  }))

  return (
    <div className="flex items-center gap-3 min-w-0 w-full">
      <span className="w-6 shrink-0 text-sm md:text-base font-bold text-gray-400 text-center">{num}</span>
      <AdminSelect
        value={value}
        onChange={onChange}
        options={mappedOptions}
        placeholder="— Chọn —"
        className={selectCls}
      />
    </div>
  )
}

const ICON_CLS = 'text-vatican-blue/80'

export function HomepageConfigForm({ initialConfig, allArticles, camNangArticles, announcements, testimonies, prayers, hymns }: Props) {
  const articleOpts   = allArticles.map(a => ({ id: a.id, label: a.title }))
  const camNangOpts   = camNangArticles.map(a => ({ id: a.id, label: a.title }))
  const announcOpts   = announcements.map(a => ({ id: a.id, label: announcementLabel(a.content_html) }))
  const testimonyOpts = testimonies.map(t => ({ id: t.id, label: t.title }))
  const prayerOpts    = prayers.map(p => ({ id: p.id, label: p.title }))
  const hymnOpts      = hymns.map(h => ({ id: h.id, label: `${h.title} — ${h.artist}` }))

  const [cfg, setCfg] = useState<Record<string, Record<string, string>>>({
    tin_nhanh: {
      hero: '', slot_1: '', slot_2: '',
      ...initialConfig.tin_nhanh,
    },
    hanh_huong: {
      slot_1:'', slot_2:'', slot_3:'', slot_4:'', slot_5:'', slot_6:'',
      ...initialConfig.hanh_huong,
    },
    cung_cau_nguyen: {
      announcement:'',
      thanh_ca_1:'', thanh_ca_2:'', thanh_ca_3:'', thanh_ca_4:'', thanh_ca_5:'', thanh_ca_6:'',
      loi_kinh_1:'', loi_kinh_2:'', loi_kinh_3:'', loi_kinh_4:'', loi_kinh_5:'', loi_kinh_6:'',
      ...initialConfig.cung_cau_nguyen,
    },
    chung_nhan: {
      slot_1:'', slot_2:'', slot_3:'', slot_4:'', slot_5:'', slot_6:'',
      ...initialConfig.chung_nhan,
    },
  })

  const set = (section: string, slot: string, value: string) =>
    setCfg(prev => ({ ...prev, [section]: { ...prev[section], [slot]: value } }))

  const [saving, setSaving] = useState(false)
  const [msg, setMsg]       = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [, start]           = useTransition()

  const handleSave = async () => {
    setSaving(true); setMsg(null)
    const { error } = await createClient()
      .from('homepage_config')
      .upsert({ id: 'main', config: cfg, updated_at: new Date().toISOString() })
    setSaving(false)
    if (error) {
      setMsg({ type: 'error', text: 'Lỗi: ' + error.message })
    } else {
      setMsg({ type: 'success', text: 'Đã lưu cấu hình trang chủ.' })
      start(() => { setTimeout(() => setMsg(null), 3000) })
    }
  }

  const disabledTinNhanh  = Object.values(cfg.tin_nhanh).filter(Boolean)
  const disabledHanhHuong = Object.values(cfg.hanh_huong).filter(Boolean)
  const disabledChungNhan = [1,2,3,4,5,6].map(i => cfg.chung_nhan[`slot_${i}`]).filter(Boolean)
  const disabledPrayers   = [1,2,3,4,5,6].map(i => cfg.cung_cau_nguyen[`loi_kinh_${i}`]).filter(Boolean)
  const disabledHymns     = [1,2,3,4,5,6].map(i => cfg.cung_cau_nguyen[`thanh_ca_${i}`]).filter(Boolean)

  return (
    <div className="flex flex-col">

      {/* Action bar */}
      <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between gap-4 shrink-0">
        <p className="text-[15px] text-gray-500 font-medium">Cấu hình nội dung hiển thị trên từng khung của trang chủ.</p>
        <div className="flex items-center gap-3 shrink-0">
          {msg && (
            <div className={`flex items-center gap-1.5 text-[14px] font-semibold ${msg.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
              {msg.type === 'success' ? <CheckCircle size={14} className="shrink-0" /> : <AlertCircle size={14} className="shrink-0" />}
              {msg.text}
            </div>
          )}
          <AdminButton type="button" onClick={handleSave} disabled={saving}>
            <Save size={15} />
            {saving ? 'Đang lưu...' : 'Lưu cấu hình'}
          </AdminButton>
        </div>
      </div>

      <div className="p-4 md:p-6 flex flex-col gap-4">

      {/* Hàng 1: Tin nhanh | Góc hành hương */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-start">
        <AdminCard icon={<Megaphone size={16} strokeWidth={2.5} className={ICON_CLS} />} title="Tin Nhanh">
          <div className="px-4 py-3 flex flex-col gap-2 flex-1">
            <LabeledRow label="Hero (lớn)"        value={cfg.tin_nhanh.hero}   options={articleOpts} onChange={v => set('tin_nhanh','hero',v)}   disabledIds={disabledTinNhanh} />
            <LabeledRow label="Nổi bật 1 (trên)"  value={cfg.tin_nhanh.slot_1} options={articleOpts} onChange={v => set('tin_nhanh','slot_1',v)} disabledIds={disabledTinNhanh} />
            <LabeledRow label="Nổi bật 2 (dưới)"  value={cfg.tin_nhanh.slot_2} options={articleOpts} onChange={v => set('tin_nhanh','slot_2',v)} disabledIds={disabledTinNhanh} />
          </div>
        </AdminCard>

        <AdminCard icon={<Map size={16} strokeWidth={2.5} className={ICON_CLS} />} title="Góc Hành Hương">
          <div className="px-4 py-3 flex flex-col gap-2 flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
              {[1,2,3,4,5,6].map(i => (
                <NumberedRow key={i} num={i} value={cfg.hanh_huong[`slot_${i}`]} options={camNangOpts} onChange={v => set('hanh_huong',`slot_${i}`,v)} disabledIds={disabledHanhHuong} />
              ))}
            </div>
          </div>
        </AdminCard>
      </div>

      {/* Hàng 2: Thông báo | Thánh ca | Lời kinh  (khớp thứ tự desktop trang chủ) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
        <AdminCard icon={<Bell size={16} strokeWidth={2.5} className={ICON_CLS} />} title="Thông Báo">
          <div className="px-4 py-3 flex flex-col gap-2 flex-1">
            <AdminSelect
              value={cfg.cung_cau_nguyen.announcement}
              onChange={v => set('cung_cau_nguyen', 'announcement', v)}
              options={announcOpts.map(o => ({ value: o.id, label: o.label }))}
              placeholder="— Chọn —"
              className={selectCls}
            />
          </div>
        </AdminCard>

        <AdminCard icon={<Music size={16} strokeWidth={2.5} className={ICON_CLS} />} title="Thánh Ca">
          <div className="px-4 py-3 flex flex-col gap-2 flex-1">
            {[1,2,3,4,5,6].map(i => (
              <NumberedRow key={i} num={i} value={cfg.cung_cau_nguyen[`thanh_ca_${i}`]} options={hymnOpts} onChange={v => set('cung_cau_nguyen',`thanh_ca_${i}`,v)} disabledIds={disabledHymns} />
            ))}
          </div>
        </AdminCard>

        <AdminCard icon={<BookOpen size={16} strokeWidth={2.5} className={ICON_CLS} />} title="Lời Kinh">
          <div className="px-4 py-3 flex flex-col gap-2 flex-1">
            {[1,2,3,4,5,6].map(i => (
              <NumberedRow key={i} num={i} value={cfg.cung_cau_nguyen[`loi_kinh_${i}`]} options={prayerOpts} onChange={v => set('cung_cau_nguyen',`loi_kinh_${i}`,v)} disabledIds={disabledPrayers} />
            ))}
          </div>
        </AdminCard>
      </div>

      {/* Hàng 3: Nhật ký chứng nhân (6 slot — 3 cột × 2 hàng) */}
      <AdminCard icon={<BookHeart size={16} strokeWidth={2.5} className={ICON_CLS} />} title="Nhật Ký Chứng Nhân">
        <div className="px-4 py-3 flex flex-col gap-2 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-2">
            {[1,2,3,4,5,6].map(i => (
              <NumberedRow key={i} num={i} value={cfg.chung_nhan[`slot_${i}`]} options={testimonyOpts} onChange={v => set('chung_nhan',`slot_${i}`,v)} disabledIds={disabledChungNhan} />
            ))}
          </div>
        </div>
      </AdminCard>

      {/* Hàng 4: Hoạt động cộng đồng (tự động, không cần cấu hình) */}
      <AdminCard icon={<Newspaper size={16} strokeWidth={2.5} />} title="Hoạt Động Cộng Đồng">
        <div className="px-4 py-4 flex items-center gap-2.5 text-sm md:text-base text-gray-500">
          <Info size={15} className="shrink-0 text-vatican-blue/60" />
          Tự động hiển thị 6 bài viết mới nhất từ danh mục <span className="font-semibold text-vatican-dark mx-1">Cần Biết → Hoạt động cộng đồng</span>. Không cần cấu hình thêm.
        </div>
      </AdminCard>

      </div>
    </div>
  )
}
