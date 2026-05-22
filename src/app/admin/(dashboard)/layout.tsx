import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AdminSidebar } from '@/components/admin/AdminSidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <AdminSidebar userEmail={user.email ?? ''} />
      <main className="flex-1 overflow-y-auto min-w-0 pt-14 lg:pt-0">
        {children}
      </main>
    </div>
  )
}
