"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { auth } from "../../../lib/firebase"
import { onAuthStateChanged } from "firebase/auth"
import { getAllProducts, addProduct, updateProduct, updateProductPrice, deleteProduct } from "../../../lib/product-service"
import Link from "next/link"
import { toast } from "sonner"

export default function AdminProducts() {
  const ADMIN_EMAIL = "adm.thaenveedu@gmail.com"
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [message, setMessage] = useState(null)
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    imageUrl: "",
    weight: "",
    origin: "",
    deliveryCharges: {}
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
      await loadProducts()
      setLoading(false)
    })
    return () => unsubscribe()
  }, [router])

  const loadProducts = async () => {
    const result = await getAllProducts()
    if (result.success) {
      setProducts(result.products)
    }
  }

  const handleAddProduct = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    // Sanitize delivery charges to exact 2 decimals as numbers
    const sanitizedCharges = Object.fromEntries(
      Object.entries(formData.deliveryCharges || {}).map(([k, v]) => {
        const num = Number(v)
        const paise = Number.isFinite(num) ? Math.round(num * 100) : 0
        return [k, paise / 100]
      })
    )

    const result = await addProduct({
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      imageUrl: formData.imageUrl,
      weight: formData.weight,
      origin: formData.origin,
      deliveryCharges: sanitizedCharges
    })

    if (result.success) {
      setMessage({ type: "success", text: "Product added successfully!" })
      setShowAddModal(false)
      setFormData({ name: "", description: "", price: "", imageUrl: "", weight: "", origin: "", deliveryCharges: {} })
      await loadProducts()
    } else {
      setMessage({ type: "error", text: result.error })
    }
    
    setLoading(false)
    setTimeout(() => setMessage(null), 3000)
  }

  const handleEditProduct = async (e) => {
    e.preventDefault()
    setLoading(true)
    const sanitizedCharges = Object.fromEntries(
      Object.entries(formData.deliveryCharges || {}).map(([k, v]) => {
        const num = Number(v)
        const paise = Number.isFinite(num) ? Math.round(num * 100) : 0
        return [k, paise / 100]
      })
    )

    const result = await updateProduct(selectedProduct.id, {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      imageUrl: formData.imageUrl,
      weight: formData.weight,
      origin: formData.origin,
      deliveryCharges: sanitizedCharges
    })

    if (result.success) {
      setMessage({ type: "success", text: "Product updated successfully!" })
      setShowEditModal(false)
      setSelectedProduct(null)
      setFormData({ name: "", description: "", price: "", imageUrl: "", weight: "", origin: "", deliveryCharges: {} })
      await loadProducts()
    } else {
      setMessage({ type: "error", text: result.error })
    }
    
    setLoading(false)
    setTimeout(() => setMessage(null), 3000)
  }

  const handleDeleteProduct = async (productId, productName) => {
    // Show confirmation toast with action buttons
    toast(`Are you sure you want to delete "${productName}"?`, {
      action: {
        label: "Delete",
        onClick: async () => {
          setLoading(true)
          const result = await deleteProduct(productId)

          if (result.success) {
            toast.success("Product deleted successfully!")
            await loadProducts()
          } else {
            toast.error(result.error || "Failed to delete product")
          }
          
          setLoading(false)
        },
      },
      cancel: {
        label: "Cancel",
        onClick: () => {},
      },
    })
  }

  const openEditModal = (product) => {
    setSelectedProduct(product)
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      imageUrl: product.imageUrl,
      weight: product.weight || "",
      origin: product.origin || "",
      deliveryCharges: product.deliveryCharges || {}
    })
    setShowEditModal(true)
  }

  const handleLogout = async () => {
    try {
      await auth.signOut()
      router.push("/admin")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  if (loading && !user) {
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
              <Link href="/admin/dashboard" className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-2xl">🔐</span>
              </Link>
              <div>
                <h1 className="font-serif text-xl sm:text-2xl font-bold">Product Management</h1>
                <p className="text-xs sm:text-sm text-muted-foreground">Manage your product catalog</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/admin/dashboard"
                className="px-4 py-2 rounded-md border hover:bg-secondary transition-colors text-sm font-medium"
              >
                Dashboard
              </Link>
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
        {/* Message Alert */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
            {message.text}
          </div>
        )}

        {/* Add Product Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            + Add New Product
          </button>
        </div>

        {/* Products Table */}
        <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Image</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-muted-foreground">
                      No products found. Add your first product!
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="h-16 w-16 rounded-lg object-cover"
                        />
                      </td>
                      <td className="px-6 py-4 font-medium">{product.name}</td>
                      <td className="px-6 py-4 max-w-xs truncate text-sm text-muted-foreground">
                        {product.description}
                      </td>
                      <td className="px-6 py-4 font-semibold">₹{product.price.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditModal(product)}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors text-sm font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id, product.name)}
                            className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors text-sm font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="font-serif text-2xl font-bold mb-6">Add New Product</h2>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Product Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., Wildflower Honey"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={3}
                  className="w-full px-4 py-2 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Brief description of the product"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Price (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                  className="w-full px-4 py-2 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="14.99"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Image URL *</label>
                <input
                  type="text"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  required
                  className="w-full px-4 py-2 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="/product-image.jpg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Weight</label>
                <input
                  type="text"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  className="w-full px-4 py-2 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., 12 oz (340g)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Origin</label>
                <input
                  type="text"
                  value={formData.origin}
                  onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                  className="w-full px-4 py-2 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., Sustainably harvested"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Delivery Charges per State (₹)</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    "Andaman and Nicobar Islands",
                    "Andhra Pradesh",
                    "Arunachal Pradesh",
                    "Assam",
                    "Bihar",
                    "Chandigarh",
                    "Chhattisgarh",
                    "Dadra and Nagar Haveli and Daman and Diu",
                    "Delhi",
                    "Goa",
                    "Gujarat",
                    "Haryana",
                    "Himachal Pradesh",
                    "Jammu and Kashmir",
                    "Jharkhand",
                    "Karnataka",
                    "Kerala",
                    "Ladakh",
                    "Lakshadweep",
                    "Madhya Pradesh",
                    "Maharashtra",
                    "Manipur",
                    "Meghalaya",
                    "Mizoram",
                    "Nagaland",
                    "Odisha",
                    "Puducherry",
                    "Punjab",
                    "Rajasthan",
                    "Sikkim",
                    "Tamil Nadu",
                    "Telangana",
                    "Tripura",
                    "Uttar Pradesh",
                    "Uttarakhand",
                    "West Bengal",
                  ].map((state) => (
                    <div key={state} className="flex items-center gap-2">
                      <span className="w-40 text-sm">{state}</span>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.deliveryCharges?.[state] ?? ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            deliveryCharges: {
                              ...formData.deliveryCharges,
                              [state]: e.target.value,
                            },
                          })
                        }
                        className="flex-1 px-3 py-2 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="0.00"
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Delivery Charges per State (₹)</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    "Andaman and Nicobar Islands",
                    "Andhra Pradesh",
                    "Arunachal Pradesh",
                    "Assam",
                    "Bihar",
                    "Chandigarh",
                    "Chhattisgarh",
                    "Dadra and Nagar Haveli and Daman and Diu",
                    "Delhi",
                    "Goa",
                    "Gujarat",
                    "Haryana",
                    "Himachal Pradesh",
                    "Jammu and Kashmir",
                    "Jharkhand",
                    "Karnataka",
                    "Kerala",
                    "Ladakh",
                    "Lakshadweep",
                    "Madhya Pradesh",
                    "Maharashtra",
                    "Manipur",
                    "Meghalaya",
                    "Mizoram",
                    "Nagaland",
                    "Odisha",
                    "Puducherry",
                    "Punjab",
                    "Rajasthan",
                    "Sikkim",
                    "Tamil Nadu",
                    "Telangana",
                    "Tripura",
                    "Uttar Pradesh",
                    "Uttarakhand",
                    "West Bengal",
                  ].map((state) => (
                    <div key={state} className="flex items-center gap-2">
                      <span className="w-40 text-sm">{state}</span>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.deliveryCharges?.[state] ?? ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            deliveryCharges: {
                              ...formData.deliveryCharges,
                              [state]: e.target.value,
                            },
                          })
                        }
                        className="flex-1 px-3 py-2 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="0.00"
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Delivery Charges per State (₹)</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    "Andaman and Nicobar Islands",
                    "Andhra Pradesh",
                    "Arunachal Pradesh",
                    "Assam",
                    "Bihar",
                    "Chandigarh",
                    "Chhattisgarh",
                    "Dadra and Nagar Haveli and Daman and Diu",
                    "Delhi",
                    "Goa",
                    "Gujarat",
                    "Haryana",
                    "Himachal Pradesh",
                    "Jammu and Kashmir",
                    "Jharkhand",
                    "Karnataka",
                    "Kerala",
                    "Ladakh",
                    "Lakshadweep",
                    "Madhya Pradesh",
                    "Maharashtra",
                    "Manipur",
                    "Meghalaya",
                    "Mizoram",
                    "Nagaland",
                    "Odisha",
                    "Puducherry",
                    "Punjab",
                    "Rajasthan",
                    "Sikkim",
                    "Tamil Nadu",
                    "Telangana",
                    "Tripura",
                    "Uttar Pradesh",
                    "Uttarakhand",
                    "West Bengal",
                  ].map((state) => (
                    <div key={state} className="flex items-center gap-2">
                      <span className="w-40 text-sm">{state}</span>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.deliveryCharges?.[state] ?? ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            deliveryCharges: {
                              ...formData.deliveryCharges,
                              [state]: e.target.value,
                            },
                          })
                        }
                        className="flex-1 px-3 py-2 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="0.00"
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium hover:opacity-90 disabled:opacity-60 transition-opacity"
                >
                  Add Product
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false)
                    setFormData({ name: "", description: "", price: "", imageUrl: "", weight: "", origin: "", deliveryCharges: {} })
                  }}
                  className="flex-1 border px-4 py-2 rounded-md font-medium hover:bg-secondary transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="font-serif text-2xl font-bold mb-6">Edit Product</h2>
            <form onSubmit={handleEditProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Product Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={3}
                  className="w-full px-4 py-2 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Price (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                  className="w-full px-4 py-2 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Image URL *</label>
                <input
                  type="text"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  required
                  className="w-full px-4 py-2 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Weight</label>
                <input
                  type="text"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  className="w-full px-4 py-2 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., 12 oz (340g)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Origin</label>
                <input
                  type="text"
                  value={formData.origin}
                  onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                  className="w-full px-4 py-2 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., Sustainably harvested"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium hover:opacity-90 disabled:opacity-60 transition-opacity"
                >
                  Update Product
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false)
                    setSelectedProduct(null)
                    setFormData({ name: "", description: "", price: "", imageUrl: "", weight: "", origin: "", deliveryCharges: {} })
                  }}
                  className="flex-1 border px-4 py-2 rounded-md font-medium hover:bg-secondary transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
