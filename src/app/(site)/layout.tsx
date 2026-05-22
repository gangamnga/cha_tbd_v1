import Header from "@/app/_components/header"
import Footer from "@/app/_components/footer"

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex flex-col">{children}</div>
      <Footer />
    </div>
  )
}
