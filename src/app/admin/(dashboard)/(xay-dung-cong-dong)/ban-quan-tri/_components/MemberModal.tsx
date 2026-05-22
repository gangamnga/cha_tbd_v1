'use client'

import { useState, useRef, useEffect } from 'react'
import {
  Plus, Pencil, X, AlertCircle,
  Phone, Mail, Loader2, UserCircle, Upload,
  Check, Download, Award,
} from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { AdminModal } from '@/components/admin/AdminModal'
import {
  AdminLabel,
  AdminButton,
  AdminInput,
  AdminTextarea,
  ModalHeader,
  AdminSelect,
} from '@/components/admin/ui'
import { CertificatePreview, generateImage } from './CertificateButton'
import type { BqtMember } from './constants'
import { DEPARTMENTS, DEPARTMENT_ROLES, getRoleDuty, splitMemberName } from './constants'

// ── Types ─────────────────────────────────────────────────────────────────────

export type RoleAssignment = { dept: string; role: string }

export function parseRoles(member: BqtMember): RoleAssignment[] {
  if (!member.role) return []
  try {
    const parsed = JSON.parse(member.role)
    if (Array.isArray(parsed)) return parsed
  } catch {}
  return [{ dept: member.department, role: member.role }]
}

export type ModalMode =
  | { type: 'add'; dept?: string }
  | { type: 'view'; member: BqtMember }
  | { type: 'edit'; member: BqtMember }



// ── MemberModal ───────────────────────────────────────────────────────────────

