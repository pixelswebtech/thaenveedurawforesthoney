import Navbar from "../../../components/navbar"
import CartDrawer from "../../../components/cart-drawer"
import LoginModal from "../../../components/login-modal"
import { UIProvider } from "../../../components/cart-ui-context"
import ProductDetailContent from "./ProductDetailContent"

// Generate static paths for all products
export async function generateStaticParams() {
  return [
    { id: 'wildflower' },
    { id: 'clover' },
    { id: 'manuka' },
    { id: 'acacia' },
  ]
}

// Server component - this will be statically generated
export default async function ProductDetailPage({ params }) {
  const { id } = await params
  
  return (
    <UIProvider>
      <Navbar />
      <ProductDetailContent productId={id} />
      <CartDrawer />
      <LoginModal />
    </UIProvider>
  )
}