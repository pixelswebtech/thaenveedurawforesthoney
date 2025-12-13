import Link from "next/link"

export default function Hero() {
  return (
    <section className="relative">
      <div className="relative h-[85vh] md:h-[100vh] w-full overflow-hidden">
        <img
          src="/authentic-photo-of-honey-drizzle-macro-golden-ligh.jpg"
          alt="Golden honey cascading from a wooden dipper"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/30 to-background/10" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-center">
             <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif text-balance leading-tight">
              Thaenveedu | Forest Honey
            </h1>
            <h1 className="text-2xl sm:text-3xl md:text-3xl lg:text-4xl font-serif text-balance leading-tight">
              Pure, Raw, & Unforgettable
            </h1>
            <p className="mt-4 md:mt-6 text-base sm:text-lg md:text-xl lg:text-2xl text-pretty max-w-3xl mx-auto">
              Wild. Sacred. Real.
              <br />
              Honey gathered from deep forest hives by
              <br />
              tribal hunters, pure nature in its most
              <br />
              authentic form.
            </p>
            <div className="mt-8 md:mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center rounded-lg bg-primary px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-medium text-primary-foreground hover:opacity-90 transition-opacity w-full sm:w-auto"
              >
                Shop Our Honey
              </Link>
              <a
                href="#our-story"
                className="inline-flex items-center justify-center rounded-lg border-2 border-foreground/20 bg-background/80 backdrop-blur-sm px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-medium hover:bg-background/90 transition-colors w-full sm:w-auto"
              >
                Our Story
              </a>
            </div>
          </div>
        </div>
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce hidden md:block">
          <svg className="w-6 h-6 text-foreground/60" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </div>
      </div>
    </section>
  )
}
