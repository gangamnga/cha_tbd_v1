'use client'

import { useState } from 'react'
import { Award, Download, Loader2 } from 'lucide-react'
import type { BqtMember } from './constants'
import { DEPARTMENTS, splitMemberName } from './constants'
import { AdminModal } from '@/components/admin/AdminModal'
import { AdminButton, ModalHeader } from '@/components/admin/ui'

// ── Helpers ───────────────────────────────────────────────────────────────────

type RoleAssignment = { dept: string; role: string }

function parseRoles(member: BqtMember): RoleAssignment[] {
  if (!member.role) return []
  try {
    const parsed = JSON.parse(member.role)
    if (Array.isArray(parsed)) return parsed
  } catch {}
  return [{ dept: member.department, role: member.role }]
}

function dateStr() {
  const t = new Date()
  return `ngày ${t.getDate()} tháng ${t.getMonth() + 1} năm ${t.getFullYear()}`
}

// ── Tạo ảnh 4K bằng Canvas ───────────────────────────────────────────────────

export async function generateImage(member: BqtMember): Promise<Blob> {
  // A4 nằm ngang ở 300dpi = 3508 × 2480
  const W = 3508
  const H = 2480
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!

  // 1. Nền SVG
  await new Promise<void>((resolve, reject) => {
    const img = new Image()
    img.onload = () => { ctx.drawImage(img, 0, 0, W, H); resolve() }
    img.onerror = reject
    img.src = '/templates/bang-cong-nhan.svg'
  })

  // Helpers
  const pt = (n: number) => n * (300 / 72)            // pt → px tại 300dpi
  const cx = 0.5 * W                                   // tâm vùng nội dung: hoàn toàn căn giữa
  const lh  = (size: number, mult = 1) => pt(size) * mult

  ctx.textAlign    = 'center'
  ctx.textBaseline = 'alphabetic'

  let y = 0.255 * H

  // BẰNG CÔNG NHẬN
  ctx.font      = `bold ${pt(14)}px "Times New Roman", serif`
  ctx.fillStyle = '#7A4F00'
  ctx.fillText('BẰNG CÔNG NHẬN', cx, y)
  y += lh(14, 1.6)

  // Tên cộng đồng
  ctx.font      = `${pt(9)}px "Times New Roman", serif`
  ctx.fillStyle = '#555555'
  ctx.fillText('Cộng đồng Cha Phanxicô Trương Bửu Diệp', cx, y)
  y += lh(9, 4)

  // Trân trọng công nhận
  ctx.font      = `italic ${pt(10)}px "Times New Roman", serif`
  ctx.fillStyle = '#666666'
  ctx.fillText('Trân trọng công nhận', cx, y)
  y += lh(10, 1.6)

  // Tên thành viên
  ctx.font      = `bold ${pt(26)}px "Times New Roman", serif`
  ctx.fillStyle = '#012642'
  const { holyName, name: rawName } = splitMemberName(member.name)
  const fullDisplayName = holyName ? `${holyName} ${rawName}` : rawName
  ctx.fillText(fullDisplayName.toUpperCase(), cx, y)
  y += lh(26, 1.2)

  // Thanh vàng
  const len  = 0.33 * W
  const grad = ctx.createLinearGradient(cx - len / 2, y, cx + len / 2, y)
  grad.addColorStop(0, '#B27408'); grad.addColorStop(0.5, '#FCE585'); grad.addColorStop(1, '#C49731')
  ctx.strokeStyle = grad
  ctx.lineWidth   = pt(1.5)
  ctx.beginPath(); ctx.moveTo(cx - len / 2, y); ctx.lineTo(cx + len / 2, y); ctx.stroke()
  y += lh(12, 2)

  // Vai trò (2 màu cùng dòng)
  const boldFont   = `bold ${pt(12)}px "Times New Roman", serif`
  const italicFont = `italic ${pt(12)}px "Times New Roman", serif`
  const roles = parseRoles(member)

  for (const r of roles) {
    const dept = DEPARTMENTS.find(d => d.key === r.dept)?.label ?? r.dept
    const sep  = '   ·   '
    ctx.font = boldFont;   const rW = ctx.measureText(r.role).width
    ctx.font = italicFont; const sW = ctx.measureText(sep).width
                           const dW = ctx.measureText(dept).width
    let x = cx - (rW + sW + dW) / 2

    ctx.textAlign = 'left'
    ctx.font = boldFont;   ctx.fillStyle = '#012642'; ctx.fillText(r.role, x, y); x += rW
    ctx.font = italicFont; ctx.fillStyle = '#7A4F00'; ctx.fillText(sep + dept, x, y)
    ctx.textAlign = 'center'
    y += lh(12, 1.9)
  }

  y += lh(9, 0.8)

  // Nhiệm kỳ
  if (member.term_year) {
    ctx.font      = `italic ${pt(9)}px "Times New Roman", serif`
    ctx.fillStyle = '#aaaaaa'
    ctx.fillText(`Nhiệm kỳ ${member.term_year}`, cx, y)
    y += lh(9, 1.6)
  }

  // Ngày
  ctx.font      = `italic ${pt(9)}px "Times New Roman", serif`
  ctx.fillStyle = '#888888'
  ctx.fillText(`TP. Hồ Chí Minh, ${dateStr()}`, cx, y)
  y += lh(9, 2.5)

  // Khối chữ ký ở hai bên
  const sigY = y
  const leftX = 0.28 * W
  const rightX = 0.72 * W

  // Bên trái: Đại diện Ban Thường trực
  ctx.textAlign = 'center'
  ctx.font      = `bold ${pt(10)}px "Times New Roman", serif`
  ctx.fillStyle = '#012642'
  ctx.fillText('Đại diện Ban Thường trực', leftX, sigY)

  // Bên phải: Linh mục Linh hướng / Ký tên & đóng dấu
  ctx.font      = `bold ${pt(10)}px "Times New Roman", serif`
  ctx.fillStyle = '#012642'
  ctx.fillText('Linh mục Linh hướng', rightX, sigY)

  ctx.font      = `italic ${pt(8)}px "Times New Roman", serif`
  ctx.fillStyle = '#888888'
  ctx.fillText('(Ký tên và đóng dấu)', rightX, sigY + pt(12))

  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(b => b ? resolve(b) : reject(new Error('toBlob failed')), 'image/png')
  )
}

