const features = [
  {
    title: "100% Pure & Raw",
    description: "Untouched by machines or heat just pure raw forest honey collected directly from wild hives. Each jar retains the natural enzymes, aroma, and taste of the forest.",
    icon: (
      <svg className="w-8 h-8" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
    )
  },
  {
    title: "Ethically Harvested from the Wild",
    description: "Our honey is gathered by indigenous honey hunters who follow age-old forest traditions. They collect only what nature offers, preserving the bees and their habitats.",
    icon: (
      <svg className="w-8 h-8" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
        <path d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
    )
  },
  {
    title: "Hand-Collected in Small Batches",
    description: "Every batch of Thaenveedu honey is carefully filtered by hand, maintaining authenticity and quality while honoring the skills of our tribal communities.",
    icon: (
      <svg className="w-8 h-8" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
        <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
      </svg>
    )
  },
  {
    title: "Local, Traceable & Sustainable",
    description: "Sourced from untouched forest regions, every jar can be traced back to its tribal honey gatherers and the forest it came from ensuring transparency and trust in every spoonful.",
    icon: (
      <svg className="w-8 h-8" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
        <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
        <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
      </svg>
    )
  },
]

export default function WhyChooseUs() {
  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20 bg-gradient-to-b from-background to-secondary/20">
      <div className="text-center mb-10 md:mb-16">
        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl">Why Choose Us</h2>
        <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
          Our promise is rooted in purity, tradition, and respect for the forest. Every drop of Thaenveedu honey reflects the bond between tribal wisdom and wild nature.
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {features.map((feature, index) => (
          <div 
            key={feature.title}
            className="relative group"
          >
            <div className="h-full rounded-xl border bg-card p-6 sm:p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                {feature.icon}
              </div>
              <h3 className="font-serif text-xl sm:text-2xl mb-3">{feature.title}</h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
            
            {/* Decorative element */}
            <div 
              className="absolute -top-2 -right-2 w-20 h-20 bg-primary/5 rounded-full blur-2xl -z-10 group-hover:bg-primary/10 transition-colors duration-300"
              style={{ animationDelay: `${index * 100}ms` }}
            />
          </div>
        ))}
      </div>
      
      <div className="mt-12 md:mt-16 text-center">
        <p className="text-base md:text-lg text-muted-foreground italic">
          From the wild heart of the forest pure, raw, and true. <br />அருளும் நம்பிக்கையும் நம் தேனின் இனிமை.
        </p>
      </div>
    </section>
  )
}










