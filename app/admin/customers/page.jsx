"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { auth } from "../../../lib/firebase"
import { onAuthStateChanged } from "firebase/auth"
import { getAllCustomers } from "../../../lib/order-service"
import Link from "next/link"

export default function AdminCustomers() {
  const ADMIN_EMAIL = "adm.thaenveedu@gmail.com"
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [customers, setCustomers] = useState([])
  const [searchTerm, setSearchTerm] = useState("")

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
      await loadCustomers()
      setLoading(false)
    })
    return () => unsubscribe()
  }, [router])

  const loadCustomers = async () => {
    try {
      const result = await getAllCustomers()
      if (result.success) {
        setCustomers(result.customers)
      }
    } catch (error) {
      console.error("Error loading customers:", error)
    }
  }

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  )

  const exportToCSV = () => {
    const headers = ["Customer ID", "Name", "Email", "Phone", "Total Orders", "Last Order Date"]
    const rows = filteredCustomers.map(customer => [
      customer.userId,
      customer.name,
      customer.email,
      customer.phone,
      customer.totalOrders,
      customer.lastOrderDate ? new Date(customer.lastOrderDate).toLocaleDateString() : "N/A"
    ])

    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `customers_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
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
      <header className="border-b bg-card shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/admin/dashboard" className="p-2 hover:bg-secondary rounded-md transition-colors">
                <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M15 19l-7-7 7-7"></path>
                </svg>
              </Link>
              <h1 className="font-serif text-xl sm:text-2xl font-bold">Customer List</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Export */}
        <div className="rounded-lg border bg-card p-6 shadow-sm mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-md border bg-background px-4 py-2 text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>
            <button
              onClick={exportToCSV}
              className="rounded-md border px-6 py-2 text-sm font-medium hover:bg-secondary transition-colors"
            >
              Export CSV
            </button>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <p className="text-sm text-muted-foreground">Total Customers</p>
            <p className="text-3xl font-serif font-bold mt-2">{customers.length}</p>
          </div>
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <p className="text-sm text-muted-foreground">Total Orders</p>
            <p className="text-3xl font-serif font-bold mt-2">
              {customers.reduce((sum, c) => sum + c.totalOrders, 0)}
            </p>
          </div>
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <p className="text-sm text-muted-foreground">Avg Orders/Customer</p>
            <p className="text-3xl font-serif font-bold mt-2">
              {customers.length > 0
                ? (customers.reduce((sum, c) => sum + c.totalOrders, 0) / customers.length).toFixed(1)
                : "0"}
            </p>
          </div>
        </div>

        {/* Customers Table */}
        <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary/50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Customer</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Contact</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Total Orders</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Last Order</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-muted-foreground">
                      No customers found
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((customer, index) => (
                    <tr key={customer.userId} className="hover:bg-secondary/20 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium">{customer.name}</p>
                          <p className="text-sm text-muted-foreground">ID: {customer.userId.slice(0, 8)}...</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p>{customer.email}</p>
                          <p className="text-muted-foreground">{customer.phone}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center justify-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium">
                          {customer.totalOrders}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {customer.lastOrderDate
                          ? new Date(customer.lastOrderDate).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric"
                            })
                          : "N/A"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
