"use client"
import { useEffect, useMemo, useState } from "react"
import Navbar from "../../components/navbar"
import CartDrawer from "../../components/cart-drawer"
import LoginModal from "../../components/login-modal"
import { UIProvider } from "../../components/cart-ui-context"
import { useCart } from "../../lib/cart-store"
import { auth, db } from "../../lib/firebase"
import { onAuthStateChanged } from "firebase/auth"
import { doc, getDoc, setDoc, arrayUnion } from "firebase/firestore"
import { createOrder } from "../../lib/order-service"
import { getProductById } from "../../lib/product-service"
import { validateOrderData, sanitizeInput } from "../../lib/security"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Script from "next/script"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"

export default function CheckoutPage() {
  const router = useRouter()
  const { items, subtotal, clear } = useCart()
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [user, setUser] = useState(null)
  const [orderId, setOrderId] = useState(null)
  const [razorpayLoaded, setRazorpayLoaded] = useState(false)
  const [razorpayLoading, setRazorpayLoading] = useState(true)
  const [showRetry, setShowRetry] = useState(false)
  const [deliveryCharge, setDeliveryCharge] = useState(0)
  const [deliveryBreakdown, setDeliveryBreakdown] = useState([])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      if (!currentUser && step > 1) {
        router.push('/checkout')
        setStep(1)
      }
    })
    return () => unsubscribe()
  }, [router, step])

  // Set a timeout to show retry button if Razorpay doesn't load
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!razorpayLoaded) {
        setRazorpayLoading(false)
        setShowRetry(true)
      }
    }, 10000) // 10 seconds timeout

    return () => clearTimeout(timer)
  }, [razorpayLoaded])

  const [addr, setAddr] = useState({
    fullName: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    phone: "",
    email: "",
    save: true,
  })
  const [validationErrors, setValidationErrors] = useState({})

  const INDIAN_STATES = [
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
  ]

  // Load user data and saved addresses
  useEffect(() => {
    if (user) {
      loadUserProfile()
    }
  }, [user])

  async function loadUserProfile() {
    if (!user) return
    try {
      const docRef = doc(db, 'users', user.uid)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        const data = docSnap.data()
        // Pre-fill form with user data if available
        setAddr(prev => ({
          ...prev,
          fullName: prev.fullName || data.displayName || user.displayName || "",
          email: prev.email || data.email || user.email || "",
          phone: prev.phone || data.phone || user.phoneNumber || "",
        }))
        
        // If user has saved addresses, pre-fill with the most recent one
        if (data.addresses && data.addresses.length > 0) {
          const lastAddress = data.addresses[data.addresses.length - 1]
          setAddr(prev => ({
            ...prev,
            ...lastAddress,
            save: true
          }))
        }
      }
    } catch (error) {
      console.error("Error loading user profile:", error)
    }
  }

  async function saveAddressIfNeeded() {
    if (!addr.save || !user) return
    try {
      const docRef = doc(db, 'users', user.uid)
      const newAddress = {
        fullName: addr.fullName,
        street: addr.street,
        city: addr.city,
        state: addr.state,
        postalCode: addr.postalCode,
        phone: addr.phone,
        email: addr.email || user.email,
      }
      
      // Save to Firestore using arrayUnion to avoid duplicates
      await setDoc(docRef, {
        addresses: arrayUnion(newAddress),
        displayName: addr.fullName,
        phone: addr.phone,
        updatedAt: new Date()
      }, { merge: true })
    } catch (e) {
      console.warn("Failed to save address", e)
    }
  }

  // Precompute delivery charge for selected state and items
  useEffect(() => {
    let cancelled = false
    async function compute() {
      if (!addr.state || items.length === 0) {
        if (!cancelled) {
          setDeliveryCharge(0)
          setDeliveryBreakdown([])
        }
        return
      }
      try {
        const products = await Promise.all(
          items.map(async (i) => {
            const res = await getProductById(i.id)
            return res.success ? res.product : null
          })
        )
        let chargePaise = 0
        const parts = []
        products.forEach((p, idx) => {
          if (!p) return
          const raw = p.deliveryCharges?.[addr.state]
          const perUnitPaise = raw ? Math.round(Number(raw) * 100) : 0
          const qty = items[idx]?.quantity || 1
          chargePaise += perUnitPaise * qty
          parts.push({
            name: items[idx]?.name || p.name,
            perUnit: perUnitPaise / 100,
            qty,
            total: (perUnitPaise * qty) / 100,
          })
        })
        if (!cancelled) {
          setDeliveryCharge(chargePaise / 100)
          setDeliveryBreakdown(parts)
        }
      } catch (e) {
        console.warn("Failed to compute delivery charges", e)
        if (!cancelled) {
          setDeliveryCharge(0)
          setDeliveryBreakdown([])
        }
      }
    }
    compute()
    return () => { cancelled = true }
  }, [addr.state, items])

  async function placeOrder() {
    setError("")
    setSaving(true)
    
    try {
      if (!user) {
        throw new Error("Please sign in to place an order")
      }

      if (items.length === 0) {
        throw new Error("Your cart is empty")
      }

      if (!razorpayLoaded) {
        setError("Payment system is still loading. Please wait...")
        setSaving(false)
        return
      }

      // Sanitize inputs
      const sanitizedAddress = {
        fullName: sanitizeInput(addr.fullName),
        street: sanitizeInput(addr.street),
        city: sanitizeInput(addr.city),
        state: sanitizeInput(addr.state),
        postalCode: sanitizeInput(addr.postalCode),
        phone: sanitizeInput(addr.phone),
        email: sanitizeInput(addr.email || user.email)
      }

      // Create order data
      const orderData = {
        items: items.map(item => ({
          id: item.id,
          name: sanitizeInput(item.name),
          price: parseFloat(item.price),
          quantity: parseInt(item.quantity),
          imageUrl: item.imageUrl
        })),
        subtotal: parseFloat(subtotal),
        shippingAddress: sanitizedAddress
      }

      // Validate order data - display errors in UI instead of throwing
      const validation = validateOrderData(orderData)
      if (!validation.isValid) {
        setError(validation.errors.join(', '))
        setSaving(false)
        return
      }

      // Initialize Razorpay with precomputed delivery charge
      const totalAmount = subtotal + deliveryCharge
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: Math.round(totalAmount * 100), // Razorpay expects amount in paise (multiply by 100)
        currency: 'INR', // Changed to INR to enable UPI and other Indian payment methods
        name: 'Thaenveedu',
        description: 'Authentic Honey Purchase',
        image: '/Honey1.avif',
        handler: async function (response) {
          // Payment successful
          console.log('Payment successful:', response)
          
          try {
            // Add payment info to order data
            const orderDataWithPayment = {
              ...orderData,
              deliveryCharge,
              total: totalAmount,
              paymentId: response.razorpay_payment_id,
              paymentStatus: 'completed'
            }

            // Create order in Firestore
            const result = await createOrder(user.uid, orderDataWithPayment)
            
            if (result.success) {
              setOrderId(result.orderId)
              await saveAddressIfNeeded()
              clear()
              setStep(3)
            } else {
              throw new Error(result.error || "Failed to create order")
            }
          } catch (e) {
            console.error("Order creation error:", e)
            setError("Payment successful but order creation failed. Please contact support with payment ID: " + response.razorpay_payment_id)
            setSaving(false)
          }
        },
        prefill: {
          name: sanitizedAddress.fullName,
          email: sanitizedAddress.email,
          contact: sanitizedAddress.phone
        },
        notes: {
          address: `${sanitizedAddress.street}, ${sanitizedAddress.city}, ${sanitizedAddress.state} ${sanitizedAddress.postalCode}`
        },
        theme: {
          color: '#f59e0b'
        },
        modal: {
          ondismiss: function() {
            setSaving(false)
            setError("Payment cancelled. Please try again.")
          }
        }
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()
      
    } catch (e) {
      console.error("Order placement error:", e)
      setError(e.message || "Failed to place order")
      setSaving(false)
    }
  }

  const Review = useMemo(
    () => (
      <div className="space-y-3">
        {items.map((i) => (
          <div key={i.id} className="flex items-center justify-between">
            <span className="text-sm">
              {i.name} × {i.quantity}
            </span>
            <span className="text-sm">₹{(i.price * i.quantity).toFixed(2)}</span>
          </div>
        ))}
        <div className="flex items-center justify-between border-t pt-3">
          <span className="font-medium">Items Subtotal</span>
          <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
        </div>
        {addr.state && (
          <div className="flex items-center justify-between">
            <span className="text-sm">Delivery ({addr.state})</span>
            <span className="text-sm">₹{deliveryCharge.toFixed(2)}</span>
          </div>
        )}
        {addr.state && deliveryBreakdown.length > 0 && (
          <div className="text-xs text-muted-foreground space-y-1">
            {deliveryBreakdown.map((d, i) => (
              <div key={i} className="flex items-center justify-between">
                <span>{d.name} × {d.qty}</span>
                <span>₹{d.total.toFixed(2)} (₹{d.perUnit.toFixed(2)}/unit)</span>
              </div>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="font-medium">Total</span>
          <span className="font-semibold">₹{(subtotal + deliveryCharge).toFixed(2)}</span>
        </div>
      </div>
    ),
    [items, subtotal, addr.state, deliveryCharge],
  )

  return (
    <UIProvider>
      <Script 
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => {
          setRazorpayLoaded(true)
          setRazorpayLoading(false)
          setShowRetry(false)
        }}
        onError={() => {
          setRazorpayLoading(false)
          setShowRetry(true)
          setError("Failed to load payment system.")
        }}
      />
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl">Checkout</h1>

        {step === 1 && (
          <form
            className="mt-6 md:mt-8 space-y-4 md:space-y-6"
            onSubmit={async (e) => {
              e.preventDefault()
              
              // Validate form
              const errors = {}
              
              if (!addr.fullName.trim()) {
                errors.fullName = "Full name is required"
              }
              
              if (addr.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addr.email)) {
                errors.email = "Please enter a valid email address"
              }
              
              if (!addr.phone.trim()) {
                errors.phone = "Phone number is required"
              } else if (!/^[0-9+\-\s()]{10,}$/.test(addr.phone)) {
                errors.phone = "Please enter a valid phone number (numbers only)"
              }
              
              if (!addr.street.trim()) {
                errors.street = "Street address is required"
              }
              
              if (!addr.city.trim()) {
                errors.city = "City is required"
              }
              
              if (!addr.state.trim()) {
                errors.state = "State is required"
              }
              
              if (!addr.postalCode.trim()) {
                errors.postalCode = "Postal code is required"
              } else if (!/^[0-9]{5,10}$/.test(addr.postalCode)) {
                errors.postalCode = "Please enter a valid postal code (numbers only)"
              }
              
              if (Object.keys(errors).length > 0) {
                setValidationErrors(errors)
                return
              }
              
              setValidationErrors({})
              setSaving(true)
              await saveAddressIfNeeded()
              setSaving(false)
              setStep(2)
            }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full name"
                value={addr.fullName}
                onChange={(v) => {
                  setAddr({ ...addr, fullName: v })
                  if (validationErrors.fullName) {
                    setValidationErrors({ ...validationErrors, fullName: undefined })
                  }
                }}
                error={validationErrors.fullName}
              />
              <Input
                label="Email address"
                type="email"
                value={addr.email}
                onChange={(v) => {
                  setAddr({ ...addr, email: v })
                  if (validationErrors.email) {
                    setValidationErrors({ ...validationErrors, email: undefined })
                  }
                }}
                error={validationErrors.email}
              />
              <Input
                label="Phone number"
                value={addr.phone}
                onChange={(v) => {
                  // Only allow numbers, +, -, spaces, and parentheses
                  const cleaned = v.replace(/[^0-9+\-\s()]/g, '')
                  setAddr({ ...addr, phone: cleaned })
                  if (validationErrors.phone) {
                    setValidationErrors({ ...validationErrors, phone: undefined })
                  }
                }}
                error={validationErrors.phone}
                placeholder="1234567890"
              />
            </div>
            <Input
              label="Street address"
              value={addr.street}
              onChange={(v) => {
                setAddr({ ...addr, street: v })
                if (validationErrors.street) {
                  setValidationErrors({ ...validationErrors, street: undefined })
                }
              }}
              error={validationErrors.street}
            />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input 
                label="City" 
                value={addr.city} 
                onChange={(v) => {
                  setAddr({ ...addr, city: v })
                  if (validationErrors.city) {
                    setValidationErrors({ ...validationErrors, city: undefined })
                  }
                }} 
                error={validationErrors.city}
              />
              <label className="block text-sm sm:text-base">
                <span className="font-medium">State</span>
                <div className="mt-2">
                  <Select
                    value={addr.state || undefined}
                    onValueChange={(v) => {
                      setAddr({ ...addr, state: v })
                      if (validationErrors.state) {
                        setValidationErrors({ ...validationErrors, state: undefined })
                      }
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select your state" />
                    </SelectTrigger>
                    <SelectContent>
                      {INDIAN_STATES.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {validationErrors.state && (
                  <span className="mt-1 text-xs sm:text-sm text-destructive">{validationErrors.state}</span>
                )}
              </label>
              <Input
                label="Postal code"
                value={addr.postalCode}
                onChange={(v) => {
                  // Only allow numbers
                  const cleaned = v.replace(/[^0-9]/g, '')
                  setAddr({ ...addr, postalCode: cleaned })
                  if (validationErrors.postalCode) {
                    setValidationErrors({ ...validationErrors, postalCode: undefined })
                  }
                }}
                error={validationErrors.postalCode}
                placeholder="123456"
                maxLength={10}
              />
            </div>
            <label className="flex items-start gap-3 text-sm sm:text-base cursor-pointer">
              <input
                type="checkbox"
                checked={addr.save}
                onChange={(e) => setAddr({ ...addr, save: e.target.checked })}
                className="mt-1"
              />
              <span>Save this address for future orders</span>
            </label>
            <button
              type="submit"
              className="w-full sm:w-auto rounded-md bg-primary px-6 py-3 sm:py-4 text-sm sm:text-base font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60 transition-opacity"
              disabled={saving}
            >
              {saving ? "Saving..." : "Continue to Payment"}
            </button>
          </form>
        )}

        {step === 2 && (
          <section className="mt-6 md:mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div className="rounded-lg border bg-card p-4 sm:p-6">
              <h2 className="font-serif text-xl sm:text-2xl">Delivery Address</h2>
              <ul className="mt-4 text-sm sm:text-base text-muted-foreground space-y-1.5">
                <li className="font-medium text-foreground">{addr.fullName}</li>
                <li>{addr.street}</li>
                <li>
                  {addr.city}, {addr.state} {addr.postalCode}
                </li>
                <li>{addr.phone}</li>
              </ul>
              <button 
                onClick={() => setStep(1)} 
                className="mt-4 text-sm sm:text-base text-primary hover:underline"
              >
                Edit Address
              </button>
            </div>
            <div className="rounded-lg border bg-card p-4 sm:p-6">
              <h2 className="font-serif text-xl sm:text-2xl">Your Order</h2>
              <div className="mt-4">{Review}</div>
              
              {razorpayLoading && !razorpayLoaded && (
                <div className="mt-6 flex items-center justify-center gap-3 p-4 rounded-md bg-secondary/50">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                  <span className="text-sm text-muted-foreground">Loading payment system...</span>
                </div>
              )}
              
              {showRetry && !razorpayLoaded && (
                <div className="mt-6 text-center space-y-3">
                  <p className="text-sm text-muted-foreground">Payment system is taking longer than expected</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="w-full rounded-md border border-primary px-4 py-3 text-sm sm:text-base font-medium text-primary hover:bg-primary/10 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              )}
              
              {!razorpayLoading && razorpayLoaded && (
                <button
                  onClick={placeOrder}
                  disabled={saving}
                  className="mt-6 w-full rounded-md bg-primary px-4 py-3 sm:py-4 text-sm sm:text-base font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60 transition-opacity"
                >
                  {saving ? "Placing Order..." : "Place Order"}
                </button>
              )}
              
              {error && (
                <div className="mt-4 rounded-md bg-destructive/10 p-3 sm:p-4 text-sm sm:text-base text-destructive">
                  {error}
                </div>
              )}
            </div>
          </section>
        )}

        {step === 3 && (
          <section className="mt-10 md:mt-16 rounded-xl border bg-card p-6 sm:p-8 md:p-12 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 sm:w-10 sm:h-10 text-primary" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl">Thank You!</h2>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-md mx-auto">
              Your order has been placed successfully. A confirmation email will be sent to you shortly.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm sm:text-base font-medium text-primary-foreground hover:opacity-90 transition-opacity"
              >
                Continue Shopping
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-md border px-6 py-3 text-sm sm:text-base font-medium hover:bg-secondary transition-colors"
              >
                Back to Home
              </Link>
            </div>
          </section>
        )}
      </main>
      <CartDrawer />
      <LoginModal />
    </UIProvider>
  )
}

function Input({ label, value, onChange, type = "text", error, placeholder, maxLength }) {
  return (
    <label className="block text-sm sm:text-base">
      <span className="font-medium">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className={`mt-2 w-full rounded-md border bg-background px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base placeholder:text-muted-foreground/40 placeholder:text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all ${
          error ? 'border-destructive focus:ring-destructive/50 focus:border-destructive' : ''
        }`}
      />
      {error && (
        <span className="mt-1 text-xs sm:text-sm text-destructive">{error}</span>
      )}
    </label>
  )
}
