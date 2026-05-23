import Header from "@/app/_components/header"
import Footer from "@/app/_components/footer"
import MobileNav from "@/app/_components/mobile-nav"

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <MobileNav />
      {/* Mobile spacer: nav bar 60px + circle overflows to 86px + shadow ~14px + clearance = 120px */}
      <div className="lg:hidden shrink-0" style={{ height: 120 }} />
      <div className="flex-1 flex flex-col">{children}</div>
      <Footer />
      {/* Mobile spacer: fixed Header at bottom ~70px */}
      <div className="lg:hidden shrink-0" style={{ height: 70 }} />
    </div>
  )
}
