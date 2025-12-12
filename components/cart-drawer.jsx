"use client"
import { useUI } from "./cart-ui-context"
import { useCart } from "../lib/cart-store"
import Link from "next/link"
export default function CartDrawer() {
  const { cartOpen, closeCart } = useUI()
  const { items, updateQty, increment, decrement, removeItem, subtotal } = useCart()
  return (
    <>
      {cartOpen && <div className="fixed inset-0 z-50 bg-black/30" onClick={closeCart} aria-hidden="true" />}
      <aside
        aria-label="Shopping cart"
        className={`fixed right-0 top-0 z-50 h-full w-full max-w-md transform bg-background shadow-xl transition-transform ${cartOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="font-serif text-xl">Your Cart</h2>
          <button onClick={closeCart} className="rounded-md border px-3 py-1">
            Close
          </button>
        </div>
        <div className="p-4 space-y-4 overflow-auto h-[calc(100%-160px)]">
          {items.length === 0 && <p className="text-muted-foreground">Your cart is empty.</p>}
          {items.map((i) => (
            <div key={i.id} className="flex items-center gap-3">
              <div className="h-20 w-20 rounded-md overflow-hidden bg-muted flex-shrink-0">
                <img
                  src={i.imageUrl || "/placeholder.jpg"}
                  alt={`${i.name} jar`}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{i.name}</p>
                  <button
                    className="text-sm text-destructive"
                    onClick={() => removeItem(i.id)}
                    aria-label={`Remove ${i.name}`}
                  >
                    Remove
                  </button>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      className="rounded-md border px-2"
                      onClick={() => decrement(i.id, 1)}
                      aria-label={`Decrease ${i.name} quantity`}
                    >
                      −
                    </button>
                    <span className="min-w-6 text-center">{i.quantity}</span>
                    <button
                      className="rounded-md border px-2"
                      onClick={() => increment(i.id, 1)}
                      aria-label={`Increase ${i.name} quantity`}
                    >
                      +
                    </button>
                  </div>
                  <span className="font-semibold">₹{(i.price * i.quantity).toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="border-t p-4">
          <div className="flex items-center justify-between">
            <span>Subtotal</span>
            <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
          </div>
          <Link
            href="/checkout"
            onClick={closeCart}
            className="mt-4 block w-full text-center rounded-md bg-primary px-4 py-2 text-primary-foreground hover:opacity-90"
          >
            Proceed to Checkout
          </Link>
        </div>
      </aside>
    </>
  )
}
