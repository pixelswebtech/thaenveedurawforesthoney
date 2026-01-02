import type React from "react"
import type { Metadata } from "next"
import { Inter, Lora } from "next/font/google"
import "./globals.css"
import { Suspense } from "react"
import { Toaster } from "@/components/ui/sonner"
import { Analytics } from "@vercel/analytics/react"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})
const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Thaenveedu",
  description: "Pure, raw honey sourced from sustainable apiaries. Discover our premium collection of Wildflower, Clover, Manuka, and Acacia honey - 100% natural with no artificial additives.",
  icons: {
    icon: [
      { url: "/logo.png", type: "image/png", rel: "icon", sizes: "any" },
    ],
  },
  openGraph: {
    title: "Thaenveedu - Raw Forest Honey",
    description: "Pure, raw honey sourced from sustainable apiaries. 100% natural with no artificial additives.",
    type: "website",
    url: "https://thaenveedu.com",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 1200,
        alt: "Thaenveedu Raw Forest Honey Logo",
      },
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Thaenveedu",
    "url": "https://thaenveedu.com",
    "logo": "https://thaenveedu.com/logo.png",
    "description": "Pure, raw forest honey sourced from tribal communities",
    "sameAs": [
      "https://www.facebook.com/share/17w1AApbEW/",
      "https://www.instagram.com/thaenveedu_rawforesthoney"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Service",
      "telephone": "+91-76026892",
      "email": "thaenveedu@gmail.com"
    }
  }

  return (
    <html lang="en" className={`${inter.variable} ${lora.variable} antialiased`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
        />
      </head>
      <body className="font-sans">
        <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
        <Toaster richColors position="top-center" closeButton duration={5000} />
        <Analytics />
      </body>
    </html>
  )
}
