import Header from "@/app/_components/header"
import Footer from "@/app/_components/footer"
import MobileNav from "@/app/_components/mobile-nav"

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col pt-[88px] pb-[70px] lg:pt-0 lg:pb-0">
      <Header />
      <MobileNav />
      <div className="flex-1 flex flex-col">{children}</div>
      <Footer />
    </div>
  )
}
