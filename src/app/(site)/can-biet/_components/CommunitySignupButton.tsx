'use client'

import { useState } from 'react'
import { X, Users, CheckCircle, Loader2 } from 'lucide-react'

type State = 'idle' | 'open' | 'submitting' | 'done' | 'error'

export function CommunitySignupButton() {
  const [state, setState] = useState<State>('idle')
  const [name, setName]   = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState<string | null>(null)

  const open  = () => { setState('open'); setError(null) }
  const close = () => { if (state === 'submitting') return; setState('idle'); setName(''); setPhone(''); setError(null) }

  const submit = async () => {
    if (!name.trim())  { setError('Vui lòng nhập họ tên.'); return }
    if (!phone.trim()) { setError('Vui lòng nhập số điện thoại.'); return }
    setState('submitting')
    setError(null)
    try {
      const res = await fetch('/api/community-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: name.trim(), phone: phone.trim() }),
      })
      if (!res.ok) throw new Error()
      setState('done')
    } catch {
      setError('Có lỗi xảy ra, vui lòng thử lại.')
      setState('open')
    }
  }

  const inputCls = 'w-full h-11 px-4 rounded-xl border border-gray-200 text-[16px] text-vatican-dark placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-vatican-blue/30 focus:border-vatican-blue transition-colors bg-white'

  return (
    <>
      {/* CTA Button */}
      <div className="px-4 lg:px-5 py-4 border-t border-gray-100">
        <button
          onClick={open}
          data-testid="community-signup-btn"
          className="w-full flex items-center justify-center gap-2 h-11 rounded-xl bg-vatican-blue text-white text-[16px] font-bold hover:bg-vatican-blue-dark transition-colors"
        >
          <Users size={16} strokeWidth={2.5} />
          Tham gia cộng đồng
        </button>
      </div>

      {/* Modal */}
      {(state === 'open' || state === 'submitting' || state === 'done' || state === 'error') && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={close} />
          <div className="relative bg-white w-full sm:max-w-[440px] rounded-t-2xl sm:rounded-2xl flex flex-col overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-vatican-blue/10 flex items-center justify-center">
                  <Users size={15} className="text-vatican-blue" />
                </div>
                <p className="text-[16px] font-black text-vatican-dark uppercase tracking-wide">
                  Tham gia cộng đồng
                </p>
              </div>
              <button onClick={close} disabled={state === 'submitting'}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                <X size={17} />
              </button>
            </div>

            {/* Body */}
            <div className="px-5 py-5">
              {state === 'done' ? (
                <div className="flex flex-col items-center gap-3 py-4 text-center">
                  <CheckCircle size={48} strokeWidth={1.5} className="text-green-500" />
                  <p className="text-[18px] font-black text-vatican-dark">Cảm ơn bạn!</p>
                  <p className="text-[16px] text-gray-500 leading-relaxed">
                    Chúng tôi đã nhận được thông tin của bạn và sẽ liên hệ sớm để chào đón bạn vào cộng đồng.
                  </p>
                  <button onClick={close}
                    className="mt-2 px-6 h-10 rounded-xl bg-vatican-blue text-white text-[16px] font-bold hover:bg-vatican-blue-dark transition-colors">
                    Đóng
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <p className="text-[16px] text-gray-500 leading-relaxed">
                    Để lại thông tin bên dưới — chúng tôi sẽ liên hệ và chào đón bạn vào cộng đồng Cha Trương Bửu Diệp.
                  </p>
                  <div className="flex flex-col gap-3">
                    <div>
                      <label className="text-[13px] font-bold uppercase tracking-widest text-gray-400 block mb-1.5">
                        Họ và tên <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text" value={name} onChange={e => setName(e.target.value)}
                        placeholder="Nguyễn Văn A"
                        className={inputCls}
                        disabled={state === 'submitting'}
                      />
                    </div>
                    <div>
                      <label className="text-[13px] font-bold uppercase tracking-widest text-gray-400 block mb-1.5">
                        Số điện thoại <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                        placeholder="0901 234 567"
                        className={inputCls}
                        disabled={state === 'submitting'}
                      />
                    </div>
                  </div>
                  {error && (
                    <p className="text-[14px] font-semibold text-red-500">{error}</p>
                  )}
                  <button
                    onClick={submit} disabled={state === 'submitting'}
                    className="w-full flex items-center justify-center gap-2 h-11 rounded-xl bg-vatican-blue text-white text-[16px] font-bold hover:bg-vatican-blue-dark disabled:opacity-60 transition-colors mt-1"
                  >
                    {state === 'submitting'
                      ? <><Loader2 size={15} className="animate-spin" />Đang gửi...</>
                      : 'Gửi thông tin'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