export function MemberModal({ mode, onClose, onSaved, onChangeMode }: {
  mode: ModalMode
  onClose: () => void
  onSaved: (member: BqtMember) => void
  onChangeMode: (newMode: ModalMode) => void
}) {
  const isEdit = mode.type === 'edit'
  const m = mode.type === 'edit' || mode.type === 'view' ? mode.member : null
  const initDept = m
    ? (parseRoles(m)[0]?.dept ?? DEPARTMENTS[0].key)
    : ((mode as { type: 'add'; dept?: string }).dept ?? DEPARTMENTS[0].key)

  const [roles, setRoles]           = useState<RoleAssignment[]>(m ? parseRoles(m) : [])
  const [addingRole, setAddingRole] = useState(roles.length === 0)
  const [newDept, setNewDept]       = useState(initDept)
  const [newRole, setNewRole]       = useState(DEPARTMENT_ROLES[initDept]?.[0]?.role ?? '')

  useEffect(() => { setNewRole(DEPARTMENT_ROLES[newDept]?.[0]?.role ?? '') }, [newDept])

  const initParsed = splitMemberName(m?.name ?? '')
  const [holyName,   setHolyName]   = useState(initParsed.holyName)
  const [name,       setName]       = useState(initParsed.name)
  const [photoUrl,   setPhotoUrl]   = useState(m?.photo_url ?? '')
  const [previewUrl, setPreviewUrl] = useState(m?.photo_url ?? '')
  const [uploading,  setUploading]  = useState(false)
  const [phone,      setPhone]      = useState(m?.phone ?? '')
  const [email,      setEmail]      = useState(m?.email ?? '')
  const [termYear,   setTermYear]   = useState(m?.term_year?.toString() ?? new Date().getFullYear().toString())
  const [isActive,   setIsActive]   = useState(m?.is_active ?? true)
  const [notes,      setNotes]      = useState(m?.notes ?? '')
  const [saving,     setSaving]     = useState(false)
  const [error,      setError]      = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [downloading, setDownloading] = useState(false)
  const [showCert,    setShowCert]    = useState(false)

  useEffect(() => {
    if (mode.type === 'edit' && mode.member) {
      const cur = mode.member
      const parsed = splitMemberName(cur.name ?? '')
      setHolyName(parsed.holyName)
      setName(parsed.name)
      setPhotoUrl(cur.photo_url ?? '')
      setPreviewUrl(cur.photo_url ?? '')
      setPhone(cur.phone ?? '')
      setEmail(cur.email ?? '')
      setTermYear(cur.term_year?.toString() ?? new Date().getFullYear().toString())
      setIsActive(cur.is_active ?? true)
      setNotes(cur.notes ?? '')
      const parsedRolesArr = parseRoles(cur)
      setRoles(parsedRolesArr)
      setAddingRole(parsedRolesArr.length === 0)
      if (parsedRolesArr.length > 0) { setNewDept(parsedRolesArr[0].dept); setNewRole(parsedRolesArr[0].role) }
      setShowCert(false)
    } else if (mode.type === 'add') {
      setHolyName(''); setName(''); setPhotoUrl(''); setPreviewUrl('')
      setPhone(''); setEmail('')
      setTermYear(new Date().getFullYear().toString())
      setIsActive(true); setNotes(''); setRoles([]); setAddingRole(true)
      const dept = mode.dept ?? DEPARTMENTS[0].key
      setNewDept(dept); setNewRole(DEPARTMENT_ROLES[dept]?.[0]?.role ?? '')
      setShowCert(false)
    }
  }, [mode])

  const confirmAddRole = () => {
    if (!newRole) return
    if (roles.some(r => r.dept === newDept && r.role === newRole)) return
    setRoles(prev => [...prev, { dept: newDept, role: newRole }])
    setAddingRole(false)
  }
  const removeRole = (i: number) => setRoles(prev => prev.filter((_, idx) => idx !== i))

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPreviewUrl(URL.createObjectURL(file))
    setUploading(true)
    const ext = file.name.split('.').pop()
    const fileName = `member-${Date.now()}.${ext}`
    const supabase = createClient()
    const { error: uploadErr } = await supabase.storage.from('members').upload(fileName, file, { upsert: true })
    if (uploadErr) { setPreviewUrl(m?.photo_url ?? ''); setUploading(false); return }
    const { data: { publicUrl } } = supabase.storage.from('members').getPublicUrl(fileName)
    setPhotoUrl(publicUrl); setUploading(false)
  }

  const clearPhoto = () => {
    setPhotoUrl(''); setPreviewUrl('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleDownload = async () => {
    if (mode.type !== 'view') return
    const memberToDownload = mode.member
    setDownloading(true)
    try {
      const blob     = await generateImage(memberToDownload)
      const fileName = `bang-cong-nhan-${memberToDownload.name.toLowerCase().replace(/\s+/g, '-')}.png`
      const url      = URL.createObjectURL(blob)
      Object.assign(document.createElement('a'), { href: url, download: fileName }).click()
      setTimeout(() => URL.revokeObjectURL(url), 5_000)
    } catch (e) {
      console.error(e)
    } finally {
      setDownloading(false)
    }
  }

  const submit = async () => {
    if (!name.trim())       { setError('Vui lòng nhập họ và tên.'); return }
    if (roles.length === 0) { setError('Vui lòng chọn ít nhất một vai trò.'); return }
    setSaving(true); setError(null)

    // Ghép Tên thánh và Họ tên bằng dấu phân tách |
    const joinedName = holyName.trim() ? `${holyName.trim()} | ${name.trim()}` : name.trim()

    const payload = {
      name:       joinedName,
      department: roles[0].dept,
      role:       JSON.stringify(roles),
      photo_url:  photoUrl || null,
      phone:      phone.trim() || null,
      email:      email.trim() || null,
      term_year:  termYear ? parseInt(termYear) : null,
      is_active:  isActive,
      notes:      notes.trim() || null,
    }

    let data: BqtMember | null = null
    let err: { message: string } | null = null
    if (isEdit && m) {
      const res = await createClient().from('bqt_members').update(payload).eq('id', m.id).select('*').single()
      data = res.data; err = res.error
    } else {
      const res = await createClient().from('bqt_members').insert([{ ...payload, sort_order: 0 }]).select('*').single()
      data = res.data; err = res.error
    }
    setSaving(false)
    if (err) { setError('Lỗi: ' + err.message); return }
    onSaved(data!)
  }

  const newRoleDuty = getRoleDuty(newDept, newRole)

  if (mode.type === 'view') {
    const member = mode.member
    const memberRoles = parseRoles(member)

    return (
      <>
        <AdminModal onClose={onClose} maxWidth="max-w-[640px]" disabled={downloading}>
          <ModalHeader
            title="HỒ SƠ THÀNH VIÊN BAN QUẢN TRỊ"
            subtitle="Thông tin chi tiết và bằng công nhận chính thức"
            onClose={onClose}
          />

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-6 bg-white">
            <div className="flex flex-col gap-6">
              {/* Basic Info */}
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-50 border border-gray-200 flex items-center justify-center shrink-0">
                  {member.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={member.photo_url} alt={member.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full bg-gray-50">
                      <UserCircle size={40} strokeWidth={1.5} className="text-gray-300" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className="text-[17px] font-bold text-gray-900 leading-tight uppercase tracking-wide">
                    {(() => {
                      const { holyName, name: rawName } = splitMemberName(member.name)
                      return holyName ? `${holyName} ${rawName}` : rawName
                    })()}
                  </h4>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    {member.term_year && (
                      <span className="text-[11px] font-semibold px-2 py-0.5 inline-flex items-center rounded uppercase tracking-wider bg-blue-50 text-vatican-blue border border-blue-200/50">
                        Nhiệm kỳ {member.term_year}
                      </span>
                    )}
                    <span className={`text-[11px] font-semibold px-2 py-0.5 inline-flex items-center rounded uppercase tracking-wider ${
                      member.is_active ? 'bg-green-50 text-green-700 border border-green-200/50' : 'bg-gray-50 text-gray-500 border border-gray-200/50'
                    }`}>
                      {member.is_active ? 'Hoạt động' : 'Đã nghỉ'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100/80" />

              {/* Roles and Depts */}
              <div>
                <p className="text-[13px] font-bold uppercase tracking-widest text-gray-400 mb-2">Chức vụ & Ban phụ trách</p>
                <div className="flex flex-col gap-2">
                  {memberRoles.map((r, i) => {
                    const dept = DEPARTMENTS.find(d => d.key === r.dept)
                    const duty = getRoleDuty(r.dept, r.role)
                    return (
                      <div key={i} className="px-4 py-3 rounded-lg border border-gray-200 bg-white">
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className="text-[14px] font-bold text-gray-800">{r.role}</span>
                          <span className="text-[12px] text-gray-400 font-medium">{dept?.label ?? r.dept}</span>
                        </div>
                        {duty && <p className="text-[12px] text-gray-500 mt-1 leading-relaxed font-normal">{duty}</p>}
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="border-t border-gray-100/80" />

              {/* Contact Details */}
              <div>
                <p className="text-[13px] font-bold uppercase tracking-widest text-gray-400 mb-3">Thông tin liên hệ</p>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-3 text-[14px]">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 shrink-0">
                      <Phone size={13} />
                    </div>
                    {member.phone ? (
                      <a href={`tel:${member.phone}`} className="font-bold text-vatican-blue hover:text-vatican-blue-dark transition-colors hover:underline">
                        {member.phone}
                      </a>
                    ) : (
                      <span className="text-gray-400 italic font-medium">Chưa cập nhật số điện thoại</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-[14px] mt-1.5">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 shrink-0">
                      <Mail size={13} />
                    </div>
                    {member.email ? (
                      <a href={`mailto:${member.email}`} className="font-bold text-vatican-blue hover:text-vatican-blue-dark transition-colors hover:underline">
                        {member.email}
                      </a>
                    ) : (
                      <span className="text-gray-400 italic font-medium">Chưa cập nhật email</span>
                    )}
                  </div>
                </div>
              </div>

              {member.notes && (
                <>
                  <div className="border-t border-gray-100/80" />
                  <div>
                    <p className="text-[13px] font-bold uppercase tracking-widest text-gray-400 mb-2">Ghi chú hành chính</p>
                    <p className="text-[13px] text-gray-600 leading-relaxed bg-amber-50/40 border border-amber-100 rounded-lg p-3 italic">
                      {member.notes}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 bg-gray-50/50 px-6 py-4 shrink-0 flex justify-end gap-2">
            <AdminButton onClick={onClose} variant="secondary" className="text-[14px]">
              Đóng
            </AdminButton>
            <AdminButton
              onClick={() => setShowCert(true)}
              variant="secondary"
              className="text-[14px]"
            >
              <Award size={14} className="text-vatican-blue" />
              Bằng công nhận
            </AdminButton>
            <AdminButton
              onClick={() => onChangeMode({ type: 'edit', member })}
              className="text-[14px]"
            >
              <Pencil size={14} />
              Chỉnh sửa
            </AdminButton>
          </div>
        </AdminModal>

        {showCert && (
          <AdminModal onClose={() => setShowCert(false)} maxWidth="max-w-[640px]">
            <ModalHeader
              title="BẰNG CÔNG NHẬN CHÍNH THỨC"
              subtitle="Khổ A4 ngang • Phát hành bởi Ban Quản Trị"
              onClose={() => setShowCert(false)}
            />

            {/* Body */}
            <div className="flex-1 px-6 py-6 bg-white flex flex-col items-center justify-center">
              <div className="w-full rounded-lg overflow-hidden bg-white border border-gray-200">
                <CertificatePreview member={member} />
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 bg-gray-50/50 px-6 py-4 shrink-0 flex justify-end gap-2">
              <AdminButton onClick={() => setShowCert(false)} variant="secondary" className="text-[14px]">
                Đóng
              </AdminButton>
              <AdminButton
                onClick={handleDownload}
                disabled={downloading}
                className="text-[14px]"
              >
                {downloading ? (
                  <><Loader2 size={14} className="animate-spin" />Đang tải...</>
                ) : (
                  <><Download size={14} />Tải bằng công nhận</>
                )}
              </AdminButton>
            </div>
          </AdminModal>
        )}
      </>
    )
  }

  return (
    <AdminModal onClose={onClose} maxWidth="max-w-[640px]" disabled={saving}>

      <ModalHeader
        title={isEdit ? 'Chỉnh sửa thành viên' : 'Thêm thành viên mới'}
        onClose={onClose}
      />

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-6 py-6 bg-white">
        <div className="flex flex-col gap-5">

          {/* Avatar + Name + Status */}
          <div className="flex gap-4 items-start">
            {/* Avatar */}
            <div className="shrink-0 flex flex-col items-center gap-1.5">
              <div
                className="relative w-[72px] h-[72px] rounded-full overflow-hidden bg-gray-100 border border-gray-200 cursor-pointer group"
                onClick={() => !uploading && !saving && fileInputRef.current?.click()}
              >
                {previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={previewUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <UserCircle size={28} strokeWidth={1.5} className="text-gray-300" />
                  </div>
                )}
                <div className={`absolute inset-0 flex items-center justify-center bg-black/40 rounded-full transition-opacity ${uploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                  {uploading
                    ? <Loader2 size={16} className="animate-spin text-white" />
                    : <Upload size={13} className="text-white" />}
                </div>
              </div>
              {previewUrl && !uploading && (
                <button type="button" onClick={clearPhoto}
                  className="text-[11px] text-gray-400 hover:text-red-500 transition-colors">
                  Xóa ảnh
                </button>
              )}
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileChange} />
            </div>

            {/* Name + Term + Status */}
            <div className="flex-1 flex flex-col gap-3 pt-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <AdminLabel>Tên thánh</AdminLabel>
                  <AdminInput type="text" value={holyName} onChange={e => setHolyName(e.target.value)}
                    placeholder="Giuse" />
                </div>
                <div>
                  <AdminLabel>Họ và tên <span className="text-red-400">*</span></AdminLabel>
                  <AdminInput type="text" value={name} onChange={e => setName(e.target.value)}
                    placeholder="Nguyễn Văn A" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <AdminLabel>Nhiệm kỳ</AdminLabel>
                  <AdminInput type="number" value={termYear} onChange={e => setTermYear(e.target.value)}
                    placeholder="2026" min={2020} max={2100} />
                </div>
                <div>
                  <AdminLabel>Trạng thái</AdminLabel>
                  <div className="flex items-center justify-between px-3 h-9 rounded-lg border border-gray-200 bg-white">
                    <span className="text-[14px] font-bold text-gray-700">{isActive ? 'Hoạt động' : 'Đã nghỉ'}</span>
                    <button type="button" onClick={() => setIsActive(v => !v)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 shrink-0 ${isActive ? 'bg-green-500' : 'bg-gray-300'}`}>
                      <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform duration-200 ${isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100" />

          {/* Roles */}
          <div>
            <p className="text-[13px] font-bold uppercase tracking-widest text-gray-400 mb-2">Ban & Vai trò <span className="text-red-400">*</span></p>

            {roles.length > 0 && (
              <div className="flex flex-col divide-y divide-gray-100 border border-gray-200 rounded-lg overflow-hidden mb-2.5 bg-white">
                {roles.map((assignment, i) => {
                  const dept = DEPARTMENTS.find(d => d.key === assignment.dept)
                  const duty = getRoleDuty(assignment.dept, assignment.role)
                  return (
                    <div key={i} className="flex items-start gap-2 px-3 py-2.5 bg-white">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className="text-[15px] font-bold text-vatican-dark">{assignment.role}</span>
                          <span className="text-[13px] text-gray-400">{dept?.label ?? assignment.dept}</span>
                        </div>
                        {duty && <p className="text-[12px] text-gray-500 mt-1 leading-relaxed">{duty}</p>}
                      </div>
                      <button type="button" onClick={() => removeRole(i)}
                        className="mt-0.5 w-6 h-6 flex items-center justify-center rounded text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors shrink-0">
                        <X size={12} />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}

            {addingRole ? (
              <div className="flex flex-col gap-2 p-3 rounded-lg border border-gray-200 bg-gray-50">
                <div className="flex gap-2">
                  <AdminSelect
                    value={newDept}
                    onChange={setNewDept}
                    options={DEPARTMENTS.map(d => ({ value: d.key, label: d.label }))}
                    placeholder="Chọn ban..."
                  />
                  <AdminSelect
                    value={newRole}
                    onChange={setNewRole}
                    options={(DEPARTMENT_ROLES[newDept] ?? []).map(r => ({ value: r.role, label: r.role }))}
                    placeholder="Chọn chức vụ..."
                  />
                </div>
                {newRoleDuty && (
                  <div className="px-3 py-2 rounded-lg bg-white border border-gray-200">
                    <p className="text-[13px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Nhiệm vụ</p>
                    <p className="text-[12px] text-gray-600 leading-relaxed">{newRoleDuty}</p>
                  </div>
                )}
                <div className="flex gap-2 justify-end">
                  {roles.length > 0 && (
                    <AdminButton type="button" onClick={() => setAddingRole(false)} variant="secondary" size="compact" className="text-[13px]">
                      Hủy
                    </AdminButton>
                  )}
                  <AdminButton type="button" onClick={confirmAddRole} disabled={!newRole} variant="primary" size="compact" className="text-[13px]">
                    <Check size={12} /> Thêm
                  </AdminButton>
                </div>
              </div>
            ) : (
              <button type="button" onClick={() => setAddingRole(true)}
                className="flex items-center gap-1.5 text-[13px] font-bold text-vatican-blue hover:text-vatican-blue-dark transition-colors py-1">
                <Plus size={13} /> Thêm vai trò
              </button>
            )}
          </div>

          <div className="border-t border-gray-100" />

          {/* Contact */}
          <div>
            <p className="text-[13px] font-bold uppercase tracking-widest text-gray-400 mb-3">Thông tin liên hệ</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <AdminLabel>Điện thoại</AdminLabel>
                <AdminInput type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                  placeholder="0901 234 567" />
              </div>
              <div>
                <AdminLabel>Email</AdminLabel>
                <AdminInput type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="email@gmail.com" />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <AdminLabel>Ghi chú</AdminLabel>
            <AdminTextarea value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="Thông tin thêm..."
              rows={2} />
          </div>

        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 bg-gray-50/50 px-6 py-4 shrink-0 flex items-center gap-3">
        {error && (
          <div className="flex items-center gap-1.5 text-[13px] font-semibold text-red-600 flex-1 min-w-0">
            <AlertCircle size={12} className="shrink-0" />
            <span className="truncate">{error}</span>
          </div>
        )}
        <div className="flex gap-2 ml-auto shrink-0">
          <AdminButton onClick={onClose} disabled={saving} variant="secondary" className="text-[14px]">
            Hủy
          </AdminButton>
          <AdminButton onClick={submit} disabled={saving || uploading} variant="primary" className="text-[14px]">
            {saving
              ? <><Loader2 size={13} className="animate-spin" />Đang lưu...</>
              : isEdit ? 'Cập nhật' : 'Lưu thành viên'}
          </AdminButton>
        </div>
      </div>

    </AdminModal>
  )
}
