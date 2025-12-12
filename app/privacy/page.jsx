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

export default function PrivacyPage() {
  return (
    <UIProvider>
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10 md:py-16 lg:py-20 prose prose-neutral dark:prose-invert">
        <BackToLoginButton />
        <h1>Privacy Policy</h1>
        <p>Last updated: October 10, 2025</p>

        <h2>Introduction</h2>
        <p>
          The Thaenveedu respects your privacy and is committed to protecting your personal data. This policy explains how we collect, use, and safeguard your information when you use our website and services.
        </p>

        <h2>Information We Collect</h2>
        <ul>
          <li>Contact information such as name, email address, and phone number</li>
          <li>Order details and shipping information</li>
          <li>Usage data such as pages visited and interactions with our site</li>
        </ul>

        <h2>How We Use Your Information</h2>
        <ul>
          <li>To process and deliver orders</li>
          <li>To communicate with you about your account or orders</li>
          <li>To improve our website and services</li>
        </ul>

        <h2>Data Security</h2>
        <p>
          We implement appropriate technical and organizational measures to protect your personal data.
        </p>

        <h2>Your Rights</h2>
        <p>
          Depending on your location, you may have rights related to your personal data, including the right to access, correct, or delete your information.
        </p>

        <h2>Contact Us</h2>
        <p>
          For privacy-related inquiries, please contact <a href="mailto:privacy@goldenhive.com">privacy@goldenhive.com</a>.
        </p>
      </main>
      <Footer />
      <CartDrawer />
      <LoginModal />
    </UIProvider>
  )
}
