import Navbar from "../components/navbar"
import Hero from "../components/hero"
import Benefits from "../components/benefits"
import WhyChooseUs from "../components/why-choose-us"
import Story from "../components/story"
import Honeycomb from "../components/honeycomb"
import Testimonials from "../components/testimonials"
import Footer from "../components/footer"
import CartDrawer from "../components/cart-drawer"
import LoginModal from "../components/login-modal"
import { UIProvider } from "../components/cart-ui-context"
import FeaturedProducts from "./sections/featured-products"

export default function HomePage() {
  return (
    <UIProvider>
      <Navbar />
      <main>
        <Hero />
        <FeaturedProducts />
        <Benefits />
        <WhyChooseUs />
        <Story />
        <Honeycomb />
        <Testimonials />
      </main>
      <Footer />
      <CartDrawer />
      <LoginModal />
    </UIProvider>
  )
}
