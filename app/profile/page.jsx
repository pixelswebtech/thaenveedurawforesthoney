"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { auth, db } from "../../lib/firebase"
import { onAuthStateChanged } from "firebase/auth"
import { doc, getDoc, setDoc } from "firebase/firestore"
import Navbar from "../../components/navbar"
import Footer from "../../components/footer"
import CartDrawer from "../../components/cart-drawer"
import LoginModal from "../../components/login-modal"
import { UIProvider } from "../../components/cart-ui-context"
import Link from "next/link"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"

function AddressInput({ label, value, onChange, error, type = "text", placeholder, maxLength }) {
  return (
    <label className="block text-sm">
      <span className="font-medium">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className={`mt-2 w-full rounded-md border bg-background px-4 py-2 text-sm placeholder:text-muted-foreground/40 placeholder:text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all ${
          error ? 'border-destructive focus:ring-destructive/50 focus:border-destructive' : ''
        }`}
      />
      {error && (
        <span className="mt-1 text-xs text-destructive">{error}</span>
      )}
    </label>
  )
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState({
    displayName: "",
    phone: "",
    addresses: []
  })
  const [editMode, setEditMode] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingAddress, setEditingAddress] = useState(null)
  const [addressForm, setAddressForm] = useState({
    fullName: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    phone: "",
    email: ""
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push('/')
        return
      }
      
      setUser(currentUser)
      await loadProfile(currentUser.uid)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [router])

  const loadProfile = async (userId) => {
    try {
      const docRef = doc(db, 'users', userId)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        setProfile(docSnap.data())
      } else {
        // Initialize with user data
        const initialProfile = {
          displayName: user?.displayName || "",
          email: user?.email || "",
          phone: user?.phoneNumber || "",
          addresses: []
        }
        setProfile(initialProfile)
      }
    } catch (error) {
      console.error("Error loading profile:", error)
    }
  }

  const saveProfile = async () => {
    if (!user) return
    
    setSaving(true)
    try {
      const docRef = doc(db, 'users', user.uid)
      await setDoc(docRef, {
        ...profile,
        email: user.email,
        updatedAt: new Date()
      }, { merge: true })
      
      setEditMode(false)
      alert("Profile saved successfully!")
    } catch (error) {
      console.error("Error saving profile:", error)
      alert("Failed to save profile")
    } finally {
      setSaving(false)
    }
  }

  const removeAddress = async (index) => {
    if (!confirm("Are you sure you want to remove this address?")) return
    
    const newAddresses = profile.addresses.filter((_, i) => i !== index)
    setProfile({ ...profile, addresses: newAddresses })
    
    if (user) {
      try {
        const docRef = doc(db, 'users', user.uid)
        await setDoc(docRef, { addresses: newAddresses }, { merge: true })
      } catch (error) {
        console.error("Error removing address:", error)
        alert("Failed to remove address")
      }
    }
  }

  const startEditAddress = (index) => {
    const address = profile.addresses[index]
    setAddressForm(address)
    setEditingAddress(index)
    setValidationErrors({})
  }

  const startAddAddress = () => {
    setAddressForm({
      fullName: profile.displayName || "",
      street: "",
      city: "",
      state: "",
      postalCode: "",
      phone: profile.phone || "",
      email: user?.email || ""
    })
    setEditingAddress(-1) // -1 indicates new address
    setValidationErrors({})
  }

  const cancelEditAddress = () => {
    setEditingAddress(null)
    setAddressForm({
      fullName: "",
      street: "",
      city: "",
      state: "",
      postalCode: "",
      phone: "",
      email: ""
    })
    setValidationErrors({})
  }

  const saveAddress = async () => {
    // Validate form
    const errors = {}
    
    if (!addressForm.fullName.trim()) {
      errors.fullName = "Full name is required"
    }
    
    if (addressForm.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addressForm.email)) {
      errors.email = "Please enter a valid email address"
    }
    
    if (!addressForm.phone.trim()) {
      errors.phone = "Phone number is required"
    } else if (!/^[0-9+\-\s()]{10,}$/.test(addressForm.phone)) {
      errors.phone = "Please enter a valid phone number (numbers only)"
    }
    
    if (!addressForm.street.trim()) {
      errors.street = "Street address is required"
    }
    
    if (!addressForm.city.trim()) {
      errors.city = "City is required"
    }
    
    if (!addressForm.state.trim()) {
      errors.state = "State is required"
    }
    
    if (!addressForm.postalCode.trim()) {
      errors.postalCode = "Postal code is required"
    } else if (!/^[0-9]{5,10}$/.test(addressForm.postalCode)) {
      errors.postalCode = "Please enter a valid postal code (numbers only)"
    }
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      return
    }

    setSaving(true)
    try {
      let newAddresses
      if (editingAddress === -1) {
        // Add new address
        newAddresses = [...(profile.addresses || []), addressForm]
      } else {
        // Update existing address
        newAddresses = [...profile.addresses]
        newAddresses[editingAddress] = addressForm
      }
      
      const docRef = doc(db, 'users', user.uid)
      await setDoc(docRef, { addresses: newAddresses }, { merge: true })
      
      setProfile({ ...profile, addresses: newAddresses })
      cancelEditAddress()
      alert("Address saved successfully!")
    } catch (error) {
      console.error("Error saving address:", error)
      alert("Failed to save address")
    } finally {
      setSaving(false)
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
    <UIProvider>
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 md:py-16 min-h-screen">
        <div className="mb-8">
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl">My Profile</h1>
          <p className="mt-2 text-muted-foreground">Manage your account information and addresses</p>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Link
            href="/orders"
            className="rounded-lg border bg-card p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-2xl">📦</span>
              </div>
              <div>
                <p className="font-medium">My Orders</p>
                <p className="text-sm text-muted-foreground">Track orders</p>
              </div>
            </div>
          </Link>

          <Link
            href="/shop"
            className="rounded-lg border bg-card p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-2xl">🛍️</span>
              </div>
              <div>
                <p className="font-medium">Shop</p>
                <p className="text-sm text-muted-foreground">Browse products</p>
              </div>
            </div>
          </Link>

          <button
            onClick={() => auth.signOut().then(() => router.push('/'))}
            className="rounded-lg border bg-card p-4 hover:shadow-md transition-shadow text-left"
          >
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-2xl">🚪</span>
              </div>
              <div>
                <p className="font-medium">Sign Out</p>
                <p className="text-sm text-muted-foreground">Logout</p>
              </div>
            </div>
          </button>
        </div>

        {/* Profile Information */}
        <div className="rounded-lg border bg-card p-6 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-2xl">Account Information</h2>
            {!editMode && (
              <button
                onClick={() => setEditMode(true)}
                className="px-4 py-2 rounded-md border hover:bg-secondary transition-colors text-sm font-medium"
              >
                Edit Profile
              </button>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={user?.email || ""}
                disabled
                className="w-full rounded-md border bg-muted px-4 py-2 text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Display Name</label>
              <input
                type="text"
                value={profile.displayName}
                onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                disabled={!editMode}
                className="w-full rounded-md border bg-background px-4 py-2 text-sm disabled:bg-muted"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Phone Number</label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                disabled={!editMode}
                placeholder="+1 555 123 4567"
                className="w-full rounded-md border bg-background px-4 py-2 text-sm disabled:bg-muted"
              />
            </div>

            {editMode && (
              <div className="flex gap-3 pt-4">
                <button
                  onClick={saveProfile}
                  disabled={saving}
                  className="px-6 py-2 rounded-md bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-60 transition-opacity text-sm font-medium"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  onClick={() => {
                    setEditMode(false)
                    loadProfile(user.uid)
                  }}
                  className="px-6 py-2 rounded-md border hover:bg-secondary transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Saved Addresses */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-2xl">Saved Addresses</h2>
            {editingAddress === null && (
              <button
                onClick={startAddAddress}
                className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-opacity text-sm font-medium"
              >
                Add Address
              </button>
            )}
          </div>
          
          {/* Address Form (Edit/Add) */}
          {editingAddress !== null && (
            <div className="mb-6 p-4 border rounded-lg bg-secondary/10">
              <h3 className="font-medium mb-4">
                {editingAddress === -1 ? 'Add New Address' : 'Edit Address'}
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <AddressInput
                    label="Full name"
                    value={addressForm.fullName}
                    onChange={(v) => {
                      setAddressForm({ ...addressForm, fullName: v })
                      if (validationErrors.fullName) {
                        setValidationErrors({ ...validationErrors, fullName: undefined })
                      }
                    }}
                    error={validationErrors.fullName}
                  />
                  <AddressInput
                    label="Email"
                    type="email"
                    value={addressForm.email}
                    onChange={(v) => {
                      setAddressForm({ ...addressForm, email: v })
                      if (validationErrors.email) {
                        setValidationErrors({ ...validationErrors, email: undefined })
                      }
                    }}
                    error={validationErrors.email}
                  />
                  <AddressInput
                    label="Phone number"
                    value={addressForm.phone}
                    onChange={(v) => {
                      const cleaned = v.replace(/[^0-9+\-\s()]/g, '')
                      setAddressForm({ ...addressForm, phone: cleaned })
                      if (validationErrors.phone) {
                        setValidationErrors({ ...validationErrors, phone: undefined })
                      }
                    }}
                    error={validationErrors.phone}
                    placeholder="1234567890"
                  />
                </div>
                
                <AddressInput
                  label="Street address"
                  value={addressForm.street}
                  onChange={(v) => {
                    setAddressForm({ ...addressForm, street: v })
                    if (validationErrors.street) {
                      setValidationErrors({ ...validationErrors, street: undefined })
                    }
                  }}
                  error={validationErrors.street}
                />
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <AddressInput
                    label="City"
                    value={addressForm.city}
                    onChange={(v) => {
                      setAddressForm({ ...addressForm, city: v })
                      if (validationErrors.city) {
                        setValidationErrors({ ...validationErrors, city: undefined })
                      }
                    }}
                    error={validationErrors.city}
                  />
                  <label className="block text-sm">
                    <span className="font-medium">State</span>
                    <div className="mt-2">
                      <Select
                        value={addressForm.state || undefined}
                        onValueChange={(v) => {
                          setAddressForm({ ...addressForm, state: v })
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
                      <span className="mt-1 text-xs text-destructive">{validationErrors.state}</span>
                    )}
                  </label>
                  <AddressInput
                    label="Postal code"
                    value={addressForm.postalCode}
                    onChange={(v) => {
                      const cleaned = v.replace(/[^0-9]/g, '')
                      setAddressForm({ ...addressForm, postalCode: cleaned })
                      if (validationErrors.postalCode) {
                        setValidationErrors({ ...validationErrors, postalCode: undefined })
                      }
                    }}
                    error={validationErrors.postalCode}
                    placeholder="123456"
                    maxLength={10}
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={saveAddress}
                    disabled={saving}
                    className="px-6 py-2 rounded-md bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-60 transition-opacity text-sm font-medium"
                  >
                    {saving ? "Saving..." : "Save Address"}
                  </button>
                  <button
                    onClick={cancelEditAddress}
                    disabled={saving}
                    className="px-6 py-2 rounded-md border hover:bg-secondary transition-colors text-sm font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Address List */}
          {profile.addresses && profile.addresses.length > 0 ? (
            <div className="space-y-4">
              {profile.addresses.map((address, index) => (
                <div key={index} className="border rounded-lg p-4 flex items-start justify-between">
                  <div>
                    <p className="font-medium">{address.fullName}</p>
                    <p className="text-sm text-muted-foreground mt-1">{address.street}</p>
                    <p className="text-sm text-muted-foreground">
                      {address.city}, {address.state} {address.postalCode}
                    </p>
                    <p className="text-sm text-muted-foreground">{address.phone}</p>
                    {address.email && (
                      <p className="text-sm text-muted-foreground">{address.email}</p>
                    )}
                  </div>
                  {editingAddress === null && (
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => startEditAddress(index)}
                        className="text-sm text-primary hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => removeAddress(index)}
                        className="text-sm text-destructive hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : editingAddress === null ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No saved addresses yet</p>
              <p className="text-sm text-muted-foreground">Click "Add Address" button above to create one</p>
            </div>
          ) : null}
        </div>
      </main>
      <Footer />
      <CartDrawer />
      <LoginModal />
    </UIProvider>
  )
}
