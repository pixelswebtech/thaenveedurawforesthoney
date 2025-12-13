export default function Story() {
  return (
    <section id="our-story" className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 md:py-20 lg:py-24 bg-secondary/30">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
        <div className="order-2 md:order-1">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif leading-tight">From Forest Hive to Heart</h2>
          <p className="mt-4 md:mt-6 text-base sm:text-lg text-muted-foreground leading-relaxed">
            In the deep silence of the forest, where bees hum among wild blossoms, our tribal honey hunters continue an ancient tradition gathering honey with reverence, courage, and care.
          </p>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
            At Thaenveedu, every drop of raw forest honey carries their trust, wisdom, and respect for nature's rhythm. No machines, no chemicals just the pure essence of the wild, harvested sustainably by hands that know the forest as home.
          </p>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
            Each jar tells a story of the trees that sheltered the hives, the songs of the honey hunters, and the golden gift they bring to your table pure, honest, and unforgettable.
          </p>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground italic">
            "இயற்கையின் நம்பிக்கை, மனிதனின் உண்மை"
          </p>
          <div className="mt-6 md:mt-8 flex flex-col sm:flex-row gap-4">
            <a 
              href="/shop" 
              className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-base font-medium text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Explore Our Collection
            </a>
            <a 
              href="#contact" 
              className="inline-flex items-center justify-center rounded-lg border-2 px-6 py-3 text-base font-medium hover:bg-secondary transition-colors"
            >
              Get in Touch
            </a>
          </div>
        </div>
        <div className="order-1 md:order-2">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-[4/3]">
            <iframe
              className="w-full h-full object-cover"
              src="https://www.youtube.com/embed/Cz7MKeQktvo?si=9OVstjeBKePsrNgy&autoplay=1&mute=1&loop=1&playlist=Cz7MKeQktvo&controls=0&showinfo=0&rel=0&modestbranding=1"
              title="Thaenveedu Forest Honey - Our Story"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
          </div>
        </div>
      </div>
    </section>
  )
}
