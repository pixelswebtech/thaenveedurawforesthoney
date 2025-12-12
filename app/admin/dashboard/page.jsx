"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { auth } from "../../../lib/firebase"
import { onAuthStateChanged } from "firebase/auth"
import { getAllOrders, updateOrderStatus, getMonthlySalesData, getAllCustomers } from "../../../lib/order-service"
import Link from "next/link"

export default function AdminDashboard() {
  const ADMIN_EMAIL = "adm.thaenveedu@gmail.com"
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    pendingOrders: 0
  })

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/admin")
        return
      }

      const token = await currentUser.getIdTokenResult()
      const tokenEmail = token.claims?.email || currentUser.email
      const hasAdminClaim = !!token.claims?.admin
      const isAllowlisted = tokenEmail === ADMIN_EMAIL
      if (!(hasAdminClaim || isAllowlisted)) {
        router.push("/admin")
        return
      }

      setUser(currentUser)
      await loadStats()
      setLoading(false)
    })
    return () => unsubscribe()
  }, [router])

  const loadStats = async () => {
    try {
      const [ordersResult, customersResult] = await Promise.all([
        getAllOrders(),
        getAllCustomers()
      ])

      if (ordersResult.success) {
        const orders = ordersResult.orders
        const totalRevenue = orders.reduce((sum, order) => sum + (order.subtotal || 0), 0)
        const pendingOrders = orders.filter(order => order.status === 'placed').length

        setStats({
          totalOrders: orders.length,
          totalRevenue,
          totalCustomers: customersResult.success ? customersResult.customers.length : 0,
          pendingOrders
        })
      }
    } catch (error) {
      console.error("Error loading stats:", error)
    }
  }

  const handleLogout = async () => {
    try {
      await auth.signOut()
      router.push("/admin")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Admin Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-2xl">🔐</span>
              </div>
              <div>
                <h1 className="font-serif text-xl sm:text-2xl font-bold">Admin Dashboard</h1>
                <p className="text-xs sm:text-sm text-muted-foreground">Thaenveedu</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground hidden sm:inline">
                {user?.email}
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-md border hover:bg-secondary transition-colors text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-3xl font-serif font-bold mt-2">{stats.totalOrders}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <span className="text-2xl">📦</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-3xl font-serif font-bold mt-2">₹{stats.totalRevenue.toFixed(2)}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Customers</p>
                <p className="text-3xl font-serif font-bold mt-2">{stats.totalCustomers}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Orders</p>
                <p className="text-3xl font-serif font-bold mt-2">{stats.pendingOrders}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                <span className="text-2xl">⏳</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/admin/orders"
            className="rounded-lg border bg-card p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center">
                <span className="text-3xl">📋</span>
              </div>
              <div>
                <h3 className="font-serif text-xl font-semibold">Order Requests</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  View and manage all customer orders
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/products"
            className="rounded-lg border bg-card p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center">
                <span className="text-3xl">🍯</span>
              </div>
              <div>
                <h3 className="font-serif text-xl font-semibold">Product Management</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Add, edit, or delete products
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/customers"
            className="rounded-lg border bg-card p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center">
                <span className="text-3xl">👤</span>
              </div>
              <div>
                <h3 className="font-serif text-xl font-semibold">Customer List</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  View all customers and their details
                </p>
              </div>
            </div>
          </Link>
        </div>
      </main>
    </div>
  )
}
