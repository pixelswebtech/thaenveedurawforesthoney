"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { auth } from "../../../lib/firebase"
import { onAuthStateChanged } from "firebase/auth"
import { getAllOrders, updateOrderStatus, getMonthlySalesData } from "../../../lib/order-service"
import Link from "next/link"
import { toast } from "sonner"

export default function AdminOrders() {
  const ADMIN_EMAIL = "adm.thaenveedu@gmail.com"
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState([])
  const [filteredOrders, setFilteredOrders] = useState([])
  const [monthlySales, setMonthlySales] = useState([])
  const [dateFilter, setDateFilter] = useState({ start: "", end: "" })
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/admin")
        return
      }

      try {
        const token = await currentUser.getIdTokenResult()
        const tokenEmail = token.claims?.email || currentUser.email
        const hasAdminClaim = !!token.claims?.admin
        const isAllowlisted = tokenEmail === ADMIN_EMAIL
        if (!(hasAdminClaim || isAllowlisted)) {
          router.push("/admin")
          return
        }

        setUser(currentUser)
        await loadOrders()
        await loadMonthlySales()
      } catch (error) {
        console.error("Error in auth state change:", error)
        router.push("/admin")
      } finally {
        setLoading(false)
      }
    })
    return () => unsubscribe()
  }, [router])

  const loadOrders = async (startDate = null, endDate = null) => {
    try {
      const result = await getAllOrders(startDate, endDate)
      if (result.success) {
        // Ensure all orders have valid items array and proper structure
        const validOrders = result.orders.map(order => ({
          ...order,
          items: Array.isArray(order.items) ? order.items : [],
          subtotal: typeof order.subtotal === 'number' ? order.subtotal : 0,
          status: order.status || 'placed',
          shippingAddress: order.shippingAddress || {},
          createdAt: order.createdAt || new Date().toISOString()
        }))
        setOrders(validOrders)
        setFilteredOrders(validOrders)
      }
    } catch (error) {
      console.error("Error loading orders:", error)
      toast.error("Failed to load orders", {
        description: "Please try refreshing the page."
      })
    }
  }

  const loadMonthlySales = async () => {
    try {
      const result = await getMonthlySalesData()
      if (result.success) {
        setMonthlySales(result.monthlySales)
      }
    } catch (error) {
      console.error("Error loading monthly sales:", error)
    }
  }

  const handleDateFilter = () => {
    if (dateFilter.start && dateFilter.end) {
      const start = new Date(dateFilter.start)
      const end = new Date(dateFilter.end)
      loadOrders(start, end)
    } else {
      loadOrders()
    }
  }

  const handleStatusFilter = (status) => {
    setStatusFilter(status)
    if (status === "all") {
      setFilteredOrders(orders)
    } else {
      // Normalize status comparison to handle various formats
      const normalizedFilter = status.toLowerCase().replace(/\s+/g, '')
      setFilteredOrders(orders.filter(order => {
        const normalizedStatus = (order.status || '').toLowerCase().replace(/\s+/g, '')
        return normalizedStatus === normalizedFilter || 
               normalizedStatus === 'order' + normalizedFilter ||
               normalizedStatus.includes(normalizedFilter)
      }))
    }
  }

  const handleDispatchOrder = async (orderId) => {
    try {
      const result = await updateOrderStatus(orderId, "dispatched")
      if (result.success) {
        await loadOrders()
        toast.success("Order marked as dispatched!", {
          description: `Order #${orderId.slice(0, 8)} has been dispatched successfully.`
        })
      } else {
        toast.error("Failed to update order status", {
          description: result.error || "Please try again."
        })
      }
    } catch (error) {
      console.error("Error dispatching order:", error)
      toast.error("Failed to update order status", {
        description: "An unexpected error occurred."
      })
    }
  }

  const handleDeliverOrder = async (orderId) => {
    try {
      const result = await updateOrderStatus(orderId, "delivered")
      if (result.success) {
        await loadOrders()
        toast.success("Order marked as delivered!", {
          description: `Order #${orderId.slice(0, 8)} has been delivered successfully.`
        })
      } else {
        toast.error("Failed to update order status", {
          description: result.error || "Please try again."
        })
      }
    } catch (error) {
      console.error("Error delivering order:", error)
      toast.error("Failed to update order status", {
        description: "An unexpected error occurred."
      })
    }
  }

  const exportToCSV = () => {
    try {
      const headers = ["Order ID", "Customer", "Email", "Phone", "Items", "Total", "Status", "Date"]
      const rows = filteredOrders.map(order => [
        order.id || "N/A",
        order.shippingAddress?.fullName || "N/A",
        order.shippingAddress?.email || "N/A",
        order.shippingAddress?.phone || "N/A",
        order.items?.length || 0,
        order.subtotal?.toFixed(2) || "0.00",
        order.status || "N/A",
        order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A"
      ])

      const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n")
      const blob = new Blob([csvContent], { type: "text/csv" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `orders_${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      URL.revokeObjectURL(url)
      
      toast.success("Orders exported successfully!")
    } catch (error) {
      console.error("Error exporting to CSV:", error)
      toast.error("Failed to export orders")
    }
  }

  const formatDate = (date) => {
    if (!date) return "N/A"
    try {
      return new Date(date).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })
    } catch (error) {
      console.error("Error formatting date:", error)
      return "Invalid date"
    }
  }

  const getStatusBadgeClass = (status) => {
    const normalizedStatus = (status || '').toLowerCase()
    switch (normalizedStatus) {
      case "placed":
      case "order placed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "dispatched":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "delivered":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const maxSales = Math.max(...monthlySales.filter(s => s > 0), 1)
  const minSales = Math.min(...monthlySales.filter(s => s > 0), 0)
  
  // Calculate bar height with better visibility for small values
  const getBarHeight = (sales) => {
    if (sales === 0) return 0
    if (maxSales === minSales) return 50 // If all values are the same
    
    // Use logarithmic scale for better visibility of small values
    const range = maxSales - minSales
    const normalizedValue = (sales - minSales) / range
    
    // Apply a curve to make small values more visible (minimum 50% height for any value > 0)
    return Math.max(50, normalizedValue * 85)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <header className="border-b bg-card shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/admin/dashboard" className="p-2 hover:bg-secondary rounded-md transition-colors">
                <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M15 19l-7-7 7-7"></path>
                </svg>
              </Link>
              <h1 className="font-serif text-xl sm:text-2xl font-bold">Order Requests</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Monthly Sales Chart */}
        <div className="rounded-lg border bg-card p-6 shadow-sm mb-8">
          <h2 className="font-serif text-2xl font-semibold mb-6">Monthly Sales Overview</h2>
          <div className="h-64 flex items-end justify-between gap-2">
            {monthlySales.map((sales, index) => {
              const height = getBarHeight(sales)
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="text-xs font-medium text-muted-foreground">
                    {sales > 0 ? `₹${sales.toLocaleString()}` : "₹0"}
                  </div>
                  <div
                    className="w-full bg-primary rounded-t transition-all hover:opacity-80 cursor-pointer relative group"
                    style={{ 
                      height: `${height}%`,
                      minHeight: sales > 0 ? "50px" : "0"
                    }}
                  >
                    {sales > 0 && (
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                        ₹{sales.toLocaleString()}
                      </div>
                    )}
                  </div>
                  <div className="text-xs font-medium">{monthNames[index]}</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Filters */}
        <div className="rounded-lg border bg-card p-6 shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Start Date</label>
              <input
                type="date"
                value={dateFilter.start}
                onChange={(e) => setDateFilter({ ...dateFilter, start: e.target.value })}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">End Date</label>
              <input
                type="date"
                value={dateFilter.end}
                onChange={(e) => setDateFilter({ ...dateFilter, end: e.target.value })}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={handleDateFilter}
                className="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
              >
                Apply Filter
              </button>
              <button
                onClick={exportToCSV}
                className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-secondary"
              >
                Export CSV
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            <button
              onClick={() => handleStatusFilter("all")}
              className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                statusFilter === "all" ? "bg-primary text-primary-foreground" : "border hover:bg-secondary"
              }`}
            >
              All
            </button>
            <button
              onClick={() => handleStatusFilter("placed")}
              className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                statusFilter === "placed" ? "bg-primary text-primary-foreground" : "border hover:bg-secondary"
              }`}
            >
              Placed
            </button>
            <button
              onClick={() => handleStatusFilter("dispatched")}
              className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                statusFilter === "dispatched" ? "bg-primary text-primary-foreground" : "border hover:bg-secondary"
              }`}
            >
              Dispatched
            </button>
            <button
              onClick={() => handleStatusFilter("delivered")}
              className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                statusFilter === "delivered" ? "bg-primary text-primary-foreground" : "border hover:bg-secondary"
              }`}
            >
              Delivered
            </button>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="rounded-lg border bg-card p-12 text-center">
              <p className="text-muted-foreground">No orders found</p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div key={order.id} className="rounded-lg border bg-card p-6 shadow-sm">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-serif text-lg font-semibold">Order #{order.id.slice(0, 8)}</h3>
                      <span className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusBadgeClass(order.status)}`}>
                        {((order.status || '').charAt(0).toUpperCase() + (order.status || '').slice(1)).replace('_', ' ')}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                      <p><span className="font-medium">Customer:</span> {order.shippingAddress?.fullName || "N/A"}</p>
                      <p><span className="font-medium">Phone:</span> {order.shippingAddress?.phone || "N/A"}</p>
                      <p><span className="font-medium">Email:</span> {order.shippingAddress?.email || "N/A"}</p>
                      <p><span className="font-medium">Date:</span> {formatDate(order.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-2xl font-bold">₹{order.subtotal?.toFixed(2)}</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    {((order.status || '').toLowerCase() === "placed" || (order.status || '').toLowerCase() === "order placed") && (
                      <button
                        onClick={() => handleDispatchOrder(order.id)}
                        className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm font-medium whitespace-nowrap"
                      >
                        Mark as Dispatched
                      </button>
                    )}
                    {(order.status || '').toLowerCase() === "dispatched" && (
                      <button
                        onClick={() => handleDeliverOrder(order.id)}
                        className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors text-sm font-medium whitespace-nowrap"
                      >
                        Mark as Delivered
                      </button>
                    )}
                  </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium text-sm mb-3">Order Items</h4>
                  <div className="space-y-2">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <span>{item.name} × {item.quantity}</span>
                        <span className="font-medium">₹{((item.price || 0) * (item.quantity || 0)).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {order.shippingAddress && (
                  <div className="border-t pt-4 mt-4">
                    <h4 className="font-medium text-sm mb-2">Shipping Address</h4>
                    <div className="text-sm text-muted-foreground">
                      <p>{order.shippingAddress.street}</p>
                      <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  )
}