// ── Preview trong modal ───────────────────────────────────────────────────────

export function CertificatePreview({ member }: { member: BqtMember }) {
  const roles = parseRoles(member)
  const s = (n: number) => `${n}px`

  return (
    <div className="relative w-full" style={{ aspectRatio: '297 / 210' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/templates/bang-cong-nhan.svg" alt="" className="absolute inset-0 w-full h-full" style={{ objectFit: 'fill' }} />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center" style={{ paddingLeft: '8%', paddingRight: '8%', paddingTop: '22%', paddingBottom: '5%' }}>
        <p style={{ fontFamily: "'Times New Roman',serif", fontSize: s(13), fontWeight: 'bold', letterSpacing: 5, color: '#7A4F00', marginBottom: 4 }}>
          BẰNG CÔNG NHẬN
        </p>
        <p style={{ fontFamily: "'Times New Roman',serif", fontSize: s(8), color: '#555', marginBottom: 12 }}>
          Cộng đồng Cha Phanxicô Trương Bửu Diệp
        </p>
        <p style={{ fontFamily: "'Times New Roman',serif", fontSize: s(9), color: '#666', fontStyle: 'italic', marginBottom: 5 }}>
          Trân trọng công nhận
        </p>
        <p style={{ fontFamily: "'Times New Roman',serif", fontSize: s(22), fontWeight: 'bold', color: '#012642', letterSpacing: 3, lineHeight: 1.2, marginBottom: 7 }}>
          {(() => {
            const { holyName, name: rawName } = splitMemberName(member.name)
            const fullDisplayName = holyName ? `${holyName} ${rawName}` : rawName
            return fullDisplayName.toUpperCase()
          })()}
        </p>
        <div style={{ width: '75%', height: 1.5, background: 'linear-gradient(to right,#B27408,#FCE585,#C49731)', marginBottom: 8 }} />
        <div style={{ marginBottom: 12 }}>
          {roles.map((r, i) => {
            const dept = DEPARTMENTS.find(d => d.key === r.dept)?.label ?? r.dept
            return (
              <p key={i} style={{ fontFamily: "'Times New Roman',serif", fontSize: s(10), color: '#012642', fontWeight: 'bold', lineHeight: 1.85 }}>
                {r.role}{' '}
                <span style={{ color: '#7A4F00', fontStyle: 'italic', fontWeight: 'normal' }}>· {dept}</span>
              </p>
            )
          })}
        </div>
        {member.term_year && (
          <p style={{ fontFamily: "'Times New Roman',serif", fontSize: s(8), color: '#aaa', fontStyle: 'italic', marginBottom: 6 }}>
            Nhiệm kỳ {member.term_year}
          </p>
        )}
        <p style={{ fontFamily: "'Times New Roman',serif", fontSize: s(8), color: '#888', fontStyle: 'italic' }}>
          TP. Hồ Chí Minh, {dateStr()}
        </p>
        <div className="w-full flex justify-between mt-3 px-8 text-center" style={{ fontFamily: "'Times New Roman',serif" }}>
          <div>
            <p style={{ fontSize: s(8), fontWeight: 'bold', color: '#012642' }}>
              Đại diện Ban Thường trực
            </p>
          </div>
          <div>
            <p style={{ fontSize: s(8), fontWeight: 'bold', color: '#012642' }}>
              Linh mục Linh hướng
            </p>
            <p style={{ fontSize: s(6.5), fontStyle: 'italic', color: '#888', marginTop: 1 }}>
              (Ký tên và đóng dấu)
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── CertificateButton ─────────────────────────────────────────────────────────

export function CertificateButton({ member }: { member: BqtMember | null }) {
  const [open,        setOpen]        = useState(false)
  const [downloading, setDownloading] = useState(false)

  const handleDownload = async () => {
    if (!member) return
    setDownloading(true)
    try {
      const blob     = await generateImage(member)
      const fileName = `bang-cong-nhan-${member.name.toLowerCase().replace(/\s+/g, '-')}.png`
      const url      = URL.createObjectURL(blob)
      Object.assign(document.createElement('a'), { href: url, download: fileName }).click()
      setTimeout(() => URL.revokeObjectURL(url), 5_000)
    } catch (e) {
      console.error(e)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <>
      <AdminButton
        onClick={() => setOpen(true)}
        disabled={!member}
        title={!member ? 'Chọn đúng 1 thành viên để in bằng' : `Bằng công nhận — ${member.name}`}
        variant="secondary"
        className="shrink-0"
      >
        <Award size={15} strokeWidth={2} className="text-vatican-blue" />
        Bằng công nhận
      </AdminButton>

      {open && member && (
        <AdminModal onClose={() => setOpen(false)} maxWidth="max-w-4xl" disabled={downloading}>
          {/* Header */}
          <ModalHeader
            title="Bằng công nhận"
            subtitle={member.name}
            icon={<Award size={16} />}
            onClose={() => setOpen(false)}
            disabled={downloading}
          />

          {/* Preview */}
          <div className="flex-1 overflow-auto p-5 bg-gray-100 flex items-center justify-center">
            <div className="w-full rounded overflow-hidden border border-gray-200">
              <CertificatePreview member={member} />
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 shrink-0 flex justify-end gap-2">
            <AdminButton
              onClick={() => setOpen(false)}
              variant="secondary"
              disabled={downloading}
            >
              Đóng
            </AdminButton>
            <AdminButton
              onClick={handleDownload}
              disabled={downloading}
              variant="primary"
            >
              {downloading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Đang tạo...
                </>
              ) : (
                <>
                  <Download size={14} />
                  Tải hình ảnh
                </>
              )}
            </AdminButton>
          </div>
        </AdminModal>
      )}
    </>
  )
}
