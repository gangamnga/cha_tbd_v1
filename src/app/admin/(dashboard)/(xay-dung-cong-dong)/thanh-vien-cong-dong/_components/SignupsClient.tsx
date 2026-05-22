'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { HeartHandshake, Phone, Trash2, Search, X } from 'lucide-react'
import { ConfirmDeleteModal } from '@/components/admin/ConfirmDeleteModal'
import { ExportPDFButton } from '@/components/admin/ExportPDFButton'
import { AdminPagination } from '@/components/admin/AdminPagination'
import { EmptyState } from '@/components/admin/EmptyState'

type Signup = { id: string; full_name: string; phone: string; created_at: string }

function SignupRow({ signup, onDeleted }: { signup: Signup; onDeleted: () => void }) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const remove = async () => {
    setDeleting(true)
    await createClient().from('community_signups').delete().eq('id', signup.id)
    onDeleted()
  }

  return (
    <div className="flex items-center gap-4 px-5 py-3.5 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
      <div className="w-8 h-8 rounded-lg bg-vatican-blue/10 flex items-center justify-center shrink-0">
        <span className="text-[13px] font-black text-vatican-blue uppercase select-none">
          {signup.full_name.charAt(0)}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[16px] font-bold text-vatican-dark truncate">{signup.full_name}</p>
        <p className="text-[13px] text-gray-400 mt-0.5">
          {new Date(signup.created_at).toLocaleDateString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
          })}
        </p>
      </div>

      <a href={`tel:${signup.phone}`}
        className="flex items-center gap-1.5 text-[15px] text-vatican-blue font-medium hover:underline transition-colors shrink-0">
        <Phone size={13} className="shrink-0" />
        {signup.phone}
      </a>

      <button
        onClick={() => setShowConfirm(true)}
        disabled={deleting}
        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50 shrink-0"
        title="Xóa"
      >
        <Trash2 size={15} />
      </button>

      {showConfirm && (
        <ConfirmDeleteModal
          title="Xóa thành viên?"
          description={signup.full_name}
          onConfirm={remove}
          onCancel={() => setShowConfirm(false)}
          loading={deleting}
        />
      )}
    </div>
  )
}

export function SignupsClient({
  initial,
  defaultQ,
  count,
  currentPage,
  totalPages,
  from,
  to,
}: {
  initial: Signup[]
  defaultQ: string
  count: number
  currentPage: number
  totalPages: number
  from: number
  to: number
}) {
  const [signups, setSignups] = useState(initial)
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [q, setQ] = useState(defaultQ)
  const [searchOpen, setSearchOpen] = useState(!!defaultQ)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { if (searchOpen) inputRef.current?.focus() }, [searchOpen])

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const p = new URLSearchParams()
    if (q.trim()) p.set('q', q.trim())
    startTransition(() => router.push(`/admin/thanh-vien-cong-dong${p.toString() ? '?' + p.toString() : ''}`))
  }

  const clearSearch = () => {
    setQ(''); setSearchOpen(false)
    startTransition(() => router.push('/admin/thanh-vien-cong-dong'))
  }

  return (
    <>
      {/* Action Bar */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2 justify-between bg-gray-50/50">
        <p className="text-[15px] text-gray-500 font-medium">
          <strong className="text-vatican-dark">{count}</strong> người đăng ký
        </p>
        <div className="flex items-center gap-2">
          {searchOpen ? (
            <form onSubmit={submitSearch} className="flex items-center gap-2 bg-white border border-vatican-blue rounded-lg px-3 h-9 transition-colors w-[220px]">
              <Search size={14} className="text-gray-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder="Tìm tên, số điện thoại..."
                className="flex-1 text-[14px] outline-none bg-transparent placeholder:text-gray-400 min-w-0"
              />
              <button type="button" onClick={clearSearch} className="text-gray-400 hover:text-gray-600 shrink-0">
                <X size={13} />
              </button>
            </form>
          ) : (
            <button onClick={() => setSearchOpen(true)} title="Tìm kiếm"
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-500 hover:border-vatican-blue hover:text-vatican-blue transition-colors shrink-0">
              <Search size={16} />
            </button>
          )}
          <div className="h-6 w-px bg-gray-200" />
          <ExportPDFButton
            title="Danh sách thành viên cộng đồng"
            headers={['Họ và tên', 'Số điện thoại', 'Ngày đăng ký']}
            rows={signups.map(s => [
              s.full_name,
              s.phone,
              new Date(s.created_at).toLocaleDateString('vi-VN', {
                day: '2-digit', month: '2-digit', year: 'numeric',
              }),
            ])}
          />
        </div>
      </div>

      {/* List */}
      {signups.length === 0 ? (
        <EmptyState
          icon={<HeartHandshake size={22} strokeWidth={1.5} className="text-gray-300" />}
          message={defaultQ ? `Không tìm thấy kết quả cho "${defaultQ}"` : 'Chưa có ai đăng ký.'}
        />
      ) : (
        <div className="divide-y divide-gray-100 max-h-[calc(100vh-280px)] overflow-y-auto">
          {signups.map(s => (
            <SignupRow
              key={s.id}
              signup={s}
              onDeleted={() => setSignups(prev => prev.filter(x => x.id !== s.id))}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      <AdminPagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalCount={count}
        itemName="người"
        from={from}
        to={to}
      />
    </>
  )
}
