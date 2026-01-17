"use client"

import { useState, useEffect, useTransition } from "react"
import { toast } from "sonner"

const STORAGE_KEY = "gh-cart-v1"
const CART_EVENT = "cart-updated"

// Prevent duplicate toasts when handlers fire twice (e.g., rapid clicks or replays)
let lastToastFingerprint = ""
function showCartToast({ kind, productName, qty, totalQty }) {
  const fingerprint = `${kind}:${productName}:${qty}:${totalQty}`
  const nowBucket = Math.floor(Date.now() / 700) // 700ms window
  const key = `${fingerprint}:${nowBucket}`
  if (key === lastToastFingerprint) return
  lastToastFingerprint = key

  if (kind === "added") {
    toast.success("Added to cart", { description: `${productName} • Qty ${qty}` })
  } else if (kind === "updated") {
    toast.success(`${productName} quantity updated`, {
      description: `Added ${qty} more • Total: ${totalQty}`,
    })
  }
}

function readStorage() {
  if (typeof window === "undefined") return { items: [] }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : { items: [] }
  } catch {
    return { items: [] }
  }
}

function writeStorage(state) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    // Dispatch custom event to notify all components
    // Use setTimeout to defer the event dispatch until after render
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent(CART_EVENT, { detail: state }))
    }, 0)
  } catch {}
}

export function useCart() {
  const [data, setData] = useState({ items: [] })
  const [, startTransition] = useTransition()

  useEffect(() => {
    // Load initial data
    setData(readStorage())

    // Listen for cart updates from other components
    const handleCartUpdate = (event) => {
      // Use startTransition to avoid blocking render
      startTransition(() => {
        setData(event.detail || readStorage())
      })
    }

    window.addEventListener(CART_EVENT, handleCartUpdate)

    return () => {
      window.removeEventListener(CART_EVENT, handleCartUpdate)
    }
  }, [])

  function addItem(product, qty = 1, meta = {}) {
    setData((current) => {
      const items = [...(current?.items || [])]
      const vId = meta?.variantId ?? null
      const idx = items.findIndex((i) => i.id === product.id && (i.variantId ?? null) === vId)
      if (idx >= 0) {
        const existing = items[idx]
        items[idx] = { ...existing, quantity: existing.quantity + qty }
        showCartToast({
          kind: "updated",
          productName: product.name,
          qty,
          totalQty: items[idx].quantity,
        })
      } else {
        items.push({
          id: product.id,
          name: product.name,
          price: Number(meta?.unitPrice ?? product.price),
          imageUrl: product.imageUrl,
          quantity: qty,
          variantId: meta?.variantId,
          weightLabel: meta?.weightLabel,
        })
        showCartToast({ kind: "added", productName: product.name, qty, totalQty: qty })
      }
      const next = { items }
      writeStorage(next)
      return next
    })
  }

  function updateQty(id, qty, variantId = null) {
    const safeQty = Math.max(1, qty)
    setData((current) => {
      const items = (current?.items || []).map((it) =>
        it.id === id && (it.variantId ?? null) === (variantId ?? null) ? { ...it, quantity: safeQty } : it
      )
      const next = { items }
      writeStorage(next)
      return next
    })
  }

  function increment(id, step = 1, variantId = null) {
    setData((current) => {
      const items = (current?.items || []).map((it) =>
        it.id === id && (it.variantId ?? null) === (variantId ?? null)
          ? { ...it, quantity: Math.max(1, Number(it.quantity || 0) + step) }
          : it
      )
      const next = { items }
      writeStorage(next)
      return next
    })
  }

  function decrement(id, step = 1, variantId = null) {
    increment(id, -Math.abs(step), variantId)
  }

  function removeItem(id, variantId = null) {
    setData((current) => {
      const next = {
        items: (current?.items || []).filter((i) => !(i.id === id && (i.variantId ?? null) === (variantId ?? null)))
      }
      writeStorage(next)
      return next
    })
  }

  function clear() {
    const next = { items: [] }
    writeStorage(next)
    setData(next)
  }

  const subtotal = (data?.items || []).reduce((sum, i) => sum + i.price * i.quantity, 0)

  return {
    items: data?.items || [],
    addItem,
    updateQty,
    increment,
    decrement,
    removeItem,
    clear,
    subtotal,
  }
}
