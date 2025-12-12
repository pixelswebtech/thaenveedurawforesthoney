"use client"
import { useEffect, useState } from "react"
import Navbar from "../../components/navbar"
import CartDrawer from "../../components/cart-drawer"
import LoginModal from "../../components/login-modal"
import { UIProvider } from "../../components/cart-ui-context"
import ProductCard from "../../components/product-card"
import { getAllProducts } from "../../lib/product-service"

export default function ShopPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch products from Firestore (admin-added only)
    const fetchProducts = async () => {
      try {
        const result = await getAllProducts()
        if (result.success) {
          setProducts(result.products)
        }
      } catch (error) {
        console.error("Error fetching products:", error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchProducts()
  }, [])

  return (
    <UIProvider>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 md:py-16 lg:py-20">
        <div className="text-center mb-10 md:mb-16">
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl">Shop All Honey</h1>
          <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore our complete collection of artisanal honey, each variety hand-selected and sustainably harvested
          </p>
        </div>
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : products.length > 0 ? (
          <div className="mt-8 md:mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
            <p className="text-xl text-muted-foreground mb-2">No products available yet</p>
            <p className="text-sm text-muted-foreground">Please check back later or contact us for more information.</p>
          </div>
        )}
      </main>
      <CartDrawer />
      <LoginModal />
    </UIProvider>
  )
}
