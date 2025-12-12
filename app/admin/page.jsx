"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { auth } from "../../lib/firebase"
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from "firebase/auth"
import Navbar from "../../components/navbar"
import Footer from "../../components/footer"
import CartDrawer from "../../components/cart-drawer"
import LoginModal from "../../components/login-modal"
import { UIProvider } from "../../components/cart-ui-context"

export default function AdminLogin() {
  const ADMIN_EMAIL = "adm.thaenveedu@gmail.com"
  const router = useRouter()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Check if user is admin
        const token = await user.getIdTokenResult()
        const tokenEmail = token.claims?.email || user.email
        const hasAdminClaim = !!token.claims?.admin
        const isAllowlisted = tokenEmail === ADMIN_EMAIL
        if (hasAdminClaim || isAllowlisted) {
          router.push("/admin/dashboard")
        } else {
          // User is signed in but not admin - redirect to shop
          router.push("/shop")
        }
      } else {
        setChecking(false)
      }
    })
    return () => unsubscribe()
  }, [router])

  const handleGoogleLogin = async () => {
    setError("")
    setLoading(true)

    try {
      const provider = new GoogleAuthProvider()
      const userCredential = await signInWithPopup(auth, provider)
      const user = userCredential.user
      
      // Check if user has admin claim
      const token = await user.getIdTokenResult()
      const tokenEmail = token.claims?.email || user.email
      const hasAdminClaim = !!token.claims?.admin
      const isAllowlisted = tokenEmail === ADMIN_EMAIL
      if (hasAdminClaim || isAllowlisted) {
        router.push("/admin/dashboard")
      } else {
        setError(`Admin access not set for ${user.email}.`)
        // Don't sign out, let them stay signed in
      }
    } catch (err) {
      console.error("Login error:", err)
      if (err.code === 'auth/popup-closed-by-user') {
        setError("Sign-in cancelled")
      } else {
        setError("Failed to sign in. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <UIProvider>
      <Navbar />
      <main className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-b from-background to-secondary/20">
        <div className="w-full max-w-md">
          <div className="rounded-xl border bg-card p-8 shadow-lg">
            <div className="text-center mb-8">
              <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🔐</span>
              </div>
              <h1 className="font-serif text-3xl font-bold">Admin Login</h1>
              <p className="mt-2 text-muted-foreground">
                Sign in to access the admin dashboard
              </p>
            </div>

            <div className="space-y-6">
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full rounded-lg bg-primary px-4 py-3 text-base font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60 transition-opacity flex items-center justify-center gap-3"
              >
                {loading ? (
                  "Signing in..."
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="currentColor"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="currentColor"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="currentColor"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="currentColor"/>
                    </svg>
                    Sign in with Google
                  </>
                )}
              </button>

              {error && (
                <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
                  {error}
                </div>
              )}
            </div>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              <p>Only authorized admin accounts can access this area</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <CartDrawer />
      <LoginModal />
    </UIProvider>
  )
}
