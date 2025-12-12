const items = [
  {
    title: "Natural Energy Boost",
    desc: "A perfect source of clean, sustainable energy. The naturally occurring sugars in raw honey fuel your body while polyphenols help reduce fatigue and oxidative stress — ideal for an active lifestyle.",
    icon: "⚡",
  },
  {
    title: "Rich in Antioxidants & Polyphenols",
    desc: "Packed with polyphenols, vitamins, and enzymes that help neutralize free radicals. This forest treasure supports immunity, cell protection, and long-term health.",
    icon: "🍯",
  },
  {
    title: "Soothes & Comforts",
    desc: "A timeless natural remedy to calm sore throats, ease coughs, and comfort the body. Raw forest honey's antibacterial and anti-inflammatory properties make it nature's sweetest medicine.",
    icon: "🌿",
  },
  {
    title: "Supports Heart Health",
    desc: "Wild forest honey, abundant in antioxidants and polyphenols, helps maintain healthy cholesterol and supports smooth blood flow — promoting overall cardiovascular health.",
    icon: "❤️",
  },
  {
    title: "Balanced Sweetness for Active Lifestyles",
    desc: "Unlike processed sugar, raw forest honey releases energy slowly. Its polyphenol content supports metabolism and recovery, making it suitable for fitness lovers and those managing diabetes in moderation.",
    icon: "🏃",
  },
]

export default function Benefits() {
  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20">
      <div className="text-center mb-10 md:mb-12">
        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl">Nature's Golden Benefits</h2>
        <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
          Pure forest honey offers more than sweetness — it's a nutritional powerhouse rich in antioxidants, polyphenols, and nature's healing energy.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {items.map((b, index) => (
          <div 
            key={b.title} 
            className="group rounded-xl border bg-card p-6 sm:p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="text-4xl sm:text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">{b.icon}</div>
            <h3 className="mt-3 font-serif text-xl sm:text-2xl">{b.title}</h3>
            <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">{b.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
