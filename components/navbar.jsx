"use client"
import Link from "next/link"
import { useUI } from "./cart-ui-context"
import { useCart } from "../lib/cart-store"
import { auth } from "../lib/firebase"
import { onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth"
import { useState, useEffect } from "react"

export default function Navbar() {
  const ADMIN_EMAIL = "adm.thaenveedu@gmail.com"
  const { toggleCart, openAuth } = useUI()
  const { items } = useCart()
  const count = items.reduce((n, i) => n + i.quantity, 0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser)
      if (currentUser) {
        try {
          const token = await currentUser.getIdTokenResult()
          const tokenEmail = token.claims?.email || currentUser.email
          const hasAdminClaim = !!token.claims?.admin
          const isAllowlisted = tokenEmail === ADMIN_EMAIL
          setIsAdmin(hasAdminClaim || isAllowlisted)
        } catch (e) {
          console.error("Error checking admin status:", e)
        }
      } else {
        setIsAdmin(false)
      }
    })
    return () => unsubscribe()
  }, [])

  const handleLogout = async () => {
    try {
      await firebaseSignOut(auth)
      setMobileMenuOpen(false)
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-transparent backdrop-blur-md border-b border-foreground/10">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/" className="flex items-center gap-2 sm:gap-3">
              <img src="/logo.png" alt="Thaenveedu logo" className="h-8 w-8 sm:h-10 sm:w-10" />
            </Link>
            <Link href="/" className="text-lg sm:text-xl md:text-2xl font-serif font-semibold text-foreground hover:text-primary transition-colors">
              Thaenveedu
            </Link>
          </div>

          {/* Desktop Navigation */}
          <ul className="hidden lg:flex items-center gap-8 text-sm font-medium">
            <li>
              <Link href="/" className="hover:text-primary transition-colors">
                Home
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-primary transition-colors">
                About
              </Link>
            </li>
            <li>
              <Link href="/shop" className="hover:text-primary transition-colors">
                Shop All
              </Link>
            </li>
            <li>
              <Link href="/#our-story" className="hover:text-primary transition-colors">
                Our Story
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-primary transition-colors">
                Contact
              </Link>
            </li>
          </ul>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {user && (
              <>
                {isAdmin && (
                  <Link
                    href="/admin/dashboard"
                    className="hidden sm:inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-md border border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 transition-colors text-sm sm:text-base font-medium"
                  >
                    <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                    </svg>
                    <span>Admin</span>
                  </Link>
                )}
                <Link
                  href="/profile"
                  className="hidden sm:inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-md border hover:bg-secondary transition-colors text-sm sm:text-base font-medium"
                  aria-label="View profile"
                >
                  <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                  <span>Profile</span>
                </Link>
                <Link
                  href="/orders"
                  className="hidden sm:inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-md border hover:bg-secondary transition-colors text-sm sm:text-base font-medium"
                >
                  <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                  </svg>
                  <span>Orders</span>
                </Link>
              </>
            )}
            <button
              aria-label="Open cart"
              onClick={toggleCart}
              className="relative rounded-md px-3 sm:px-4 py-2 bg-primary text-primary-foreground hover:opacity-90 transition-opacity text-sm sm:text-base font-medium flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
              <span>Cart</span>
              {count > 0 && (
                <span
                  aria-label={`${count} items in cart`}
                  className="absolute -top-2 -right-2 text-xs bg-accent text-accent-foreground rounded-full h-5 w-5 flex items-center justify-center font-bold"
                >
                  {count}
                </span>
              )}
            </button>
            {user ? (
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={handleLogout}
                  className="px-3 sm:px-4 py-2 rounded-md border hover:bg-secondary transition-colors text-sm sm:text-base font-medium"
                  aria-label="Sign out"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={openAuth}
                className="hidden sm:inline-flex px-3 sm:px-4 py-2 rounded-md border hover:bg-secondary transition-colors text-sm sm:text-base font-medium"
                aria-label="Sign in to your account"
              >
                Sign In
              </button>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-md hover:bg-secondary transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t pt-4 space-y-3">
            <Link
              href="/"
              className="block py-2 text-base font-medium hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/about"
              className="block py-2 text-base font-medium hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
            <Link
              href="/shop"
              className="block py-2 text-base font-medium hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Shop All
            </Link>
            {user && (
              <>
                <Link
                  href="/profile"
                  className="block py-2 text-base font-medium hover:text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Profile
                </Link>
                <Link
                  href="/orders"
                  className="block py-2 text-base font-medium hover:text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Orders
                </Link>
              </>
            )}
            <Link
              href="/#our-story"
              className="block py-2 text-base font-medium hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Our Story
            </Link>
            <Link
              href="/contact"
              className="block py-2 text-base font-medium hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact
            </Link>
            {user ? (
              <div className="sm:hidden space-y-2 border-t pt-3">
                <button
                  onClick={handleLogout}
                  className="block w-full text-left py-2 text-base font-medium hover:text-primary transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  openAuth()
                  setMobileMenuOpen(false)
                }}
                className="block w-full text-left py-2 text-base font-medium hover:text-primary transition-colors sm:hidden"
              >
                Sign In
              </button>
            )}
          </div>
        )}
      </nav>
    </header>
  )
}
