"use client"
import { useState } from "react"

const facts = [
  { label: "Bees per hive", value: "Up to 60,000", icon: "🐝" },
  { label: "Nectar to honey", value: "2 million flowers → 1 lb", icon: "🌸" },
  { label: "Queen lifespan", value: "~5 years", icon: "👑" },
  { label: "Hexagon strength", value: "Efficient + sturdy", icon: "⬡" },
  { label: "Raw honey", value: "Enzymes + antioxidants", icon: "🍯" },
  { label: "Bee dances", value: "Waggle to navigate", icon: "💃" },
]

export default function Honeycomb() {
  const [hover, setHover] = useState(null)
  
  // Configuration for the circle
  const radius = 160 // Distance from center
  const totalItems = facts.length

  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20 overflow-hidden">
      <div className="text-center mb-10 md:mb-12">
        <h3 className="font-serif text-3xl sm:text-4xl md:text-5xl">The Honeycomb</h3>
        <p className="mt-3 md:mt-4 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
          Fascinating facts about our buzzing friends
        </p>
      </div>

      {/* Container for the rotating circle. 
        We use a square container here to ensure smooth rotation without layout shift.
      */}
      <div className="relative w-[450px] h-[450px] flex items-center justify-center mx-auto">
        <div className="absolute inset-0 rotating-circle">
          {facts.map((f, idx) => {
            // Calculate position
            const angle = (idx / totalItems) * 2 * Math.PI - Math.PI / 2
            const x = Math.cos(angle) * radius
            const y = Math.sin(angle) * radius

            return (
              <div
                key={idx}
                className="absolute left-1/2 top-1/2"
                // 1. Position the item on the circle
                style={{
                  transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                }}
              >
                {/* 2. Counter-rotate the inner content so the icon/text stays upright 
                  while the parent container spins.
                */}
                <div 
                  className="counter-rotate group cursor-pointer relative"
                  onMouseEnter={() => setHover(idx)}
                  onMouseLeave={() => setHover(null)}
                  onClick={() => setHover(hover === idx ? null : idx)}
                  aria-describedby={hover === idx ? `tip-${idx}` : undefined}
                >
                  <div className="hex pulse bg-primary/20 hover:bg-primary/30 flex items-center justify-center">
                    <span className="text-2xl sm:text-3xl md:text-4xl">{f.icon}</span>
                  </div>
                  
                  <div
                    id={`tip-${idx}`}
                    role="tooltip"
                    className={`pointer-events-none absolute left-1/2 -translate-x-1/2 -bottom-12 sm:-bottom-14 whitespace-nowrap rounded-lg bg-accent px-3 py-2 text-xs sm:text-sm text-accent-foreground shadow-lg transition-all duration-300 z-50 ${hover === idx ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
                  >
                    <div className="font-semibold">{f.label}</div>
                    <div className="text-xs mt-1">{f.value}</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
      
      <style jsx>{`
        /* Rotates the entire ring of items */
        .rotating-circle {
          animation: spin 60s linear infinite;
        }

        /* Rotates the individual items in reverse to keep them upright */
        .counter-rotate {
          animation: spin-reverse 60s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }

        /* Pauses rotation when hovering over ANY item in the circle container */
        .rotating-circle:hover,
        .rotating-circle:hover .counter-rotate {
          animation-play-state: paused;
        }

        .hex {
          width: 80px;
          height: 45px;
          background: var(--color-primary);
          position: relative;
          margin: 0; 
          border-radius: 8px;
          transition: all 300ms ease;
        }
        @media (min-width: 640px) {
          .hex {
            width: 100px;
            height: 55px;
          }
        }
        .hex:before,
        .hex:after {
          content: '';
          position: absolute;
          width: 0;
          border-left: 40px solid transparent;
          border-right: 40px solid transparent;
        }
        @media (min-width: 640px) {
          .hex:before,
          .hex:after {
            border-left: 50px solid transparent;
            border-right: 50px solid transparent;
          }
        }
        .hex:before {
          bottom: 100%;
          border-bottom: 23px solid var(--color-primary);
        }
        @media (min-width: 640px) {
          .hex:before {
            border-bottom: 28px solid var(--color-primary);
          }
        }
        .hex:after {
          top: 100%;
          border-top: 23px solid var(--color-primary);
        }
        @media (min-width: 640px) {
          .hex:after {
            border-top: 28px solid var(--color-primary);
          }
        }
        .pulse {
          animation: pulse 6s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .group:hover .hex {
          transform: scale(1.1);
          background: var(--color-primary);
        }
        .group:hover .hex:before {
          border-bottom-color: var(--color-primary);
        }
        .group:hover .hex:after {
          border-top-color: var(--color-primary);
        }
      `}</style>
    </section>
  )
}