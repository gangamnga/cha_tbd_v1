import Header from "@/app/_components/header"
import Footer from "@/app/_components/footer"
import MobileNav from "@/app/_components/mobile-nav"

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col pb-[60px] lg:pb-0">
      <Header />
      <div className="flex-1 flex flex-col">{children}</div>
      <Footer />
      <MobileNav />
    </div>
  )
}
