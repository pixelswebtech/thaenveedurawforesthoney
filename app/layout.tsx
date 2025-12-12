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
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${lora.variable} antialiased`}>
      <body className="font-sans">
        <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
        <Toaster richColors position="top-center" closeButton duration={5000} />
        <Analytics />
      </body>
    </html>
  )
}
