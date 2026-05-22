'use client'

import { useState, useEffect, useTransition } from 'react'
import { Plus, UserPlus, Minus } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { AdminLabel, AdminButton, AdminInput, AdminTextarea, ModalHeader, AdminSelect, ModalFooter } from '@/components/admin/ui'
import { AdminModal } from '@/components/admin/AdminModal'

type Trip = { id: string; dates: string; title: string }

export function AddRegistrationButton() {
  const [open, setOpen] = useState(false)
  const [trips, setTrips] = useState<Trip[]>([])
  const [tripId, setTripId] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [numPeople, setNumPeople] = useState(1)
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const [, startTransition] = useTransition()

  useEffect(() => {
    if (!open) return
    createClient()
      .from('pilgrimage_trips')
      .select('id, dates, title')
      .eq('status', 'open')
      .order('sort_order')
      .then(({ data }: { data: any }) => setTrips(data ?? []))
  }, [open])

  const selectedTrip = trips.find(t => t.id === tripId)

  const reset = () => {
    setName(''); setPhone(''); setNumPeople(1); setNotes('')
    setTripId(''); setError(null)
  }

  const close = () => { reset(); setOpen(false) }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !phone.trim()) return
    setSubmitting(true); setError(null)
    const supabase = createClient()
    const { error: err } = await supabase.from('pilgrimage_registrations').insert([{
      name: name.trim(),
      phone: phone.trim(),
      num_people: numPeople,
      notes: notes.trim(),
      trip_id: tripId || null,
      trip_title: selectedTrip?.title ?? '',
      trip_dates: selectedTrip?.dates ?? '',
      status: 'pending',
    }])
    setSubmitting(false)
    if (err) { setError('Có lỗi xảy ra. Vui lòng thử lại.') }
    else { close(); startTransition(() => router.refresh()) }
  }


  return (
    <>
      <AdminButton onClick={() => setOpen(true)} className="px-6 shrink-0 text-[14px]">
        <Plus size={13} strokeWidth={2.5} />
        Nhập thủ công
      </AdminButton>

      {open && (
        <AdminModal onClose={close} maxWidth="max-w-md" disabled={submitting}>
          <ModalHeader
            title="Thêm đăng ký"
            onClose={close}
          />

          {/* Body */}
          <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <AdminLabel>Chuyến hành hương</AdminLabel>
                <AdminSelect
                  value={tripId}
                  onChange={setTripId}
                  placeholder="— Chọn chuyến —"
                  options={trips.map(t => ({ value: t.id, label: `${t.dates} · ${t.title}` }))}
                />
              </div>

              <div className="flex flex-col gap-1">
                <AdminLabel>Họ và tên <span className="text-red-500">*</span></AdminLabel>
                <AdminInput type="text" required value={name} onChange={e => setName(e.target.value)}
                  placeholder="Nguyễn Văn A" />
              </div>

              <div className="flex flex-col gap-1">
                <AdminLabel>Số điện thoại <span className="text-red-500">*</span></AdminLabel>
                <AdminInput type="tel" required value={phone} onChange={e => setPhone(e.target.value)}
                  placeholder="0912 345 678" />
              </div>

              <div className="flex flex-col gap-1">
                <AdminLabel>Số người đi cùng</AdminLabel>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => setNumPeople(p => Math.max(1, p - 1))}
                    className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-vatican-blue hover:text-vatican-blue transition-colors">
                    <Minus size={14} />
                  </button>
                  <span className="text-[16px] font-bold text-vatican-dark w-8 text-center">{numPeople}</span>
                  <button type="button" onClick={() => setNumPeople(p => p + 1)}
                    className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-vatican-blue hover:text-vatican-blue transition-colors">
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <AdminLabel>Ghi chú</AdminLabel>
                <AdminTextarea value={notes} onChange={e => setNotes(e.target.value)}
                  placeholder="Yêu cầu đặc biệt..."
                  rows={2} />
              </div>
            </div>

            <ModalFooter error={error} onCancel={close} submitting={submitting}>
              <AdminButton type="submit" disabled={submitting} variant="primary">
                <UserPlus size={13} strokeWidth={2.5} />
                {submitting ? 'Đang lưu...' : 'Lưu'}
              </AdminButton>
            </ModalFooter>
          </form>
        </AdminModal>
      )}
    </>
  )
}
