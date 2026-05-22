import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin — Cha Trương Bửu Diệp',
}

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
