'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { AdminInput, AdminLabel, AdminButton } from '@/components/admin/ui'
import { Lock, Mail } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Email hoặc mật khẩu không đúng.')
      setLoading(false)
    } else {
      router.push('/admin/dang-ky-hanh-huong')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-[400px]">
        {/* Logo area */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-vatican-blue rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock size={24} className="text-white" />
          </div>
          <h1 className="text-[16px] font-black text-vatican-dark">Admin Portal</h1>
          <p className="text-[16px] text-gray-500 mt-1">Cha Phanxicô Trương Bửu Diệp</p>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <AdminLabel htmlFor="email" className="normal-case tracking-normal text-gray-600 text-[14px] font-bold">Email</AdminLabel>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <AdminInput id="email" type="email" placeholder="admin@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="pl-9" />
              </div>
            </div>
            <div className="space-y-1.5">
              <AdminLabel htmlFor="password" className="normal-case tracking-normal text-gray-600 text-[14px] font-bold">Mật khẩu</AdminLabel>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <AdminInput id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="pl-9" />
              </div>
            </div>
            {error && (
              <div className="bg-red-50 text-red-600 text-[14px] font-semibold px-3 py-2.5 rounded-lg">
                {error}
              </div>
            )}
            <AdminButton type="submit" disabled={loading} className="w-full justify-center">
              {loading ? 'Đang xử lý...' : 'Đăng nhập'}
            </AdminButton>
          </form>
        </div>
      </div>
    </div>
  )
}
