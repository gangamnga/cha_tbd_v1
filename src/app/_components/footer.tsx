import Image from "next/image";
import Container from "./container";


export default function Footer() {
  return (
    <footer className="relative text-white bg-vatican-blue overflow-hidden min-h-[400px] flex flex-col justify-center py-12 md:py-20">

      {/* bg-footer.svg: bird at y=44 in 680px viewBox; object-right-top anchors top edge so vertical crop goes to bottom (sky = same color, invisible) */}
      <Image
        src="/platforms/bg-footer.svg"
        alt=""
        aria-hidden="true"
        fill
        className="object-cover object-[78%_50%] md:object-right-top pointer-events-none select-none"
      />

      <div className="absolute inset-0 bg-black/10 pointer-events-none" />

      <div className="relative z-10">
        <Container>
          <div className="max-w-3xl mx-auto flex flex-col items-center gap-10">

            <div className="flex flex-col gap-4 w-full">
              <blockquote className="font-serif text-[22px] md:text-[30px] font-bold italic leading-snug text-center tracking-wide">
                &ldquo;Tôi sống giữa đoàn chiên và nếu có chết<br />cũng chết giữa đoàn chiên.&rdquo;
              </blockquote>
              <p className="text-[16px] uppercase tracking-[0.25em] font-semibold text-white/80 text-right">
                Phanxicô<br className="sm:hidden" /> Trương Bửu Diệp
              </p>
            </div>

            <div className="w-full flex justify-center pt-4">
              <p className="text-[16px] text-white/50 font-medium tracking-wide text-center">
                © {new Date().getFullYear()} Chatruongbuudiep.com
              </p>
            </div>

          </div>
        </Container>
      </div>

    </footer>
  );
}
