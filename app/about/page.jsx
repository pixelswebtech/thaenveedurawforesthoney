"use client"
import Image from "next/image"
import Link from "next/link"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import CartDrawer from "@/components/cart-drawer"
import LoginModal from "@/components/login-modal"
import { UIProvider } from "@/components/cart-ui-context"

export default function AboutPage() {
  return (
    <UIProvider>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20">
      <header className="text-center mb-10 md:mb-14">
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl">Where Tribal Wisdom Meets Nature's Sweetness</h1>
        <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
          From the wild heart of South India to your home, this is the story of Thaenveedu.
        </p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">
        <div>
          <h2 className="font-serif text-2xl md:text-3xl">The Heart of Thaenveedu</h2>
          <p className="mt-4 text-sm sm:text-base leading-relaxed text-muted-foreground">
            Deep in the untouched forests of South India, the hum of bees and the rhythm of the trees guide a way of life that's centuries old. Thaenveedu was born to preserve that heritage, the ancient art of honey hunting practiced by tribal communities, who climb towering cliffs and follow the forest's whispers to find pure, wild honey. For them, honey isn't just food; it's a sacred bond between humans and nature, taken with care, never greed.
          </p>
          <h3 className="mt-8 font-serif text-xl">Our Mission</h3>
          <p className="mt-3 text-sm sm:text-base leading-relaxed text-muted-foreground">
            Our mission is simple: to bring you pure, raw forest honey that carries the essence of the wild, while empowering the tribal families who harvest it. We believe in ethical sourcing, sustainable practices, and complete honesty, from the hive to your heart.
          </p>
          <h3 className="mt-8 font-serif text-xl">Our Promise</h3>
          <ul className="mt-3 space-y-2 text-sm sm:text-base text-muted-foreground">
            <li><span className="font-medium text-foreground">100% raw & unheated:</span> Preserving all natural enzymes and polyphenols.</li>
            <li><span className="font-medium text-foreground">Wild-sourced:</span> From deep forest hives untouched by commercial beekeeping.</li>
            <li><span className="font-medium text-foreground">Tribal-crafted:</span> Gathered through traditional, respectful honey hunting.</li>
            <li><span className="font-medium text-foreground">Traceable & honest:</span> Every batch tells the story of its origin.</li>
          </ul>
          <h3 className="mt-8 font-serif text-xl">Our Connection with the Forest</h3>
          <p className="mt-3 text-sm sm:text-base leading-relaxed text-muted-foreground">
            The forests give us more than honey; they teach us patience, balance, and gratitude. By supporting Thaenveedu, you're helping preserve not just a product, but a way of life the wisdom of indigenous honey hunters and the wild harmony they protect.
          </p>
          <blockquote className="mt-6 italic text-muted-foreground">
            "From the wild heart of the forest, to the warmth of your home, every drop of Thaenveedu tells a story of trust."
          </blockquote>
          <div className="mt-8 flex gap-3">
            <Link href="/shop" className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-primary-foreground text-sm sm:text-base hover:opacity-90 transition-opacity">Shop Our Honey</Link>
            <Link href="/contact" className="inline-flex items-center justify-center rounded-md border px-5 py-2.5 text-sm sm:text-base hover:bg-secondary transition-colors">Get in Touch</Link>
          </div>
        </div>
        <div>
          <div className="relative rounded-2xl overflow-hidden border bg-card">
            <Image 
              src="/about.png" 
              alt="Tribal honey hunter and forest honey imagery"
              width={1200}
              height={900}
              className="w-full h-auto object-cover"
              priority
            />
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="mt-16 md:mt-24">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl mb-4">Our Story in Pictures</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            From the forest to the hands of tribal hunters, witness the journey of pure, raw honey
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {/* Image 1 */}
          <div className="group relative rounded-2xl overflow-hidden border bg-card shadow-sm hover:shadow-lg transition-shadow duration-300">
            <div className="aspect-square relative">
              <Image 
                src="/about_a.jpg" 
                alt="Tribal hunter with honeycomb"
                fill
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
              <p className="text-white p-4 text-sm font-medium">Forest Wisdom</p>
            </div>
          </div>

          {/* Image 2 */}
          <div className="group relative rounded-2xl overflow-hidden border bg-card shadow-sm hover:shadow-lg transition-shadow duration-300">
            <div className="aspect-square relative">
              <Image 
                src="/about_b.jpg" 
                alt="Pure honey in jar"
                fill
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
              <p className="text-white p-4 text-sm font-medium">Pure Nature</p>
            </div>
          </div>

          {/* Image 3 */}
          <div className="group relative rounded-2xl overflow-hidden border bg-card shadow-sm hover:shadow-lg transition-shadow duration-300 md:col-span-2">
            <div className="relative w-full h-96">
              <Image 
                src="/about_c.png" 
                alt="Forest honey hunting expedition"
                fill
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
              <p className="text-white p-4 text-sm font-medium">Wild Harvest</p>
            </div>
          </div>
        </div>
      </section>
      </main>
      <Footer />
      <CartDrawer />
      <LoginModal />
    </UIProvider>
  )
}
