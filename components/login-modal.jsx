"use client"
import { useUI } from "./cart-ui-context"
import { useEffect, useState } from "react"
import { auth } from "../lib/firebase"
import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification
} from "firebase/auth"

export default function LoginModal() {
  const { authOpen, closeAuth } = useUI()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [verificationSent, setVerificationSent] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Determine a safe continue URL for email verification links
  const getContinueUrl = () => {
    const envUrl = process.env.NEXT_PUBLIC_APP_URL
    if (envUrl) return envUrl
    if (typeof window !== "undefined") return window.location.origin
    const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
    return authDomain ? `https://${authDomain}` : undefined
  }

  useEffect(() => {
    if (!authOpen) {
      setError("")
      setEmail("")
      setPassword("")
      setIsSignUp(false)
      setVerificationSent(false)
      setShowPassword(false)
    }
  }, [authOpen])

  async function signInWithGoogle() {
    setLoading(true)
    setError("")
    try {
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
      closeAuth()
      // Redirect to shop page after successful login
      window.location.href = '/shop'
    } catch (e) {
      console.error("Google sign-in error:", e)
      if (e.code === 'auth/popup-closed-by-user') {
        setError("Sign-in cancelled")
      } else {
        setError(e?.message || "Google sign-in failed. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleEmailAuth(e) {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Validation
    if (!email || !password) {
      setError("Please enter both email and password")
      setLoading(false)
      return
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address")
      setLoading(false)
      return
    }

    // Restrict to Gmail only
    const emailDomain = email.split('@')[1]?.toLowerCase()
    if (emailDomain !== 'gmail.com') {
      setError("Only Gmail addresses are allowed. Please use a Gmail account.")
      setLoading(false)
      return
    }

    // Password validation
    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      setLoading(false)
      return
    }

    // Strong password validation for signup
    if (isSignUp) {
      if (!/[A-Z]/.test(password)) {
        setError("Password must contain at least one uppercase letter")
        setLoading(false)
        return
      }
      if (!/[a-z]/.test(password)) {
        setError("Password must contain at least one lowercase letter")
        setLoading(false)
        return
      }
      if (!/[0-9]/.test(password)) {
        setError("Password must contain at least one number")
        setLoading(false)
        return
      }
      if (password.length < 8) {
        setError("Password must be at least 8 characters for new accounts")
        setLoading(false)
        return
      }
    }

    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        // Send verification email with an allowed continue URL to avoid auth/invalid-continue-uri
        const continueUrl = getContinueUrl()
        await sendEmailVerification(userCredential.user, continueUrl ? { url: continueUrl } : undefined)
        // Sign out immediately after signup to prevent access before verification
        await auth.signOut()
        setVerificationSent(true)
        setError("")
        // Don't close the modal, show verification message instead
      } else {
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password)
          // Check if email is verified for email/password users
          if (!userCredential.user.emailVerified) {
            setError("Please verify your email before signing in. Check your inbox for the verification link.")
            await auth.signOut() // Sign out the unverified user
            setLoading(false)
            return
          }
          closeAuth()
          // Redirect to shop page after successful login
          window.location.href = '/shop'
        } catch (signInError) {
          // If user not found, check if they meant to sign up
          if (signInError.code === 'auth/user-not-found') {
            setError("No account found with this email. Please sign up first if you're a new user.")
            setLoading(false)
            return
          }
          // Re-throw to be caught by outer catch
          throw signInError
        }
      }
    } catch (e) {
      console.error("Email auth error:", e)
      switch (e.code) {
        case 'auth/email-already-in-use':
          setError("Email already in use. Try signing in instead.")
          break
        case 'auth/invalid-email':
          setError("Invalid email address")
          break
        case 'auth/user-not-found':
          setError("No account found with this email. Please sign up first if you're a new user.")
          break
        case 'auth/wrong-password':
          setError("Incorrect password")
          break
        case 'auth/weak-password':
          setError("Password is too weak")
          break
        case 'auth/invalid-credential':
          setError("Invalid email or password")
          break
        default:
          setError(e?.message || "Authentication failed. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  if (!authOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeAuth} />
      <div className="relative z-10 w-full max-w-md rounded-xl border bg-background p-6 sm:p-8 shadow-2xl">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl">
              {isSignUp ? "Create Account" : "Welcome Back"}
            </h2>
            <p className="mt-2 text-sm sm:text-base text-muted-foreground">
              {isSignUp ? "Sign up to get started" : "Sign in to continue"}
            </p>
          </div>
          <button
            onClick={closeAuth}
            className="p-2 rounded-md hover:bg-secondary transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          {/* Verification Success Message */}
          {verificationSent && (
            <div className="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <div className="flex-1">
                  <h3 className="font-semibold text-green-900 dark:text-green-100 mb-1">
                    Verification Email Sent!
                  </h3>
                  <p className="text-sm text-green-800 dark:text-green-200">
                    We've sent a verification link to <strong>{email}</strong>. 
                    Please check your inbox and click the link to verify your account before signing in.
                  </p>
                  <button
                    onClick={() => {
                      setVerificationSent(false)
                      setIsSignUp(false)
                      setEmail("")
                      setPassword("")
                    }}
                    className="mt-3 text-sm text-green-700 dark:text-green-300 hover:underline font-medium"
                  >
                    Go to Sign In →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Email/Password Form */}
          {!verificationSent && (
            <form onSubmit={handleEmailAuth} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email (Gmail only)
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@gmail.com"
                className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm placeholder:font-light focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={loading}
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password {isSignUp && "(min. 8 chars, 1 uppercase, 1 lowercase, 1 number)"}
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border bg-background px-4 py-2.5 pr-10 text-sm placeholder:font-light focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={loading}
                  required
                  minLength={isSignUp ? 8 : 6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-primary px-4 py-3 text-sm sm:text-base font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60 transition-opacity"
              disabled={loading}
            >
              {loading ? "Please wait..." : isSignUp ? "Sign Up" : "Sign In"}
            </button>
          </form>
          )}

          {!verificationSent && (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              {/* Google Sign In */}
              <button
                onClick={signInWithGoogle}
                className="w-full rounded-lg border px-4 py-3 text-sm sm:text-base font-medium hover:bg-secondary disabled:opacity-60 transition-colors flex items-center justify-center gap-3"
                disabled={loading}
                type="button"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </button>
            </>
          )}

          {error && (
            <div className="rounded-lg bg-destructive/10 p-3 sm:p-4 text-xs sm:text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Toggle Sign In/Sign Up */}
          {!verificationSent && (
            <div className="text-center">
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp)
                  setError("")
                }}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
                type="button"
                disabled={loading}
              >
                {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
              </button>
            </div>
          )}
        </div>

        <p className="mt-6 text-xs sm:text-sm text-center text-muted-foreground">
          By continuing, you agree to our{" "}
          <a href="/terms" className="text-primary hover:underline">
            Terms
          </a>{" "}
          and{" "}
          <a href="/privacy" className="text-primary hover:underline">
            Privacy Policy
          </a>
          .
        </p>

        <div className="mt-4 text-center">
          <a 
            href="/admin" 
            className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            Admin Login →
          </a>
        </div>
      </div>
    </div>
  )
}
