"use client"
import Navbar from "../../components/navbar"
import Footer from "../../components/footer"
import CartDrawer from "../../components/cart-drawer"
import LoginModal from "../../components/login-modal"
import { UIProvider, useUI } from "../../components/cart-ui-context"

function BackToLoginButton() {
  const { openAuth } = useUI()
  return (
    <button
      onClick={openAuth}
      className="mb-6 inline-flex items-center gap-2 text-sm text-primary hover:underline"
      aria-label="Back to Sign Up"
    >
      ← Back to Sign Up
    </button>
  )
}

export default function TermsPage() {
  return (
    <UIProvider>
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10 md:py-16 lg:py-20 prose prose-neutral dark:prose-invert">
        <BackToLoginButton />
        <h1>Terms and Conditions</h1>
        <p>Last updated: October 10, 2025</p>

        <h2>1. Agreement to Terms</h2>
        <p>
          By accessing or using The Thaenveedu website and services, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use our services.
        </p>

        <h2>2. Purchases</h2>
        <p>
          All purchases are subject to product availability. We reserve the right to limit the quantities of any products that we offer.
        </p>

        <h2>3. Shipping and Returns</h2>
        <p>
          Orders are processed within 1-2 business days. If you are not satisfied with your purchase, please contact us within 14 days of delivery for assistance.
        </p>

        <h2>4. Intellectual Property</h2>
        <p>
          All content, trademarks, and data on this site are the property of The Thaenveedu and protected by intellectual property laws.
        </p>

        <h2>5. Contact Us</h2>
        <p>
          If you have questions about these Terms, please contact us at <a href="mailto:support@goldenhive.com">support@goldenhive.com</a>.
        </p>
      </main>
      <Footer />
      <CartDrawer />
      <LoginModal />
    </UIProvider>
  )
}
