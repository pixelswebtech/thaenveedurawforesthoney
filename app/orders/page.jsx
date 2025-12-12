"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { auth } from "../../lib/firebase"
import { onAuthStateChanged } from "firebase/auth"
import { getUserOrders } from "../../lib/order-service"
import { hasUserReviewedProduct } from "../../lib/review-service"
import Navbar from "../../components/navbar"
import Footer from "../../components/footer"
import CartDrawer from "../../components/cart-drawer"
import LoginModal from "../../components/login-modal"
import { UIProvider } from "../../components/cart-ui-context"
import Link from "next/link"

export default function OrdersPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [reviewedProducts, setReviewedProducts] = useState(new Set())

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser)
      if (!currentUser) {
        router.push('/')
        return
      }
      
      // Fetch user orders
      setLoading(true)
      const result = await getUserOrders(currentUser.uid)
      if (result.success) {
        setOrders(result.orders)
        
        // Check which products have been reviewed
        const reviewed = new Set()
        for (const order of result.orders) {
          if (order.status === 'delivered' && order.items) {
            for (const item of order.items) {
              const hasReviewed = await hasUserReviewedProduct(currentUser.uid, item.id)
              if (hasReviewed) {
                reviewed.add(item.id)
              }
            }
          }
        }
        setReviewedProducts(reviewed)
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [router])

  const getStatusBadgeClass = (status) => {
    const normalizedStatus = status?.toLowerCase() || ''
    if (normalizedStatus.includes('placed')) {
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    } else if (normalizedStatus.includes('processing')) {
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    } else if (normalizedStatus.includes('dispatched')) {
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    } else if (normalizedStatus.includes('delivered')) {
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
    }
    return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
  }

  const formatDate = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <UIProvider>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 md:py-16 min-h-screen">
        <div className="mb-8">
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl">My Orders</h1>
          <p className="mt-2 text-muted-foreground">Track and view your order history</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-5xl">📦</span>
            </div>
            <h2 className="font-serif text-2xl mb-4">No orders yet</h2>
            <p className="text-muted-foreground mb-8">Start shopping to see your orders here</p>
            <a
              href="/shop"
              className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-base font-medium text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Start Shopping
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="rounded-lg border bg-card p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 pb-4 border-b">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-serif text-xl">Order #{order.id.slice(0, 8)}</h3>
                      <span className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusBadgeClass(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-sm text-muted-foreground">Total Amount</p>
                    <p className="font-serif text-2xl">₹{order.subtotal?.toFixed(2)}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Items</h4>
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
                        <img
                          src={item.imageUrl || "/placeholder.jpg"}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Qty: {item.quantity} × ₹{item.price?.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="font-semibold">
                          ₹{((item.price || 0) * (item.quantity || 0)).toFixed(2)}
                        </div>
                        
                        {/* Review Button - Only show for delivered orders */}
                        {order.status === 'delivered' && (
                          reviewedProducts.has(item.id) ? (
                            <div className="text-xs text-green-600 font-medium flex items-center gap-1">
                              <span>✓</span>
                              <span className="hidden sm:inline">Reviewed</span>
                            </div>
                          ) : (
                            <Link
                              href={`/shop/${item.id}#reviews`}
                              className="text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-md font-medium hover:opacity-90 transition-opacity whitespace-nowrap"
                            >
                              Write Review
                            </Link>
                          )
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {order.shippingAddress && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="font-medium text-sm mb-2">Shipping Address</h4>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p className="font-medium text-foreground">{order.shippingAddress.fullName}</p>
                      <p>{order.shippingAddress.street}</p>
                      <p>
                        {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                        {order.shippingAddress.postalCode}
                      </p>
                      <p>{order.shippingAddress.phone}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
      <CartDrawer />
      <LoginModal />
    </UIProvider>
  )
}
