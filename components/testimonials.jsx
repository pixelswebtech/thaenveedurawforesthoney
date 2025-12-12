"use client"
import { useState, useEffect } from "react"

const items = [
  { 
    name: "Gabriel Prasana Raj", 
    text: "The richest honey I have ever tasted—silky, floral, unforgettable. It's become a staple in my kitchen!",
    location: "Sevvapettai, Thiruvallur",
    rating: 5
  },
  { 
    name: "Jameel", 
    text: "A spoonful in tea feels like a small ritual of comfort. The quality is unmatched and you can taste the difference.",
    location: "Muthupet, Thiruvarur",
    rating: 5
  },
  { 
    name: "Priya", 
    text: "Beautifully bottled and beautifully made. A pantry essential that I gift to everyone I know.",
    location: "Chennai, Tamil Nadu",
    rating: 5
  },
  { 
    name: "Jobin", 
    text: "As a chef, I'm particular about ingredients. This honey elevates every dish. Truly exceptional.",
    location: "kanyakumari",
    rating: 5
  },
]

export default function Testimonials() {
  const [idx, setIdx] = useState(0)
  const next = () => setIdx((i) => (i + 1) % items.length)
  const prev = () => setIdx((i) => (i - 1 + items.length) % items.length)
  
  useEffect(() => {
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [])

  return (
    <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 md:py-20 lg:py-24 text-center">
      <h3 className="font-serif text-3xl sm:text-4xl md:text-5xl">Kind Words</h3>
      <p className="mt-3 md:mt-4 text-base md:text-lg text-muted-foreground">
        From our happy customers
      </p>
      
      <div className="mt-10 md:mt-12 min-h-[200px] flex flex-col items-center justify-center">
        <div className="flex gap-1 mb-4">
          {[...Array(items[idx].rating)].map((_, i) => (
            <svg key={i} className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
        
        <blockquote className="text-lg sm:text-xl md:text-2xl text-muted-foreground italic max-w-3xl leading-relaxed px-4">
          "{items[idx].text}"
        </blockquote>
        
        <div className="mt-6">
          <p className="font-semibold text-lg sm:text-xl">— {items[idx].name}</p>
          <p className="text-sm text-muted-foreground mt-1">{items[idx].location}</p>
        </div>
      </div>
      
      <div className="mt-8 flex items-center justify-center gap-4">
        <button 
          onClick={prev} 
          className="p-3 rounded-full border hover:bg-secondary transition-colors"
          aria-label="Previous testimonial"
        >
          <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M15 19l-7-7 7-7"></path>
          </svg>
        </button>
        
        <div className="flex gap-2">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`h-2 rounded-full transition-all ${
                i === idx ? 'w-8 bg-primary' : 'w-2 bg-muted'
              }`}
              aria-label={`Go to testimonial ${i + 1}`}
            />
          ))}
        </div>
        
        <button 
          onClick={next} 
          className="p-3 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
          aria-label="Next testimonial"
        >
          <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M9 5l7 7-7 7"></path>
          </svg>
        </button>
      </div>
    </section>
  )
}
