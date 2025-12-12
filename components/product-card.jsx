"use client"
import { useCart } from "../lib/cart-store"
import { useUI } from "./cart-ui-context"
import { auth } from "../lib/firebase"
import { onAuthStateChanged } from "firebase/auth"
import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { convertUnsplashUrl } from "../lib/image-utils"

export default function ProductCard({ product }) {
  const { addItem } = useCart()
  const { openAuth } = useUI()
  const [user, setUser] = useState(null)
  const [imageUrl, setImageUrl] = useState("/placeholder.jpg")

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
    })
    return () => unsubscribe()
  }, [])

  // Convert Unsplash URLs to direct image URLs
  useEffect(() => {
    if (product?.imageUrl) {
      const convertedUrl = convertUnsplashUrl(product.imageUrl)
      setImageUrl(convertedUrl || "/placeholder.jpg")
    } else {
      setImageUrl("/placeholder.jpg")
    }
  }, [product?.imageUrl])

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Check if user is logged in
    if (!user) {
      // Redirect to login if not authenticated
      openAuth()
      return
    }
    
    addItem(product, 1)
  }

  return (
    <Link href={`/shop/${product.id}`} className="group rounded-lg border bg-card text-card-foreground overflow-hidden flex flex-col hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer h-full">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted flex-shrink-0">
        {imageUrl && (
          <Image
            src={imageUrl}
            alt={`${product.name} honey jar`}
            fill
            className="object-cover transition-all duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority
            onError={(e) => {
              e.currentTarget.src = "/placeholder.jpg"
            }}
          />
        )}
      </div>
      <div className="p-4 sm:p-5 md:p-6 flex-1 flex flex-col gap-3">
        <h3 className="font-serif text-lg sm:text-xl md:text-2xl line-clamp-1 min-h-[2rem] sm:min-h-[2.5rem]">{product.name}</h3>
        <p className="text-xs sm:text-sm md:text-base text-muted-foreground line-clamp-2 flex-1 min-h-[3rem]">
          {product.description}
        </p>
        <div className="mt-auto pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <span className="font-semibold text-xl sm:text-2xl">₹{product.price.toFixed(2)}</span>
          <button
            onClick={handleAddToCart}
            className="w-full sm:w-auto rounded-md bg-primary text-primary-foreground px-4 py-2.5 text-sm sm:text-base font-medium hover:opacity-90 transition-opacity active:scale-95 whitespace-nowrap"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </Link>
  )
}
